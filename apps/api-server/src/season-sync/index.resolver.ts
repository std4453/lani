import { ItemRefreshService } from '@/api/jellyfin';
import { ChinaAxiosService } from '@/common/axios.service';
import { COSService } from '@/common/cos.service';
import { PrismaService } from '@/common/prisma.service';
import { ConfigType, COSBucket } from '@/config';
import { DateFormat } from '@/constants/date-format';
import { BangumiSeasonService } from '@/season-sync/bangumi/index.service';
import { PartialSeason } from '@/season-sync/index.model';
import { SkyhookSeasonService } from '@/season-sync/skyhook/index.service';
import { ensureXMLRoot, mergeXMLNode } from '@/utils/xml';
import { ConflictException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Args, ID, Int, Mutation, Resolver } from '@nestjs/graphql';
import { Cron } from '@nestjs/schedule';
import { Image, JellyfinFolder, MetadataSource, Season } from '@prisma/client';
import dayjs from 'dayjs';
import fs from 'fs';
import fsPromises from 'fs/promises';
import md5 from 'md5';
import path from 'path';
import xml2js from 'xml2js';

@Resolver()
export class SyncMetadataResolver {
  constructor(
    private skyhook: SkyhookSeasonService,
    private bangumi: BangumiSeasonService,
    private china: ChinaAxiosService,
    private prisma: PrismaService,
    private config: ConfigService<ConfigType, true>,
    private cos: COSService,
  ) {}

  private readonly builder = new xml2js.Builder();
  private readonly parser = new xml2js.Parser();

  @Mutation(() => ID)
  async syncMetadata(@Args('seasonId') seasonId: number) {
    const { bangumiId, tvdbId, tvdbSeason, isArchived, infoSource } =
      await this.prisma.season.findUnique({
        where: { id: seasonId },
      });
    if (isArchived) {
      throw new ConflictException('season is archived (deleted)');
    }
    let result: PartialSeason = {};
    switch (infoSource) {
      case MetadataSource.BGM_CN:
        if (!bangumiId) {
          throw new ConflictException('bangumiId not set');
        }
        result = await this.bangumi.fetch(
          {
            info: true,
            characters: true,
            images: true,
          },
          bangumiId,
        );
        break;
      case MetadataSource.SKYHOOK:
        if (!tvdbId) {
          throw new ConflictException('tvdbid not set');
        }
        if (tvdbSeason === null) {
          throw new ConflictException('tvdbSeason not set');
        }
        result = await this.skyhook.fetch(
          {
            info: true,
            characters: true,
            images: true,
          },
          tvdbId,
          tvdbSeason,
        );
        break;
      default:
        throw new ConflictException('infoSource not available for auto sync');
    }
    const { info, images } = result;
    const newSeason = await this.prisma.season.update({
      where: { id: seasonId },
      data: {
        description: info?.description ?? '',
        tags: info?.tags ?? info?.genres ?? [],
        weekday: info?.weekday ?? null,
        airTime: info?.time ?? '',
        yearAndSemester:
          info?.year && info?.semester
            ? `${info.year}${info.semester.toString().padStart(2, '0')}`
            : '',
        ...(images?.posterURL
          ? {
              posterImage: {
                connectOrCreate: {
                  where: {
                    sourceUrl: images.posterURL,
                  },
                  create: {
                    sourceUrl: images.posterURL,
                  },
                },
              },
            }
          : undefined),
        ...(images?.fanartURL
          ? {
              fanartImage: {
                connectOrCreate: {
                  where: {
                    sourceUrl: images.fanartURL,
                  },
                  create: {
                    sourceUrl: images.fanartURL,
                  },
                },
              },
            }
          : undefined),
        ...(images?.bannerURL
          ? {
              bannerImage: {
                connectOrCreate: {
                  where: {
                    sourceUrl: images.bannerURL,
                  },
                  create: {
                    sourceUrl: images.bannerURL,
                  },
                },
              },
            }
          : undefined),
      },
      include: {
        jellyfinFolder: true,
        bannerImage: true,
        fanartImage: true,
        posterImage: true,
      },
    });
    await this.writeSeasonMetadata(newSeason);
    return 'ok';
  }

  @Mutation(() => ID)
  async writeMetadata(@Args('seasonId') seasonId: number) {
    const season = await this.prisma.season.findUnique({
      where: { id: seasonId },
      include: {
        jellyfinFolder: true,
        bannerImage: true,
        fanartImage: true,
        posterImage: true,
      },
    });
    if (season.isArchived) {
      throw new ConflictException('season is archived (deleted)');
    }
    await this.writeSeasonMetadata(season);
    return 'ok';
  }

  private async ensureImage(image: Image) {
    if (image.cosPath) {
      return image;
    }
    // TODO: SSRF
    const ext = image.sourceUrl
      .substring(image.sourceUrl.lastIndexOf('.'))
      .toLowerCase();
    // 防止XSS攻击，这里过滤一下后缀名
    if (!['.jpg', '.jpeg', '.png'].includes(ext)) {
      throw new Error('unsupported image type');
    }
    const { data } = await this.china.get<Buffer>(image.sourceUrl, {
      responseType: 'arraybuffer',
      // 最大10M
      maxContentLength: 10 * 1024 * 1024,
    });
    const hash = md5(data);
    const bucket = this.config.get<COSBucket>('imagesBucket');
    const key = `${hash}${ext}`;
    await this.cos.putObject({
      Bucket: bucket.bucket,
      Region: bucket.region,
      Key: key,
      Body: data,
    });
    return await this.prisma.image.update({
      where: { id: image.id },
      data: {
        cosPath: key,
      },
    });
  }

  private async writeSeasonMetadata({
    title,
    description,
    tags,
    tvdbId,
    bangumiId,
    id,
    yearAndSemester,
    jellyfinFolder,
    bannerImage,
    fanartImage,
    posterImage,
    jellyfinId,
  }: Season & {
    jellyfinFolder: JellyfinFolder | null;
    bannerImage: Image | null;
    fanartImage: Image | null;
    posterImage: Image | null;
  }) {
    const seasonRoot = jellyfinFolder?.location;
    if (!seasonRoot) {
      throw new ConflictException('seasonRoot not set');
    }
    console.log(`writing metadata for season '${title}'`);
    const nfoPath = path.join(
      this.config.get('mediaRoot'),
      seasonRoot,
      title,
      'tvshow.nfo',
    );
    let xmlObj: any = {};
    await fsPromises.mkdir(path.dirname(nfoPath), { recursive: true });
    try {
      await fsPromises.stat(nfoPath);
      const currentContent = await fsPromises.readFile(nfoPath, 'utf8');
      xmlObj = await this.parser.parseStringPromise(currentContent);
    } catch (error) {
      // 若文件不存在，xml格式有问题，无视报错，因为之后会覆盖它
      // 如果是没有读权限，或是目录，之后写入时肯定会报错，现在也可以无视
    }
    ensureXMLRoot(xmlObj, 'tvshow');
    // https://kodi.wiki/view/NFO_files/TV_shows
    mergeXMLNode(
      {
        title: [title],
        ...(description ? { plot: [description] } : undefined),
        tag: tags.length > 0 ? tags : undefined,
        uniqueId: [
          {
            $: {
              type: 'lani',
              default: 'true',
            },
            _: id,
          },
          tvdbId
            ? {
                $: {
                  type: 'tvdb',
                },
                _: tvdbId,
              }
            : undefined,
          bangumiId
            ? {
                $: {
                  type: 'bangumi',
                },
                _: bangumiId,
              }
            : undefined,
        ].filter(Boolean),
        ...(yearAndSemester
          ? { year: [yearAndSemester.substring(0, 4)] }
          : undefined),
      },
      xmlObj.tvshow,
    );
    const nfoContent = this.builder.buildObject(xmlObj);
    await fsPromises.writeFile(nfoPath, nfoContent, 'utf-8');
    await Promise.all(
      [
        { image: bannerImage, type: 'banner' },
        { image: fanartImage, type: 'fanart' },
        { image: posterImage, type: 'poster' },
      ].map(async ({ image, type }) => {
        if (!image) {
          return;
        }
        const { cosPath } = await this.ensureImage(image);
        if (!cosPath) {
          throw new Error('cosPath not set');
        }
        const bucket = this.config.get<COSBucket>('imagesBucket');
        const ext = cosPath.substring(cosPath.lastIndexOf('.'));
        await this.cos.getObject({
          Bucket: bucket.bucket,
          Region: bucket.region,
          Key: cosPath,
          Output: fs.createWriteStream(
            path.join(
              this.config.get('mediaRoot'),
              seasonRoot,
              title,
              `${type}${ext}`,
            ),
          ),
        });
      }),
    );
    if (jellyfinId) {
      await ItemRefreshService.post(jellyfinId);
    }
  }

  @Mutation(() => ID)
  async syncEpisodeData(@Args('seasonId') seasonId: number) {
    const season = await this.prisma.season.findUnique({
      where: { id: seasonId },
    });
    const result = await this.internalSyncEpisodeData(season);
    return result ? 'ok' : 'no change';
  }

  private async internalSyncEpisodeData({
    id: seasonId,
    episodesSource,
    bangumiId,
    tvdbId,
    tvdbSeason,
    airTime,
  }: Season) {
    let result: PartialSeason = {};
    switch (episodesSource) {
      case MetadataSource.BGM_CN:
        if (!bangumiId) {
          throw new ConflictException('bangumiId not set');
        }
        result = await this.bangumi.fetch(
          {
            episodes: true,
          },
          bangumiId,
        );
        break;
      case MetadataSource.SKYHOOK:
        if (!tvdbId) {
          throw new ConflictException('tvdbid not set');
        }
        if (tvdbSeason === null) {
          throw new ConflictException('tvdbSeason not set');
        }
        result = await this.skyhook.fetch(
          {
            episodes: true,
          },
          tvdbId,
          tvdbSeason,
        );
        break;
      default:
        return false;
    }

    await this.prisma.season.update({
      where: { id: seasonId },
      data: {
        episodesLastSync: new Date(),
        episodes: {
          upsert: (result.episodes ?? []).map(
            ({ index, title, description = '', airDate }) => ({
              where: {
                seasonId_index: {
                  seasonId,
                  index,
                },
              },
              update: {
                title,
                description,
                airTime: this.getEpisodeAirTime(airTime, airDate),
              },
              create: {
                index,
                title,
                description,
                airTime: this.getEpisodeAirTime(airTime, airDate),
              },
            }),
          ),
        },
      },
    });
    return true;
  }

  private getEpisodeAirTime(airTime: string, airDate: string | undefined) {
    if (!airDate) {
      return undefined;
    }
    // 很多动画都是这个时候播，目前还没有日历模块，因此这个时间最多导致下载比出的晚，可以随便指定一个
    // TODO: 想办法从skyhook拿播出时间
    const seasonAirTime = airTime || '23:00';
    const airTimeHours = parseInt(seasonAirTime.substring(0, 2));
    const airTimeMinutes = parseInt(seasonAirTime.substring(3, 5));
    const combinedAirTime = dayjs(airDate, DateFormat.NothingDay)
      .add(airTimeHours, 'h')
      .add(airTimeMinutes, 'm');
    return combinedAirTime.toDate();
  }

  @Cron('*/10 * * * *') // 每 10 分钟
  @Mutation(() => Int)
  async syncAllSeasonsEpisodeData() {
    const seasons = await this.prisma.season.findMany({
      where: {
        AND: [
          {
            // 不同步已删除或未追番中的季度
            isArchived: false,
            isMonitoring: true,
          },
          {
            // 从未同步过，或距离上次同步时间超过12小时
            OR: [
              {
                episodesLastSync: null,
              },
              {
                episodesLastSync: {
                  lt: dayjs().subtract(12, 'hours').toDate(),
                },
              },
            ],
          },
          {
            // 设置了同步数据源和关联信息
            OR: [
              {
                episodesSource: MetadataSource.BGM_CN,
                bangumiId: {
                  not: '',
                },
              },
              {
                episodesSource: MetadataSource.SKYHOOK,
                tvdbId: {
                  not: '',
                },
                tvdbSeason: {
                  not: null,
                },
              },
            ],
          },
          {
            // 没有剧集或者存在未完成下载的剧集，这是为了避免频繁同步已完结的剧集，导致API调用限频
            OR: [
              {
                episodes: {
                  none: {},
                },
              },
              {
                episodes: {
                  some: {
                    jellyfinEpisodeId: null,
                  },
                },
              },
            ],
          },
        ],
      },
    });
    const results = await Promise.all(
      seasons.map(async (season) => {
        try {
          return await this.internalSyncEpisodeData(season);
        } catch (e) {
          console.error(e);
          return false;
        }
      }),
    );
    return results.filter((result) => result).length;
  }
}

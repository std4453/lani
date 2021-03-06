import { MetadataRefreshMode } from '@/api/jellyfin';
import { ChinaAxiosService } from '@/common/axios.service';
import { S3Service } from '@/common/s3.service';
import { PrismaService } from '@/common/prisma.service';
import config from '@/config';
import { DateFormat } from '@/constants/date-format';
import { BangumiSeasonService } from '@/season-sync/bangumi/index.service';
import { PartialSeason } from '@/season-sync/index.model';
import { SkyhookSeasonService } from '@/season-sync/skyhook/index.service';
import { JellyfinHelp } from '@/utils/JellyfinHelp';
import { ensureXMLRoot, mergeXMLNode } from '@/utils/xml';
import { Image, JellyfinFolder, MetadataSource, Season } from '@lani/db';
import { resolveChroot } from '@lani/framework';
import { ConflictException } from '@nestjs/common';
import { Args, ID, Int, Mutation, Resolver } from '@nestjs/graphql';
import { Cron } from '@nestjs/schedule';
import dayjs from 'dayjs';
import fs from 'fs/promises';
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
    private s3: S3Service,
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
    // ??????XSS????????????????????????????????????
    if (!['.jpg', '.jpeg', '.png'].includes(ext)) {
      throw new Error('unsupported image type');
    }
    const { data } = await this.china.get<Buffer>(image.sourceUrl, {
      responseType: 'arraybuffer',
      // ??????10M
      maxContentLength: 10 * 1024 * 1024,
    });
    const hash = md5(data);
    const key = `${hash}${ext}`;
    await this.s3
      .putObject({
        Bucket: config.s3.bucket,
        Key: key,
        Body: data,
      })
      .promise();
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
    const nfoPath = resolveChroot(
      path.join(config.lani.mediaRoot, seasonRoot, title, 'tvshow.nfo'),
    );
    let xmlObj: any = {};
    await fs.mkdir(path.dirname(nfoPath), { recursive: true });
    let modified = false;
    let currentContent = '';
    try {
      await fs.stat(nfoPath);
      currentContent = await fs.readFile(nfoPath, 'utf8');
      xmlObj = await this.parser.parseStringPromise(currentContent);
    } catch (error) {
      // ?????????????????????xml?????????????????????????????????????????????????????????
      // ????????????????????????????????????????????????????????????????????????????????????????????????
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
    if (currentContent !== nfoContent) {
      await fs.writeFile(nfoPath, nfoContent, 'utf-8');
      modified = true;
    }
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
        const ext = cosPath.substring(cosPath.lastIndexOf('.'));
        const { Body: content } = await this.s3
          .getObject({
            Bucket: config.s3.bucket,
            Key: cosPath,
          })
          .promise();
        if (!content) {
          throw new Error('GetObject returns empty content');
        }
        if (!Buffer.isBuffer(content)) {
          throw new Error('GetObject returns non-buffer result');
        }
        const newFileHash = md5(content);
        const filePath = resolveChroot(
          path.join(config.lani.mediaRoot, seasonRoot, title, `${type}${ext}`),
        );
        let currentFileHash = '';
        try {
          const currentFileContent = await fs.readFile(filePath);
          currentFileHash = md5(currentFileContent);
        } catch (error) {
          // ????????????????????????????????????????????????????????????hash?????????????????????
        }
        console.log(currentFileHash, newFileHash);
        if (currentFileHash !== newFileHash) {
          await fs.writeFile(filePath, content);
          modified = true;
        }
      }),
    );
    if (modified) {
      if (jellyfinId) {
        await JellyfinHelp.refreshItem({
          itemId: jellyfinId,
          metadataRefreshMode: MetadataRefreshMode.DEFAULT,
          imageRefreshMode: MetadataRefreshMode.DEFAULT,
        });
      } else {
        await JellyfinHelp.refreshItem({
          itemId: jellyfinFolder.jellyfinId,
          recursive: true,
        });
      }
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
    // ?????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????
    // TODO: ????????????skyhook???????????????
    const seasonAirTime = airTime || '23:00';
    const airTimeHours = parseInt(seasonAirTime.substring(0, 2));
    const airTimeMinutes = parseInt(seasonAirTime.substring(3, 5));
    const combinedAirTime = dayjs(airDate, DateFormat.NothingDay)
      .add(airTimeHours, 'h')
      .add(airTimeMinutes, 'm');
    return combinedAirTime.toDate();
  }

  @Cron('*/10 * * * *') // ??? 10 ??????
  @Mutation(() => Int)
  async syncAllSeasonsEpisodeData() {
    const seasons = await this.prisma.season.findMany({
      where: {
        AND: [
          {
            // ??????????????????????????????????????????
            isArchived: false,
            isMonitoring: true,
          },
          {
            // ???????????????????????????????????????????????????12??????
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
            // ???????????????????????????????????????
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
            // ????????????????????????????????????????????????????????????????????????????????????????????????????????????API????????????
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

  @Mutation(() => Boolean)
  async syncJellyfinSeriesId(@Args('seasonId') seasonId: number) {
    const { jellyfinId, title, jellyfinFolder } =
      await this.prisma.season.findUnique({
        where: { id: seasonId },
        include: {
          jellyfinFolder: true,
        },
      });
    if (!jellyfinFolder) {
      return false;
    }
    const items = await JellyfinHelp.getItemsByUserId({
      userId: config.jellyfin.dummyUserId,
      searchTerm: title,
      limit: 10,
      parentId: jellyfinFolder.jellyfinId,
      recursive: true,
      includeItemTypes: ['Series'],
    });
    const id = (items.Items ?? []).find((item) => item.Name === title)?.Id;
    if (!id) {
      return false;
    }
    if (id === jellyfinId) {
      return true;
    }
    await this.prisma.season.update({
      where: { id: seasonId },
      data: {
        jellyfinId: id,
      },
    });
    return true;
  }
}

import { ChinaAxiosService } from '@/common/axios.service';
import { PrismaService } from '@/common/prisma.service';
import { S3Service } from '@/common/s3.service';
import config from '@/config';
import { SeasonEmitService } from '@/season-emit/index.service';
import { BangumiSeasonService } from '@/season-scrape/bangumi/index.service';
import { PartialSeason } from '@/season-scrape/index.model';
import { SkyhookSeasonService } from '@/season-scrape/skyhook/index.service';
import { Image, MetadataSource, Season } from '@lani/db';
import { ConflictException, Injectable } from '@nestjs/common';
import md5 from 'md5';

@Injectable()
export class SeasonScrapeService {
  constructor(
    private seasonEmitService: SeasonEmitService,
    private skyhook: SkyhookSeasonService,
    private bangumi: BangumiSeasonService,
    private prisma: PrismaService,
    private china: ChinaAxiosService,
    private s3: S3Service,
  ) {}

  async syncMetadata(season: Season) {
    const { bangumiId, tvdbId, tvdbSeason, infoSource } = season;
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
      where: { id: season.id },
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
    // TODO: 强制上传之后才能设置？
    await Promise.all(
      ['bannerImage', 'fanartImage', 'posterImage'].map(
        async (key: 'bannerImage' | 'fanartImage' | 'posterImage') => {
          const image = newSeason[key];
          const result = await this.ensureImage(image);
          if (result) {
            newSeason[key] = result;
          }
        },
      ),
    );
    // TODO: 改成通过MQ解耦
    await this.seasonEmitService.writeSeasonMetadata(newSeason);
  }

  private async ensureImage(image: Image | null) {
    if (!image) {
      return;
    }
    if (image.cosPath) {
      return;
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
}

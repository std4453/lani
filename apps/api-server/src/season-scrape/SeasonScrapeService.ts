import { ChinaAxiosService } from '@/common/axios.service';
import { PrismaService } from '@/common/prisma.service';
import { S3Service } from '@/common/s3.service';
import config from '@/config';
import { SeasonEmitService } from '@/season-emit/index.service';
import { BangumiSeasonService } from '@/season-scrape/bangumi/index.service';
import { PartialSeason } from '@/season-scrape/index.model';
import { SkyhookSeasonService } from '@/season-scrape/skyhook/index.service';
import { SeasonImageKey, SeasonWithImages } from '@/types/entities';
import { Image, MetadataSource, Prisma } from '@lani/db';
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

  async syncMetadata({
    id,
    bangumiId,
    tvdbId,
    tvdbSeason,
    infoSource,
    fanartImage,
    bannerImage,
    posterImage,
  }: SeasonWithImages) {
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

    const data: Prisma.SeasonUpdateInput = {
      description: info?.description ?? '',
      tags: info?.tags ?? info?.genres ?? [],
      weekday: info?.weekday ?? null,
      airTime: info?.time ?? '',
      yearAndSemester:
        info?.year && info?.semester
          ? `${info.year}${info.semester.toString().padStart(2, '0')}`
          : '',
    };

    await Promise.all([
      this.uploadImage(fanartImage, images?.fanartURL, data, 'fanartImage'),
      this.uploadImage(posterImage, images?.posterURL, data, 'posterImage'),
      this.uploadImage(bannerImage, images?.bannerURL, data, 'bannerImage'),
    ]);

    const newSeason = await this.prisma.season.update({
      where: { id },
      data,
      include: {
        jellyfinFolder: true,
        bannerImage: true,
        fanartImage: true,
        posterImage: true,
      },
    });

    await this.seasonEmitService.writeSeasonMetadata(newSeason);
  }

  private async uploadImage(
    image: Image | null,
    url: string | undefined,
    update: Prisma.SeasonUpdateInput,
    type: SeasonImageKey,
  ) {
    if (!url) {
      return;
    }
    if (image && image.sourceUrl === url) {
      return;
    }

    // TODO: SSRF
    const ext = url.substring(url.lastIndexOf('.')).toLowerCase();
    // 防止XSS攻击，这里过滤一下后缀名
    if (!['.jpg', '.jpeg', '.png'].includes(ext)) {
      console.error('unsupported image type');
      return;
    }
    const { data } = await this.china.get<Buffer>(url, {
      responseType: 'arraybuffer',
      // 最大10M
      maxContentLength: 10 * 1024 * 1024,
    });
    const hash = md5(data);
    const key = `${hash}${ext}`;

    try {
      await this.s3
        .headObject({
          Bucket: config.s3.bucket,
          Key: key,
        })
        .promise();
      return;
    } catch (error) {}

    await this.s3
      .putObject({
        Bucket: config.s3.bucket,
        Key: key,
        Body: data,
      })
      .promise();

    update[type] = {
      connectOrCreate: {
        where: {
          sourceUrl: url,
        },
        create: {
          sourceUrl: url,
          cosPath: key,
          hash,
        },
      },
    };
  }
}

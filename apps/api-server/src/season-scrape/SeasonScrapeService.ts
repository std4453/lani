import { GlobalAxiosService } from '@/common/axios.service';
import { PrismaService } from '@/common/prisma.service';
import { S3Service } from '@/common/s3.service';
import config from '@/config';
import { SeasonEmitService } from '@/season-emit/index.service';
import { BangumiSeasonService } from '@/season-scrape/bangumi/index.service';
import { PartialSeason } from '@/season-scrape/index.model';
import { SkyhookSeasonService } from '@/season-scrape/skyhook/index.service';
import { SeasonImageKey, SeasonWithImages } from '@/types/entities';
import { Image, MetadataSource, Prisma } from '@lani/db';
import { ConflictException, Injectable, Logger } from '@nestjs/common';
import md5 from 'md5';

@Injectable()
export class SeasonScrapeService {
  private logger = new Logger(SeasonScrapeService.name);

  constructor(
    private seasonEmitService: SeasonEmitService,
    private skyhook: SkyhookSeasonService,
    private bangumi: BangumiSeasonService,
    private prisma: PrismaService,
    private global: GlobalAxiosService,
    private s3: S3Service,
  ) {}

  async syncMetadata({
    id,
    title,
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
        this.logger.verbose(
          `Syncing metadata for season #${id} (${title}) from bgmid:${bangumiId}`,
        );
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
        this.logger.verbose(
          `Syncing metadata for season #${id} (${title}) from tvdb:${tvdbId} / S${tvdbSeason
            .toString()
            .padStart(2, '0')}`,
        );
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
      // yearAndSemesterCanonical字段粗略做到可排序，原先的yearAndSemester冬季番
      //（XXXX年1月开播）录入的是XXXX04，会显得大于当年4月开播的春季番。出于兼容性考虑，
      // 新增一个字段，对于冬季番录入(XXXX-1)04，顺序就正确了。
      yearAndSemesterCanonical:
        info?.year && info?.semester
          ? (info.year - (info.semester === 4 ? 1 : 0)) * 100 + info.semester
          : 0,
    };

    this.logger.verbose(`Uploading images for season #${id} (${title})...`);
    await Promise.all([
      this.uploadImage(fanartImage, images?.fanartURL, data, 'fanartImage'),
      this.uploadImage(posterImage, images?.posterURL, data, 'posterImage'),
      this.uploadImage(bannerImage, images?.bannerURL, data, 'bannerImage'),
    ]);

    this.logger.verbose(`Writing db for season #${id} (${title})...`);
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
      this.logger.verbose(`${type} unchanged (url = ${url}), upload skipped`);
      return;
    }

    // TODO: SSRF
    const ext = url.substring(url.lastIndexOf('.')).toLowerCase();
    // 防止XSS攻击，这里过滤一下后缀名
    if (!['.jpg', '.jpeg', '.png'].includes(ext)) {
      this.logger.warn(
        `Unable to download ${type} from ${url} (unsupported file extension type)`,
      );
      return;
    }
    this.logger.verbose(`Downloading ${type} from ${url}...`);
    // lani.bgm.tv 当前已无法直连，必须使用代理
    const { data } = await this.global.get<Buffer>(url, {
      responseType: 'arraybuffer',
      // 最大10M
      maxContentLength: 10 * 1024 * 1024,
    });
    const hash = md5(data);
    const key = `${hash}${ext}`;
    this.logger.verbose(
      `${type} downloaded from ${url}, new path will be ${key}, uploading file...`,
    );

    try {
      // 如果文件已经存在，这里不会报错，因此会return
      await this.s3
        .headObject({
          Bucket: config.s3.bucket,
          Key: key,
        })
        .promise();
      this.logger.warn(
        `Upload ${type} skipped (file under path ${key} already exists)`,
      );
      return;
    } catch (error) {
      // 否则，文件不存在，继续上传
    }

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

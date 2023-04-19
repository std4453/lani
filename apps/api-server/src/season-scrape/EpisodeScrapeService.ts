import { PrismaService } from '@/common/prisma.service';
import { DateFormat } from '@/constants/date-format';
import { BangumiSeasonService } from '@/season-scrape/bangumi/index.service';
import { PartialSeason } from '@/season-scrape/index.model';
import { SkyhookSeasonService } from '@/season-scrape/skyhook/index.service';
import { MetadataSource, Season } from '@lani/db';
import { ConflictException, Injectable, Logger } from '@nestjs/common';
import dayjs from 'dayjs';

@Injectable()
export class EpisodeScrapeService {
  private logger = new Logger(EpisodeScrapeService.name);

  constructor(
    private skyhook: SkyhookSeasonService,
    private bangumi: BangumiSeasonService,
    private prisma: PrismaService,
  ) {}

  async syncEpisodeData({
    id: seasonId,
    title,
    episodesSource,
    bangumiId,
    tvdbId,
    tvdbSeason,
    airTime: seasonAirTime,
    downloadOffsetHours,
  }: Season) {
    let result: PartialSeason = {};
    switch (episodesSource) {
      case MetadataSource.BGM_CN:
        if (!bangumiId) {
          throw new ConflictException('bangumiId not set');
        }
        this.logger.verbose(
          `Syncing episode data for season #${seasonId} (${title}) from bgmid:${bangumiId}`,
        );
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
        this.logger.verbose(
          `Syncing episode data for season #${seasonId} (${title}) from tvdb:${tvdbId} / S${tvdbSeason
            .toString()
            .padStart(2, '0')}`,
        );
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

    if (result.episodes?.length) {
      this.logger.verbose(
        `Got ${result.episodes.length} episodes for season #${seasonId} (${title}) from data source, writing to db...`,
      );
    } else {
      this.logger.warn(
        `Data source returned no episodes for season for season #${seasonId} (${title})`,
      );
    }

    await this.prisma.$transaction([
      this.prisma.season.update({
        where: { id: seasonId },
        data: {
          episodesLastSync: new Date(),
          episodes: {
            upsert: (result.episodes ?? []).map(
              ({ index, title, description = '', airDate }) => {
                const rawAirTime = this.getEpisodeAirTime(
                  seasonAirTime,
                  airDate,
                );
                const airTime = rawAirTime
                  ? dayjs(rawAirTime)
                      .subtract(downloadOffsetHours, 'hour')
                      .toDate()
                  : undefined;
                return {
                  where: {
                    seasonId_index: {
                      seasonId,
                      index,
                    },
                  },
                  update: {
                    title,
                    description,
                    rawAirTime,
                    airTime,
                  },
                  create: {
                    index,
                    title,
                    description,
                    rawAirTime,
                    airTime,
                  },
                };
              },
            ),
          },
        },
      }),
      // 删除元数据中不存在，且没有任何下载任务的剧集，因为没有任务所以不会有文件，没有副作用
      this.prisma.episode.deleteMany({
        where: {
          seasonId,
          index: {
            notIn: (result.episodes ?? []).map((e) => e.index),
          },
          downloadJobs: {
            none: {},
          },
        },
      }),
    ]);
    return true;
  }

  private getEpisodeAirTime(airTime: string, airDate: string | undefined) {
    if (!airDate) {
      return undefined;
    }
    // 由于bangumi数据里没有播出时间，默认设置为23:00
    // TODO: 想办法从skyhook拿播出时间
    const seasonAirTime = airTime || '23:00';
    const airTimeHours = parseInt(seasonAirTime.substring(0, 2));
    const airTimeMinutes = parseInt(seasonAirTime.substring(3, 5));
    const combinedAirTime = dayjs(airDate, DateFormat.NothingDay)
      .add(airTimeHours, 'h')
      .add(airTimeMinutes, 'm');
    return combinedAirTime.toDate();
  }
}

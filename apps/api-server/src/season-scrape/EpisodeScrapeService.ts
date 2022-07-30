import { PrismaService } from '@/common/prisma.service';
import { DateFormat } from '@/constants/date-format';
import { BangumiSeasonService } from '@/season-scrape/bangumi/index.service';
import { PartialSeason } from '@/season-scrape/index.model';
import { SkyhookSeasonService } from '@/season-scrape/skyhook/index.service';
import { MetadataSource, Season } from '@lani/db';
import { ConflictException, Injectable } from '@nestjs/common';
import dayjs from 'dayjs';

@Injectable()
export class EpisodeScrapeService {
  constructor(
    private skyhook: SkyhookSeasonService,
    private bangumi: BangumiSeasonService,
    private prisma: PrismaService,
  ) {}

  async syncEpisodeData({
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
    // TODO: 如果有已可用的剧集被更改，触发warning
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
}

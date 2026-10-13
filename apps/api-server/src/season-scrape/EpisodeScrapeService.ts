import { PrismaService } from '@/common/prisma.service';
import { DateFormat } from '@/constants/date-format';
import { BangumiSeasonService } from '@/season-scrape/bangumi/index.service';
import { PartialSeason } from '@/season-scrape/index.model';
import { SkyhookSeasonService } from '@/season-scrape/skyhook/index.service';
import { EpisodeType, MetadataSource, Prisma, Season } from '@lani/db';
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

    const existing = await this.prisma.episode.findMany({
      where: { seasonId },
    });
    const seen = new Set<string>();
    const matchedIds = new Set<number>();
    const updates = (result.episodes ?? []).flatMap((episode) => {
      const episodeType = (episode.episodeType ?? 'EPISODE') as EpisodeType;
      const episodeNumber = new Prisma.Decimal(
        episode.episodeNumber ?? String(episode.index),
      );
      const key = `${episodeType}:${episodeNumber}`;
      if (seen.has(key))
        throw new ConflictException(`Duplicate source episode ${key}`);
      seen.add(key);
      const identity =
        episode.bangumiEpisodeId == null
          ? undefined
          : existing.find(
              (e) => e.bangumiEpisodeId === episode.bangumiEpisodeId,
            );
      const numbered = existing.find(
        (e) =>
          e.episodeType === episodeType &&
          (e.episodeNumber != null
            ? e.episodeNumber.equals(episodeNumber)
            : e.index != null && episodeNumber.equals(e.index)),
      );
      if (identity && numbered && identity.id !== numbered.id) {
        // 保留既有编号与任务关联，冲突不应阻止其他剧集同步。
        matchedIds.add(identity.id);
        this.logger.warn(
          `Skipping source episode ${episode.bangumiEpisodeId} in season #${seasonId}: numbering conflict at ${key}`,
        );
        return [];
      }
      if (
        !identity &&
        numbered?.bangumiEpisodeId != null &&
        episode.bangumiEpisodeId != null &&
        numbered.bangumiEpisodeId !== episode.bangumiEpisodeId
      ) {
        this.logger.warn(
          `Skipping source episode ${episode.bangumiEpisodeId} in season #${seasonId}: identity conflict at ${key}`,
        );
        return [];
      }
      const current = identity ?? numbered;
      if (current) matchedIds.add(current.id);
      const rawAirTime =
        this.getEpisodeAirTime(seasonAirTime, episode.airDate) ?? null;
      const data = {
        episodeType,
        episodeNumber,
        index:
          episodeType === 'EPISODE' && episodeNumber.isInteger()
            ? episodeNumber.toNumber()
            : null,
        bangumiEpisodeId: episode.bangumiEpisodeId,
        bangumiSort: episode.bangumiSort,
        sourceData: episode.sourceData,
        title: episode.title,
        description: episode.description ?? '',
        rawAirTime,
        airTime: rawAirTime
          ? dayjs(rawAirTime).subtract(downloadOffsetHours, 'hour').toDate()
          : null,
      };
      return [
        current
          ? this.prisma.episode.update({ where: { id: current.id }, data })
          : this.prisma.episode.create({ data: { ...data, seasonId } }),
      ];
    });
    // 上游缺失只记录，不删除已有剧集和关联任务。
    const missing = existing.filter((e) => !matchedIds.has(e.id));
    if (missing.length)
      this.logger.warn(
        `${missing.length} local episodes absent from metadata for season #${seasonId}`,
      );
    await this.prisma.$transaction([
      ...updates,
      this.prisma.season.update({
        where: { id: seasonId },
        data: { episodesLastSync: new Date() },
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

import path from 'path';
import { getSeasonDirectory } from '@/utils/season-directory';
import {
  BaseItemKind,
  BaseItemDto,
  ItemFields,
  JellyfinHelp,
  MetadataRefreshMode,
  TvShowsService,
} from '@/api/jellyfin';
import { mapPath } from '@/utils/path';
import { jellyfinNumber } from '@/utils/episode-number';
import { lockEpisode } from '@/common/episode-lock';
import { PrismaService } from '@/common/prisma.service';
import config from '@/config';
import { SeasonWithJellyfinFolder } from '@/types/entities';
import { LaniFilterCron } from '@/utils/GraphQLExceptionFilter';
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class SeasonJellyfinService {
  private logger = new Logger(SeasonJellyfinService.name);

  constructor(private prisma: PrismaService) {}

  async refreshAfterFolderRename({ jellyfinFolder }: SeasonWithJellyfinFolder) {
    this.logger.verbose(
      `Refreshing Jellyfin folder ${jellyfinFolder.jellyfinId.substring(
        0,
        8,
      )} (${jellyfinFolder.name}) after season rename...`,
    );
    await JellyfinHelp.refreshItem({
      itemId: jellyfinFolder.jellyfinId,
      metadataRefreshMode: MetadataRefreshMode.DEFAULT,
      recursive: true,
    });
  }

  async refreshAfterWriteToDisk({
    id,
    title,
    jellyfinId,
    jellyfinFolder,
  }: SeasonWithJellyfinFolder) {
    if (jellyfinId) {
      this.logger.verbose(
        `Refreshing Jellyfin season ${jellyfinId.substring(
          0,
          8,
        )} after writing season #${id} (${title}) to disk...`,
      );
      await JellyfinHelp.refreshItem({
        itemId: jellyfinId,
        metadataRefreshMode: MetadataRefreshMode.FULL_REFRESH,
        imageRefreshMode: MetadataRefreshMode.DEFAULT,
      });
    } else {
      this.logger.verbose(
        `Refreshing Jellyfin folder ${jellyfinFolder.jellyfinId.substring(
          0,
          8,
        )} (${
          jellyfinFolder.name
        }) after writing to disk since season #${id} (${title}) has no Jellyfin ID...`,
      );
      await JellyfinHelp.refreshItem({
        itemId: jellyfinFolder.jellyfinId,
        metadataRefreshMode: MetadataRefreshMode.DEFAULT,
        recursive: true,
      });
    }
  }

  async refreshAfterDelete({
    jellyfinFolder,
    id,
    title,
  }: SeasonWithJellyfinFolder) {
    this.logger.verbose(
      `Refreshing Jellyfin folder ${jellyfinFolder.jellyfinId.substring(
        0,
        8,
      )} (${
        jellyfinFolder.name
      }) after season #${id} (${title}) was deleted...`,
    );
    await JellyfinHelp.refreshItem({
      itemId: jellyfinFolder.jellyfinId,
      metadataRefreshMode: MetadataRefreshMode.DEFAULT,
    });
  }

  private async getSeries(jellyfinFolderId: string): Promise<BaseItemDto[]> {
    const result: BaseItemDto[] = [];
    const limit = 100;
    for (let startIndex = 0; ; ) {
      const page = await JellyfinHelp.getItemsByUserId({
        userId: config.jellyfin.dummyUserId,
        parentId: jellyfinFolderId,
        recursive: true,
        includeItemTypes: [BaseItemKind.SERIES],
        fields: [ItemFields.PATH, ItemFields.PROVIDER_IDS],
        startIndex,
        limit,
        enableTotalRecordCount: true,
      });
      const items = page.Items ?? [];
      result.push(...items);
      startIndex += items.length;
      if (
        !items.length ||
        (page.TotalRecordCount != null
          ? startIndex >= page.TotalRecordCount
          : items.length < limit)
      )
        break;
    }
    return result;
  }

  async syncJellyfinSeriesId(
    season: SeasonWithJellyfinFolder,
    series?: BaseItemDto[],
  ) {
    const { id: seasonId, jellyfinId, title, jellyfinFolder } = season;
    const items = series ?? (await this.getSeries(jellyfinFolder.jellyfinId));
    const laniId = (item: BaseItemDto) =>
      Object.entries(item.ProviderIds ?? {}).find(
        ([key]) => key.toLowerCase() === 'lani',
      )?.[1];
    // 比较 Jellyfin 的路径，不使用 API 容器的 pathMapping。
    const normalize = (value: string) =>
      path.posix.normalize(value.replace(/\\/g, '/')).replace(/\/$/, '');
    const expectedPath = normalize(
      `${jellyfinFolder.location}/${getSeasonDirectory(season)}`,
    );
    const byId = items.filter(
      (item) => item.Id && laniId(item) === String(seasonId),
    );
    const matches = byId.length
      ? byId
      : items.filter(
          (item) =>
            item.Id &&
            !laniId(item) &&
            item.Path &&
            normalize(item.Path) === expectedPath,
        );
    const match =
      matches.find(
        (item) => item.Path && normalize(item.Path) === expectedPath,
      ) ?? matches[0];
    if (matches.length > 1) {
      this.logger.warn(
        `Season #${seasonId} matched ${matches.length} Jellyfin series by ${
          byId.length ? 'Lani ID' : 'path'
        }; using item ${match.Id}`,
      );
    }
    if (!match?.Id) {
      this.logger.verbose(
        `Season #${seasonId} (${title}) matched no Jellyfin series`,
      );
      return false;
    }
    if (match.Path && normalize(match.Path) !== expectedPath) {
      this.logger.warn(
        `Season #${seasonId} matched Jellyfin series ${match.Id} by Lani ID but its path differs from the expected directory`,
      );
    }
    if (match.Id !== jellyfinId) {
      // 部分 Jellyfin 版本的媒体库刷新只发现目录，不读取新季度的 NFO。
      // 对已经由应用写入或显式同步的季度，关联后单独读取其元数据。
      if (!laniId(match) && season.directory) {
        await this.refreshAfterWriteToDisk({ ...season, jellyfinId: match.Id });
      }
      // 改名后 Jellyfin 会生成新剧集 ID。所有已发布版本按实际新路径匹配完成后，
      // 才完成季度关联；否则保留空季度 ID，让定时同步继续等待异步扫描。
      const episodes = await this.prisma.episode.findMany({
        where: {
          seasonId,
          currentVersionId: { not: null },
          jellyfinEpisodeId: { not: null },
        },
        include: {
          currentVersion: {
            include: {
              files: { where: { role: 'video' }, include: { asset: true } },
            },
          },
        },
        orderBy: { id: 'asc' },
      });
      if (episodes.length) {
        if (!match.Path || normalize(match.Path) !== expectedPath) return false;
        const { Items = [] } = await TvShowsService.getEpisodes(
          match.Id,
          config.jellyfin.dummyUserId,
          [ItemFields.PATH],
        );
        const associations = episodes.map((episode) => {
          const target = episode.currentVersion?.files[0]?.asset.jellyfinPath;
          const number = jellyfinNumber(episode);
          const item = (Items ?? []).find(
            (item) =>
              item.Id &&
              item.Path &&
              target &&
              item.IndexNumber === number.index &&
              item.ParentIndexNumber === number.season &&
              path.resolve(mapPath(config.jellyfin.pathMapping, item.Path)) ===
                path.resolve(target),
          );
          return { episode, target, item };
        });
        if (associations.some(({ item }) => !item?.Id)) return false;
        await this.prisma.$transaction(async (tx) => {
          for (const { episode, target, item } of associations) {
            await lockEpisode(tx, episode.id);
            const result = await tx.episode.updateMany({
              where: {
                id: episode.id,
                currentVersionId: episode.currentVersionId,
                jellyfinEpisodeId: episode.jellyfinEpisodeId,
                currentVersion: {
                  files: {
                    some: { role: 'video', asset: { jellyfinPath: target } },
                  },
                },
              },
              data: { jellyfinEpisodeId: item!.Id },
            });
            if (!result.count)
              throw new Error('剧集版本或播放关联已变化，请重试同步');
          }
          const updated = await tx.season.updateMany({
            where: {
              id: seasonId,
              jellyfinId,
              lastWriteDirectory: season.lastWriteDirectory,
              lastWriteTitle: season.lastWriteTitle,
            },
            data: { jellyfinId: match.Id },
          });
          if (!updated.count) throw new Error('季度目录已变化，请重试同步');
        });
        return true;
      }
      await this.prisma.season.update({
        where: { id: seasonId },
        data: { jellyfinId: match.Id },
      });
    }
    return true;
  }

  @Cron('*/5 * * * * *') // 每 5 秒
  @LaniFilterCron()
  async syncAllSeasonsJellyfinSeriesId() {
    // 已经写入硬盘，且缺少 Jellyfin ID 的季度
    const seasons = await this.prisma.season.findMany({
      where: {
        jellyfinId: '',
        lastWriteToDisk: {
          not: null,
        },
      },
      include: { jellyfinFolder: true },
    });
    const libraries = new Map<string, Promise<BaseItemDto[]>>();
    const result = await Promise.all(
      seasons.map(async (season) => {
        try {
          const folderId = season.jellyfinFolder.jellyfinId;
          if (!libraries.has(folderId))
            libraries.set(folderId, this.getSeries(folderId));
          return await this.syncJellyfinSeriesId(
            season,
            await libraries.get(folderId),
          );
        } catch (error) {
          this.logger.warn(
            `Failed to match Jellyfin series for season #${season.id}: ${error.message}`,
          );
          return false;
        }
      }),
    );
    return result.filter((b) => b).length;
  }
}

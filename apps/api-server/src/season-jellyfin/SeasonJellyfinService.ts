import {
  BaseItemKind,
  JellyfinHelp,
  MetadataRefreshMode,
} from '@/api/jellyfin';
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
        metadataRefreshMode: MetadataRefreshMode.DEFAULT,
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

  async syncJellyfinSeriesId({
    id: seasonId,
    jellyfinId,
    title,
    jellyfinFolder,
  }: SeasonWithJellyfinFolder) {
    const items = await JellyfinHelp.getItemsByUserId({
      userId: config.jellyfin.dummyUserId,
      searchTerm: title,
      limit: 10,
      parentId: jellyfinFolder.jellyfinId,
      recursive: true,
      includeItemTypes: [BaseItemKind.SERIES],
    });
    const id = (items.Items ?? []).find((item) => item.Name === title)?.Id;
    if (!id) {
      this.logger.verbose(
        `Season #${seasonId} (${title}) matched no Jellyfin season`,
      );
      return false;
    }
    if (id === jellyfinId) {
      return true;
    }
    this.logger.verbose(
      `Season #${seasonId} (${title}) matched Jellyfin season ID ${id}`,
    );
    await this.prisma.season.update({
      where: { id: seasonId },
      data: {
        jellyfinId: id,
      },
    });
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
    const result = await Promise.all(
      seasons.map(async (season) => {
        try {
          return this.syncJellyfinSeriesId(season);
        } catch (_error) {
          return false;
        }
      }),
    );
    return result.filter((b) => b).length;
  }
}

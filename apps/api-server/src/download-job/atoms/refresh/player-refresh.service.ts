import { Injectable } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { Int, Mutation, Resolver } from '@nestjs/graphql';
import {
  JellyfinHelp,
  MetadataRefreshMode,
  TvShowsService,
} from '@/api/jellyfin';
import config from '@/config';
import { BatchQueue, QueueEntry } from './batch-queue';
interface PlayerRequest {
  seriesId: string;
  season: number;
  index: number;
  startedAt?: number;
  refreshed(at: string): Promise<void>;
}
@Injectable()
@Resolver()
export class PlayerRefreshService extends BatchQueue<
  PlayerRequest,
  { jellyfinEpisodeId: string }
> {
  @Interval(15000)
  @Mutation(() => Int)
  async refreshAllPlayerWaitingStatus() {
    return this.refresh();
  }
  protected async refreshBatch(
    entries: Map<
      number,
      QueueEntry<PlayerRequest, { jellyfinEpisodeId: string }>
    >,
  ) {
    const groups = new Map<string, typeof entries>();
    for (const [id, entry] of entries) {
      const group = groups.get(entry.input.seriesId) ?? new Map();
      group.set(id, entry);
      groups.set(entry.input.seriesId, group);
    }
    for (const [seriesId, group] of groups) {
      for (const [id, entry] of group) {
        if (this.entries.get(id) !== entry) group.delete(id);
      }
      if (!group.size) continue;
      try {
        const fresh = [...group.values()].filter(
          (entry) => entry.input.startedAt === undefined,
        );
        if (fresh.length) {
          await JellyfinHelp.refreshItem({
            itemId: seriesId,
            metadataRefreshMode: MetadataRefreshMode.FULL_REFRESH,
            imageRefreshMode: MetadataRefreshMode.FULL_REFRESH,
          });
          const now = Date.now();
          // 一个季度只刷新一次；每个新请求分别记录新的计时起点。
          for (const [id, entry] of group) {
            if (
              entry.input.startedAt !== undefined ||
              this.entries.get(id) !== entry
            )
              continue;
            try {
              await entry.input.refreshed(new Date(now).toISOString());
              entry.input.startedAt = now;
            } catch (error) {
              this.settle(
                id,
                entry,
                error instanceof Error
                  ? error
                  : new Error('保存刷新检查点失败'),
              );
            }
          }
        }
        if (![...group].some(([id, entry]) => this.entries.get(id) === entry))
          continue;
        const { Items } = await TvShowsService.getEpisodes(
          seriesId,
          config.jellyfin.dummyUserId,
        );
        for (const [id, entry] of group) {
          const { season, index, startedAt } = entry.input;
          const episode = (Items ?? []).find(
            (item) =>
              item.IndexNumber === index && item.ParentIndexNumber === season,
          );
          if (episode?.Id)
            this.settle(id, entry, { jellyfinEpisodeId: episode.Id });
          else if (
            startedAt !== undefined &&
            Date.now() - startedAt > 5 * 60 * 1000
          )
            this.settle(
              id,
              entry,
              new Error('超过5分钟未被识别，请检查 Jellyfin 设置'),
            );
        }
      } catch (error) {
        for (const [id, entry] of group)
          this.settle(
            id,
            entry,
            error instanceof Error ? error : new Error('Jellyfin 刷新失败'),
          );
      }
    }
  }
}

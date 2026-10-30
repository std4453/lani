import { Injectable, Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { Int, Mutation, Resolver } from '@nestjs/graphql';
import { IDownloadClient } from '@/download-client/IDownloadClient';
import { BatchQueue, QueueEntry } from './batch-queue';

interface DownloadWait {
  hash: string;
  timeoutMinutes?: number | null;
  onTimeout?: () => void;
}

@Injectable()
@Resolver()
export class DownloadRefreshService extends BatchQueue<
  DownloadWait,
  { downloadPath: string }
> {
  private logger = new Logger(DownloadRefreshService.name);

  constructor(private client: IDownloadClient) {
    super();
  }

  @Interval(30000)
  @Mutation(() => Int)
  async refreshAllLegacyTaskStage() {
    return this.refresh();
  }

  protected async refreshBatch(
    entries: Map<number, QueueEntry<DownloadWait, { downloadPath: string }>>,
  ) {
    try {
      const torrents = await this.client.lookupTorrents([
        ...new Set([...entries.values()].map((entry) => entry.input.hash)),
      ]);
      const byHash = new Map(
        torrents.map((torrent) => [torrent.hash, torrent]),
      );
      for (const [id, entry] of entries) {
        if (this.entries.get(id) !== entry) continue;
        const torrent = byHash.get(entry.input.hash);
        if (!torrent) this.settle(id, entry, new Error('种子不存在或被删除'));
        else if (torrent.status === 'error')
          this.settle(
            id,
            entry,
            new Error(`种子下载失败，当前状态：${torrent.state}`),
          );
        else if (torrent.status === 'success')
          this.settle(id, entry, { downloadPath: torrent.downloadPath });
        else if (
          entry.input.timeoutMinutes != null &&
          entry.input.timeoutMinutes > 0 &&
          torrent.addedAt != null &&
          torrent.addedAt > 0 &&
          Date.now() - torrent.addedAt * 1000 >=
            entry.input.timeoutMinutes * 60000
        ) {
          try {
            entry.input.onTimeout?.();
          } catch (error) {
            this.settle(
              id,
              entry,
              error instanceof Error ? error : new Error(String(error)),
            );
          }
        }
      }
    } catch (error) {
      // 查询失败不能证明下载失败；保留等待对象，下个周期重试。
      this.logger.warn(
        `Torrent status query failed; retrying on next refresh: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }
}

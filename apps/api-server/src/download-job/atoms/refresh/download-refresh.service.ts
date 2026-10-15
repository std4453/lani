import { Injectable } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { Int, Mutation, Resolver } from '@nestjs/graphql';
import { IDownloadClient } from '@/download-job/client/IDownloadClient';
import { BatchQueue, QueueEntry } from './batch-queue';
@Injectable()
@Resolver()
export class DownloadRefreshService extends BatchQueue<
  string,
  { downloadPath: string }
> {
  constructor(private client: IDownloadClient) {
    super();
  }
  @Interval(30000)
  @Mutation(() => Int)
  async refreshAllDownloadStatus() {
    return this.refresh();
  }
  protected async refreshBatch(
    entries: Map<number, QueueEntry<string, { downloadPath: string }>>,
  ) {
    try {
      const torrents = await this.client.lookupTorrents([
        ...new Set([...entries.values()].map((entry) => entry.input)),
      ]);
      const byHash = new Map(
        torrents.map((torrent) => [torrent.hash, torrent]),
      );
      for (const [id, entry] of entries) {
        const torrent = byHash.get(entry.input);
        if (!torrent) this.settle(id, entry, new Error('种子不存在或被删除'));
        else if (torrent.status === 'error')
          this.settle(
            id,
            entry,
            new Error(`种子下载失败，当前状态：${torrent.state}`),
          );
        else if (torrent.status === 'success')
          this.settle(id, entry, { downloadPath: torrent.downloadPath });
      }
    } catch (error) {
      for (const [id, entry] of entries)
        this.settle(
          id,
          entry,
          error instanceof Error ? error : new Error('下载状态刷新失败'),
        );
    }
  }
}

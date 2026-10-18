import { MikanSyncService } from '@/mikan-sync/index.service';
import { NyaaSyncService } from '@/nyaa-sync/index.service';
import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { TorrentHistorySyncState } from './index.model';

@Injectable()
export class TorrentHistorySyncService {
  private readonly logger = new Logger(TorrentHistorySyncService.name);
  private job?: TorrentHistorySyncState & { id: string };
  private readonly jobs = new Map<string, TorrentHistorySyncState>();

  constructor(private mikan: MikanSyncService, private nyaa: NyaaSyncService) {}

  start(): string {
    if (this.job?.running) return this.job.id;
    const job = {
      id: randomUUID(),
      running: true,
      added: 0,
      error: null as string | null,
    };
    this.job = job;
    this.jobs.set(job.id, job);
    // 保留最近十次结果，避免新任务覆盖尚未被页面读到的完成状态。
    if (this.jobs.size > 10) this.jobs.delete(this.jobs.keys().next().value);
    void this.sync((added) => {
      job.added += added;
    }).then(
      (added) => {
        job.added = added;
        job.running = false;
      },
      (error: unknown) => {
        this.logger.error('Torrent history synchronization failed', error);
        job.error = '历史种子同步失败，已入库的种子保留，请重试';
        job.running = false;
      },
    );
    return job.id;
  }

  status(id: string): TorrentHistorySyncState {
    const job = this.jobs.get(id);
    if (!job) {
      throw new Error('同步任务不存在或服务已重启，请重新同步');
    }
    return { running: job.running, added: job.added, error: job.error };
  }

  private async sync(onAdded: (added: number) => void) {
    const results = await Promise.allSettled([
      this.mikan.syncMikanHistory().then((added) => {
        onAdded(added);
        return added;
      }),
      this.nyaa.syncNyaaHistory(onAdded),
    ]);
    let added = 0;
    for (const result of results) {
      if (result.status === 'rejected') throw result.reason;
      added += result.value;
    }
    return added;
  }
}

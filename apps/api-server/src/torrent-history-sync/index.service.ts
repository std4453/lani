import { MikanSyncService } from '@/mikan-sync/index.service';
import { NyaaSyncService } from '@/nyaa-sync/index.service';
import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { TorrentHistorySync } from './index.model';

@Injectable()
export class TorrentHistorySyncService {
  private readonly logger = new Logger(TorrentHistorySyncService.name);
  private job?: TorrentHistorySync & { id: string };
  private readonly jobs = new Map<string, TorrentHistorySync>();

  constructor(private mikan: MikanSyncService, private nyaa: NyaaSyncService) {}

  start(): string {
    if (this.job?.running) return this.job.id;
    const job = {
      id: randomUUID(),
      running: true,
      error: null as string | null,
    };
    this.job = job;
    this.jobs.set(job.id, job);
    // 保留最近十次结果，避免新任务覆盖尚未被页面读到的完成状态。
    if (this.jobs.size > 10) this.jobs.delete(this.jobs.keys().next().value);
    void this.sync().then(
      () => {
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

  status(id: string): TorrentHistorySync {
    const job = this.jobs.get(id);
    if (!job) {
      throw new Error('同步任务不存在或服务已重启，请重新同步');
    }
    return { running: job.running, error: job.error };
  }

  private async sync() {
    const results = await Promise.allSettled([
      this.mikan.syncMikanHistory(),
      this.nyaa.syncNyaaHistory(),
    ]);
    for (const result of results) {
      if (result.status === 'rejected') throw result.reason;
    }
  }
}

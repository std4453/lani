import { PrismaService } from '@/common/prisma.service';
import { LaniFilterCron } from '@/utils/GraphQLExceptionFilter';
import { Prisma, TorrentChannel } from '@lani/db';
import { extractNyaaMetadata, parseNyaaSubtitles } from '@lani/parse-nyaa';
import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { NyaaSyncService } from './index.service';
import { NyaaStoppedError, responseStatus } from './rate-limited-client';

const DAY = 24 * 60 * 60 * 1000;
type Job = {
  id: number;
  hash: string;
  permalink: string | null;
  attempts: number;
  readyAt: number;
  result?: Prisma.TorrentUpdateManyMutationInput;
};

@Injectable()
export class NyaaMetadataService implements OnModuleDestroy {
  private readonly logger = new Logger(NyaaMetadataService.name);
  private running?: Promise<number>;
  private stopped = false;
  private pausedUntil = 0;
  private readonly queue = new Map<number, Job>();
  // 本次运行处理完的任务不自动重新入队；重启后重新读取 pending/failed。
  private readonly finished = new Set<number>();

  constructor(private prisma: PrismaService, private nyaa: NyaaSyncService) {}

  onModuleDestroy() {
    this.stopped = true;
    return this.running;
  }

  private get paused() {
    return Date.now() < Math.max(this.pausedUntil, this.nyaa.pausedUntil);
  }

  @Cron('10 * * * * *')
  @LaniFilterCron()
  syncMetadata(): Promise<number> {
    if (this.stopped || this.paused) return Promise.resolve(0);
    if (this.running) return this.running;
    this.running = this.processBatch().finally(() => {
      this.running = undefined;
    });
    return this.running;
  }

  private async loadQueue() {
    const now = new Date();
    let cursor = 0;
    // 分页扫描防止已耗尽重试的记录占满首批，也能发现后来补入的历史资源。
    while (!this.stopped && !this.paused) {
      const rows = await this.prisma.torrent.findMany({
        where: {
          id: { gt: cursor },
          channel: TorrentChannel.NYAA,
          publishDate: { gte: new Date(now.getTime() - 30 * DAY), lte: now },
          metadataStatus: { in: ['pending', 'failed'] },
        },
        orderBy: { id: 'asc' },
        take: 200,
        select: { id: true, hash: true, permalink: true },
      });
      for (const row of rows) {
        if (!this.queue.has(row.id) && !this.finished.has(row.id)) {
          this.queue.set(row.id, { ...row, attempts: 0, readyAt: 0 });
        }
      }
      if (rows.length < 200) break;
      cursor = rows[rows.length - 1].id;
    }
  }

  private async processBatch() {
    await this.loadQueue();
    let count = 0;
    let processed = 0;
    for (const job of this.queue.values()) {
      if (this.stopped || this.paused || processed >= 40) break;
      if (job.readyAt > Date.now()) continue;
      processed++;
      if (!job.result) {
        let parsing = false;
        try {
          const html = await this.nyaa.fetchDetails(job.permalink ?? '');
          parsing = true;
          const metadata = extractNyaaMetadata(html, job.hash);
          const result = parseNyaaSubtitles(metadata);
          job.result = {
            metadata: JSON.parse(JSON.stringify(result)),
            metadataFetchedAt: new Date(),
            metadataStatus: 'parsed',
            metadataError: null,
          };
        } catch (error) {
          // 退出取消不记作抓取失败，也不保存中间状态。
          if (error instanceof NyaaStoppedError) break;
          const status = responseStatus(error);
          const throttled = status === 429 || status === 403;
          if (throttled) this.pausedUntil = Date.now() + 15 * 60000;
          job.attempts++;
          job.readyAt = Math.max(
            Date.now() + 60000 * 2 ** (job.attempts - 1),
            this.pausedUntil,
          );
          if (job.attempts >= 3) {
            // 只保存最终失败；旧解析结果和成功时间保持不变。
            job.result = {
              metadataStatus: 'failed',
              metadataError: status
                ? `抓取失败（HTTP ${status}）`
                : parsing
                ? '页面校验或字幕解析失败'
                : '抓取失败（网络或请求错误）',
            };
          }
          this.logger.warn(
            `Nyaa metadata ${job.id} attempt ${job.attempts} failed (HTTP ${
              status ?? 'unknown'
            })`,
          );
        }
      }
      if (job.result) {
        // 保存失败时保留结果，下次只重试数据库写入，不重复请求页面。
        const saved = await this.prisma.torrent.updateMany({
          where: { id: job.id },
          data: job.result,
        });
        if (job.result.metadataStatus === 'parsed') count += saved.count;
        this.finished.add(job.id);
        this.queue.delete(job.id);
      }
    }
    if (count) this.logger.log(`Parsed Nyaa metadata for ${count} torrents`);
    return count;
  }
}

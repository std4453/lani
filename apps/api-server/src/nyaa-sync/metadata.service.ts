import { PrismaService } from '@/common/prisma.service';
import { LaniFilterCron } from '@/utils/GraphQLExceptionFilter';
import { Prisma, TorrentChannel } from '@lani/db';
import { Injectable, Logger, OnApplicationShutdown } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { NyaaSyncService } from './index.service';
import { extractNyaaMetadata, parseNyaaSubtitles } from './subtitles';

const DAY = 24 * 60 * 60 * 1000;

@Injectable()
export class NyaaMetadataService implements OnApplicationShutdown {
  private readonly logger = new Logger(NyaaMetadataService.name);
  private running?: Promise<number>;
  private stopped = false;

  constructor(private prisma: PrismaService, private nyaa: NyaaSyncService) {}

  onApplicationShutdown() {
    this.stopped = true;
    return this.running;
  }

  @Cron('10 * * * * *')
  @LaniFilterCron()
  syncMetadata(): Promise<number> {
    if (this.stopped) return Promise.resolve(0);
    if (this.running) return this.running;
    this.running = this.processBatch().finally(() => {
      this.running = undefined;
    });
    return this.running;
  }

  private eligible(now: Date): Prisma.TorrentWhereInput {
    return {
      channel: TorrentChannel.NYAA,
      publishDate: { gte: new Date(now.getTime() - 30 * DAY), lte: now },
      nyaaMetadataFetchedAt: null,
      nyaaMetadataStatus: { in: ['pending', 'failed'] },
      OR: [
        { nyaaMetadataRetryAt: null },
        { nyaaMetadataRetryAt: { lte: now } },
      ],
    };
  }

  private async processBatch() {
    // 数据库本身充当持久队列；每次只取一小批，重启后可继续。
    const rows = await this.prisma.torrent.findMany({
      where: this.eligible(new Date()),
      orderBy: [{ publishDate: 'desc' }, { id: 'desc' }],
      take: 40,
      select: {
        id: true,
        hash: true,
        permalink: true,
        nyaaMetadataFailures: true,
      },
    });
    let count = 0;
    for (const row of rows) {
      if (this.stopped) break;
      const now = new Date();
      // 有限租约避免重叠执行重复处理；崩溃后租约到期即可恢复。
      const lease = new Date(now.getTime() + 5 * 60 * 1000);
      const claimed = await this.prisma.torrent.updateMany({
        where: { id: row.id, ...this.eligible(now) },
        data: { nyaaMetadataRetryAt: lease },
      });
      if (!claimed.count) continue;
      const owner = { id: row.id, nyaaMetadataRetryAt: lease };
      try {
        const metadata = extractNyaaMetadata(
          await this.nyaa.fetchDetails(row.permalink ?? ''),
          row.hash,
        );
        const result = parseNyaaSubtitles(metadata);
        const saved = await this.prisma.torrent.updateMany({
          where: owner,
          data: {
            nyaaMetadata: JSON.parse(JSON.stringify(metadata)),
            nyaaMetadataResult: JSON.parse(JSON.stringify(result)),
            nyaaMetadataFetchedAt: new Date(),
            nyaaMetadataStatus: 'parsed',
            nyaaMetadataFailures: 0,
            nyaaMetadataRetryAt: null,
          },
        });
        count += saved.count;
      } catch (error) {
        const status =
          (error as { status?: number; response?: { status?: number } })
            ?.status ??
          (error as { response?: { status?: number } })?.response?.status;
        const unavailable = status === 404 || status === 410;
        const throttled = status === 429 || status === 403;
        const failures = row.nyaaMetadataFailures + 1;
        const delay = Math.min(DAY, 60000 * 2 ** Math.min(failures, 10));
        await this.prisma.torrent.updateMany({
          where: owner,
          data: {
            nyaaMetadataStatus: unavailable ? 'unavailable' : 'failed',
            nyaaMetadataFailures: failures,
            nyaaMetadataRetryAt: unavailable
              ? null
              : new Date(
                  Date.now() + Math.max(delay, throttled ? 15 * 60000 : 0),
                ),
          },
        });
        // 不记录响应正文或外部错误对象，避免日志带入页面中的任意内容。
        this.logger.warn(
          `Nyaa metadata ${row.id} failed (HTTP ${status ?? 'unknown'})`,
        );
        if (throttled) break;
      }
    }
    if (count) this.logger.log(`Parsed Nyaa metadata for ${count} torrents`);
    return count;
  }
}

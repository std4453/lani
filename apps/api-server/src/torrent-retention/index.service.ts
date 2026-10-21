import { BackgroundQueueService } from '@/background-queue/index.service';
import { HttpRequestError } from '@/common/axios.service';
import { PrismaService } from '@/common/prisma.service';
import config from '@/config';
import { QBittorrentService } from '@/download-client/QBittorrentService';
import { QBTTorrent } from '@/download-client/types';
import { BackgroundJob } from '@lani/db';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Int, Mutation, Resolver } from '@nestjs/graphql';
import { Cron } from '@nestjs/schedule';
import {
  RETENTION_BATCH_SIZE,
  RETENTION_QUEUE,
  retentionDecision,
  torrentIdentities,
  validHash,
} from './policy';

@Injectable()
@Resolver()
export class TorrentRetentionService implements OnModuleInit {
  private readonly logger = new Logger(TorrentRetentionService.name);
  private readonly policy = config.downloadClient.qbittorrent.retention;
  private scanning?: Promise<number>;

  private errorDetails(error: unknown) {
    // 不记录 message、请求或任意异常对象，避免上游错误夹带凭据。
    if (error instanceof HttpRequestError) {
      const status = Number.isInteger(error.status) ? error.status : 'unknown';
      const code =
        typeof error.code === 'string' && /^[A-Z0-9_]{1,40}$/.test(error.code)
          ? error.code
          : 'unknown';
      return `type=HttpRequestError, status=${status}, code=${code}`;
    }
    return `type=${error instanceof Error ? 'Error' : typeof error}`;
  }

  constructor(
    private prisma: PrismaService,
    private qbt: QBittorrentService,
    private queue: BackgroundQueueService,
  ) {}

  onModuleInit() {
    this.queue.register(RETENTION_QUEUE, {
      enabled: this.policy.enabled,
      execute: (job) => this.execute(job),
    });
  }

  @Cron('0 0 */6 * * *')
  async poll() {
    try {
      await this.scanTorrentRetention();
    } catch (error) {
      this.logger.warn(
        `Torrent retention scan failed; waiting for next scan; ${this.errorDetails(
          error,
        )}`,
      );
    }
  }

  @Mutation(() => Int, {
    description: '检查种子保留规则并入队，返回候选数量；配置关闭时不执行',
  })
  scanTorrentRetention(): Promise<number> {
    if (!this.policy.enabled) return Promise.resolve(0);
    if (!this.scanning)
      this.scanning = this.scan().finally(() => (this.scanning = undefined));
    return this.scanning;
  }

  /** 已越过提交阶段的下载证明归属；同 hash 仍被未完成任务使用时暂不清理。 */
  private async ownedHashes() {
    const tasks = await this.prisma.task.findMany({
      where: {
        type: { in: ['DOWNLOAD', 'BATCH_DOWNLOAD'] },
        qbtTorrentHash: { not: null },
      },
      select: {
        qbtTorrentHash: true,
        legacyStage: true,
        isCancelled: true,
        isFailed: true,
      },
    });
    const owned = new Set<string>();
    const active = new Set<string>();
    for (const task of tasks) {
      if (!validHash(task.qbtTorrentHash)) continue;
      const hash = task.qbtTorrentHash.toLowerCase();
      if (!['UNAVAILABLE', 'DOWNLOAD_SUBMITTING'].includes(task.legacyStage))
        owned.add(hash);
      if (
        task.legacyStage !== 'AVAILABLE' &&
        !task.isCancelled &&
        !task.isFailed
      )
        active.add(hash);
    }
    return { owned, active };
  }

  private eligible(
    torrent: QBTTorrent,
    {
      owned,
      active,
    }: Awaited<ReturnType<TorrentRetentionService['ownedHashes']>>,
  ) {
    const identities = torrentIdentities(torrent);
    return (
      identities.some((hash) => owned.has(hash)) &&
      !identities.some((hash) => active.has(hash)) &&
      retentionDecision(torrent, this.policy)
    );
  }

  private async scan() {
    // 不替换待执行或运行中的输入，避免 revision 更新导致同轮删除再次执行。
    if (
      await this.prisma.backgroundJob.count({
        where: { queueName: RETENTION_QUEUE },
      })
    )
      return 0;
    const ownership = await this.ownedHashes();
    if (!ownership.owned.size) return 0;
    // 与 DownloadAtom 的 30 秒轮询分开；低频全列表查询避免历史 hash 形成超长 URL。
    const torrents = await this.qbt.listTorrents();
    const candidates = torrents.filter((torrent) =>
      this.eligible(torrent, ownership),
    );
    const hashes = [
      ...new Set(candidates.map((torrent) => torrent.hash.toLowerCase())),
    ];
    if (!hashes.length) return 0;
    await this.prisma.$transaction((tx) =>
      this.queue.enqueue(tx, RETENTION_QUEUE, 'scan', { hashes }),
    );
    for (const torrent of candidates) {
      const decision = retentionDecision(torrent, this.policy)!;
      this.logger.log(
        `Torrent retention queued: hash=${torrent.hash}, state=${torrent.state}, rule=${decision.rule}, clock=${decision.timeField}, since=${decision.since}, dueAt=${decision.dueAt}`,
      );
    }
    this.logger.log(`Torrent retention scan queued ${hashes.length} torrents`);
    return hashes.length;
  }

  private async execute(job: BackgroundJob) {
    const payload = job.payload as { hashes?: unknown };
    if (!Array.isArray(payload?.hashes) || !payload.hashes.every(validHash))
      throw new Error('种子清理任务内容无效');
    const hashes = [
      ...new Set<string>(
        payload.hashes.map((hash: string) => hash.toLowerCase()),
      ),
    ];
    for (
      let offset = 0;
      offset < hashes.length;
      offset += RETENTION_BATCH_SIZE
    ) {
      const batch = hashes.slice(offset, offset + RETENTION_BATCH_SIZE);
      try {
        // 队列可能在重启后恢复；按最新归属、状态、时间重新判断，避免删除陈旧候选。
        const ownership = await this.ownedHashes();
        const current = await this.qbt.listTorrents({ hashes: batch });
        const selected = [
          ...new Set(
            current
              .filter(
                (torrent) =>
                  batch.includes(torrent.hash.toLowerCase()) &&
                  this.eligible(torrent, ownership),
              )
              .map((torrent) => torrent.hash.toLowerCase()),
          ),
        ];
        if (!selected.length) continue;
        await this.qbt.deleteTorrentsKeepFiles(selected);
        this.logger.log(
          `Torrent retention delete accepted: count=${
            selected.length
          }, hashes=${selected.join(',')}, deleteFiles=false`,
        );
      } catch (error) {
        // 批次错误不抛给队列，不阻塞后续批次；下一轮扫描重新判断，不立即重试。
        this.logger.warn(
          `Torrent retention batch failed: hashes=${batch.join(
            ',',
          )}; waiting for next scan; ${this.errorDetails(error)}`,
        );
      }
    }
    return async () => undefined;
  }
}

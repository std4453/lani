import { QueueConsumer } from '@/background-queue/consumer.decorator';
import { PrismaService } from '@/common/prisma.service';
import config from '@/config';
import { QBittorrentService } from '@/download-client/QBittorrentService';
import { QBTTorrent } from '@/download-client/types';
import { DownloadJobService } from '@/download-job/index.service';
import { enqueueJob } from '@/background-queue/producer';
import { QueueHandler, QueueJob } from '@/background-queue/types';
import { TorrentRetentionPayload, validateRetentionPayload } from './payload';
import { Injectable, Logger } from '@nestjs/common';
import { Int, Mutation, Resolver } from '@nestjs/graphql';
import { Cron } from '@nestjs/schedule';
import { inspect } from 'util';
import {
  RETENTION_BATCH_SIZE,
  RETENTION_QUEUE,
  retentionDecision,
  torrentIdentities,
} from './policy';

@Injectable()
@Resolver()
@QueueConsumer(RETENTION_QUEUE)
export class TorrentRetentionService
  implements QueueHandler<TorrentRetentionPayload>
{
  private readonly logger = new Logger(TorrentRetentionService.name);
  private readonly policy = config.downloadClient.qbittorrent.retention;
  private scanning?: Promise<number>;

  constructor(
    private prisma: PrismaService,
    private qbt: QBittorrentService,
    private downloads: DownloadJobService,
  ) {}

  get enabled() {
    return this.policy.enabled;
  }

  @Cron('0 0 */6 * * *')
  async poll() {
    try {
      await this.scanTorrentRetention();
    } catch (error) {
      this.logger.warn(
        `Torrent retention scan failed; waiting for next scan; ${inspect(
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

  private eligible(
    torrent: QBTTorrent,
    {
      owned,
      active,
    }: Awaited<ReturnType<DownloadJobService['getTorrentOwnership']>>,
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
    const ownership = await this.downloads.getTorrentOwnership();
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
      enqueueJob(tx, RETENTION_QUEUE, 'scan', { version: 1, hashes }),
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

  async execute(job: QueueJob<TorrentRetentionPayload>) {
    const payload = job.payload;
    validateRetentionPayload(payload);
    const hashes = [
      ...new Set(payload.hashes.map((hash) => hash.toLowerCase())),
    ];
    for (
      let offset = 0;
      offset < hashes.length;
      offset += RETENTION_BATCH_SIZE
    ) {
      const batch = hashes.slice(offset, offset + RETENTION_BATCH_SIZE);
      try {
        // 队列可能在重启后恢复；按最新归属、状态、时间重新判断，避免删除陈旧候选。
        const current = await this.qbt.listTorrents({ hashes: batch });
        const ownership = await this.downloads.getTorrentOwnership(
          current.flatMap((torrent) => torrentIdentities(torrent)),
        );
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
          )}; waiting for next scan; ${inspect(error)}`,
        );
      }
    }
    return async () => undefined;
  }
}

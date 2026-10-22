import { BackgroundQueueService } from '@/background-queue/index.service';
import { enqueueJob } from '@/background-queue/producer';
import { QueueCommit, QueueJob, QueueWaiting } from '@/background-queue/types';
import { PrismaService } from '@/common/prisma.service';
import config from '@/config';
import { Prisma, Torrent, TorrentMatchStatus } from '@lani/db';
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  OnApplicationBootstrap,
  OnApplicationShutdown,
  OnModuleInit,
} from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import {
  candidateSeasons,
  catalogReady,
  digest,
  observeCatalog,
  snapshot,
  validatePolicy,
} from './catalog';
import { CatalogSnapshot, CatalogState, MatchQuery } from './protocol';
import { MatcherTransport } from './transport';

import { enqueueTorrentMatch, matchingEnabled } from './producer';
import { CATALOG_QUEUE, MATCH_QUEUE, TorrentMatchPayload } from './queues';
export { CATALOG_QUEUE, MATCH_QUEUE } from './queues';

function stateFrom(value: Prisma.JsonValue): CatalogState | null {
  if (
    value &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    Object.keys(value).length === 0
  )
    return null;
  const state = value as unknown as CatalogState;
  if (
    state?.schemaVersion !== 1 ||
    !state.desired?.version ||
    !Array.isArray(state.desired.catalog) ||
    !Number.isFinite(Date.parse(state.dueAt))
  )
    throw new Error('Unsupported matcher catalog checkpoint');
  return state;
}

export function torrentQuery(
  torrent: Pick<
    Torrent,
    | 'seasonTitleAliases'
    | 'seasonTitleRaw'
    | 'publishDate'
    | 'episodeType'
    | 'episodeNumber'
    | 'episodeNumberFrom'
    | 'episodeNumberTo'
  >,
): MatchQuery | null {
  const aliases = [
    ...new Set(
      [torrent.seasonTitleRaw ?? '', ...torrent.seasonTitleAliases]
        .map((v) => v.trim())
        .filter(Boolean),
    ),
  ];
  if (!aliases.length) return null;
  const single =
    torrent.episodeType === 'EPISODE' &&
    torrent.episodeNumber != null &&
    torrent.episodeNumberFrom == null &&
    torrent.episodeNumberTo == null;
  const episode = single ? Number(torrent.episodeNumber) : undefined;
  return {
    aliases,
    publishedAt: torrent.publishDate.toISOString(),
    ...(episode !== undefined && Number.isFinite(episode) ? { episode } : {}),
  };
}

/** 工程层只选择候选、等待目录并保存结果，不决定时间／集数的模型权重。 */
@Injectable()
export class TorrentMatchService
  implements OnModuleInit, OnApplicationBootstrap, OnApplicationShutdown
{
  private readonly logger = new Logger(TorrentMatchService.name);
  private transport?: MatcherTransport;
  private observing?: Promise<void>;
  private stopped = false;
  private observationFailed = false;
  private observed = false;
  private activating = false;

  constructor(
    private prisma: PrismaService,
    private queues: BackgroundQueueService,
  ) {}

  onModuleInit() {
    const enabled = config.matching.enabled;
    if (enabled) {
      validatePolicy(config.matching);
      this.transport = new MatcherTransport(config.matching);
    }
  }

  async onApplicationBootstrap() {
    await this.queues.initialize();
    if (this.transport) {
      await this.prisma.torrentMatchCatalog.upsert({
        where: { id: 1 },
        create: { id: 1 },
        update: {},
      });
      await this.refreshCatalog();
    }
  }

  @Cron('0 * * * * *')
  refreshCatalog(): Promise<void> {
    if (!this.transport || this.stopped) return Promise.resolve();
    if (this.observing) return this.observing;
    this.observing = this.observe()
      .catch(async () => {
        this.observationFailed = true;
        this.logger.error('Matcher catalog observation failed');
      })
      .finally(() => {
        this.observing = undefined;
      });
    return this.observing;
  }

  private async observe() {
    // 在一致快照里读取季度目录；数据库写入路径无需逐一挂事件。
    const rows = await this.prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SET TRANSACTION ISOLATION LEVEL REPEATABLE READ`;
      return tx.season.findMany({
        select: {
          id: true,
          title: true,
          aliases: true,
          yearAndSemester: true,
        },
      });
    });
    const desired = snapshot(rows);
    await this.prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM torrent_match_catalog WHERE id = 1 FOR UPDATE`;
      const row = await tx.torrentMatchCatalog.findUnique({
        where: { id: 1 },
      });
      const previous = stateFrom(row!.state);
      const next = observeCatalog(previous, desired, new Date());
      if (next === previous) return;
      await tx.torrentMatchCatalog.update({
        where: { id: 1 },
        data: { state: next as unknown as Prisma.InputJsonValue },
      });
      if (next.active?.version === next.desired.version) {
        await tx.backgroundJob.deleteMany({
          where: { queueName: CATALOG_QUEUE },
        });
      } else {
        await enqueueJob(
          tx,
          CATALOG_QUEUE,
          'catalog',
          desired as unknown as Prisma.InputJsonValue,
          new Date(next.dueAt),
        );
      }
    });
    this.observationFailed = false;
    this.observed = true;
    void this.queues.wake(CATALOG_QUEUE);
    void this.queues.wake(MATCH_QUEUE);
  }

  async configure(job: QueueJob<CatalogSnapshot>): Promise<QueueCommit> {
    // 到期时再次读取数据库，不能发布已被新变化取代的快照。
    await this.refreshCatalog();
    if (this.observationFailed) throw new QueueWaiting();
    const desired = job.payload;
    const current = await this.currentCatalog();
    if (
      !current ||
      current.desired.version !== desired.version ||
      Date.parse(current.dueAt) > Date.now()
    )
      throw new QueueWaiting();
    this.activating = true;
    await this.transport!.load(desired);
    return async (tx) => {
      await tx.$queryRaw`SELECT id FROM torrent_match_catalog WHERE id = 1 FOR UPDATE`;
      const row = await tx.torrentMatchCatalog.findUnique({
        where: { id: 1 },
      });
      const current = stateFrom(row!.state);
      if (!current) throw new Error('Missing catalog checkpoint');
      await tx.torrentMatchCatalog.update({
        where: { id: 1 },
        data: {
          state: {
            ...current,
            active: desired,
          } as unknown as Prisma.InputJsonValue,
        },
      });
    };
  }

  private async input(job: QueueJob<TorrentMatchPayload>) {
    if (job.payload?.version !== undefined && job.payload.version !== 1)
      throw new Error('Unsupported matching payload version');
    const id = job.payload?.torrentId;
    if (!Number.isInteger(id) || id! <= 0)
      throw new Error('Invalid matching job');
    const torrent = await this.prisma.torrent.findFirst({ where: { id } });
    return { torrent, query: torrent ? torrentQuery(torrent) : null };
  }

  private async currentCatalog() {
    const row = await this.prisma.torrentMatchCatalog.findUnique({
      where: { id: 1 },
    });
    return stateFrom(row.state);
  }

  async ready(job: QueueJob<TorrentMatchPayload>) {
    if (!this.observed || this.observationFailed || this.activating)
      return false;
    const { torrent, query } = await this.input(job);
    if (!torrent || !query || torrent.matchStatus === 'DISMISSED') return true;
    return catalogReady(await this.currentCatalog(), query, config.matching);
  }

  async match(job: QueueJob<TorrentMatchPayload>): Promise<QueueCommit> {
    const { torrent, query } = await this.input(job);
    if (!torrent || torrent.matchStatus === 'DISMISSED')
      return async () => undefined;
    let matchedSeasonId: number | null = null;
    let matchStatus: TorrentMatchStatus = 'UNSUPPORTED';
    let result: Prisma.InputJsonValue = {
      reason: 'no_parsed_title',
    };
    if (query) {
      const state = await this.currentCatalog();
      // ready 与执行之间只可能有目录更新；交给等待结果而不是用旧候选拒答。
      if (this.activating || !catalogReady(state, query, config.matching))
        throw new QueueWaiting();
      const active = state!.active!;
      const ids = candidateSeasons(active, query, config.matching).map(
        (s) => s.id,
      );
      const inputVersion = digest(query);
      const response = await this.transport!.match(
        active,
        query,
        ids,
        `torrent:${torrent.id}:${inputVersion}`,
      );
      matchedSeasonId =
        response.result.seasonId === null
          ? null
          : Number(response.result.seasonId);
      matchStatus = matchedSeasonId === null ? 'NO_MATCH' : 'MATCHED';
      result = {
        inputVersion,
        catalogVersion: active.version,
        modelVersion: response.modelVersion,
        mode: response.mode,
        reason: response.result.reason ?? null,
        score: response.result.score ?? null,
      };
    }
    return async (tx) => {
      // 先锁外键父行，避免与季度删除的父行 -> 种子顺序形成死锁。
      const seasons =
        matchedSeasonId === null
          ? []
          : await tx.$queryRaw<
              { id: number }[]
            >`SELECT id FROM seasons WHERE id = ${matchedSeasonId} FOR KEY SHARE`;
      // 再按种子 -> 任务的顺序提交；删除的种子只确认任务。
      const existing = await tx.$queryRaw<
        { id: number; matchStatus: TorrentMatchStatus | null }[]
      >`SELECT id, match_status AS "matchStatus" FROM torrents WHERE id = ${torrent.id} FOR UPDATE`;
      if (!existing.length || existing[0].matchStatus === 'DISMISSED') return;
      await tx.torrent.update({
        where: { id: torrent.id },
        data: {
          matchedSeasonId: seasons[0]?.id ?? null,
          matchStatus,
          matchDetails: result,
          matchedAt: new Date(),
        },
      });
    };
  }

  async enqueueBatch(torrentIds: number[], rematch = false): Promise<number> {
    if (!matchingEnabled()) throw new BadRequestException('种子匹配未启用');
    if (
      !Array.isArray(torrentIds) ||
      torrentIds.length < 1 ||
      torrentIds.length > 500 ||
      torrentIds.some((id) => !Number.isSafeInteger(id) || id <= 0)
    )
      throw new BadRequestException('每批需提供 1 至 500 个有效种子 ID');
    const count = await this.prisma.$transaction((tx) =>
      enqueueTorrentMatch(tx, torrentIds, !rematch),
    );
    // 先提交业务状态及队列事务，再唤醒消费者。
    if (count) void this.queues.wake(MATCH_QUEUE);
    return count;
  }

  async cancelAssociation(torrentId: number): Promise<boolean> {
    await this.prisma.$transaction(async (tx) => {
      // 与入队、结果提交保持相同锁顺序；删除任务使在途结果无法确认。
      const rows = await tx.$queryRaw<{ id: number }[]>`
        SELECT id FROM torrents WHERE id = ${torrentId} FOR UPDATE`;
      if (!rows.length) throw new NotFoundException('种子不存在');
      await tx.torrent.update({
        where: { id: torrentId },
        data: {
          matchedSeasonId: null,
          matchStatus: 'DISMISSED',
          matchDetails: { reason: 'user_cancelled' },
          matchedAt: new Date(),
        },
      });
      await tx.backgroundJob.deleteMany({
        where: { queueName: MATCH_QUEUE, key: String(torrentId) },
      });
    });
    return true;
  }

  settleCatalog() {
    this.activating = false;
  }

  async onApplicationShutdown() {
    this.stopped = true;
    await this.observing;
    await this.transport?.close();
  }
}

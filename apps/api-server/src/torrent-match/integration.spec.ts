jest.mock('./llm/llm-matcher', () => ({ LlmMatcher: class {} }));
import { LocalAxiosService } from '@/common/axios.service';
import { Test, TestingModule } from '@nestjs/testing';
import { DiscoveryModule } from '@nestjs/core';
import { QueueExplorer } from '@/background-queue/explorer';
import { MatchCatalogConsumer, TorrentMatchConsumer } from './consumers';
import { PrismaClient, Prisma } from '@lani/db';
import { PrismaService } from '@/common/prisma.service';
import { BackgroundQueueService } from '@/background-queue/index.service';
import {
  CATALOG_QUEUE,
  MATCH_QUEUE,
  TorrentMatchService,
} from './index.service';
import { MatcherTransport } from './transport';
import { LlmMatcher } from './llm/llm-matcher';
import { CatalogState } from './protocol';
import config from '@/config';
import { enqueueTorrentMatch, updateWithTorrentMatching } from './producer';
import { TorrentSyncService } from '@/torrent-sync/index.service';
import { ParseTorrentService } from '@/parse-torrent/index.service';

jest.mock('@/config', () => ({
  __esModule: true,
  default: {
    network: { timeout: 1000 },
    postgresUrl: process.env.LANI_LIFECYCLE_TEST_DATABASE_URL,
    matching: {
      enabled: true,
      endpoint: 'http://127.0.0.1:1',
      timeoutMs: 1000,
      catalogDebounceMs: 30 * 60 * 1000,
      timezone: 'Asia/Shanghai',
      previousQuarters: 0,
      nextQuarters: 0,
    },
  },
}));
const url = process.env.LANI_LIFECYCLE_TEST_DATABASE_URL;
const suite = url ? describe : describe.skip;

suite('种子入库、目录等待与结果持久化', () => {
  let db: PrismaClient;
  let queues: BackgroundQueueService;
  let service: TorrentMatchService;
  let module: TestingModule;
  let folderId: number;
  let seasonId: number;
  let sequence = 0;
  let match: jest.SpyInstance;
  let load: jest.SpyInstance;
  const insert = () =>
    db.$transaction(async (tx) => {
      const torrent = await tx.torrent.create({
        data: {
          title: '动画 03',
          hash: `matching-regression-${++sequence}`,
          torrentLink: 'test:local',
          size: BigInt(1),
          publishDate: new Date('2026-10-21T00:00:00Z'),
          episodeType: 'EPISODE',
          episodeNumber: new Prisma.Decimal(3),
          seasonTitleRaw: '动画',
          seasonTitleAliases: ['Anime'],
          organizationParts: [],
        },
      });
      await enqueueTorrentMatch(tx, [torrent.id]);
      return torrent;
    });
  const update = (id: number, data: Prisma.TorrentUpdateInput) =>
    db.$transaction((tx) =>
      updateWithTorrentMatching(tx, [id], () =>
        tx.torrent.update({ where: { id }, data }),
      ),
    );
  const state = async () =>
    (await db.torrentMatchCatalog.findUnique({ where: { id: 1 } }))!
      .state as unknown as CatalogState;
  const start = async () => {
    module = await Test.createTestingModule({
      imports: [DiscoveryModule],
      providers: [
        { provide: PrismaService, useValue: db },
        LocalAxiosService,
        BackgroundQueueService,
        QueueExplorer,
        TorrentMatchService,
        { provide: LlmMatcher, useValue: {} },
        MatchCatalogConsumer,
        TorrentMatchConsumer,
      ],
    }).compile();
    queues = module.get(BackgroundQueueService);
    service = module.get(TorrentMatchService);
    await module.init();
    await queues.wake(CATALOG_QUEUE);
  };
  const mature = async () => {
    const current = await state();
    const dueAt = new Date(Date.now() - 1000);
    await db.torrentMatchCatalog.update({
      where: { id: 1 },
      data: {
        state: {
          ...current,
          dueAt: dueAt.toISOString(),
        } as unknown as Prisma.InputJsonValue,
      },
    });
    await db.backgroundJob.updateMany({
      where: { queueName: CATALOG_QUEUE },
      data: { availableAt: dueAt },
    });
    await queues.wake(CATALOG_QUEUE);
  };
  beforeAll(async () => {
    const target = new URL(url!);
    if (
      !['localhost', '127.0.0.1'].includes(target.hostname) ||
      !target.pathname.endsWith('_test')
    )
      throw new Error('An isolated localhost *_test database is required');
    db = new PrismaClient({ datasources: { db: { url } } });
    await db.$connect();
  });
  beforeEach(async () => {
    config.matching.enabled = true;
    await db.backgroundJob.deleteMany({
      where: { queueName: { in: [CATALOG_QUEUE, MATCH_QUEUE] } },
    });
    await db.torrentMatchCatalog.deleteMany();
    const folder = await db.jellyfinFolder.create({
      data: {
        name: 'Matcher regression',
        jellyfinId: `matcher-${++sequence}`,
        location: '/tmp/matcher-test',
      },
    });
    folderId = folder.id;
    const season = await db.season.create({
      data: {
        title: `动画-${++sequence}`,
        aliases: ['Anime'],
        tags: [],
        yearAndSemester: '202603',
        jellyfinFolderId: folderId,
      },
    });
    seasonId = season.id;
    load = jest.spyOn(MatcherTransport.prototype, 'load').mockResolvedValue({
      protocolVersion: 2,
      catalogVersion: '',
      modelVersion: 'test',
      mode: 'lexical',
    });
    match = jest
      .spyOn(MatcherTransport.prototype, 'match')
      .mockImplementation(async (catalog, _query, ids, requestId) => ({
        protocolVersion: 2,
        catalogVersion: catalog.version,
        modelVersion: 'test',
        mode: 'lexical',
        decision: { stage: 'primary' },
        requestId,
        result: {
          seasonId: ids.includes(String(seasonId)) ? String(seasonId) : null,
        },
      }));
    await start();
  });
  afterEach(async () => {
    await module.close();
    jest.restoreAllMocks();
    config.matching.enabled = true;
    await db.torrent.deleteMany({
      where: { hash: { startsWith: 'matching-regression-' } },
    });
    await db.backgroundJob.deleteMany({
      where: { queueName: { in: [CATALOG_QUEUE, MATCH_QUEUE] } },
    });
    await db.torrentMatchCatalog.deleteMany();
    await db.season.deleteMany({ where: { jellyfinFolderId: folderId } });
    await db.jellyfinFolder.delete({ where: { id: folderId } });
  });
  afterAll(async () => {
    await db.$disconnect();
  });

  it('enqueues transactionally and saves a match without recursive enqueue', async () => {
    const torrent = await insert();
    expect(
      await db.backgroundJob.count({ where: { queueName: MATCH_QUEUE } }),
    ).toBe(1);
    await queues.wake(MATCH_QUEUE);
    const result = await db.torrent.findUnique({ where: { id: torrent.id } });
    expect(result!.matchedSeasonId).toBe(seasonId);
    expect(result!.matchStatus).toBe('MATCHED');
    expect(result!.matchDetails).toMatchObject({
      modelVersion: 'test',
    });
    expect(
      await db.backgroundJob.count({ where: { queueName: MATCH_QUEUE } }),
    ).toBe(0);
    await db.torrent.update({
      where: { id: torrent.id },
      data: { metadataStatus: 'parsed' },
    });
    expect(
      await db.backgroundJob.count({ where: { queueName: MATCH_QUEUE } }),
    ).toBe(0);
  });

  it('does not require an episode number for season matching', async () => {
    const torrent = await insert();
    await update(torrent.id, { episodeNumber: null });
    await queues.wake(MATCH_QUEUE);
    expect(match).toHaveBeenCalledWith(
      expect.anything(),
      {
        rawTitle: '动画 03',
        aliases: ['动画', 'Anime'],
        publishedAt: '2026-10-21T00:00:00.000Z',
      },
      expect.anything(),
      expect.anything(),
    );
  });

  it('keeps manual cancellation through input changes and repeated cancellation', async () => {
    const torrent = await insert();
    await queues.wake(MATCH_QUEUE);
    await expect(service.cancelAssociation(torrent.id)).resolves.toBe(true);
    await expect(service.cancelAssociation(torrent.id)).resolves.toBe(true);
    await update(torrent.id, { seasonTitleAliases: ['Updated alias'] });
    await db.$transaction((tx) => enqueueTorrentMatch(tx, [torrent.id]));
    await queues.wake(MATCH_QUEUE);
    expect(match).toHaveBeenCalledTimes(1);
    expect(
      await db.torrent.findUnique({ where: { id: torrent.id } }),
    ).toMatchObject({
      matchedSeasonId: null,
      matchStatus: 'DISMISSED',
      matchDetails: { reason: 'user_cancelled' },
    });
    expect(
      await db.backgroundJob.count({ where: { queueName: MATCH_QUEUE } }),
    ).toBe(0);
  });

  it('discards an in-flight result after cancellation and continues the next torrent', async () => {
    const first = await insert();
    const second = await insert();
    let release!: () => void;
    let entered!: () => void;
    const started = new Promise<void>((resolve) => {
      entered = resolve;
    });
    const blocked = new Promise<void>((resolve) => {
      release = resolve;
    });
    const original = match.getMockImplementation()!;
    match.mockImplementationOnce(async (...args) => {
      entered();
      await blocked;
      return original(...args);
    });
    const consuming = queues.wake(MATCH_QUEUE);
    await started;
    try {
      await service.cancelAssociation(first.id);
    } finally {
      release();
    }
    await consuming;
    expect(
      await db.torrent.findUnique({ where: { id: first.id } }),
    ).toMatchObject({
      matchedSeasonId: null,
      matchStatus: 'DISMISSED',
    });
    expect(
      await db.torrent.findUnique({ where: { id: second.id } }),
    ).toMatchObject({
      matchedSeasonId: seasonId,
      matchStatus: 'MATCHED',
    });
    expect(
      await db.backgroundJob.count({ where: { queueName: MATCH_QUEUE } }),
    ).toBe(0);
  });

  it('reports missing torrents without affecting other matching work', async () => {
    const torrent = await insert();
    await expect(service.cancelAssociation(-1)).rejects.toThrow('种子不存在');
    expect(
      await db.backgroundJob.count({ where: { key: String(torrent.id) } }),
    ).toBe(1);
  });

  it('retains old work while disabled without accepting or consuming new work', async () => {
    await insert();
    await module.close();
    config.matching.enabled = false;
    await start();
    const disabled = await insert();
    await queues.wake(MATCH_QUEUE);
    expect(
      await db.torrent.findUnique({ where: { id: disabled.id } }),
    ).toMatchObject({
      matchStatus: null,
      matchedAt: null,
      matchedSeasonId: null,
    });
    await expect(service.enqueueBatch([disabled.id])).rejects.toThrow(
      '种子匹配未启用',
    );
    expect(match).not.toHaveBeenCalled();
    expect(
      await db.backgroundJob.count({ where: { queueName: MATCH_QUEUE } }),
    ).toBe(1);
  });

  it('accepts legacy payloads but retains unsupported versions without invoking the worker', async () => {
    const legacy = await insert();
    await db.backgroundJob.updateMany({
      where: { queueName: MATCH_QUEUE, key: String(legacy.id) },
      data: { payload: { torrentId: legacy.id } },
    });
    await queues.wake(MATCH_QUEUE);
    expect(match).toHaveBeenCalledTimes(1);
    const invalid = await insert();
    await db.backgroundJob.updateMany({
      where: { queueName: MATCH_QUEUE, key: String(invalid.id) },
      data: { payload: { version: 2, torrentId: invalid.id } },
    });
    await queues.wake(MATCH_QUEUE);
    expect(match).toHaveBeenCalledTimes(1);
    expect(
      await db.backgroundJob.findFirst({
        where: { queueName: MATCH_QUEUE },
      }),
    ).toMatchObject({ status: 'failed', attempts: 1 });
  });

  it('does not enqueue skipped duplicate inserts or rolled back records', async () => {
    const torrent = await insert();
    await queues.wake(MATCH_QUEUE);
    await db.torrent.createMany({
      data: [
        {
          title: torrent.title,
          hash: torrent.hash,
          torrentLink: 'test',
          size: BigInt(1),
          publishDate: torrent.publishDate,
        },
      ],
      skipDuplicates: true,
    });
    await expect(
      db.$transaction(async (tx) => {
        await updateWithTorrentMatching(tx, [torrent.id], () =>
          tx.torrent.update({
            where: { id: torrent.id },
            data: { seasonTitleAliases: ['changed'] },
          }),
        );
        throw new Error('rollback');
      }),
    ).rejects.toThrow('rollback');
    expect(
      await db.backgroundJob.count({ where: { queueName: MATCH_QUEUE } }),
    ).toBe(0);
  });

  it('distinguishes unsupported input from refusal, and skips unrelated updates', async () => {
    const torrent = await insert();
    await update(torrent.id, {
      title: ' ',
      seasonTitleRaw: null,
      seasonTitleAliases: [],
    });
    await queues.wake(MATCH_QUEUE);
    expect(
      (await db.torrent.findUnique({ where: { id: torrent.id } }))!.matchStatus,
    ).toBe('UNSUPPORTED');
    expect(match).not.toHaveBeenCalled();
    await update(torrent.id, { subtitleType: '外挂' });
    expect(
      await db.backgroundJob.count({ where: { queueName: MATCH_QUEUE } }),
    ).toBe(0);
  });

  it('uses the real ingestion and reparsing transactions, without duplicate or unrelated jobs', async () => {
    const parser = new ParseTorrentService(db as unknown as PrismaService);
    const sync = new TorrentSyncService(db as unknown as PrismaService, parser);
    const item = {
      hash: `matching-regression-${++sequence}`,
      title: '[Group] Anime - 03 [1080p]',
      torrentLink: 'local',
      permalink: '',
      size: 1n,
      publishDate: new Date('2026-10-21T00:00:00Z'),
    };
    const counts = await Promise.all([
      sync.insert([item], 'MIKAN'),
      sync.insert([item], 'NYAA'),
    ]);
    expect(counts.sort()).toEqual([0, 1]);
    expect(
      await db.backgroundJob.count({ where: { queueName: MATCH_QUEUE } }),
    ).toBe(1);
    const torrent = await db.torrent.findUnique({ where: { hash: item.hash } });
    await queues.wake(MATCH_QUEUE);
    await parser.parseTorrents([torrent!.id]);
    expect(
      await db.backgroundJob.count({ where: { queueName: MATCH_QUEUE } }),
    ).toBe(0);
    // 模拟旧解析字段，真实重解析入口必须在同一事务失效结果并入队。
    await db.torrent.update({
      where: { id: torrent!.id },
      data: { seasonTitleAliases: ['old'] },
    });
    await parser.parseTorrents([torrent!.id]);
    expect(
      await db.backgroundJob.count({ where: { queueName: MATCH_QUEUE } }),
    ).toBe(1);
    expect(
      (await db.torrent.findUnique({ where: { id: torrent!.id } }))!
        .matchStatus,
    ).toBe('PENDING');
  });

  it('waits for a changed candidate catalog, retaining the debounce across restart', async () => {
    await db.season.update({
      where: { id: seasonId },
      data: { aliases: ['Updated anime'] },
    });
    await service.refreshCatalog();
    const before = await state();
    const torrent = await insert();
    await queues.wake(MATCH_QUEUE);
    expect(match).not.toHaveBeenCalled();
    await module.close();
    await start();
    expect((await state()).dueAt).toBe(before.dueAt);
    await queues.wake(MATCH_QUEUE);
    expect(match).not.toHaveBeenCalled();
    await mature();
    await queues.wake(MATCH_QUEUE);
    expect(
      (await db.torrent.findUnique({ where: { id: torrent.id } }))!
        .matchedSeasonId,
    ).toBe(seasonId);
    expect(load).toHaveBeenCalledTimes(2);
  });

  it('does not restore an old worker cache during catalog activation', async () => {
    // 变化在回退目录中的其他季度；debounce 与激活期间都必须等待。
    await db.season.create({
      data: {
        title: 'Future anime',
        aliases: [],
        tags: [],
        yearAndSemester: '202704',
        jellyfinFolderId: folderId,
      },
    });
    await service.refreshCatalog();
    let entered!: () => void;
    let release!: () => void;
    const started = new Promise<void>((resolve) => {
      entered = resolve;
    });
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    load.mockImplementationOnce(async () => {
      entered();
      await gate;
    });
    const changing = mature();
    await started;
    await insert();
    await queues.wake(MATCH_QUEUE);
    expect(match).not.toHaveBeenCalled();
    release();
    await changing;
    await queues.wake(MATCH_QUEUE);
    expect(match).toHaveBeenCalledTimes(1);
    expect(match.mock.calls[0][0].version).toBe(
      (await state()).active!.version,
    );
  });

  it('treats no_match as completed and does not rematch after catalog changes', async () => {
    match.mockImplementation(async (catalog, _query, _ids, requestId) => ({
      protocolVersion: 2,
      catalogVersion: catalog.version,
      modelVersion: 'test',
      mode: 'lexical',
      decision: { stage: 'primary' },
      requestId,
      result: { seasonId: null },
    }));
    const torrent = await insert();
    await queues.wake(MATCH_QUEUE);
    expect(
      (await db.torrent.findUnique({ where: { id: torrent.id } }))!.matchStatus,
    ).toBe('NO_MATCH');
    await db.season.update({
      where: { id: seasonId },
      data: { aliases: ['another'] },
    });
    await service.refreshCatalog();
    await mature();
    await queues.wake(MATCH_QUEUE);
    expect(match).toHaveBeenCalledTimes(1);
  });

  it('pauses a faulty worker once without consuming the rest of the queue', async () => {
    match.mockRejectedValue(new Error('worker offline'));
    await insert();
    await insert();
    await queues.wake(MATCH_QUEUE);
    await queues.wake(MATCH_QUEUE);
    expect(match).toHaveBeenCalledTimes(1);
    expect(
      (await db.backgroundJob.findFirst({
        where: { queueName: MATCH_QUEUE },
        orderBy: { id: 'asc' },
      }))!.status,
    ).toBe('failed');
    expect(
      await db.backgroundJob.count({ where: { queueName: MATCH_QUEUE } }),
    ).toBe(2);
  });

  it('does not persist an old match after the source input is replaced in flight', async () => {
    let entered!: () => void;
    let release!: () => void;
    const started = new Promise<void>((resolve) => {
      entered = resolve;
    });
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    match.mockImplementationOnce(async (catalog, _query, _ids, requestId) => {
      entered();
      await gate;
      return {
        protocolVersion: 2,
        catalogVersion: catalog.version,
        modelVersion: 'stale',
        mode: 'lexical',
        decision: { stage: 'primary' },
        requestId,
        result: { seasonId: null },
      };
    });
    const torrent = await insert();
    const running = queues.wake(MATCH_QUEUE);
    await started;
    await update(torrent.id, { seasonTitleAliases: ['New input'] });
    release();
    await running;
    expect(match).toHaveBeenCalledTimes(2);
    expect(
      (await db.torrent.findUnique({ where: { id: torrent.id } }))!
        .matchDetails,
    ).toMatchObject({ modelVersion: 'test' });
  });

  it('uses raw titles without aliases and carries parser season hints', async () => {
    const torrent = await insert();
    await update(torrent.id, {
      seasonTitleRaw: null,
      seasonTitleAliases: [],
      parseResult: { publisherSeason: 2 },
    });
    await queues.wake(MATCH_QUEUE);
    expect(match.mock.calls[0][1]).toMatchObject({
      rawTitle: '动画 03',
      aliases: [],
      publisherSeason: 2,
    });
    expect(
      (await db.torrent.findUnique({ where: { id: torrent.id } }))!.matchStatus,
    ).toBe('MATCHED');
  });

  it('accepts an old season selected by the fallback stage', async () => {
    await db.season.update({
      where: { id: seasonId },
      data: { yearAndSemester: '200004' },
    });
    await service.refreshCatalog();
    await mature();
    match.mockImplementation(async (catalog, _query, ids, requestId) => {
      expect(ids).not.toContain(String(seasonId));
      expect(
        catalog.catalog.some((season) => season.id === String(seasonId)),
      ).toBe(true);
      return {
        protocolVersion: 2,
        catalogVersion: catalog.version,
        modelVersion: 'test',
        mode: 'external',
        requestId,
        decision: { stage: 'fallback', fallbackReason: 'primary_refused' },
        result: { seasonId: String(seasonId) },
      };
    });
    const torrent = await insert();
    await queues.wake(MATCH_QUEUE);
    expect(
      await db.torrent.findUnique({ where: { id: torrent.id } }),
    ).toMatchObject({
      matchedSeasonId: seasonId,
      matchDetails: {
        decision: { stage: 'fallback', fallbackReason: 'primary_refused' },
      },
    });
  });

  it('discards an in-flight result when an unobserved fallback candidate changes', async () => {
    const torrent = await insert();
    let entered!: () => void;
    let release!: () => void;
    const started = new Promise<void>((resolve) => {
      entered = resolve;
    });
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    const original = match.getMockImplementation()!;
    match.mockImplementationOnce(async (...args) => {
      entered();
      await gate;
      return original(...args);
    });
    const running = queues.wake(MATCH_QUEUE);
    await started;
    await db.season.create({
      data: {
        title: 'Old candidate',
        aliases: [],
        tags: [],
        yearAndSemester: '200004',
        jellyfinFolderId: folderId,
      },
    });
    release();
    await running;
    expect(
      await db.torrent.findUnique({ where: { id: torrent.id } }),
    ).toMatchObject({
      matchStatus: 'PENDING',
      matchedSeasonId: null,
    });
    await service.refreshCatalog();
    await mature();
    await queues.wake(MATCH_QUEUE);
    expect(
      (await db.torrent.findUnique({ where: { id: torrent.id } }))!.matchStatus,
    ).toBe('MATCHED');
  });
});

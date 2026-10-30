import { Prisma, PrismaClient } from '@lani/db';
import {
  atomTypes,
  buildWorkflowSnapshot,
  currentStep,
  requestCancellation,
} from '@lani/workflow';
import { SmartDownloadService } from './smart-download.service';
import { downloadDefinition } from './definition';
jest.mock('@/config', () => ({
  __esModule: true,
  default: {
    jellyfin: { apiEndpoint: 'http://127.0.0.1:1', apiToken: 'test' },
    s3: { bucket: 'test' },
    network: { timeout: { global: 100, local: 100 } },
    smartDownload: { rules: { title: { excludes: [] } } },
  },
}));
const url = process.env.LANI_LIFECYCLE_TEST_DATABASE_URL;
(url ? describe : describe.skip)('智能下载隔离数据库集成', () => {
  let db: PrismaClient;
  let folder: number, season: number, episode: number;
  let service: SmartDownloadService;
  let tasks: any;
  const start = jest.fn(),
    cancel = jest.fn();
  const lookupTorrents = jest.fn();
  const base = new Date('2026-10-01T12:00:00Z');
  const registry = Object.fromEntries(
    atomTypes.map((atom) => [atom, { wants: [] }]),
  ) as any;
  const workflow = () =>
    buildWorkflowSnapshot(downloadDefinition, registry, base.toISOString());
  beforeAll(async () => {
    const parsed = new URL(url!);
    if (
      !['127.0.0.1', 'localhost'].includes(parsed.hostname) ||
      !parsed.pathname.endsWith('_test')
    )
      throw new Error('Expected isolated test database');
    db = new PrismaClient({ datasources: { db: { url } } });
    await db.$connect();
  });
  beforeEach(async () => {
    jest.clearAllMocks();
    folder = (
      await db.jellyfinFolder.create({
        data: {
          name: 'smart test',
          jellyfinId: `smart-${Date.now()}-${Math.random()}`,
          location: '/test',
        },
      })
    ).id;
    season = (
      await db.season.create({
        data: {
          title: `smart-${Date.now()}-${Math.random()}`,
          jellyfinFolderId: folder,
          aliases: [],
          tags: [],
          jellyfinId: 'series',
          smartDownloadEnabled: true,
        },
      })
    ).id;
    episode = (
      await db.episode.create({
        data: {
          seasonId: season,
          index: 1,
          episodeNumber: 1,
          bangumiSort: 25,
          rawAirTime: base,
          airTime: base,
        },
      })
    ).id;
    tasks = {
      creationTransaction: (run) => db.$transaction(run),
      create: (tx, type, _definition, params) =>
        tx.task.create({
          data: {
            ...params,
            type,
            legacyStage: 'DOWNLOAD_SUBMITTING',
            workflow: workflow(),
          },
        }),
      start,
      cancel,
    };
    service = new SmartDownloadService(
      db as any,
      tasks as any,
      { lookupTorrents } as any,
    );
  });
  afterEach(async () => {
    await db.task.deleteMany({
      where: { episodes: { some: { episode: { seasonId: season } } } },
    });
    await db.torrent.deleteMany({ where: { matchedSeasonId: season } });
    await db.season.delete({ where: { id: season } });
    await db.jellyfinFolder.delete({ where: { id: folder } });
  });
  afterAll(async () => {
    await db?.$disconnect();
  });
  async function torrent(
    title = 'Test 01 CHS',
    hours = 1,
    channel: 'MIKAN' | 'NYAA' = 'MIKAN',
  ) {
    const hash = `smart-${Math.random()}`;
    return db.torrent.create({
      data: {
        title,
        hash,
        organizationParts: [],
        seasonTitleAliases: [],
        torrentLink: `magnet:${hash}`,
        size: 1024,
        channel,
        matchedSeasonId: season,
        matchStatus: 'MATCHED',
        parseVersion: 1,
        parseResult: {
          episodeInfo: { type: 'episode', index: 1 },
          subtitleInfo: { languages: ['zh-Hans'], multi: false, delivery: [] },
        },
        publishDate: new Date(base.getTime() + hours * 3600000),
      },
    });
  }
  test('历史资源正常入队，重复与并发扫描不重复创建，任务保存参数和证据', async () => {
    const selected = await torrent();
    const first = service.run();
    expect(service.run()).toBe(first);
    expect(await first).toBe(1);
    expect(await service.run()).toBe(0);
    const [task] = await db.task.findMany({ where: { episodeId: episode } });
    expect(task).toMatchObject({
      type: 'DOWNLOAD',
      isSmartDownload: true,
      downloadTimeoutMinutes: 120,
      smartDownloadTorrentHash: selected.hash,
    });
    expect(task.smartDownloadDecision).toMatchObject({
      version: 1,
      episode: { id: episode },
    });
  });
  test('延迟 Nyaa 详情下轮重算；重启没有游标遗漏', async () => {
    const t = await torrent('Test 01', 1, 'NYAA');
    expect(await service.run()).toBe(0);
    await db.torrent.update({
      where: { id: t.id },
      data: { metadataFetchedAt: new Date(), metadataStatus: 'parsed' },
    });
    service = new SmartDownloadService(db as any, tasks, {
      lookupTorrents,
    } as any);
    expect(await service.run()).toBe(1);
  });
  test('任务创建失败整体回滚，下轮能重新选源', async () => {
    await torrent();
    const create = tasks.create;
    tasks.create = jest.fn(async (...args) => {
      await create(...args);
      throw new Error('injected failure after task insert');
    });
    expect(await service.run()).toBe(0);
    expect(await db.task.count({ where: { episodeId: episode } })).toBe(0);
    expect(await db.taskEpisode.count({ where: { episodeId: episode } })).toBe(
      0,
    );
    expect(start).not.toHaveBeenCalled();
    tasks.create = create;
    expect(await service.run()).toBe(1);
  });
  test('扫描后关闭智能下载，事务复查不再入队', async () => {
    await torrent();
    tasks.creationTransaction = async (run) => {
      await db.season.update({
        where: { id: season },
        data: { smartDownloadEnabled: false },
      });
      return db.$transaction(run);
    };
    expect(await service.run()).toBe(0);
    expect(start).not.toHaveBeenCalled();
  });
  test('12 集 1200 个资源的完整扫描记录耗时并保持每集一次入队', async () => {
    await db.episode.createMany({
      data: Array.from({ length: 11 }, (_, i) => ({
        seasonId: season,
        index: i + 2,
        episodeNumber: i + 2,
        bangumiSort: i + 26,
        rawAirTime: new Date(base.getTime() + (i + 1) * 86400000),
      })),
    });
    const template = await torrent();
    await db.torrent.delete({ where: { id: template.id } });
    const { id: _id, displayId: _displayId, ...fields } = template;
    await db.torrent.createMany({
      data: Array.from({ length: 1200 }, (_, i) => ({
        ...fields,
        hash: `perf-${season}-${i}`,
        torrentLink: `magnet:perf-${season}-${i}`,
        publishDate: new Date(
          base.getTime() + Math.floor(i / 100) * 86400000 + (i % 100) * 60000,
        ),
        parseResult: {
          episodeInfo: { type: 'episode', index: Math.floor(i / 100) + 1 },
          subtitleInfo: { languages: ['zh'], multi: false, delivery: [] },
        },
        metadata: undefined,
        matchDetails: undefined,
      })) as any,
    });
    const started = Date.now();
    expect(await service.run()).toBe(12);
    console.info(
      `Smart download benchmark: episodes=12 torrents=1200 elapsedMs=${
        Date.now() - started
      }`,
    );
    expect(await service.run()).toBe(0);
    expect(start).toHaveBeenCalledTimes(12);
  }, 30000);
  test.each(['timeout', 'manual'] as const)(
    '%s 取消的智能资源不再入选，换源取消仍可重新选择',
    async (cause) => {
      const first = await torrent();
      const next = await torrent('Other 01 CHS', 2);
      await service.run();
      const [task] = await db.task.findMany({ where: { episodeId: episode } });
      const cancelled = requestCancellation(workflow(), base.toISOString(), {
        ...(cause === 'timeout'
          ? { code: 'timeout' as const, reason: '超时' }
          : {}),
      });
      cancelled.status = 'cancelled';
      await db.task.update({
        where: { id: task.id },
        data: {
          isCancelled: true,
          workflow: JSON.parse(JSON.stringify(cancelled)),
        },
      });
      expect(await service.run()).toBe(1);
      expect(
        (
          await db.task.findFirst({
            where: { episodeId: episode },
            orderBy: { id: 'desc' },
          })
        )?.smartDownloadTorrentHash,
      ).toBe(next.hash);
      await db.task.deleteMany({
        where: { episodeId: episode, id: { not: task.id } },
      });
      cancelled.cancellation!.code = 'baha';
      await db.task.update({
        where: { id: task.id },
        data: { workflow: JSON.parse(JSON.stringify(cancelled)) },
      });
      expect(await service.run()).toBe(1);
      expect(
        (
          await db.task.findFirst({
            where: { episodeId: episode },
            orderBy: { id: 'desc' },
          })
        )?.smartDownloadTorrentHash,
      ).toBe(first.hash);
    },
  );
  test('Baha 仅取消下载中的智能任务，已完成下载器任务不替换', async () => {
    await torrent();
    await service.run();
    const [task] = await db.task.findMany({ where: { episodeId: episode } });
    const running = workflow();
    running.currentStepId = downloadDefinition.find(
      (step) => step.atom === 'download',
    )!.id;
    currentStep(running).status = 'running';
    await db.task.update({
      where: { id: task.id },
      data: {
        workflow: JSON.parse(JSON.stringify(running)),
        legacyStage: 'DOWNLOADING',
        qbtTorrentHash: 'qbt',
      },
    });
    await torrent('[Baha] Test 01', 2);
    await db.season.update({
      where: { id: season },
      data: { smartDownloadPreferBaha: true },
    });
    lookupTorrents.mockResolvedValue([{ hash: 'qbt', status: 'success' }]);
    await service.run();
    expect(cancel).not.toHaveBeenCalled();
    lookupTorrents.mockResolvedValue([{ hash: 'qbt', status: 'pending' }]);
    await service.run();
    expect(cancel).toHaveBeenCalledWith(task.id, {
      code: 'baha',
      reason: '智能下载任务取消（Baha 优先）',
    });
    cancel.mockClear();
    await db.task.update({
      where: { id: task.id },
      data: { isSmartDownload: false },
    });
    await service.run();
    expect(cancel).not.toHaveBeenCalled();
  });

  test('失败智能下载排除原 hash，下一轮选择其他候选且不重复入队', async () => {
    const failedTorrent = await torrent();
    await service.run();
    const [failed] = await db.task.findMany({ where: { episodeId: episode } });
    const flow = workflow();
    flow.status = 'failed';
    currentStep(flow).status = 'failed';
    await db.task.update({
      where: { id: failed.id },
      data: {
        isFailed: true,
        workflow: flow as any,
      },
    });
    expect(await service.run()).toBe(0);
    expect(await service.run()).toBe(0);
    expect(await db.task.count({ where: { episodeId: episode } })).toBe(1);
    const next = await torrent('Other 01 CHS', 2);
    expect(await service.run()).toBe(1);
    expect(
      (
        await db.task.findFirst({
          where: { episodeId: episode },
          orderBy: { id: 'desc' },
        })
      )?.smartDownloadTorrentHash,
    ).toBe(next.hash);
    expect(next.hash).not.toBe(failedTorrent.hash);
  });
});

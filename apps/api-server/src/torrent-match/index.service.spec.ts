jest.mock('./llm/llm-matcher', () => ({ LlmMatcher: class {} }));
import { Prisma } from '@lani/db';
import { QueueWaiting } from '@/background-queue/types';
import { observeCatalog, snapshot } from './catalog';
import { TorrentMatchService } from './index.service';
import config from '@/config';
import { MatcherTransport } from './transport';

jest.mock('@/config', () => ({
  __esModule: true,
  default: {
    matching: {
      enabled: true,
      backend: 'external',
      endpoint: 'http://worker:8090',
      timeoutMs: 1000,
      timezone: 'Asia/Shanghai',
      previousQuarters: 0,
      nextQuarters: 0,
    },
  },
}));

function fixture() {
  const season = {
    id: 1,
    title: '动画',
    aliases: [],
    yearAndSemester: '202603',
  };
  const active = snapshot([season]);
  const state = { ...observeCatalog(null, active, new Date(), 0), active };
  const torrent = {
    id: 10,
    title: '[Group] 动画 03',
    parseResult: {},
    publishDate: new Date('2026-10-21T00:00:00Z'),
    seasonTitleRaw: '动画',
    seasonTitleAliases: [],
    episodeType: 'EPISODE',
    episodeNumber: new Prisma.Decimal(3),
    episodeNumberFrom: null,
    episodeNumberTo: null,
    matchStatus: 'PENDING',
  };
  const db = {
    torrent: { findFirst: jest.fn().mockResolvedValue(torrent) },
    torrentMatchCatalog: { findUnique: jest.fn().mockResolvedValue({ state }) },
  };
  const transport = {
    match: jest.fn().mockResolvedValue({
      protocolVersion: 2,
      catalogVersion: active.version,
      modelVersion: 'model-v1',
      mode: 'external',
      decision: { stage: 'fallback', fallbackReason: 'primary_refused' },
      result: { seasonId: '1' },
    }),
  };
  const service = new TorrentMatchService(
    db as any,
    {} as any,
    {} as any,
    {} as any,
  );
  (service as any).matcher = transport;
  const locks: string[] = [];
  const tx = {
    $executeRaw: jest.fn().mockImplementation(async () => {
      locks.push('catalog table');
    }),
    $queryRaw: jest
      .fn()
      .mockImplementation(async (sql: TemplateStringsArray) => {
        const text = sql.join('');
        locks.push(
          text.includes('torrent_match_catalog')
            ? 'catalog checkpoint'
            : text.includes('FROM seasons')
            ? 'season'
            : 'torrent',
        );
        return [
          {
            id: text.includes('FROM seasons') ? 1 : 10,
            matchStatus: 'PENDING',
          },
        ];
      }),
    season: { findMany: jest.fn().mockResolvedValue([season]) },
    torrentMatchCatalog: { findUnique: jest.fn().mockResolvedValue({ state }) },
    torrent: {
      findUnique: jest.fn().mockResolvedValue(torrent),
      update: jest.fn().mockResolvedValue({}),
    },
    backgroundJob: { findUnique: jest.fn().mockResolvedValue({ revision: 1 }) },
  };
  const job = {
    id: 20,
    revision: 1,
    payload: { version: 1, torrentId: 10 },
  } as any;
  return { service, tx, transport, job, torrent, season, state, locks };
}

it('persists the full response unchanged and uses only row locks', async () => {
  const f = fixture();
  const commit = await f.service.match(f.job);
  await commit(f.tx as any);
  expect(f.tx.torrent.update).toHaveBeenCalledWith(
    expect.objectContaining({
      data: expect.objectContaining({
        matchedSeasonId: 1,
        matchDetails: expect.objectContaining({
          decision: { stage: 'fallback', fallbackReason: 'primary_refused' },
        }),
      }),
    }),
  );
  expect(f.locks).toEqual(['catalog checkpoint', 'season', 'torrent']);
  expect(f.tx.$executeRaw).not.toHaveBeenCalled();
  expect(f.tx.torrent.update.mock.calls[0][0].data.matchDetails).toEqual({
    ...(await f.transport.match.mock.results[0].value),
    inputVersion: expect.any(String),
  });
});

it('does not commit if the raw input changed without a new queue revision', async () => {
  const f = fixture();
  const commit = await f.service.match(f.job);
  f.tx.torrent.findUnique.mockResolvedValue({
    ...f.torrent,
    title: 'New title',
  });
  await expect(commit(f.tx as any)).rejects.toBeInstanceOf(QueueWaiting);
  expect(f.tx.torrent.update).not.toHaveBeenCalled();
});

it('leaves a superseding queue revision to the queue transaction guard', async () => {
  const f = fixture();
  const commit = await f.service.match(f.job);
  f.tx.torrent.findUnique.mockResolvedValue({
    ...f.torrent,
    parseResult: { publisherSeason: 2 },
  });
  f.tx.backgroundJob.findUnique.mockResolvedValue({ revision: 2 });
  await expect(commit(f.tx as any)).resolves.toBeUndefined();
  expect(f.tx.torrent.update).not.toHaveBeenCalled();
});

it('rejects a new fallback-only candidate even before catalog observation catches up', async () => {
  const f = fixture();
  const commit = await f.service.match(f.job);
  f.tx.season.findMany.mockResolvedValue([
    f.season,
    { ...f.season, id: 2, yearAndSemester: '200004' },
  ]);
  await expect(commit(f.tx as any)).rejects.toBeInstanceOf(QueueWaiting);
  expect(f.tx.torrent.update).not.toHaveBeenCalled();
});

it('rejects a result after the observed catalog changes', async () => {
  const f = fixture();
  const commit = await f.service.match(f.job);
  f.tx.torrentMatchCatalog.findUnique.mockResolvedValue({
    state: {
      ...f.state,
      desired: snapshot([{ ...f.season, declaredEpisodeCount: 12 }]),
    },
  });
  await expect(commit(f.tx as any)).rejects.toBeInstanceOf(QueueWaiting);
  expect(f.tx.torrent.update).not.toHaveBeenCalled();
});

it('stores arbitrary optional JSON without requiring backend identity', async () => {
  const f = fixture();
  const response = {
    protocolVersion: 2,
    catalogVersion: f.state.active.version,
    requestId: 'response',
    result: { seasonId: '1', custom: ['result-data'] },
    stage: 'backend-stage',
    diagnostics: { anotherVendor: { units: 'unspecified' } },
    other: [null, false],
  };
  f.transport.match.mockResolvedValue(response);
  const commit = await f.service.match(f.job);
  await commit(f.tx as any);
  expect(f.tx.torrent.update.mock.calls[0][0].data.matchDetails).toEqual({
    ...response,
    inputVersion: expect.any(String),
  });
});

it('blocks another inference until the stale catalog is observed after rollback', async () => {
  const f = fixture();
  (f.service as any).observed = true;
  const commit = await f.service.match(f.job);
  f.tx.season.findMany.mockResolvedValue([f.season, { ...f.season, id: 2 }]);
  const refresh = jest
    .spyOn(f.service, 'refreshCatalog')
    .mockResolvedValue(undefined);
  await expect(commit(f.tx as any)).rejects.toBeInstanceOf(QueueWaiting);
  expect(await f.service.ready(f.job)).toBe(false);
  expect(f.transport.match).toHaveBeenCalledTimes(1);
  expect(refresh).not.toHaveBeenCalled();
  f.service.settleMatch();
  expect(refresh).toHaveBeenCalledTimes(1);
  f.service.settleMatch();
  expect(refresh).toHaveBeenCalledTimes(1);
});

it('waits for a refreshed catalog if the selected season is deleted after the snapshot check', async () => {
  const f = fixture();
  (f.service as any).observed = true;
  const commit = await f.service.match(f.job);
  f.tx.$queryRaw.mockResolvedValueOnce([{ id: 1 }]).mockResolvedValueOnce([]);
  const refresh = jest
    .spyOn(f.service, 'refreshCatalog')
    .mockResolvedValue(undefined);
  await expect(commit(f.tx as any)).rejects.toBeInstanceOf(QueueWaiting);
  expect(f.tx.season.findMany).toHaveBeenCalledTimes(1);
  expect(f.tx.torrent.findUnique).not.toHaveBeenCalled();
  expect(f.tx.torrent.update).not.toHaveBeenCalled();
  expect(await f.service.ready(f.job)).toBe(false);
  expect(refresh).not.toHaveBeenCalled();
  f.service.settleMatch();
  expect(refresh).toHaveBeenCalledTimes(1);
});

it.each(['external', 'llm'] as const)(
  '运行时选择 %s 后端并关闭所选实例',
  async (backend) => {
    const previous = config.matching.backend;
    config.matching.backend = backend;
    const builtIn = { close: jest.fn().mockResolvedValue(undefined) };
    const externalClose = jest
      .spyOn(MatcherTransport.prototype, 'close')
      .mockResolvedValue(undefined);
    try {
      const service = new TorrentMatchService(
        {} as any,
        {} as any,
        {} as any,
        builtIn as any,
      );
      service.onModuleInit();
      expect((service as any).matcher).toEqual(
        backend === 'llm' ? builtIn : expect.any(MatcherTransport),
      );
      await service.onApplicationShutdown();
      expect(builtIn.close).toHaveBeenCalledTimes(backend === 'llm' ? 1 : 0);
      expect(externalClose).toHaveBeenCalledTimes(
        backend === 'external' ? 1 : 0,
      );
    } finally {
      config.matching.backend = previous;
      externalClose.mockRestore();
    }
  },
);

it('目录观察使用单次查询，只有写入检查点才开启事务', async () => {
  const season = {
    id: 1,
    title: '动画',
    aliases: [],
    yearAndSemester: '202603',
  };
  const tx = {
    $queryRaw: jest.fn().mockResolvedValue([{ id: 1 }]),
    torrentMatchCatalog: {
      findUnique: jest.fn().mockResolvedValue({ state: {} }),
      update: jest.fn().mockResolvedValue(undefined),
    },
    backgroundJob: {
      upsert: jest.fn().mockResolvedValue({ id: 1 }),
      updateMany: jest.fn().mockResolvedValue({ count: 1 }),
    },
  };
  const db = {
    season: { findMany: jest.fn().mockResolvedValue([season]) },
    $transaction: jest.fn(async (callback) => callback(tx)),
  };
  const queues = { wake: jest.fn().mockResolvedValue(undefined) };
  const service = new TorrentMatchService(
    db as any,
    queues as any,
    {} as any,
    {} as any,
  );
  (service as any).matcher = {};
  await service.refreshCatalog();
  expect(db.season.findMany).toHaveBeenCalledTimes(1);
  expect(db.$transaction).toHaveBeenCalledTimes(1);
  expect(tx.torrentMatchCatalog.update).toHaveBeenCalled();
});

it('waits for new number evidence before committing and selects no episode titles or dates', async () => {
  const previous = config.matching.backend;
  config.matching.backend = 'llm';
  try {
    const f = fixture();
    const commit = await f.service.match(f.job);
    f.tx.season.findMany.mockResolvedValue([
      {
        ...f.season,
        episodes: [
          {
            episodeType: 'EPISODE',
            episodeNumber: new Prisma.Decimal(1),
            bangumiSort: new Prisma.Decimal(14),
          },
        ],
      },
    ]);
    await expect(commit(f.tx as any)).rejects.toBeInstanceOf(QueueWaiting);
    expect(f.tx.torrent.update).not.toHaveBeenCalled();
    expect(f.tx.season.findMany.mock.calls[0][0].select.episodes).toEqual({
      where: { bangumiSort: { not: null } },
      select: { episodeType: true, episodeNumber: true, bangumiSort: true },
    });
  } finally {
    config.matching.backend = previous;
  }
});

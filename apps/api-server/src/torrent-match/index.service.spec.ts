import { Prisma } from '@lani/db';
import { QueueWaiting } from '@/background-queue/types';
import { observeCatalog, snapshot } from './catalog';
import { TorrentMatchService } from './index.service';

jest.mock('@/config', () => ({
  __esModule: true,
  default: {
    matching: {
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
    isCurrent: jest.fn().mockReturnValue(true),
  };
  const service = new TorrentMatchService(db as any, {} as any, {} as any);
  (service as any).transport = transport;
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

it('persists the actual decision stage and locks the catalog before the season and torrent', async () => {
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
  expect(f.locks).toEqual([
    'catalog table',
    'catalog checkpoint',
    'season',
    'torrent',
  ]);
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

it('rejects a result after an observed catalog or worker identity changes', async () => {
  for (const change of ['catalog', 'worker']) {
    const f = fixture();
    const commit = await f.service.match(f.job);
    if (change === 'catalog') {
      f.tx.torrentMatchCatalog.findUnique.mockResolvedValue({
        state: {
          ...f.state,
          desired: snapshot([{ ...f.season, declaredEpisodeCount: 12 }]),
        },
      });
    } else {
      f.transport.isCurrent.mockReturnValue(false);
    }
    await expect(commit(f.tx as any)).rejects.toBeInstanceOf(QueueWaiting);
    expect(f.tx.torrent.update).not.toHaveBeenCalled();
  }
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

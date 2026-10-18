import { EpisodeScrapeService } from './EpisodeScrapeService';
import { Prisma } from '@lani/db';
jest.mock('@/common/prisma.service', () => ({ PrismaService: class {} }));
jest.mock('@/season-scrape/bangumi/index.service', () => ({
  BangumiSeasonService: class {},
}));
jest.mock('@/season-scrape/skyhook/index.service', () => ({
  SkyhookSeasonService: class {},
}));
jest.mock('./bangumi-data/BangumiDataService', () => ({
  BangumiDataService: class {},
}));
function setup(existing: any[], episodes: any[]) {
  const prisma = {
    episode: {
      findMany: jest.fn().mockResolvedValue(existing),
      update: jest.fn(),
      create: jest.fn(),
      deleteMany: jest.fn(),
    },
    season: { update: jest.fn() },
    $transaction: jest.fn().mockResolvedValue([]),
  };
  const bangumiData = { getSchedule: jest.fn().mockResolvedValue(undefined) };
  const service = new EpisodeScrapeService(
    { fetch: async () => ({ episodes }) } as any,
    { fetch: async () => ({ episodes }) } as any,
    prisma as any,
    bangumiData as any,
  );
  return {
    prisma,
    bangumiData,
    sync: (overrides: Record<string, unknown> = {}) =>
      service.syncEpisodeData({
        id: 1,
        episodesSource: 'BGM_CN',
        bangumiId: '1',
        airTime: '23:00',
        downloadOffsetHours: 0,
        ...overrides,
      } as any),
  };
}
it('binds legacy rows without recreating them', async () => {
  const { prisma, sync } = setup(
    [
      {
        id: 5,
        index: 1,
        episodeType: 'EPISODE',
        episodeNumber: null,
        bangumiEpisodeId: null,
      },
    ],
    [
      {
        episodeNumber: '1',
        episodeType: 'EPISODE',
        bangumiEpisodeId: 99,
        title: 'one',
      },
    ],
  );
  await sync();
  expect(prisma.episode.update).toHaveBeenCalledWith(
    expect.objectContaining({
      where: { id: 5 },
      data: expect.objectContaining({ bangumiEpisodeId: 99 }),
    }),
  );
  expect(prisma.episode.create).not.toHaveBeenCalled();
});
it('uses source identity when a chapter is renumbered', async () => {
  const { prisma, sync } = setup(
    [
      {
        id: 5,
        index: 1,
        episodeType: 'EPISODE',
        episodeNumber: new Prisma.Decimal(1),
        bangumiEpisodeId: 99,
      },
    ],
    [
      {
        episodeNumber: '1.5',
        episodeType: 'EPISODE',
        bangumiEpisodeId: 99,
        title: 'half',
      },
    ],
  );
  await sync();
  expect(prisma.episode.update).toHaveBeenCalledWith(
    expect.objectContaining({
      where: { id: 5 },
      data: expect.objectContaining({
        index: null,
        episodeNumber: new Prisma.Decimal('1.5'),
      }),
    }),
  );
});
it('keeps missing local chapters', async () => {
  const { prisma, sync } = setup(
    [{ id: 5, index: 1, episodeType: 'EPISODE' }],
    [],
  );
  await sync();
  expect(prisma.episode.deleteMany).not.toHaveBeenCalled();
});

it.each(['BGM_CN', 'SKYHOOK'])(
  '%s 同步复用同一份作品级时分，并在跨日合成后应用下载偏移',
  async (episodesSource) => {
    const { prisma, sync, bangumiData } = setup(
      [],
      [
        { episodeNumber: '1', title: 'one', airDate: '20261002' },
        { episodeNumber: '2', title: 'two', airDate: '20261009' },
      ],
    );
    bangumiData.getSchedule.mockResolvedValue({
      begin: '2026-10-02T16:23:00Z',
      broadcastAt: '2026-10-02T16:23:00Z',
    });
    await sync({
      episodesSource,
      tvdbId: 1,
      tvdbSeason: 1,
      airTime: '',
      downloadOffsetHours: -2,
    });
    expect(bangumiData.getSchedule).toHaveBeenCalledTimes(1);
    expect(bangumiData.getSchedule).toHaveBeenCalledWith('1');
    const rows = prisma.episode.create.mock.calls.map(([{ data }]) => data);
    expect(
      rows.map((row) => [
        row.rawAirTime.toISOString(),
        row.airTime.toISOString(),
      ]),
    ).toEqual([
      ['2026-10-02T16:23:00.000Z', '2026-10-02T18:23:00.000Z'],
      ['2026-10-09T16:23:00.000Z', '2026-10-09T18:23:00.000Z'],
    ]);
    expect(rows[0]).not.toHaveProperty('broadcastAt');
  },
);

it('没有命中时回退 UTC+8 23:00，正下载偏移仍提前执行', async () => {
  const { prisma, sync } = setup(
    [],
    [
      { episodeNumber: '1', title: 'one', airDate: '20261002' },
      { episodeNumber: '2', title: 'two' },
    ],
  );
  await sync({ airTime: '', downloadOffsetHours: 2 });
  expect(prisma.episode.create.mock.calls[0][0].data).toMatchObject({
    rawAirTime: new Date('2026-10-02T15:00:00Z'),
    airTime: new Date('2026-10-02T13:00:00Z'),
  });
  expect(prisma.episode.create.mock.calls[1][0].data).toMatchObject({
    rawAirTime: null,
    airTime: null,
  });
});

it('没有 Bangumi 对照的 Skyhook 同步使用默认时间，不查索引', async () => {
  const { prisma, sync, bangumiData } = setup(
    [],
    [{ episodeNumber: '1', title: 'one', airDate: '20261002' }],
  );
  await sync({
    episodesSource: 'SKYHOOK',
    bangumiId: null,
    tvdbId: 1,
    tvdbSeason: 1,
    airTime: '',
  });
  expect(bangumiData.getSchedule).not.toHaveBeenCalled();
  expect(prisma.episode.create.mock.calls[0][0].data.rawAirTime).toEqual(
    new Date('2026-10-02T15:00:00Z'),
  );
});

it('明确设置的季度时分优先于作品级时间，手工剧集不参与同步', async () => {
  const { prisma, sync, bangumiData } = setup(
    [],
    [{ episodeNumber: '1', title: 'one', airDate: '20261002' }],
  );
  bangumiData.getSchedule.mockResolvedValue({
    begin: '2026-10-02T16:23:00Z',
    broadcastAt: '2026-10-02T16:23:00Z',
  });
  await sync({ airTime: '21:30' });
  expect(prisma.episode.create.mock.calls[0][0].data.rawAirTime).toEqual(
    new Date('2026-10-02T13:30:00Z'),
  );
  jest.clearAllMocks();
  await expect(sync({ episodesSource: 'MANUAL' })).resolves.toBe(false);
  expect(prisma.episode.create).not.toHaveBeenCalled();
  expect(bangumiData.getSchedule).not.toHaveBeenCalled();
});
it('跳过编号已占用且来源身份不同的剧集', async () => {
  const { prisma, sync } = setup(
    [{ id: 5, index: 1, episodeType: 'EPISODE', bangumiEpisodeId: 99 }],
    [
      {
        episodeNumber: '1',
        episodeType: 'EPISODE',
        bangumiEpisodeId: 100,
        title: 'replacement',
      },
    ],
  );
  await expect(sync()).resolves.toBe(true);
  expect(prisma.episode.update).not.toHaveBeenCalled();
  expect(prisma.episode.create).not.toHaveBeenCalled();
  expect(prisma.$transaction).toHaveBeenCalled();
});

it.each(['前移', '交换'])(
  '上游编号%s时跳过冲突集，其他剧集和同步时间仍正常保存',
  async (mode) => {
    const existing = [1, 2].map((n) => ({
      id: n + 10,
      index: n,
      episodeType: 'EPISODE',
      episodeNumber: new Prisma.Decimal(n),
      bangumiEpisodeId: n + 100,
    }));
    const episodes = [
      {
        episodeType: 'EPISODE',
        episodeNumber: '1',
        bangumiEpisodeId: 102,
        title: 'moved',
      },
      ...(mode === '交换'
        ? [
            {
              episodeType: 'EPISODE',
              episodeNumber: '2',
              bangumiEpisodeId: 101,
              title: 'swapped',
            },
          ]
        : []),
      {
        episodeType: 'EPISODE',
        episodeNumber: '3',
        bangumiEpisodeId: 103,
        title: 'new',
      },
    ];
    const { prisma, sync } = setup(existing, episodes);
    await expect(sync()).resolves.toBe(true);
    expect(prisma.episode.update).not.toHaveBeenCalled();
    expect(prisma.episode.deleteMany).not.toHaveBeenCalled();
    expect(prisma.episode.create).toHaveBeenCalledTimes(1);
    expect(prisma.episode.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ bangumiEpisodeId: 103 }),
      }),
    );
    expect(prisma.season.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { episodesLastSync: expect.any(Date) },
    });
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
  },
);

import { EpisodeScrapeService } from './EpisodeScrapeService';
import { Prisma } from '@lani/db';
jest.mock('@/common/prisma.service', () => ({ PrismaService: class {} }));
jest.mock('@/season-scrape/bangumi/index.service', () => ({
  BangumiSeasonService: class {},
}));
jest.mock('@/season-scrape/skyhook/index.service', () => ({
  SkyhookSeasonService: class {},
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
  const service = new EpisodeScrapeService(
    {} as any,
    { fetch: async () => ({ episodes }) } as any,
    prisma as any,
  );
  return {
    prisma,
    sync: () =>
      service.syncEpisodeData({
        id: 1,
        episodesSource: 'BGM_CN',
        bangumiId: '1',
        airTime: '23:00',
        downloadOffsetHours: 0,
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

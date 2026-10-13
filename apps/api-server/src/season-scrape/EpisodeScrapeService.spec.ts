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
it('rejects a different upstream identity at an occupied number', async () => {
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
  await expect(sync()).rejects.toThrow('identity conflict');
  expect(prisma.$transaction).not.toHaveBeenCalled();
});

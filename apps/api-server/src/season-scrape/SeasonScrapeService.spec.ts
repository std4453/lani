import { SeasonScrapeService } from './SeasonScrapeService';

jest.mock('@/common/prisma.service', () => ({ PrismaService: class {} }));
jest.mock('@/common/s3.service', () => ({ S3Service: class {} }));
jest.mock('@/common/axios.service', () => ({ GlobalAxiosService: class {} }));
jest.mock('@/season-emit/index.service', () => ({
  SeasonEmitService: class {},
}));
jest.mock('@/season-scrape/bangumi/index.service', () => ({
  BangumiSeasonService: class {},
}));
jest.mock('@/season-scrape/skyhook/index.service', () => ({
  SkyhookSeasonService: class {},
}));
jest.mock('@/config', () => ({ __esModule: true, default: {} }));

it('uses explicit metadata sync to rewrite manual seasons without fetching external metadata', async () => {
  const season = { id: 12, title: 'A/B', infoSource: 'MANUAL' } as any;
  const emit = { writeSeasonMetadata: jest.fn() };
  const fetch = jest.fn();
  const prisma = {
    season: { findUnique: jest.fn().mockResolvedValue(season) },
  };
  const service = new SeasonScrapeService(
    emit as any,
    { fetch } as any,
    { fetch } as any,
    prisma as any,
    {} as any,
    {} as any,
  );
  await service.syncMetadata(season);
  expect(emit.writeSeasonMetadata).toHaveBeenCalledWith(season);
  expect(fetch).not.toHaveBeenCalled();
});

function setup(infoSource: string) {
  const season = {
    id: 12,
    title: '中文标题',
    infoSource,
    bangumiId: '1',
    tvdbId: '2',
    tvdbSeason: 1,
    aliases: ['旧名称'],
  } as any;
  const fetch = jest
    .fn()
    .mockResolvedValue({ info: { aliases: ['Original', '中文标题'] } });
  const emit = { writeSeasonMetadata: jest.fn() };
  const prisma = { season: { update: jest.fn().mockResolvedValue(season) } };
  const service = new SeasonScrapeService(
    emit as any,
    { fetch } as any,
    { fetch } as any,
    prisma as any,
    {} as any,
    {} as any,
  );
  return { season, fetch, emit, prisma, service };
}

it.each(['BGM_CN', 'SKYHOOK'])(
  '%s 同步覆盖别名且不修改主标题',
  async (source) => {
    const { season, service, prisma } = setup(source);
    await service.syncMetadata(season);
    const data = prisma.season.update.mock.calls[0][0].data;
    expect(data.aliases).toEqual(['Original', '中文标题']);
    expect(data).not.toHaveProperty('title');
  },
);

it('来源不再包含名称时清空历史别名', async () => {
  const { season, service, prisma, fetch } = setup('BGM_CN');
  fetch.mockResolvedValue({ info: { aliases: [] } });
  await service.syncMetadata(season);
  expect(prisma.season.update.mock.calls[0][0].data.aliases).toEqual([]);
});

it.each(['BGM_CN', 'SKYHOOK'])(
  '%s 拉取失败时不改写已有别名',
  async (source) => {
    const { season, service, prisma, fetch, emit } = setup(source);
    fetch.mockRejectedValue(new Error('upstream failed'));
    await expect(service.syncMetadata(season)).rejects.toThrow(
      'upstream failed',
    );
    expect(prisma.season.update).not.toHaveBeenCalled();
    expect(emit.writeSeasonMetadata).not.toHaveBeenCalled();
    expect(season.aliases).toEqual(['旧名称']);
  },
);

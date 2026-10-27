import { SeasonScrapeService } from './SeasonScrapeService';

jest.mock('@/common/prisma.service', () => ({ PrismaService: class {} }));
jest.mock('@/common/s3.service', () => ({ S3Service: class {} }));
jest.mock('@/image-thumbnail/index.service', () => ({
  ImageThumbnailService: class {},
}));
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
    { path: jest.fn() } as any,
    { findAnime: jest.fn().mockResolvedValue(undefined) } as any,
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
    { path: jest.fn() } as any,
    { findAnime: jest.fn().mockResolvedValue(undefined) } as any,
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

it('弹弹play查询失败不阻断原有元数据和NFO同步', async () => {
  const { season, service, prisma, emit } = setup('BGM_CN');
  await service.syncMetadata(season);
  expect(prisma.season.update).toHaveBeenCalled();
  expect(emit.writeSeasonMetadata).toHaveBeenCalled();
});

it('停用查询后保留已有作品身份并继续写NFO', async () => {
  const { season, service, prisma, emit } = setup('BGM_CN');
  season.dandanplayAnimeId = '18690';
  await service.syncMetadata(season);
  const data = prisma.season.update.mock.calls[0][0].data;
  expect(data).not.toHaveProperty('dandanplayAnimeId');
  expect(data).not.toHaveProperty('episodes');
  expect(emit.writeSeasonMetadata).toHaveBeenCalledWith(
    expect.objectContaining({ dandanplayAnimeId: '18690' }),
  );
});

it('作品映射变化时清除旧的单集映射', async () => {
  const { season, service, prisma } = setup('BGM_CN');
  (service as any).dandanplay.findAnime.mockResolvedValue('18690');
  await service.syncMetadata({ ...season, dandanplayAnimeId: '123' });
  expect(prisma.season.update.mock.calls[0][0].data).toMatchObject({
    dandanplayAnimeId: '18690',
    episodes: { updateMany: { data: { dandanplayEpisodeId: null } } },
  });
});

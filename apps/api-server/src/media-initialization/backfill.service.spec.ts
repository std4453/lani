import { MediaBackfillService } from './backfill.service';
import { getLibraryItem } from '@/api/jellyfin/library-item';
import { applyBackfill, inspectBackfillFile } from './backfill';
jest.mock('@/config', () => ({
  __esModule: true,
  default: { jellyfin: { dummyUserId: 'user', pathMapping: [] } },
}));
jest.mock('@/common/prisma.service', () => ({ PrismaService: class {} }));
jest.mock('@/media-pool/media-pool.service', () => ({
  MediaPoolService: class {},
}));
jest.mock('@/api/jellyfin/library-item', () => ({ getLibraryItem: jest.fn() }));
jest.mock('@/utils/media-companions', () => ({
  companions: jest.fn().mockResolvedValue([]),
}));
jest.mock('./backfill', () => ({
  applyBackfill: jest.fn(),
  inspectBackfillFile: jest.fn(async (path, role) => ({ path, role })),
}));
afterEach(() => jest.clearAllMocks());
function setup(episodes: any[] = []) {
  const findFirst = jest.fn(async () => episodes.shift() ?? null);
  const db = { episode: { count: jest.fn().mockResolvedValue(0), findFirst } };
  const service = new MediaBackfillService(db as never, {} as never);
  return { service, findFirst };
}
it.each(['all-versioned', 'only-undownloaded'])(
  '%s 没有待回填剧集，不请求 Jellyfin 详情',
  async () => {
    const { service, findFirst } = setup();
    await service.run();
    expect(findFirst).toHaveBeenCalledWith({
      where: { jellyfinEpisodeId: { not: null }, currentVersionId: null },
      orderBy: { id: 'asc' },
    });
    expect(getLibraryItem).not.toHaveBeenCalled();
    expect(service.mediaRegistrationProgress().state).toBe('ready');
  },
);
it('混合数据只枚举数据库筛选出的待回填剧集，经过统一接入层登记视频和外置字幕', async () => {
  const { service } = setup([{ id: 4, jellyfinEpisodeId: 'missing-version' }]);
  (getLibraryItem as jest.Mock).mockResolvedValue({
    Path: '/library/a.mkv',
    MediaStreams: [
      { IsExternal: true, Type: 'Subtitle', Path: '/library/a.zh.ass' },
    ],
  });
  await service.run();
  expect(getLibraryItem).toHaveBeenCalledTimes(1);
  expect(getLibraryItem).toHaveBeenCalledWith(
    'user',
    'missing-version',
    expect.any(AbortSignal),
  );
  expect(inspectBackfillFile).toHaveBeenCalledWith(
    '/library/a.zh.ass',
    'subtitle',
  );
  expect(applyBackfill).toHaveBeenCalledWith(
    expect.anything(),
    expect.anything(),
    [expect.objectContaining({ episodeId: 4 })],
  );
  expect(service.mediaRegistrationProgress().completed).toBe(1);
});
it('瞬时失败有限重试，鉴权错误立即失败且不登记', async () => {
  const get = getLibraryItem as jest.Mock;
  const first = setup([{ id: 4, jellyfinEpisodeId: 'missing' }]);
  get.mockRejectedValue(
    Object.assign(new Error('timeout'), { code: 'ETIMEDOUT' }),
  );
  await expect(first.service.run()).rejects.toThrow('timeout');
  expect(get).toHaveBeenCalledTimes(3);
  get.mockClear();
  get.mockRejectedValue(Object.assign(new Error('forbidden'), { status: 403 }));
  await expect(
    setup([{ id: 4, jellyfinEpisodeId: 'missing' }]).service.run(),
  ).rejects.toThrow('forbidden');
  expect(get).toHaveBeenCalledTimes(1);
  expect(applyBackfill).not.toHaveBeenCalled();
});

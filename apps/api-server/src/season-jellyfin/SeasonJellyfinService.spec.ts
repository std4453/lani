import { JellyfinHelp, ItemFields, MetadataRefreshMode } from '@/api/jellyfin';
import { SeasonJellyfinService } from './SeasonJellyfinService';

jest.mock('@/common/prisma.service', () => ({ PrismaService: class {} }));
jest.mock('@/utils/GraphQLExceptionFilter', () => ({
  LaniFilterCron: () => () => undefined,
}));
jest.mock('@/config', () => ({
  __esModule: true,
  default: {
    jellyfin: {
      dummyUserId: 'user',
      pathMapping: [{ from: '/media', to: '/local' }],
    },
  },
}));

const season = {
  id: 12,
  title: '展示名/新标题',
  directory: 'new',
  lastWriteDirectory: 'new',
  lastWriteTitle: 'old',
  jellyfinId: '',
  jellyfinFolder: { jellyfinId: 'library', location: '/media' },
} as any;

afterEach(() => jest.restoreAllMocks());

function setup() {
  const prisma = { season: { update: jest.fn(), findMany: jest.fn() } };
  const service = new SeasonJellyfinService(prisma as any);
  const refresh = jest.spyOn(JellyfinHelp, 'refreshItem').mockResolvedValue();
  const warn = jest
    .spyOn((service as any).logger, 'warn')
    .mockImplementation(() => undefined);
  return { service, prisma, warn, refresh };
}

it('reads the NFO of a newly discovered series after its initial path match', async () => {
  const { service, prisma, refresh } = setup();
  await service.syncJellyfinSeriesId(season, [
    { Id: 'new-series', Path: '/media/new', ProviderIds: {} },
  ]);
  expect(refresh).toHaveBeenCalledWith({
    itemId: 'new-series',
    metadataRefreshMode: MetadataRefreshMode.FULL_REFRESH,
    imageRefreshMode: MetadataRefreshMode.DEFAULT,
  });
  expect(prisma.season.update).toHaveBeenCalled();
});

it('leaves an unsuccessful NFO refresh eligible for the next association retry', async () => {
  const { service, prisma, refresh } = setup();
  refresh.mockRejectedValue(new Error('refresh unavailable'));
  await expect(
    service.syncJellyfinSeriesId(season, [
      { Id: 'new-series', Path: '/media/new' },
    ]),
  ).rejects.toThrow('refresh unavailable');
  expect(prisma.season.update).not.toHaveBeenCalled();
});

it('does not refresh legacy NFOs until the season has been explicitly written', async () => {
  const { service, refresh } = setup();
  await service.syncJellyfinSeriesId({ ...season, directory: null }, [
    { Id: 'legacy', Path: '/media/new' },
  ]);
  expect(refresh).not.toHaveBeenCalled();
});

it('explicit metadata sync rereads NFOs even when Jellyfin previously cached the item', async () => {
  const { service, refresh } = setup();
  await service.refreshAfterWriteToDisk({ ...season, jellyfinId: 'existing' });
  expect(refresh).toHaveBeenCalledWith(
    expect.objectContaining({
      itemId: 'existing',
      metadataRefreshMode: MetadataRefreshMode.FULL_REFRESH,
    }),
  );
});

it('prioritizes Lani ID over title and path, warning and choosing the first duplicate', async () => {
  const { service, prisma, warn } = setup();
  await service.syncJellyfinSeriesId(season, [
    { Id: 'path-only', Name: season.title, Path: '/media/new' },
    {
      Id: 'first',
      Name: 'different',
      Path: '/media/old',
      ProviderIds: { Lani: '12' },
    },
    { Id: 'second', Path: '/media/new', ProviderIds: { lani: '12' } },
  ]);
  expect(prisma.season.update).toHaveBeenCalledWith({
    where: { id: 12 },
    data: { jellyfinId: 'first' },
  });
  expect(warn).toHaveBeenCalledWith(expect.stringContaining('matched 2'));
});

it('falls back to the exact Jellyfin path only when its Lani ID is absent', async () => {
  const { service, prisma } = setup();
  expect(
    await service.syncJellyfinSeriesId(season, [
      { Id: 'wrong-id', Path: '/media/new', ProviderIds: { lani: '13' } },
      { Id: 'title-only', Name: season.title, Path: '/elsewhere/new' },
      { Id: 'local-path', Path: '/local/new' },
    ]),
  ).toBe(false);
  expect(prisma.season.update).not.toHaveBeenCalled();
  expect(
    await service.syncJellyfinSeriesId(season, [
      { Id: 'legacy', Path: '/media/new/' },
    ]),
  ).toBe(true);
});

it('finds matches beyond the first page and shares the library query within a cron run', async () => {
  const { service, prisma } = setup();
  prisma.season.findMany.mockResolvedValue([season, { ...season, id: 13 }]);
  const get = jest
    .spyOn(JellyfinHelp, 'getItemsByUserId')
    .mockResolvedValueOnce({
      Items: Array.from({ length: 100 }, (_, i) => ({ Id: `other-${i}` })),
      TotalRecordCount: 102,
    })
    .mockResolvedValueOnce({
      Items: [
        { Id: 'found-12', ProviderIds: { lani: '12' } },
        { Id: 'found-13', ProviderIds: { lani: '13' } },
      ],
      TotalRecordCount: 102,
    });
  expect(await service.syncAllSeasonsJellyfinSeriesId()).toBe(2);
  expect(get).toHaveBeenCalledTimes(2);
  expect(get).toHaveBeenLastCalledWith(
    expect.objectContaining({
      startIndex: 100,
      parentId: 'library',
      fields: [ItemFields.PATH, ItemFields.PROVIDER_IDS],
    }),
  );
  expect(get.mock.calls[0][0]).not.toHaveProperty('searchTerm');
});

it('logs query failures without writing an association', async () => {
  const { service, prisma, warn } = setup();
  prisma.season.findMany.mockResolvedValue([season]);
  jest
    .spyOn(JellyfinHelp, 'getItemsByUserId')
    .mockRejectedValue(new Error('unavailable'));
  expect(await service.syncAllSeasonsJellyfinSeriesId()).toBe(0);
  expect(prisma.season.update).not.toHaveBeenCalled();
  expect(warn).toHaveBeenCalledWith(expect.stringContaining('unavailable'));
});

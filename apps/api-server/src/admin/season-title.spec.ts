import { AdminResolver } from './index.resolver';
import { BangumiAPIService } from '@/api/bangumi';
import { WriteGate } from '@/application-state/write-gate';

jest.mock('@/config', () => ({ __esModule: true, default: {} }));
jest.mock('@/common/prisma.service', () => ({ PrismaService: class {} }));
jest.mock('@/download-job/index.service', () => ({
  DownloadJobService: class {},
}));
jest.mock('@/season-emit/index.service', () => ({
  SeasonEmitService: class {},
}));
jest.mock('@/api/bangumi', () => ({
  BangumiAPIService: { getSubjectById: jest.fn() },
  SubjectType: { Anime: 2 },
}));

it('保存标题时将旧目录定位交给媒体服务处理', async () => {
  let season = {
    id: 1,
    title: 'old',
    directory: 'old',
    lastWriteDirectory: null,
    lastWriteTitle: null,
  };
  const prisma = {
    downloadSource: { deleteMany: jest.fn(), createMany: jest.fn() },
    season: {
      update: jest.fn(async ({ data }) => (season = { ...season, ...data })),
    },
    $queryRaw: jest.fn(),
    $transaction: (queries) => Promise.all(queries),
  };
  const emit = { writeSeasonMetadata: jest.fn() };
  const gate = new WriteGate();
  gate.open();
  const resolver = new AdminResolver(
    prisma as never,
    { enqueueDownloadJobsInternal: jest.fn() } as never,
    emit as never,
    {} as never,
    { emit: jest.fn() } as never,
    gate,
  );
  await resolver.saveSeason(1, { title: 'new', sources: [] } as never);
  expect(emit.writeSeasonMetadata).toHaveBeenCalledWith(
    expect.objectContaining({
      title: 'new',
      directory: 'old',
      lastWriteDirectory: null,
      lastWriteTitle: null,
    }),
  );
});

it.each([
  ['中文标题', 'Original', '中文标题'],
  ['', 'Original', 'Original'],
  ['', '', '未命名'],
])('Bangumi 默认标题保持中文优先：%s / %s', async (nameCn, name, expected) => {
  (BangumiAPIService.getSubjectById as jest.Mock).mockResolvedValue({
    id: 1,
    type: 2,
    name_cn: nameCn,
    name,
  });
  const resolver = new AdminResolver(
    { season: { findFirst: jest.fn().mockResolvedValue(null) } } as any,
    {} as any,
    {} as any,
    {} as any,
    {} as any,
    {} as any,
  );
  expect((await resolver.searchBangumi('bgmid:1'))[0].name).toBe(expected);
});

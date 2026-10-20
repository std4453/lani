import { AdminResolver } from './index.resolver';
import { BangumiAPIService } from '@/api/bangumi';

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
  );
  expect((await resolver.searchBangumi('bgmid:1'))[0].name).toBe(expected);
});

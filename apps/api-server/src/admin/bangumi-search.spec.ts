import { AdminResolver } from './index.resolver';
import { BangumiAPIService } from '@/api/bangumi';
import { bangumiSearchTags } from './bangumi-search-tags';

jest.mock('@/config', () => ({ __esModule: true, default: {} }));
jest.mock('@/common/prisma.service', () => ({ PrismaService: class {} }));
jest.mock('@/download-job/index.service', () => ({
  DownloadJobService: class {},
}));
jest.mock('@/season-emit/index.service', () => ({
  SeasonEmitService: class {},
}));
jest.mock('@/api/bangumi', () => ({
  BangumiAPIService: {
    getSubjectById: jest.fn(),
    searchSubjects: jest.fn(),
    searchSubjectByKeywords: jest.fn(),
  },
  SubjectType: { Anime: 2 },
  Legacy_SubjectType: { _2: 2 },
}));

const api = BangumiAPIService as jest.Mocked<typeof BangumiAPIService>;
const tags = [
  { name: '奇幻', count: 3 },
  { name: ' 漫画改 ', count: 10 },
];
const item = { id: 400602, name_cn: '葬送的芙莉莲', air_date: '2023-09-29' };
let resolver: AdminResolver;

beforeEach(() => {
  jest.resetAllMocks();
  resolver = new AdminResolver(
    {
      season: {
        findMany: jest.fn().mockResolvedValue([{ bangumiId: '400602' }]),
        findFirst: jest.fn().mockResolvedValue(null),
      },
    } as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
  );
  api.searchSubjectByKeywords.mockResolvedValue({ list: [item] });
  api.getSubjectById.mockResolvedValue({ ...item, tags } as never);
});

it('旧版使用 large 保留日期，并按热度补齐详情标签', async () => {
  expect(await resolver.searchBangumi('芙莉莲', false)).toEqual([
    {
      id: '400602',
      name: '葬送的芙莉莲',
      airDate: '2023-09-29',
      added: true,
      tags: ['漫画改', '奇幻'],
    },
  ]);
  expect(api.searchSubjectByKeywords).toHaveBeenCalledWith(
    '芙莉莲',
    2,
    'large',
    0,
    25,
  );
  expect(api.getSubjectById).toHaveBeenCalledWith(400602);
});

it('标签详情失败时保留可选条目及日期', async () => {
  api.getSubjectById.mockRejectedValue(new Error('timeout'));
  expect((await resolver.searchBangumi('芙莉莲', false))[0]).toMatchObject({
    id: '400602',
    airDate: '2023-09-29',
    tags: [],
  });
});

it('新版和精确查询复用已有标签，不重复请求详情', async () => {
  const subject = { ...item, type: 2, date: item.air_date, tags };
  api.searchSubjects.mockResolvedValue({ data: [subject] } as never);
  expect((await resolver.searchBangumi('芙莉莲', true))[0].tags).toEqual([
    '漫画改',
    '奇幻',
  ]);
  expect(api.getSubjectById).not.toHaveBeenCalled();
  api.getSubjectById.mockResolvedValue(subject as never);
  expect((await resolver.searchBangumi('bgmid:400602'))[0]).toMatchObject({
    airDate: '2023-09-29',
    tags: ['漫画改', '奇幻'],
  });
  expect(api.getSubjectById).toHaveBeenCalledTimes(1);
});

it('空结果不请求详情，搜索失败仍向调用方报告', async () => {
  api.searchSubjectByKeywords.mockResolvedValue({ list: [] });
  expect(await resolver.searchBangumi('无结果', false)).toEqual([]);
  expect(api.getSubjectById).not.toHaveBeenCalled();
  api.searchSubjectByKeywords.mockRejectedValue(new Error('unavailable'));
  await expect(resolver.searchBangumi('失败', false)).rejects.toThrow(
    'unavailable',
  );
});

it('多个搜索请求共享详情并发上限，保持搜索顺序', async () => {
  api.searchSubjectByKeywords.mockResolvedValue({
    list: Array.from({ length: 9 }, (_, id) => ({ ...item, id })),
  });
  let active = 0;
  let peak = 0;
  (api.getSubjectById as jest.Mock).mockImplementation(async (id: number) => {
    peak = Math.max(peak, ++active);
    await new Promise((resolve) => setTimeout(resolve, (9 - id) * 2));
    active--;
    return { tags: [{ name: String(id), count: 1 }] } as never;
  });
  const results = await Promise.all([
    resolver.searchBangumi('甲', false),
    resolver.searchBangumi('乙', false),
  ]);
  expect(peak).toBe(4);
  for (const result of results)
    expect(result.map((entry) => entry.tags[0])).toEqual(
      Array.from({ length: 9 }, (_, id) => String(id)),
    );
});

it('缺失、空白和重复标签归一化且不修改来源', () => {
  expect(bangumiSearchTags()).toEqual([]);
  const source = [...tags, { name: '奇幻', count: 1 }, { name: ' ', count: 5 }];
  expect(bangumiSearchTags(source)).toEqual(['漫画改', '奇幻']);
  expect(source[0]).toEqual(tags[0]);
});

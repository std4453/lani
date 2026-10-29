import { Logger } from '@nestjs/common';
import { BangumiAPIService } from '@/api/bangumi';
import { BangumiSeasonService } from './index.service';
jest.mock('@/api/bangumi', () => ({
  BangumiAPIService: { getEpisodes: jest.fn(), getSubjectById: jest.fn() },
  EpType: { MainStory: 0, SP: 1 },
}));
const getEpisodes = BangumiAPIService.getEpisodes as jest.Mock;
const getSubjectById = BangumiAPIService.getSubjectById as jest.Mock;
const row = (id: number, type: number, ep: number, sort: number) => ({
  id,
  type,
  ep,
  sort,
  airdate: '',
  name: `Episode ${id}`,
  name_cn: '',
  desc: '',
});
beforeEach(() => {
  getEpisodes.mockReset();
  getSubjectById.mockReset();
  getSubjectById.mockResolvedValue({});
});
it('preserves ep, SP sort and undated source metadata', async () => {
  getEpisodes.mockResolvedValue({
    total: 4,
    data: [
      row(1, 0, 0, 0),
      row(2, 0, 12.5, 12.5),
      row(3, 1, 0, 1),
      row(4, 2, 0, 1),
    ],
  });
  const result = await new BangumiSeasonService().fetch(
    { episodes: true },
    '253',
  );
  expect(
    result.episodes?.map((e) => [
      e.episodeType,
      e.episodeNumber,
      e.bangumiEpisodeId,
    ]),
  ).toEqual([
    ['EPISODE', '0', 1],
    ['EPISODE', '12.5', 2],
    ['SP', '1', 3],
  ]);
  expect(result.episodes?.[2]).toMatchObject({
    bangumiSort: '1',
    sourceData: { type: 1, ep: 0, sort: 1 },
  });
  expect(result.episodes?.[2].airDate).toBeUndefined();
  expect(getEpisodes).toHaveBeenCalledWith(253, undefined, 100, 0);
});
it('paginates before filtering unsupported chapter types', async () => {
  getEpisodes
    .mockResolvedValueOnce({ total: 2, data: [row(1, 2, 0, 1)] })
    .mockResolvedValueOnce({ total: 2, data: [row(2, 1, 0, 2)] });
  expect(
    (await new BangumiSeasonService().fetch({ episodes: true }, '253'))
      .episodes,
  ).toHaveLength(1);
  expect(getEpisodes).toHaveBeenNthCalledWith(2, 253, undefined, 100, 1);
});
it('rejects incomplete pages', async () => {
  getEpisodes
    .mockResolvedValueOnce({ total: 2, data: [row(1, 0, 1, 1)] })
    .mockResolvedValueOnce({ total: 2, data: [] });
  await expect(
    new BangumiSeasonService().fetch({ episodes: true }, '253'),
  ).rejects.toThrow('empty page');
});
it('跳过异常编号并保留同页的有效剧集', async () => {
  const warn = jest
    .spyOn(Logger.prototype, 'warn')
    .mockImplementation(() => undefined);
  getEpisodes.mockResolvedValue({
    total: 8,
    data: [
      row(1, 0, undefined as any, 1),
      row(2, 0, 1.1234, 2),
      row(3, 1, 0, 10000000),
      row(4, 0, -1, 4),
      row(5, 0, NaN, 5),
      row(6, 0, 6, Infinity),
      row(7, 0, 12.5, 12.5),
      row(8, 1, 0, 9999999.999),
    ],
  });
  try {
    const { episodes } = await new BangumiSeasonService().fetch(
      { episodes: true },
      '253',
    );
    expect(episodes?.map((e) => e.bangumiEpisodeId)).toEqual([7, 8]);
    expect(warn).toHaveBeenCalledTimes(6);
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('episode 1 in subject 253'),
    );
  } finally {
    warn.mockRestore();
  }
});

it('元数据包含所有名称，中文主标题也保留在别名数组', async () => {
  (BangumiAPIService.getSubjectById as jest.Mock).mockResolvedValue({
    name: 'SPY×FAMILY',
    name_cn: '间谍过家家',
    summary: '简介',
    tags: [],
    infobox: [{ key: '别名', value: [{ k: '日文名', v: 'スパイファミリー' }] }],
  });
  const result = await new BangumiSeasonService().fetch({ info: true }, '1');
  expect(result.info?.aliases).toEqual([
    'SPY×FAMILY',
    '间谍过家家',
    'スパイファミリー',
  ]);
  expect(result.info?.description).toBe('简介');
});

const subject = (overrides: Record<string, unknown> = {}) => ({
  name: '作品',
  name_cn: '',
  summary: '',
  tags: [],
  infobox: [],
  ...overrides,
});

it('声明集数取自 eps，首播日期保留独立的有效日期', async () => {
  getSubjectById.mockResolvedValue(
    subject({ eps: 12, total_episodes: 15, date: '2024-02-29' }),
  );
  const { info } = await new BangumiSeasonService().fetch({ info: true }, '1');
  expect(info).toMatchObject({
    declaredEpisodeCount: 12,
    premiereDate: '2024-02-29',
  });
});

it.each([undefined, null, 0, -1, 1.5, NaN, Infinity, '12', 2147483648])(
  '无效声明集数 %s 保持未知，不使用 total_episodes',
  async (eps) => {
    getSubjectById.mockResolvedValue(subject({ eps, total_episodes: 15 }));
    const { info } = await new BangumiSeasonService().fetch(
      { info: true },
      '1',
    );
    expect(info?.declaredEpisodeCount).toBeNull();
  },
);

it.each([
  undefined,
  null,
  '',
  '2026-02-29',
  '2026-04-31',
  '2026-1-01',
  '2026-01-01T00:00:00Z',
  '0000-01-01',
  'not-a-date',
])('无效首播日期 %s 保持未知', async (date) => {
  getSubjectById.mockResolvedValue(subject({ eps: 12, date }));
  const { info } = await new BangumiSeasonService().fetch({ info: true }, '1');
  expect(info?.premiereDate).toBeNull();
  expect(info?.year).toBeUndefined();
});

it('仅同步剧集时也读取独立作品信息，返回范围仅包含匹配元数据', async () => {
  getSubjectById.mockResolvedValue(
    subject({ eps: 24, date: '2026-10-01', summary: '不要覆盖的简介' }),
  );
  getEpisodes.mockResolvedValue({ total: 1, data: [row(1, 0, 1, 1)] });
  const result = await new BangumiSeasonService().fetch(
    { episodes: true },
    '253',
  );
  expect(getSubjectById).toHaveBeenCalledTimes(1);
  expect(result.matchMetadata).toEqual({
    declaredEpisodeCount: 24,
    premiereDate: '2026-10-01',
  });
  expect(result.info).toBeUndefined();
  expect(result.images).toBeUndefined();
  expect(result.episodes).toHaveLength(1);
});

it('同时同步作品和剧集时只请求一次 subject', async () => {
  getSubjectById.mockResolvedValue(subject({ eps: 12, date: '2026-10-01' }));
  getEpisodes.mockResolvedValue({ total: 0, data: [] });
  const result = await new BangumiSeasonService().fetch(
    { episodes: true, info: true },
    '253',
  );
  expect(getSubjectById).toHaveBeenCalledTimes(1);
  expect(result.matchMetadata).toEqual({
    declaredEpisodeCount: 12,
    premiereDate: '2026-10-01',
  });
  expect(result.info).toMatchObject(result.matchMetadata!);
});

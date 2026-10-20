import { SkyhookSeasonService } from './index.service';

jest.mock('@/common/axios.service', () => ({ GlobalAxiosService: class {} }));

const show = () => ({
  title: 'Series title',
  lastUpdated: '2026-01-01T00:00:00Z',
  firstAired: '2026-07-01',
  seasons: [{ seasonNumber: 1 }],
  episodes: [],
});

it('读取全系列主标题和 alternativeTitles，保留主标题并清理异常名称', async () => {
  const get = jest.fn().mockResolvedValue({
    data: {
      ...show(),
      alternativeTitles: [
        { title: 'Series title' },
        { title: ' 原名 ' },
        { title: 'Line\nTwo' },
        null,
        {},
        { title: 42 },
      ],
    },
  });
  const result = await new SkyhookSeasonService({ get } as any).fetch(
    { info: true },
    '1',
    1,
  );
  expect(result.info?.aliases).toEqual(['Series title', '原名', 'Line Two']);
  expect(get).toHaveBeenCalledTimes(1);
});

it.each([undefined, null, {}, []])(
  '兼容没有 alternativeTitles 的响应：%j',
  async (alternativeTitles) => {
    const get = jest
      .fn()
      .mockResolvedValue({ data: { ...show(), alternativeTitles } });
    const result = await new SkyhookSeasonService({ get } as any).fetch(
      { info: true },
      '1',
      1,
    );
    expect(result.info?.aliases).toEqual(['Series title']);
  },
);

it('外部请求失败时保留错误', async () => {
  const get = jest.fn().mockRejectedValue(new Error('upstream failed'));
  await expect(
    new SkyhookSeasonService({ get } as any).fetch({ info: true }, '1', 1),
  ).rejects.toThrow('upstream failed');
});

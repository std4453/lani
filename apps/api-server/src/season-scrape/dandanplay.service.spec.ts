import {
  dandanplayRequest,
  DandanplayService,
  mapDandanEpisodes,
} from './dandanplay.service';
import config from '@/config';
import { createHash } from 'crypto';

jest.mock('@/common/axios.service', () => ({ GlobalAxiosService: class {} }));
jest.mock('@/config', () => ({
  __esModule: true,
  default: { dandanplay: { kind: 'publicProxy' } },
}));

beforeEach(() => {
  config.dandanplay = { kind: 'publicProxy' };
});

it('禁用时不发送新查询', async () => {
  config.dandanplay = false;
  const get = jest.fn();
  const service = new DandanplayService({ get } as any);
  expect(await service.findAnime('499169')).toBeUndefined();
  expect(await service.findEpisodes('18690', [])).toBeUndefined();
  expect(get).not.toHaveBeenCalled();
});

it('官方请求签名使用官方路径，密钥不进入URL或请求头', () => {
  const request = dandanplayRequest(
    '/v2/bangumi/18690',
    { kind: 'official', appId: 'test-app', appSecret: 'test-key' },
    1700000000,
  );
  expect(request.url).toBe('https://api.dandanplay.net/api/v2/bangumi/18690');
  expect(request.options.headers).toEqual({
    'X-AppId': 'test-app',
    'X-Timestamp': '1700000000',
    'X-Signature': createHash('sha256')
      .update('test-app1700000000/api/v2/bangumi/18690test-key')
      .digest('base64'),
  });
  expect(JSON.stringify(request)).not.toContain('test-key');
});

it('官方请求失败时不切换到公开代理或泄露错误中的认证信息', async () => {
  config.dandanplay = {
    kind: 'official',
    appId: 'test-app',
    appSecret: 'test-key',
  };
  const get = jest.fn().mockRejectedValue(new Error('test-key'));
  const service = new DandanplayService({ get } as any);
  const warn = jest.spyOn((service as any).logger, 'warn').mockImplementation();
  await expect(service.findAnime('499169')).resolves.toBeUndefined();
  expect(get).toHaveBeenCalledTimes(1);
  expect(get.mock.calls[0][0]).toContain('api.dandanplay.net');
  expect(JSON.stringify(warn.mock.calls)).not.toContain('test-key');
});

it('整数集号与SP顺序匹配，不混淆正片、SP、半集和其他类型', () => {
  const episodes = [
    { episodeType: 'EPISODE', episodeNumber: '1', title: 'one' },
    { episodeType: 'SP', episodeNumber: '12.5', title: 'special one' },
    { episodeType: 'EPISODE', episodeNumber: '1.5', title: 'half' },
    { episodeType: 'SP', episodeNumber: '24.5', title: 'special two' },
    { episodeType: 'OVA', episodeNumber: '1', title: 'ova' },
  ];
  const result = mapDandanEpisodes(episodes, [
    { episodeId: 10001, episodeNumber: '1' },
    { episodeId: 19002, episodeNumber: 'S2' },
    { episodeId: 19001, episodeNumber: 'S1' },
    { episodeId: 10015, episodeNumber: '1.5' },
  ]);
  expect([...result.values()]).toEqual(['10001', '19001', '19002']);
  expect(result.has(episodes[2])).toBe(false);
  expect(result.has(episodes[4])).toBe(false);
});

it('忽略重复编号和非法ID，不填猜测结果', () => {
  expect(
    mapDandanEpisodes(
      [{ index: 1, title: 'one' }],
      [
        { episodeId: 10001, episodeNumber: '1' },
        { episodeId: 10002, episodeNumber: '1' },
      ],
    ).size,
  ).toBe(0);
});

it('通过Bangumi查作品，使用原始详情查询分集且不保存响应', async () => {
  const http = {
    get: jest.fn().mockResolvedValue({
      data: {
        success: true,
        bangumi: {
          animeId: 18690,
          episodes: [{ episodeId: 186909001, episodeNumber: 'S1' }],
        },
      },
    }),
  };
  const service = new DandanplayService(http as any);
  expect(await service.findAnime('499169')).toBe('18690');
  const special = { episodeType: 'SP', episodeNumber: '12.5', title: 'SP' };
  expect((await service.findEpisodes('18690', [special]))?.get(special)).toBe(
    '186909001',
  );
  expect(http.get.mock.calls.map((call) => call[1].params.path)).toEqual([
    '/v2/bangumi/bgmtv/499169',
    '/v2/bangumi/18690',
  ]);
});

it.each(['network', 'missing', 'malformed'])(
  '%s 失败只返回空结果',
  async (failure) => {
    const get =
      failure === 'network'
        ? jest.fn().mockRejectedValue(new Error('offline'))
        : jest.fn().mockResolvedValue({
            data: failure === 'missing' ? { success: false } : {},
          });
    const service = new DandanplayService({ get } as any);
    await expect(service.findAnime('499169')).resolves.toBeUndefined();
    await expect(service.findEpisodes('18690', [])).resolves.toBeUndefined();
  },
);

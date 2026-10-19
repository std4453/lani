jest.mock('@/config', () => ({
  __esModule: true,
  default: { torrents: { nyaa: { qps: 1 } } },
}));
jest.mock('@/common/axios.service', () => ({ GlobalAxiosService: class {} }));
jest.mock('@/torrent-sync/index.service', () => ({
  TorrentSyncService: class {},
}));
jest.mock('@/utils/GraphQLExceptionFilter', () => ({
  LaniFilterCron: () => () => undefined,
}));
jest.mock('./parse', () => ({ parseRSS: jest.fn(), parseHistory: jest.fn() }));
import config from '@/config';
import { NyaaSyncService } from './index.service';
import { parseHistory, parseRSS } from './parse';

function setup() {
  const axios = { get: jest.fn().mockResolvedValue({ data: 'page' }) };
  const torrents = { insert: jest.fn().mockResolvedValue(1) };
  const service = new NyaaSyncService(axios as any, torrents as any);
  (service as any).client.request = (send: (signal: AbortSignal) => unknown) =>
    send(new AbortController().signal);
  (parseRSS as jest.Mock).mockResolvedValue([{ title: 'RSS' }]);
  (parseHistory as jest.Mock).mockReturnValue([{ title: 'history' }]);
  return { service, axios, torrents };
}

describe('Nyaa synchronization', () => {
  beforeEach(() => jest.clearAllMocks());
  it('fetches three RSS categories and coalesces overlapping calls', async () => {
    const { service, axios } = setup();
    const first = service.syncCategory('1_2');
    expect(service.syncCategory('1_2')).toBe(first);
    await first;
    expect(axios.get.mock.calls[0][1].signal).toBeInstanceOf(AbortSignal);
    expect(await service.syncNyaa()).toBe(3);
    expect(
      axios.get.mock.calls.slice(1).map(([, options]) => options.params),
    ).toEqual([
      { page: 'rss', c: '1_2' },
      { page: 'rss', c: '1_3' },
      { page: 'rss', c: '1_4' },
    ]);
  });
  it('fetches fixed history pages sequentially by category and shares an in-flight sync', async () => {
    const { service, axios } = setup();
    const onAdded = jest.fn();
    const first = service.syncNyaaHistory(onAdded);
    expect(service.syncNyaaHistory()).toBe(first);
    expect(await first).toBe(49);
    expect(onAdded.mock.calls).toEqual(Array.from({ length: 49 }, () => [1]));
    const params = axios.get.mock.calls.map(([, options]) => options.params);
    expect(params[0]).toEqual({ c: '1_2', p: 1 });
    expect(params[29]).toEqual({ c: '1_2', p: 30 });
    expect(params[30]).toEqual({ c: '1_3', p: 1 });
    expect(params[42]).toEqual({ c: '1_4', p: 1 });
    expect(params[48]).toEqual({ c: '1_4', p: 7 });
  });
  it('keeps saved pages and continues other categories when one category fails', async () => {
    const { service, axios, torrents } = setup();
    axios.get.mockRejectedValueOnce(new Error('HTTP 429'));
    await expect(service.syncNyaaHistory()).rejects.toThrow('部分分类同步失败');
    expect(torrents.insert).toHaveBeenCalledTimes(19);
    expect(await service.syncNyaaHistory()).toBe(49);
  });
  it('stops each history category on an empty page', async () => {
    const { service, axios } = setup();
    (parseHistory as jest.Mock).mockReturnValue([]);
    await service.syncNyaaHistory();
    expect(axios.get).toHaveBeenCalledTimes(3);
  });
});

it('reports only committed additions before the next page and preserves progress after a later failure', async () => {
  const { service, axios, torrents } = setup();
  const onAdded = jest.fn();
  torrents.insert.mockResolvedValue(0).mockResolvedValueOnce(2);
  axios.get
    .mockResolvedValueOnce({ data: 'first' })
    .mockImplementationOnce(() => {
      expect(onAdded.mock.calls).toEqual([[2]]);
      return Promise.reject(new Error('later page failed'));
    });
  await expect(service.syncNyaaHistory(onAdded)).rejects.toThrow(
    '部分分类同步失败',
  );
  expect(onAdded.mock.calls.flat().reduce((sum, n) => sum + n, 0)).toBe(2);
  expect(onAdded).toHaveBeenCalledTimes(20);
});

it('rejects external or malformed detail URLs without requesting them', () => {
  const { service, axios } = setup();
  for (const url of [
    'http://nyaa.si/view/1',
    'https://evil.test/view/1',
    'https://nyaa.si/view/1?redirect=x',
    'https://nyaa.si/view/0',
  ]) {
    expect(() => service.fetchDetails(url)).toThrow('Invalid Nyaa detail URL');
  }
  expect(axios.get).not.toHaveBeenCalled();
});

it('shares the one-QPS ceiling between detail and RSS requests even with a higher configured QPS', async () => {
  jest.useFakeTimers();
  jest.setSystemTime(10000);
  config.torrents.nyaa.qps = 10;
  try {
    const started: number[] = [];
    const axios = {
      get: jest.fn<Promise<{ data: string }>, [string, unknown]>(async () => {
        started.push(Date.now());
        return { data: 'page' };
      }),
    };
    const torrents = { insert: jest.fn().mockResolvedValue(1) };
    const service = new NyaaSyncService(axios as any, torrents as any);
    const first = service.fetchDetails('https://nyaa.si/view/123');
    const second = service.syncCategory('1_2');
    await first;
    for (let i = 0; i < 5; i++) await Promise.resolve();
    jest.advanceTimersByTime(999);
    expect(started).toEqual([10000]);
    jest.advanceTimersByTime(1);
    await second;
    expect(started).toEqual([10000, 11000]);
    expect(axios.get.mock.calls[0][1]).toMatchObject({
      maxRedirects: 0,
      maxContentLength: 2097152,
      responseType: 'text',
    });
  } finally {
    config.torrents.nyaa.qps = 1;
    jest.useRealTimers();
  }
});

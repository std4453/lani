jest.mock('@/config', () => ({
  __esModule: true,
  default: { nyaa: { qps: 0.5 } },
}));
jest.mock('@/common/axios.service', () => ({ GlobalAxiosService: class {} }));
jest.mock('@/torrent-sync/index.service', () => ({
  TorrentSyncService: class {},
}));
jest.mock('@/utils/GraphQLExceptionFilter', () => ({
  LaniFilterCron: () => () => undefined,
}));
jest.mock('./parse', () => ({ parseRSS: jest.fn(), parseHistory: jest.fn() }));
import { NyaaSyncService } from './index.service';
import { parseHistory, parseRSS } from './parse';

function setup() {
  const axios = { get: jest.fn().mockResolvedValue({ data: 'page' }) };
  const torrents = { insert: jest.fn().mockResolvedValue(1) };
  const service = new NyaaSyncService(axios as any, torrents as any);
  (service as any).client.request = (send: () => unknown) => send();
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
    const first = service.syncNyaaHistory();
    expect(service.syncNyaaHistory()).toBe(first);
    expect(await first).toBe(49);
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

it('returns a background run immediately and shares its ID until completion', async () => {
  const { service } = setup();
  let complete: (count: number) => void = () => undefined;
  jest.spyOn(service, 'syncNyaaHistory').mockImplementation(
    () =>
      new Promise((resolve) => {
        complete = resolve;
      }),
  );
  const started = service.startHistorySync();
  expect(started.running).toBe(true);
  expect(service.startHistorySync().id).toBe(started.id);
  expect(service.syncNyaaHistory).toHaveBeenCalledTimes(1);
  complete(7);
  await Promise.resolve();
  expect(service.getHistorySync()).toEqual({
    ...started,
    running: false,
    added: 7,
  });
  expect(service.startHistorySync().id).not.toBe(started.id);
  complete(0);
  await Promise.resolve();
});

it('captures background rejection and exposes failure without an unhandled promise', async () => {
  const { service } = setup();
  expect(service.getHistorySync()).toEqual({
    id: '',
    running: false,
    added: 0,
    error: null,
  });
  jest
    .spyOn(service, 'syncNyaaHistory')
    .mockRejectedValue(new Error('upstream failure'));
  const started = service.startHistorySync();
  await Promise.resolve();
  expect(service.getHistorySync()).toEqual({
    ...started,
    running: false,
    error: expect.stringContaining('同步失败'),
  });
});

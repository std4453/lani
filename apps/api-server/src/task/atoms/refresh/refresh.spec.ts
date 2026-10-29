import { DownloadRefreshService } from './download-refresh.service';
import { PlayerRefreshService } from './player-refresh.service';
import {
  IDownloadClient,
  TorrentInfoWithStatus,
} from '@/download-client/IDownloadClient';
import {
  JellyfinHelp,
  TvShowsService,
  CancelablePromise,
} from '@/api/jellyfin';
jest.mock('@/config', () => ({
  __esModule: true,
  default: {
    jellyfin: {
      apiEndpoint: 'http://127.0.0.1:1',
      dummyUserId: 'test',
      pathMapping: [],
    },
  },
}));
beforeEach(() => jest.useFakeTimers());
afterEach(() => {
  jest.clearAllTimers();
  jest.useRealTimers();
  jest.restoreAllMocks();
});
it('大量下载合为一个查询，重复刷新不重叠，空队列不请求下载器', async () => {
  let resolve!: (value: TorrentInfoWithStatus[]) => void;
  const lookupTorrents = jest.fn(
    (_hashes: string[]) =>
      new Promise<TorrentInfoWithStatus[]>((done) => {
        resolve = done;
      }),
  );
  const queue = new DownloadRefreshService({
    lookupTorrents,
  } as unknown as IDownloadClient);
  expect(await queue.refreshAllLegacyTaskStage()).toBe(0);
  const results = Array.from({ length: 20 }, (_, id) =>
    queue.enqueue(id, { hash: `hash-${id}`, cancel: jest.fn() }),
  );
  const first = queue.refreshAllLegacyTaskStage();
  const second = queue.refreshAllLegacyTaskStage();
  expect(lookupTorrents).toHaveBeenCalledTimes(1);
  expect(lookupTorrents.mock.calls[0][0]).toHaveLength(20);
  resolve(
    Array.from({ length: 20 }, (_, id) => ({
      hash: `hash-${id}`,
      status: 'success',
      downloadPath: '/download',
    })),
  );
  await Promise.all([first, second, ...results]);
  expect(await queue.refreshAllLegacyTaskStage()).toBe(0);
  expect(lookupTorrents).toHaveBeenCalledTimes(1);
});
it('取消移除等待对象，旧批次的迟到结果不能完成新的尝试', async () => {
  let resolve!: (value: TorrentInfoWithStatus[]) => void;
  const lookupTorrents = jest.fn(
    (_hashes: string[]) =>
      new Promise<TorrentInfoWithStatus[]>((done) => {
        resolve = done;
      }),
  );
  const queue = new DownloadRefreshService({
    lookupTorrents,
  } as unknown as IDownloadClient);
  const old = jest.fn();
  void queue.enqueue(1, { hash: 'old', cancel: jest.fn() }).then(old);
  const first = queue.refreshAllLegacyTaskStage();
  queue.remove(1);
  const current = jest.fn();
  void queue.enqueue(1, { hash: 'new', cancel: jest.fn() }).then(current);
  resolve([{ hash: 'old', status: 'success', downloadPath: '/old' }]);
  await first;
  expect(old).not.toHaveBeenCalled();
  expect(current).not.toHaveBeenCalled();
  const next = queue.refreshAllLegacyTaskStage();
  resolve([{ hash: 'new', status: 'success', downloadPath: '/new' }]);
  await next;
  expect(current).toHaveBeenCalledWith({ downloadPath: '/new' });
});
it('同季度多个剧集只刷新和查询一次，后续轮询仅查询，失败季度不阻断其他季度', async () => {
  const refresh = jest.spyOn(JellyfinHelp, 'refreshItem').mockImplementation(
    ({ itemId }) =>
      new CancelablePromise<void>((resolve, reject) => {
        if (itemId === 'bad') reject(new Error('offline'));
        else resolve();
      }),
  );
  const lookup = jest
    .spyOn(TvShowsService, 'getEpisodes')
    .mockResolvedValueOnce({ Items: [] })
    .mockResolvedValueOnce({
      Items: [
        {
          Id: 'one',
          IndexNumber: 1,
          ParentIndexNumber: 1,
          Path: '/media/episode.mkv',
        },
        {
          Id: 'two',
          IndexNumber: 2,
          ParentIndexNumber: 1,
          Path: '/media/episode.mkv',
        },
      ],
    });
  const queue = new PlayerRefreshService();
  const refreshed = jest.fn(async () => undefined);
  const bad = expect(
    queue.enqueue(9, {
      seriesId: 'bad',
      filePath: '/media/episode.mkv',
      season: 1,
      index: 1,
      refreshed,
    }),
  ).rejects.toThrow('offline');
  const one = queue.enqueue(1, {
    seriesId: 'good',
    filePath: '/media/episode.mkv',
    season: 1,
    index: 1,
    refreshed,
  });
  const two = queue.enqueue(2, {
    seriesId: 'good',
    filePath: '/media/episode.mkv',
    season: 1,
    index: 2,
    refreshed,
  });
  await queue.refreshAllPlayerWaitingStatus();
  await bad;
  expect(refresh).toHaveBeenCalledTimes(2);
  expect(lookup).toHaveBeenCalledTimes(1);
  expect(refreshed).toHaveBeenCalledTimes(2);
  await queue.refreshAllPlayerWaitingStatus();
  await expect(one).resolves.toEqual({ jellyfinEpisodeId: 'one' });
  await expect(two).resolves.toEqual({ jellyfinEpisodeId: 'two' });
  expect(refresh).toHaveBeenCalledTimes(2);
  expect(lookup).toHaveBeenCalledTimes(2);
});
it('全部取消后不再向 Jellyfin 发送刷新请求', async () => {
  const refresh = jest.spyOn(JellyfinHelp, 'refreshItem');
  const queue = new PlayerRefreshService();
  void queue.enqueue(1, {
    seriesId: 'series',
    filePath: '/media/episode.mkv',
    season: 1,
    index: 1,
    refreshed: async () => undefined,
  });
  queue.remove(1);
  expect(await queue.refreshAllPlayerWaitingStatus()).toBe(0);
  expect(refresh).not.toHaveBeenCalled();
});
it('等待识别超过五分钟后失败，失败对象不再进入后续批次', async () => {
  jest.spyOn(JellyfinHelp, 'refreshItem').mockResolvedValue(undefined);
  const lookup = jest
    .spyOn(TvShowsService, 'getEpisodes')
    .mockResolvedValue({ Items: [] });
  const queue = new PlayerRefreshService();
  const result = expect(
    queue.enqueue(1, {
      seriesId: 'series',
      filePath: '/media/episode.mkv',
      season: 1,
      index: 1,
      refreshed: async () => undefined,
    }),
  ).rejects.toThrow('超过5分钟');
  await queue.refreshAllPlayerWaitingStatus();
  jest.setSystemTime(Date.now() + 301000);
  await queue.refreshAllPlayerWaitingStatus();
  await result;
  expect(await queue.refreshAllPlayerWaitingStatus()).toBe(0);
  expect(lookup).toHaveBeenCalledTimes(2);
});
it('前一个季度刷新在途时取消后面的季度，不发送已取消季度的刷新', async () => {
  let release!: () => void;
  const refresh = jest.spyOn(JellyfinHelp, 'refreshItem').mockImplementation(
    () =>
      new CancelablePromise<void>((resolve) => {
        release = resolve;
      }),
  );
  jest.spyOn(TvShowsService, 'getEpisodes').mockResolvedValue({
    Items: [
      {
        Id: 'one',
        IndexNumber: 1,
        ParentIndexNumber: 1,
        Path: '/media/episode.mkv',
      },
    ],
  });
  const queue = new PlayerRefreshService();
  const first = queue.enqueue(1, {
    seriesId: 'first',
    filePath: '/media/episode.mkv',
    season: 1,
    index: 1,
    refreshed: async () => undefined,
  });
  void queue.enqueue(2, {
    seriesId: 'cancelled',
    filePath: '/media/episode.mkv',
    season: 1,
    index: 1,
    refreshed: async () => undefined,
  });
  const batch = queue.refreshAllPlayerWaitingStatus();
  queue.remove(2);
  release();
  await batch;
  await first;
  expect(refresh).toHaveBeenCalledTimes(1);
});
it('下载器暂时断连保留队列，下个周期继续查询，取消对象不再查询', async () => {
  const lookupTorrents = jest
    .fn()
    .mockRejectedValueOnce(new Error('temporarily offline'))
    .mockResolvedValueOnce([
      { hash: 'keep', status: 'success', downloadPath: '/download' },
    ]);
  const queue = new DownloadRefreshService({
    lookupTorrents,
  } as unknown as IDownloadClient);
  const fulfilled = jest.fn(),
    rejected = jest.fn();
  const result = queue
    .enqueue(1, { hash: 'keep', cancel: jest.fn() })
    .then(fulfilled, rejected);
  void queue
    .enqueue(2, { hash: 'cancelled', cancel: jest.fn() })
    .then(fulfilled, rejected);
  await queue.refreshAllLegacyTaskStage();
  expect(fulfilled).not.toHaveBeenCalled();
  expect(rejected).not.toHaveBeenCalled();
  queue.remove(2);
  await queue.refreshAllLegacyTaskStage();
  await result;
  expect(lookupTorrents).toHaveBeenNthCalledWith(2, ['keep']);
  expect(fulfilled).toHaveBeenCalledWith({ downloadPath: '/download' });
  expect(rejected).not.toHaveBeenCalled();
});
it('成功查询后，种子不存在或明确错误才会使对应下载失败', async () => {
  const lookupTorrents = jest.fn().mockResolvedValue([
    { hash: 'broken', status: 'error', state: 'missingFiles' },
    { hash: 'good', status: 'success', downloadPath: '/download' },
  ]);
  const queue = new DownloadRefreshService({
    lookupTorrents,
  } as unknown as IDownloadClient);
  const missing = expect(
    queue.enqueue(1, { hash: 'missing', cancel: jest.fn() }),
  ).rejects.toThrow('种子不存在');
  const broken = expect(
    queue.enqueue(2, { hash: 'broken', cancel: jest.fn() }),
  ).rejects.toThrow('missingFiles');
  const good = expect(
    queue.enqueue(3, { hash: 'good', cancel: jest.fn() }),
  ).resolves.toEqual({
    downloadPath: '/download',
  });
  await queue.refreshAllLegacyTaskStage();
  await Promise.all([missing, broken, good]);
  expect(await queue.refreshAllLegacyTaskStage()).toBe(0);
});

it('替换扩展名后忽略同集旧路径，等待新路径被识别且支持路径映射', async () => {
  const config = (await import('@/config')).default;
  const previous = config.jellyfin.pathMapping;
  config.jellyfin.pathMapping = [{ from: '/jellyfin', to: '/media' }];
  try {
    jest.spyOn(JellyfinHelp, 'refreshItem').mockResolvedValue(undefined);
    const old = {
      Id: 'old',
      IndexNumber: 1,
      ParentIndexNumber: 1,
      Path: '/jellyfin/episode.mkv',
    };
    const lookup = jest
      .spyOn(TvShowsService, 'getEpisodes')
      .mockResolvedValueOnce({
        Items: [old, { ...old, Id: 'missing-path', Path: undefined }],
      })
      .mockResolvedValueOnce({
        Items: [old, { ...old, Id: 'new', Path: '/jellyfin/episode.mp4' }],
      });
    const queue = new PlayerRefreshService();
    const completed = jest.fn();
    const result = queue
      .enqueue(1, {
        seriesId: 'series',
        filePath: '/media/episode.mp4',
        season: 1,
        index: 1,
        refreshed: async () => undefined,
      })
      .then(completed);
    await queue.refreshAllPlayerWaitingStatus();
    expect(completed).not.toHaveBeenCalled();
    await queue.refreshAllPlayerWaitingStatus();
    await result;
    expect(completed).toHaveBeenCalledWith({ jellyfinEpisodeId: 'new' });
    expect(lookup).toHaveBeenCalledWith('series', 'test', ['Path']);
    expect(JellyfinHelp.refreshItem).toHaveBeenCalledTimes(1);
  } finally {
    config.jellyfin.pathMapping = previous;
  }
});

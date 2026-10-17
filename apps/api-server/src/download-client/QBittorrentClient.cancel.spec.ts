import { QBittorrentClient } from './QBittorrentClient';
jest.mock('@/config', () => ({
  __esModule: true,
  default: { network: { timeout: { local: 100 } } },
}));
it('取消只发送指定 hash，固定保留数据，并回查移除结果', async () => {
  const qbt = {
    post: jest.fn(async () => ({})),
    getTorrent: jest.fn(async () => ({ hash: 'actual-id' })),
    resolveTorrents: jest.fn(async () => new Map()),
  };
  const client = new QBittorrentClient(qbt as never, {} as never);
  await client.removeTorrent('abc');
  expect(qbt.post).toHaveBeenCalledWith(
    '/torrents/delete',
    'hashes=actual-id&deleteFiles=false',
    expect.any(Object),
  );
  expect(qbt.getTorrent).toHaveBeenCalledWith('abc');
  expect(qbt.resolveTorrents).toHaveBeenCalledWith(['abc', 'actual-id']);
});
it('空 hash 列表不向下载器请求全量条目', async () => {
  const qbt = { resolveTorrents: jest.fn() };
  const client = new QBittorrentClient(qbt as never, {} as never);
  expect(await client.lookupTorrents([])).toEqual([]);
  expect(await client.getActiveTorrentsStatus([])).toEqual([]);
  expect(qbt.resolveTorrents).not.toHaveBeenCalled();
});
it('删除响应成功但条目仍存在时不能报告取消成功', async () => {
  const qbt = {
    post: jest.fn(async () => ({})),
    getTorrent: jest.fn(async () => ({ hash: 'actual-id' })),
    resolveTorrents: jest.fn(
      async () => new Map([['abc', { hash: 'actual-id' }]]),
    ),
  };
  const client = new QBittorrentClient(qbt as never, {} as never);
  jest.spyOn(client as any, 'pause').mockResolvedValue(undefined);
  await expect(client.removeTorrent('abc')).rejects.toThrow('尚未确认移除');
  expect(qbt.resolveTorrents).toHaveBeenCalledTimes(10);
});
it('解析种子失败不能当作已删除，也不能发出删除请求', async () => {
  const qbt = {
    post: jest.fn(),
    getTorrent: jest.fn().mockRejectedValue(new Error('offline')),
  };
  const client = new QBittorrentClient(qbt as never, {} as never);
  await expect(client.removeTorrent('abc')).rejects.toThrow('offline');
  expect(qbt.post).not.toHaveBeenCalled();
});

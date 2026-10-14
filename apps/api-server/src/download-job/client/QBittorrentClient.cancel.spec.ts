import { QBittorrentClient } from './QBittorrentClient';
jest.mock('@/config', () => ({
  __esModule: true,
  default: { network: { timeout: { local: 100 } } },
}));
it('取消只发送指定 hash，固定保留数据，并回查移除结果', async () => {
  const qbt = {
    post: jest.fn(async () => ({})),
    getTorrent: jest.fn(async () => undefined),
  };
  const client = new QBittorrentClient(qbt as never, {} as never);
  await client.removeTorrent('abc');
  expect(qbt.post).toHaveBeenCalledWith(
    '/torrents/delete',
    'hashes=abc&deleteFiles=false',
    expect.any(Object),
  );
  expect(qbt.getTorrent).toHaveBeenCalledWith('abc');
});
it('空 hash 列表不向下载器请求全量条目', async () => {
  const qbt = { listTorrents: jest.fn() };
  const client = new QBittorrentClient(qbt as never, {} as never);
  expect(await client.lookupTorrents([])).toEqual([]);
  expect(await client.getActiveTorrentsStatus([])).toEqual([]);
  expect(qbt.listTorrents).not.toHaveBeenCalled();
});

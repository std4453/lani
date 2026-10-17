import { QBittorrentService } from './QBittorrentService';
import { QBittorrentClient } from './QBittorrentClient';
import { QBTTorrent } from './types';

jest.mock('@/config', () => ({
  __esModule: true,
  default: { network: { timeout: { local: 100 } } },
}));

const v1 = '1'.repeat(40);
const v2 = '2'.repeat(64);
const id = v2.slice(0, 40);
const torrent = {
  hash: id,
  infohash_v1: v1,
  infohash_v2: v2,
  name: 'video',
  state: 'downloading',
  completion_on: 0,
  dlspeed: 123,
  downloaded: 20,
  size: 100,
} as QBTTorrent;

function setup() {
  const service = Object.create(
    QBittorrentService.prototype,
  ) as QBittorrentService;
  const list = jest.fn(async ({ hashes }: { hashes?: string[] } = {}) =>
    !hashes || hashes.includes(id) ? [torrent] : [],
  );
  service.listTorrents = list;
  return { service, list, client: new QBittorrentClient(service, {} as never) };
}

it('hybrid 的旧 v1 标识通过一次全量查询解析，批量返回保留请求标识', async () => {
  const { service, list } = setup();
  const uppercase = 'A'.repeat(40);
  const other = {
    ...torrent,
    hash: 'a'.repeat(40),
    infohash_v1: '',
    infohash_v2: '',
  };
  list.mockResolvedValueOnce([torrent, other]);
  const result = await service.resolveTorrents([v1, v2, id, uppercase, v1]);
  expect(result.get(v1)?.hash).toBe(id);
  expect(result.get(v2)?.hash).toBe(id);
  expect(result.get(id)?.hash).toBe(id);
  expect(result.get(uppercase)?.hash).toBe(other.hash);
  expect(result.size).toBe(4);
  expect(list).toHaveBeenCalledTimes(1);

  list.mockClear();
  expect((await service.getTorrent(v1))?.hash).toBe(id);
  expect(list).toHaveBeenCalledTimes(2);
  expect(list).toHaveBeenLastCalledWith();
});

it('纯 v2 用截断候选查询，但核对完整 v2 防止认错种子', async () => {
  const { service, list } = setup();
  list.mockResolvedValue([{ ...torrent, infohash_v1: '' }]);
  expect((await service.getTorrent(v2))?.hash).toBe(id);
  expect(list).toHaveBeenCalledWith({ hashes: [v2, id] });
  const different = v2.slice(0, 40) + '3'.repeat(24);
  expect(await service.getTorrent(different)).toBeUndefined();
});

it('旧下载器没有 infohash 字段时仍可按实际 ID 查询', async () => {
  const { service, list } = setup();
  list.mockResolvedValue([{ hash: v1 } as QBTTorrent]);
  expect((await service.getTorrent(v1))?.hash).toBe(v1);
  expect(list).toHaveBeenCalledTimes(1);
});

it('全量查询失败继续抛错，不能当作不存在；空批次不请求', async () => {
  const { service, list } = setup();
  expect((await service.resolveTorrents([])).size).toBe(0);
  expect(list).not.toHaveBeenCalled();
  list.mockResolvedValueOnce([]).mockRejectedValueOnce(new Error('offline'));
  await expect(service.getTorrent(v1)).rejects.toThrow('offline');
});

it('别名指向多个条目时拒绝猜测，不按名字或零 hash 匹配', async () => {
  const { service, list } = setup();
  list.mockResolvedValue([torrent, { ...torrent, hash: '3'.repeat(40) }]);
  await expect(service.getTorrent(v1)).rejects.toThrow('多个下载器条目');
  list.mockResolvedValue([{ ...torrent, infohash_v1: '0'.repeat(40) }]);
  expect(await service.getTorrent('0'.repeat(40))).toBeUndefined();
  expect(await service.getTorrent('video')).toBeUndefined();
});

it('旧任务下载状态及进度仍以原始请求 hash 关联，文件接口使用实际 ID', async () => {
  const { service, client } = setup();
  expect(await client.lookupTorrents([v1])).toEqual([
    { hash: v1, name: 'video', status: 'pending' },
  ]);
  expect(await client.getActiveTorrentsStatus([v1, id])).toEqual([
    expect.objectContaining({ hash: v1, speed: 123, downloaded: 20 }),
    expect.objectContaining({ hash: id, speed: 123, downloaded: 20 }),
  ]);
  service.getFiles = jest.fn(async () => [
    { name: 'video.mp4', size: 100 } as never,
  ]);
  expect(await client.getTorrentFiles(v1)).toEqual([
    { path: 'video.mp4', size: 100 },
  ]);
  expect(service.getFiles).toHaveBeenCalledWith(id);
});

it('已存在的 hybrid 按别名复用，提交返回实际 ID', async () => {
  const { service, client } = setup();
  service.post = jest.fn();
  expect(
    await client.submitTorrent({ hash: v1, input: 'magnet:test' }),
  ).toEqual({
    hash: id,
    name: 'video',
  });
  expect(service.post).not.toHaveBeenCalled();
});

it('提交后异步出现的 hybrid 能通过 v1 别名确认', async () => {
  const { service, list, client } = setup();
  list.mockResolvedValueOnce([]).mockResolvedValueOnce([]);
  service.post = jest.fn(async () => ({ data: 'Ok.' })) as never;
  expect(
    await client.submitTorrent({ hash: v1, input: 'magnet:test' }),
  ).toEqual({
    hash: id,
    name: 'video',
  });
  expect(service.post).toHaveBeenCalledTimes(1);
});

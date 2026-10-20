import { QBittorrentService } from './QBittorrentService';
import { QBittorrentClient } from './QBittorrentClient';
import { QBTTorrent } from './types';
import { parseTorrentInput } from './torrent-input';

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

it('实际 ID 直接批量命中，结果仅包含请求的种子', async () => {
  const { service, list } = setup();
  expect((await service.resolveTorrents([id, id])).get(id)).toBe(torrent);
  expect(list).toHaveBeenCalledTimes(1);
  expect(list).toHaveBeenCalledWith({ hashes: [id, id] });
});

it('历史 v1 共用一次全量查询，仍以原请求 hash 关联任务', async () => {
  const { service, list } = setup();
  const result = await service.resolveTorrents([v1, id, 'missing']);
  expect([...result.keys()]).toEqual([v1, id]);
  expect(result.get(v1)).toBe(torrent);
  expect(list).toHaveBeenCalledTimes(2);
  expect(list).toHaveBeenLastCalledWith();
});

it('全量查询采用最新列表，不保留之前已经移除的种子', async () => {
  const { service, list } = setup();
  list.mockResolvedValueOnce([torrent]).mockResolvedValueOnce([]);
  expect((await service.resolveTorrents([id, 'missing'])).size).toBe(0);
});

it('全量查询失败继续抛错，不能当作不存在；空批次不请求', async () => {
  const { service, list } = setup();
  expect((await service.resolveTorrents([])).size).toBe(0);
  expect(list).not.toHaveBeenCalled();
  list.mockResolvedValueOnce([]).mockRejectedValueOnce(new Error('offline'));
  await expect(service.getTorrent(v1)).rejects.toThrow('offline');
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
    await client.submitTorrent({
      hash: v1,
      clientHash: v1,
      input: 'magnet:test',
    }),
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
    await client.submitTorrent({
      hash: v1,
      clientHash: v1,
      input: 'magnet:test',
    }),
  ).toEqual({
    hash: id,
    name: 'video',
  });
  expect(service.post).toHaveBeenCalledTimes(1);
});

it.each([
  `magnet:?xt=urn:btmh:1220${v2}`,
  `magnet:?xt=urn:btih:${v1}&xt=urn:btmh:1220${v2}`,
])('新 v2 提交直接使用解析阶段确定的 ID：%s', async (input) => {
  const { service, list, client } = setup();
  list.mockResolvedValueOnce([]).mockResolvedValueOnce([]);
  service.post = jest.fn(async () => ({ data: 'Ok.' })) as never;
  expect(
    await client.submitTorrent({ ...parseTorrentInput(input), input }),
  ).toEqual({ hash: id, name: 'video' });
  expect(list.mock.calls).toEqual([[{ hashes: [id] }], [], [{ hashes: [id] }]]);
});

it('btih 提交后取得 hybrid 元数据导致 ID 变化，仍能查询和取消', async () => {
  const { service, list, client } = setup();
  list.mockResolvedValueOnce([{ ...torrent, hash: v1, infohash_v2: '' }]);
  expect(
    (
      await client.submitTorrent({
        hash: v1,
        clientHash: v1,
        input: `magnet:?xt=urn:btih:${v1}`,
      })
    ).hash,
  ).toBe(v1);
  expect(await client.lookupTorrents([v1])).toEqual([
    { hash: v1, name: 'video', status: 'pending' },
  ]);
  service.post = jest.fn(async () => {
    list.mockResolvedValue([]);
    return { data: '' };
  }) as never;
  await client.removeTorrent(v1);
  expect(service.post).toHaveBeenCalledWith(
    '/torrents/delete',
    `hashes=${id}&deleteFiles=false`,
    expect.any(Object),
  );
});

it.each([true, false])(
  '新种子仅在显式要求时覆盖下载器全局目录布局：%s',
  async (preservePaths) => {
    const { service, list, client } = setup();
    list.mockResolvedValueOnce([]).mockResolvedValueOnce([]);
    service.post = jest.fn(async () => ({ data: 'Ok.' })) as never;
    await client.submitTorrent(
      {
        hash: v1,
        clientHash: v1,
        input: Buffer.from('torrent'),
        name: 'season',
      },
      preservePaths ? { preservePaths } : undefined,
    );
    const body = (service.post as jest.Mock).mock.calls[0][1].toString();
    if (preservePaths)
      expect(body).toContain('name="contentLayout"\r\n\r\nOriginal');
    else expect(body).not.toContain('contentLayout');
    expect(body).not.toContain('skip_checking');
  },
);

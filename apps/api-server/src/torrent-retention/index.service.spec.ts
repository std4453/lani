import { TorrentRetentionService } from './index.service';
import config from '@/config';
import { RETENTION_QUEUE } from './policy';

jest.mock('@/config', () => ({
  __esModule: true,
  default: {
    downloadClient: {
      qbittorrent: {
        retention: { enabled: true, afterFinish: '7d', afterSeeding: '30d' },
      },
    },
  },
}));
const hash = (n: number) => n.toString(16).padStart(40, '0');
const torrent = (n: number) => ({
  hash: hash(n),
  state: 'pausedUP',
  progress: 1,
  completion_on: 1,
  added_on: 1,
});
const task = (n: number) => ({
  qbtTorrentHash: hash(n),
  legacyStage: 'AVAILABLE',
  isCancelled: false,
  isFailed: false,
});

function setup() {
  const db: any = {
    task: { findMany: jest.fn().mockResolvedValue([task(1)]) },
    backgroundJob: { count: jest.fn().mockResolvedValue(0) },
    $transaction: jest.fn((fn) => fn(db)),
  };
  const qbt: any = {
    listTorrents: jest.fn().mockResolvedValue([torrent(1)]),
    deleteTorrentsKeepFiles: jest.fn(),
  };
  const queue: any = { enqueue: jest.fn(), register: jest.fn() };
  const service = new TorrentRetentionService(db, qbt, queue);
  service.onModuleInit();
  const handler = queue.register.mock.calls[0][1];
  return { db, qbt, queue, service, handler };
}

afterEach(() => {
  config.downloadClient.qbittorrent.retention.enabled = true;
});
it('does nothing while disabled, including debug mutation', async () => {
  config.downloadClient.qbittorrent.retention.enabled = false;
  const { service, qbt, handler } = setup();
  expect(handler.enabled).toBe(false);
  expect(await service.scanTorrentRetention()).toBe(0);
  expect(qbt.listTorrents).not.toHaveBeenCalled();
});
it('only enqueues owned completed candidates, without deleting in the scanner', async () => {
  const { service, qbt, queue } = setup();
  qbt.listTorrents.mockResolvedValue([torrent(1), torrent(2)]);
  expect(await service.scanTorrentRetention()).toBe(1);
  expect(queue.enqueue).toHaveBeenCalledWith(
    expect.anything(),
    RETENTION_QUEUE,
    'scan',
    { hashes: [hash(1)] },
  );
  expect(qbt.deleteTorrentsKeepFiles).not.toHaveBeenCalled();
});
it('coalesces concurrent scans and does not replace outstanding work', async () => {
  const { service, db, queue } = setup();
  await Promise.all([
    service.scanTorrentRetention(),
    service.scanTorrentRetention(),
  ]);
  expect(queue.enqueue).toHaveBeenCalledTimes(1);
  db.backgroundJob.count.mockResolvedValue(1);
  expect(await service.scanTorrentRetention()).toBe(0);
  expect(queue.enqueue).toHaveBeenCalledTimes(1);
});
it('protects reused active tasks and unconfirmed submissions; recognizes hybrid hashes', async () => {
  const { service, db, qbt } = setup();
  db.task.findMany.mockResolvedValue([
    task(1),
    { ...task(1), legacyStage: 'DOWNLOADING' },
    { ...task(2), legacyStage: 'DOWNLOAD_SUBMITTING', isFailed: true },
    task(3),
  ]);
  qbt.listTorrents.mockResolvedValue([
    torrent(1),
    torrent(2),
    { ...torrent(4), infohash_v1: hash(3) },
  ]);
  expect(await service.scanTorrentRetention()).toBe(1);
});
it('revalidates ownership, state and time immediately before deletion', async () => {
  const { db, qbt, handler } = setup();
  db.task.findMany.mockResolvedValue([task(1), task(2), task(3)]);
  qbt.listTorrents.mockResolvedValue([
    torrent(1),
    { ...torrent(2), state: 'downloading' },
    { ...torrent(3), completion_on: Math.floor(Date.now() / 1000) },
    torrent(4),
  ]);
  await handler.execute({
    payload: { hashes: [hash(1), hash(2), hash(3), hash(4)] },
  });
  expect(qbt.deleteTorrentsKeepFiles).toHaveBeenCalledWith([hash(1)]);
});
it('splits batches serially, continues after failure and never retries a failed batch', async () => {
  const { db, qbt, handler } = setup();
  const ids = Array.from({ length: 201 }, (_, n) => n + 1);
  db.task.findMany.mockResolvedValue(ids.map(task));
  qbt.listTorrents.mockImplementation(async ({ hashes }) =>
    hashes.map((h) => torrent(parseInt(h, 16))),
  );
  let running = false;
  qbt.deleteTorrentsKeepFiles.mockImplementation(async () => {
    expect(running).toBe(false);
    running = true;
    await Promise.resolve();
    running = false;
    if (qbt.deleteTorrentsKeepFiles.mock.calls.length === 1)
      throw new Error('413');
  });
  const commit = await handler.execute({ payload: { hashes: ids.map(hash) } });
  await commit();
  expect(
    qbt.deleteTorrentsKeepFiles.mock.calls.map(([batch]) => batch.length),
  ).toEqual([100, 100, 1]);
  expect(handler.retry).toBeUndefined();
});
it('continues after a lookup failure and rejects malformed stored jobs', async () => {
  const { qbt, handler } = setup();
  qbt.listTorrents
    .mockRejectedValueOnce(new Error('offline'))
    .mockResolvedValue([torrent(1)]);
  await handler.execute({
    payload: { hashes: Array.from({ length: 101 }, (_, n) => hash(n + 1)) },
  });
  expect(qbt.listTorrents).toHaveBeenCalledTimes(2);
  expect(qbt.deleteTorrentsKeepFiles).not.toHaveBeenCalled();
  await expect(
    handler.execute({ payload: { hashes: ['all'] } }),
  ).rejects.toThrow();
});

import { TorrentRetentionService } from './index.service';
import config from '@/config';
import { RETENTION_QUEUE } from './policy';
import { enqueueJob } from '@/background-queue/producer';
jest.mock('@/background-queue/producer', () => ({ enqueueJob: jest.fn() }));
jest.mock('@/task/index.service', () => ({ TaskService: class {} }));

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
function setup() {
  const db: any = {
    backgroundJob: { count: jest.fn().mockResolvedValue(0) },
    $transaction: jest.fn((fn) => fn(db)),
  };
  const qbt: any = {
    listTorrents: jest.fn().mockResolvedValue([torrent(1)]),
    deleteTorrentsKeepFiles: jest.fn(),
  };
  jest.mocked(enqueueJob).mockClear();
  const tasks: any = {
    getTorrentOwnership: jest
      .fn()
      .mockResolvedValue({ owned: new Set([hash(1)]), active: new Set() }),
  };
  const queue: any = { register: jest.fn() };
  const service = new TorrentRetentionService(db, qbt, queue, tasks);
  service.onModuleInit();
  const handler = queue.register.mock.calls[0][1];
  return { db, qbt, tasks, service, handler };
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
  const { service, qbt } = setup();
  qbt.listTorrents.mockResolvedValue([torrent(1), torrent(2)]);
  expect(await service.scanTorrentRetention()).toBe(1);
  expect(enqueueJob).toHaveBeenCalledWith(
    expect.anything(),
    RETENTION_QUEUE,
    'scan',
    { version: 1, hashes: [hash(1)] },
  );
  expect(qbt.deleteTorrentsKeepFiles).not.toHaveBeenCalled();
});
it('coalesces concurrent scans and does not replace outstanding work', async () => {
  const { service, db } = setup();
  await Promise.all([
    service.scanTorrentRetention(),
    service.scanTorrentRetention(),
  ]);
  expect(enqueueJob).toHaveBeenCalledTimes(1);
  db.backgroundJob.count.mockResolvedValue(1);
  expect(await service.scanTorrentRetention()).toBe(0);
  expect(enqueueJob).toHaveBeenCalledTimes(1);
});
it('uses task ownership and protects active hybrid identities', async () => {
  const { service, tasks, qbt } = setup();
  tasks.getTorrentOwnership.mockResolvedValue({
    owned: new Set([hash(1), hash(3)]),
    active: new Set([hash(1)]),
  });
  qbt.listTorrents.mockResolvedValue([
    torrent(1),
    torrent(2),
    { ...torrent(4), infohash_v1: hash(3) },
  ]);
  expect(await service.scanTorrentRetention()).toBe(1);
});
it('revalidates ownership, state and time immediately before deletion', async () => {
  const { tasks, qbt, handler } = setup();
  tasks.getTorrentOwnership.mockResolvedValue({
    owned: new Set([1, 2, 3].map(hash)),
    active: new Set(),
  });
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
  const { tasks, qbt, handler } = setup();
  const ids = Array.from({ length: 201 }, (_, n) => n + 1);
  tasks.getTorrentOwnership.mockResolvedValue({
    owned: new Set(ids.map(hash)),
    active: new Set(),
  });
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

it('logs bounded HTTP diagnostics without leaking exception messages or request data', async () => {
  const { Logger } = await import('@nestjs/common');
  const { HttpRequestError } = await import('@/common/axios.service');
  const warn = jest.spyOn(Logger.prototype, 'warn').mockImplementation();
  try {
    const { qbt, handler, service } = setup();
    const error = new HttpRequestError('secret-token', 413, 'ERR_BAD_REQUEST');
    qbt.deleteTorrentsKeepFiles.mockRejectedValue(error);
    await handler.execute({ payload: { hashes: [hash(1)] } });
    qbt.listTorrents.mockRejectedValue(new Error('secret-token'));
    await service.poll();
    const messages = warn.mock.calls.map(([message]) => message).join('\n');
    expect(messages).toContain('status=413, code=ERR_BAD_REQUEST');
    expect(messages).toContain('type=Error');
    expect(messages).not.toContain('secret-token');
  } finally {
    warn.mockRestore();
  }
});

it.each([undefined, 1])(
  'accepts persisted payload version %s',
  async (version) => {
    const { qbt, handler } = setup();
    await handler.execute({
      payload: {
        ...(version === undefined ? {} : { version }),
        hashes: [hash(1)],
      },
    });
    expect(qbt.deleteTorrentsKeepFiles).toHaveBeenCalledWith([hash(1)]);
  },
);
it('rejects an unknown payload version before contacting the downloader', async () => {
  const { qbt, handler } = setup();
  await expect(
    handler.execute({ payload: { version: 2, hashes: [hash(1)] } }),
  ).rejects.toThrow('不支持的种子清理任务版本');
  expect(qbt.listTorrents).not.toHaveBeenCalled();
  expect(qbt.deleteTorrentsKeepFiles).not.toHaveBeenCalled();
});

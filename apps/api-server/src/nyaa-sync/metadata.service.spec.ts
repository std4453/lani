jest.mock('@/config', () => ({ __esModule: true, default: {} }));
jest.mock('@/common/prisma.service', () => ({ PrismaService: class {} }));
jest.mock('./index.service', () => ({ NyaaSyncService: class {} }));
jest.mock('@/utils/GraphQLExceptionFilter', () => ({
  LaniFilterCron: () => () => undefined,
}));
jest.mock('@lani/parse-nyaa', () => ({
  extractNyaaMetadata: jest.fn(),
  parseNyaaSubtitles: jest.fn(),
}));
import { NyaaMetadataService } from './metadata.service';
import { extractNyaaMetadata, parseNyaaSubtitles } from '@lani/parse-nyaa';
import { NyaaStoppedError } from './rate-limited-client';

function setup() {
  const row = {
    id: 1,
    hash: 'a'.repeat(40),
    permalink: 'https://nyaa.si/view/1',
  };
  const prisma = {
    torrent: {
      findMany: jest.fn().mockResolvedValue([row]),
      updateMany: jest.fn().mockResolvedValue({ count: 1 }),
    },
  };
  const nyaa = {
    fetchDetails: jest.fn().mockResolvedValue('html'),
    pausedUntil: 0,
  };
  (extractNyaaMetadata as jest.Mock).mockReturnValue({
    title: 'Title',
    description: 'Subs: English',
    files: [],
  });
  (parseNyaaSubtitles as jest.Mock).mockReturnValue({
    version: 1,
    status: 'known',
    subtitleInfo: { languages: ['en'], multi: false, delivery: [] },
    evidence: [],
  });
  return {
    service: new NyaaMetadataService(prisma as any, nyaa as any),
    prisma,
    nyaa,
    row,
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
  jest.setSystemTime(new Date('2026-10-19T00:00:00Z'));
});
afterEach(() => jest.useRealTimers());

it('deduplicates concurrent batches and queued records, saving only the final result', async () => {
  const { service, prisma, nyaa, row } = setup();
  const first = service.syncMetadata();
  expect(service.syncMetadata()).toBe(first);
  expect(await first).toBe(1);
  expect(prisma.torrent.findMany.mock.calls[0][0].where).toEqual({
    id: { gt: 0 },
    channel: 'NYAA',
    publishDate: { gte: new Date('2026-09-19'), lte: new Date('2026-10-19') },
    metadataStatus: { in: ['pending', 'failed'] },
  });
  expect(nyaa.fetchDetails).toHaveBeenCalledWith(row.permalink);
  expect(extractNyaaMetadata).toHaveBeenCalledWith('html', row.hash);
  expect(prisma.torrent.updateMany).toHaveBeenCalledTimes(1);
  expect(prisma.torrent.updateMany.mock.calls[0][0].data).toMatchObject({
    metadataStatus: 'parsed',
    metadataFetchedAt: expect.any(Date),
    metadata: { status: 'known' },
    metadataError: null,
  });
  expect(prisma.torrent.updateMany.mock.calls[0][0].data).not.toHaveProperty(
    'parseResult',
  );
  expect(
    prisma.torrent.updateMany.mock.calls[0][0].data.metadata,
  ).not.toHaveProperty('description');
  expect(prisma.torrent.updateMany.mock.calls[0][0].data).not.toHaveProperty(
    'metadataResult',
  );
  await service.syncMetadata();
  expect(nyaa.fetchDetails).toHaveBeenCalledTimes(1);
});

it('stores an unknown parse as success', async () => {
  const { service, prisma } = setup();
  (parseNyaaSubtitles as jest.Mock).mockReturnValue({
    version: 1,
    status: 'unknown',
    evidence: [],
  });
  await service.syncMetadata();
  expect(prisma.torrent.updateMany.mock.calls[0][0].data).toMatchObject({
    metadataStatus: 'parsed',
    metadata: { status: 'unknown' },
  });
});

it.each([404, 410, 500])(
  'keeps HTTP %s retries in memory, then persists failure without clearing old success',
  async (status) => {
    const { service, prisma, nyaa } = setup();
    nyaa.fetchDetails.mockRejectedValue({ response: { status } });
    await service.syncMetadata();
    await service.syncMetadata();
    expect(nyaa.fetchDetails).toHaveBeenCalledTimes(1);
    expect(prisma.torrent.updateMany).not.toHaveBeenCalled();
    jest.advanceTimersByTime(60000);
    await service.syncMetadata();
    expect(prisma.torrent.updateMany).not.toHaveBeenCalled();
    jest.advanceTimersByTime(119999);
    await service.syncMetadata();
    expect(nyaa.fetchDetails).toHaveBeenCalledTimes(2);
    jest.advanceTimersByTime(1);
    await service.syncMetadata();
    expect(prisma.torrent.updateMany.mock.calls[0][0].data).toEqual({
      metadataStatus: 'failed',
      metadataError: `抓取失败（HTTP ${status}）`,
    });
    jest.advanceTimersByTime(86400000);
    await service.syncMetadata();
    expect(nyaa.fetchDetails).toHaveBeenCalledTimes(3);
    // 新实例会重新加载 failed；包括保留有旧成功结果的失败行。
    const restarted = new NyaaMetadataService(prisma as any, nyaa as any);
    nyaa.fetchDetails.mockResolvedValue('html');
    expect(await restarted.syncMetadata()).toBe(1);
    expect(nyaa.fetchDetails).toHaveBeenCalledTimes(4);
  },
);

it.each([403, 429])(
  'pauses later batches and other rows for 15 minutes on HTTP %s',
  async (status) => {
    const { service, prisma, nyaa, row } = setup();
    prisma.torrent.findMany.mockResolvedValue([row, { ...row, id: 2 }]);
    nyaa.fetchDetails.mockRejectedValueOnce({ response: { status } });
    await service.syncMetadata();
    const reads = prisma.torrent.findMany.mock.calls.length;
    jest.advanceTimersByTime(14 * 60000);
    expect(await service.syncMetadata()).toBe(0);
    expect(prisma.torrent.findMany).toHaveBeenCalledTimes(reads);
    expect(nyaa.fetchDetails).toHaveBeenCalledTimes(1);
    expect(prisma.torrent.updateMany).not.toHaveBeenCalled();
    jest.advanceTimersByTime(60000);
    expect(await service.syncMetadata()).toBe(2);
  },
);

it('honors a pause triggered by RSS and does not consume a retry after cancellation', async () => {
  const { service, prisma, nyaa } = setup();
  nyaa.pausedUntil = Date.now() + 60000;
  await service.syncMetadata();
  expect(prisma.torrent.findMany).not.toHaveBeenCalled();
  jest.advanceTimersByTime(60000);
  nyaa.fetchDetails.mockRejectedValueOnce(new NyaaStoppedError());
  await service.syncMetadata();
  nyaa.fetchDetails.mockRejectedValue(new Error('network'));
  await service.syncMetadata();
  jest.advanceTimersByTime(60000);
  await service.syncMetadata();
  expect(prisma.torrent.updateMany).not.toHaveBeenCalled();
  jest.advanceTimersByTime(120000);
  await service.syncMetadata();
  expect(prisma.torrent.updateMany.mock.calls[0][0].data.metadataStatus).toBe(
    'failed',
  );
});

it('continues other jobs during backoff and discovers records beyond a full page', async () => {
  const { service, prisma, nyaa, row } = setup();
  prisma.torrent.findMany
    .mockResolvedValueOnce(
      Array.from({ length: 200 }, (_, i) => ({ ...row, id: i + 1 })),
    )
    .mockResolvedValueOnce([{ ...row, id: 201 }])
    .mockResolvedValue([]);
  nyaa.fetchDetails.mockRejectedValueOnce(new Error('network'));
  expect(await service.syncMetadata()).toBe(39);
  expect(prisma.torrent.findMany.mock.calls[1][0].where.id).toEqual({
    gt: 200,
  });
  for (let i = 0; i < 5; i++) await service.syncMetadata();
  expect(nyaa.fetchDetails).toHaveBeenCalledTimes(201);
  expect(prisma.torrent.updateMany).toHaveBeenCalledWith(
    expect.objectContaining({ where: { id: 201 } }),
  );
});

it('retries saving a successful result without refetching after a database outage', async () => {
  const { service, prisma, nyaa } = setup();
  prisma.torrent.updateMany.mockRejectedValueOnce(
    new Error('database offline'),
  );
  await expect(service.syncMetadata()).rejects.toThrow('database offline');
  expect(await service.syncMetadata()).toBe(1);
  expect(nyaa.fetchDetails).toHaveBeenCalledTimes(1);
});

it('never persists unvalidated HTML and gives a bounded failure reason', async () => {
  const { service, prisma } = setup();
  (extractNyaaMetadata as jest.Mock).mockImplementation(() => {
    throw new Error('untrusted page');
  });
  for (let i = 0; i < 3; i++) {
    await service.syncMetadata();
    jest.advanceTimersByTime(120000);
  }
  expect(prisma.torrent.updateMany.mock.calls[0][0].data).toEqual({
    metadataStatus: 'failed',
    metadataError: '页面校验或字幕解析失败',
  });
});

it('stops taking new work on shutdown', async () => {
  const { service, prisma } = setup();
  service.onModuleDestroy();
  expect(await service.syncMetadata()).toBe(0);
  expect(prisma.torrent.findMany).not.toHaveBeenCalled();
});

it('drops a deleted torrent without blocking remaining jobs', async () => {
  const { service, prisma, row, nyaa } = setup();
  prisma.torrent.findMany.mockResolvedValue([row, { ...row, id: 2 }]);
  prisma.torrent.updateMany.mockResolvedValueOnce({ count: 0 });
  expect(await service.syncMetadata()).toBe(1);
  await service.syncMetadata();
  expect(nyaa.fetchDetails).toHaveBeenCalledTimes(2);
});

it('waits for shutdown cancellation without persisting a failed attempt', async () => {
  const { service, nyaa, prisma } = setup();
  let cancel: (error: Error) => void = () => undefined;
  nyaa.fetchDetails.mockImplementation(
    () =>
      new Promise((_, reject) => {
        cancel = reject;
      }),
  );
  const task = service.syncMetadata();
  for (let i = 0; i < 5; i++) await Promise.resolve();
  const stopping = service.onModuleDestroy();
  expect(stopping).toBe(task);
  cancel(new NyaaStoppedError());
  expect(await stopping).toBe(0);
  expect(prisma.torrent.updateMany).not.toHaveBeenCalled();
  expect(await service.syncMetadata()).toBe(0);
});

it('manually refreshes completed records without clearing their stored results', async () => {
  const { service, prisma, nyaa } = setup();
  await service.syncMetadata();
  prisma.torrent.updateMany.mockClear();
  expect(await service.refreshMetadata([1, 1])).toBe(1);
  expect(await service.refreshMetadata([1])).toBe(0);
  expect(prisma.torrent.findMany).toHaveBeenLastCalledWith({
    where: { id: { in: [1] }, channel: 'NYAA' },
    select: { id: true, hash: true, permalink: true },
  });
  expect(prisma.torrent.updateMany).not.toHaveBeenCalled();
  jest.advanceTimersByTime(60000);
  expect(await service.syncMetadata()).toBe(1);
  expect(nyaa.fetchDetails).toHaveBeenCalledTimes(2);
});

it.each(
  [[], [0], [-1], [1.5], [2147483648], Array(101).fill(1)].map((ids) => [ids]),
)(
  'rejects invalid refresh input %j before reading or enqueueing',
  async (ids) => {
    const { service, prisma } = setup();
    await expect(service.refreshMetadata(ids)).rejects.toThrow('种子 ID');
    expect(prisma.torrent.findMany).not.toHaveBeenCalled();
  },
);

it('rejects a partially missing or non-Nyaa batch without queueing any of it', async () => {
  const { service, prisma, nyaa } = setup();
  await expect(service.refreshMetadata([1, 2])).rejects.toThrow(
    '种子不存在或不属于 Nyaa',
  );
  prisma.torrent.findMany.mockResolvedValue([]);
  expect(await service.syncMetadata()).toBe(0);
  expect(nyaa.fetchDetails).not.toHaveBeenCalled();
});

it('prioritizes explicit refreshes over an automatic backlog', async () => {
  const { service, prisma, nyaa, row } = setup();
  prisma.torrent.findMany.mockResolvedValueOnce(
    Array.from({ length: 80 }, (_, i) => ({ ...row, id: i + 1 })),
  );
  await service.syncMetadata();
  prisma.torrent.findMany.mockResolvedValueOnce([
    { ...row, id: 100, permalink: 'https://nyaa.si/view/100' },
  ]);
  await service.refreshMetadata([100]);
  nyaa.fetchDetails.mockClear();
  await service.syncMetadata();
  expect(nyaa.fetchDetails).toHaveBeenNthCalledWith(
    1,
    'https://nyaa.si/view/100',
  );
});

it('queues during cooldown without resetting retries, then permits an explicit retry after exhaustion', async () => {
  const { service, prisma, nyaa } = setup();
  nyaa.pausedUntil = Date.now() + 15 * 60000;
  expect(await service.refreshMetadata([1])).toBe(1);
  expect(await service.syncMetadata()).toBe(0);
  expect(nyaa.fetchDetails).not.toHaveBeenCalled();
  jest.advanceTimersByTime(15 * 60000);
  nyaa.fetchDetails.mockRejectedValue(new Error('network'));
  for (let i = 0; i < 3; i++) {
    expect(await service.refreshMetadata([1])).toBe(0);
    await service.syncMetadata();
    jest.advanceTimersByTime(120000);
  }
  expect(prisma.torrent.updateMany).toHaveBeenLastCalledWith({
    where: { id: 1 },
    data: {
      metadataStatus: 'failed',
      metadataError: '抓取失败（网络或请求错误）',
    },
  });
  nyaa.fetchDetails.mockResolvedValue('html');
  expect(await service.refreshMetadata([1])).toBe(1);
  expect(await service.syncMetadata()).toBe(1);
});

it('deduplicates an in-flight refresh and stops accepting refreshes during shutdown', async () => {
  const { service, prisma, nyaa } = setup();
  let resolve!: (html: string) => void;
  nyaa.fetchDetails.mockImplementation(
    () => new Promise<string>((done) => (resolve = done)),
  );
  const task = service.syncMetadata();
  for (let i = 0; i < 5; i++) await Promise.resolve();
  expect(await service.refreshMetadata([1])).toBe(0);
  resolve('html');
  expect(await task).toBe(1);
  await service.syncMetadata();
  expect(nyaa.fetchDetails).toHaveBeenCalledTimes(1);

  let releaseRead!: (rows: unknown[]) => void;
  prisma.torrent.findMany.mockImplementationOnce(
    () => new Promise((done) => (releaseRead = done)),
  );
  const refreshing = service.refreshMetadata([1]);
  await service.onModuleDestroy();
  releaseRead([{ id: 1 }]);
  await expect(refreshing).rejects.toThrow('服务正在停止');
  await expect(service.refreshMetadata([1])).rejects.toThrow('服务正在停止');
});

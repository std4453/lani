import config from '@/config';
import { enqueueTorrentMatch, updateWithTorrentMatching } from './producer';
import { TorrentMatchService } from './index.service';

jest.mock('@/config', () => ({
  __esModule: true,
  default: { matching: { enabled: true } },
}));

const transaction = () => ({
  torrent: { updateMany: jest.fn().mockResolvedValue({ count: 1 }) },
  backgroundJob: {
    upsert: jest.fn().mockResolvedValue({ id: 10 }),
    updateMany: jest.fn().mockResolvedValue({ count: 1 }),
  },
});

beforeEach(() => {
  config.matching.enabled = true;
});

it('禁用时不写入队列或匹配状态，元数据更新仍执行', async () => {
  config.matching.enabled = false;
  const tx = transaction();
  expect(await enqueueTorrentMatch(tx as any, [1])).toBe(0);
  const update = jest.fn().mockResolvedValue('updated');
  expect(await updateWithTorrentMatching(tx as any, [1], update)).toBe(
    'updated',
  );
  expect(tx.torrent.updateMany).not.toHaveBeenCalled();
  expect(tx.backgroundJob.upsert).not.toHaveBeenCalled();
});

it('批量入队去重并按 ID 加锁，只处理未识别记录', async () => {
  const tx = transaction();
  tx.torrent.updateMany.mockResolvedValueOnce({ count: 0 });
  expect(await enqueueTorrentMatch(tx as any, [3, 1, 3], true)).toBe(1);
  expect(tx.torrent.updateMany.mock.calls.map(([arg]) => arg.where)).toEqual([
    { id: 1, matchStatus: null },
    { id: 3, matchStatus: null },
  ]);
  expect(tx.backgroundJob.upsert).toHaveBeenCalledTimes(1);
});

it('重跑仍排除用户取消关联的记录', async () => {
  const tx = transaction();
  await enqueueTorrentMatch(tx as any, [1]);
  expect(tx.torrent.updateMany.mock.calls[0][0].where.OR).toEqual([
    { matchStatus: null },
    { matchStatus: { not: 'DISMISSED' } },
  ]);
});

it('运维接口默认只处理未识别记录，提交后唤醒消费者', async () => {
  const tx = transaction();
  const events: string[] = [];
  const db = {
    $transaction: jest.fn(async (fn) => {
      const count = await fn(tx);
      events.push('committed');
      return count;
    }),
  };
  const queues = {
    wake: jest.fn(async () => {
      events.push('wake');
    }),
  };
  const service = new TorrentMatchService(db as any, queues as any, {} as any);
  expect(await service.enqueueBatch([1])).toBe(1);
  expect(tx.torrent.updateMany.mock.calls[0][0].where.matchStatus).toBeNull();
  expect(events).toEqual(['committed', 'wake']);
  await service.enqueueBatch([2], true);
  expect(tx.torrent.updateMany.mock.calls[1][0].where.OR).toBeDefined();
});

it('禁用、无效批次和事务失败均不会唤醒消费者', async () => {
  const db = {
    $transaction: jest.fn().mockRejectedValue(new Error('rollback')),
  };
  const queues = { wake: jest.fn() };
  const service = new TorrentMatchService(db as any, queues as any, {} as any);
  for (const ids of [[], [0], [-1], [1.5], Array(501).fill(1)]) {
    await expect(service.enqueueBatch(ids)).rejects.toThrow('有效种子 ID');
  }
  expect(db.$transaction).not.toHaveBeenCalled();
  config.matching.enabled = false;
  await expect(service.enqueueBatch([1])).rejects.toThrow('种子匹配未启用');
  expect(db.$transaction).not.toHaveBeenCalled();
  config.matching.enabled = true;
  await expect(service.enqueueBatch([1])).rejects.toThrow('rollback');
  expect(queues.wake).not.toHaveBeenCalled();
});

it.each([
  { title: '[Group] New raw title 03' },
  { parseResult: { publisherSeason: 2 } },
])('实际原始标题或发布者季数变化时重新入队: %j', async (change) => {
  const row = {
    id: 1,
    title: '[Group] Anime 03',
    parseResult: { publisherSeason: 1 },
    seasonTitleRaw: 'Anime',
    seasonTitleAliases: [],
    publishDate: new Date('2026-10-21T00:00:00Z'),
    episodeType: 'EPISODE',
    episodeNumber: 3,
    episodeNumberFrom: null,
    episodeNumberTo: null,
  };
  const tx = {
    ...transaction(),
    $queryRaw: jest.fn().mockResolvedValue([]),
  };
  (tx.torrent as any).findMany = jest
    .fn()
    .mockResolvedValueOnce([row])
    .mockResolvedValueOnce([{ ...row, ...change }]);
  await updateWithTorrentMatching(tx as any, [1], async () => undefined);
  expect(tx.backgroundJob.upsert).toHaveBeenCalledTimes(1);
});

it('解析器无关字段变化不会重新调用模型', async () => {
  const row = {
    id: 1,
    title: '[Group] Anime 03',
    parseResult: { publisherSeason: 1, subtitleInfo: { languages: ['zh'] } },
    seasonTitleRaw: 'Anime',
    seasonTitleAliases: [],
    publishDate: new Date('2026-10-21T00:00:00Z'),
    episodeType: 'EPISODE',
    episodeNumber: 3,
    episodeNumberFrom: null,
    episodeNumberTo: null,
  };
  const tx = { ...transaction(), $queryRaw: jest.fn().mockResolvedValue([]) };
  (tx.torrent as any).findMany = jest
    .fn()
    .mockResolvedValueOnce([row])
    .mockResolvedValueOnce([
      { ...row, parseResult: { ...row.parseResult, subtitleInfo: null } },
    ]);
  await updateWithTorrentMatching(tx as any, [1], async () => undefined);
  expect(tx.backgroundJob.upsert).not.toHaveBeenCalled();
});

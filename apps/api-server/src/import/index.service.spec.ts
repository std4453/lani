import { ImportService, importDefinition } from './index.service';
import { TaskType } from '@lani/db';
jest.mock('@/config', () => ({
  __esModule: true,
  default: {
    jellyfin: { apiEndpoint: 'http://127.0.0.1:1', apiToken: 'test' },
    s3: { bucket: 'test' },
    network: { timeout: { global: 100, local: 100 } },
  },
}));
function setup() {
  const tx = {
    episode: {
      findMany: jest.fn(async ({ where }) =>
        where.id.in.map((id: number) => ({ id, seasonId: 1 })),
      ),
    },
  };
  let committed = false;
  const prisma = {
    $transaction: jest.fn(async (run) => {
      const result = await run(tx);
      committed = true;
      return result;
    }),
  };
  const tasks = {
    create: jest.fn(async () => ({ id: 42 })),
    start: jest.fn(() => {
      expect(committed).toBe(true);
      return new Promise<void>(() => undefined);
    }),
  };
  return {
    service: new ImportService(prisma as never, tasks as never),
    tasks,
    tx,
    prisma,
  };
}
it('事务提交后后台运行，返回任务 ID 并保存确认顺序和路径', async () => {
  const { service, tasks, tx } = setup();
  await expect(
    service.importMultiple([
      { episodeId: 2, importPath: '/source/02.mkv' },
      { episodeId: 1, importPath: '/source/01.mkv' },
    ]),
  ).resolves.toBe(42);
  expect(tasks.create).toHaveBeenCalledWith(
    tx,
    TaskType.BATCH_IMPORT,
    importDefinition,
    {
      entries: [
        { episodeId: 2, sourcePath: '/source/02.mkv' },
        { episodeId: 1, sourcePath: '/source/01.mkv' },
      ],
    },
  );
  expect(tasks.start).toHaveBeenCalledWith(42);
});
it('单集导入复用任务流程', async () => {
  const { service, tasks, tx } = setup();
  await expect(service.importSingle(1, '/source/01.mkv')).resolves.toBe(42);
  expect(tasks.create).toHaveBeenCalledWith(
    tx,
    TaskType.IMPORT,
    importDefinition,
    { entries: [{ episodeId: 1, sourcePath: '/source/01.mkv' }] },
  );
});
it.each([
  [[], '请选择'],
  [
    [
      { episodeId: 1, importPath: '/a' },
      { episodeId: 1, importPath: '/b' },
    ],
    '同一剧集',
  ],
  [
    [
      { episodeId: 1, importPath: '/a/b/../c' },
      { episodeId: 2, importPath: '/a/c' },
    ],
    '同一文件',
  ],
  [[{ episodeId: 1, importPath: '../a' }], '参数无效'],
] as const)('拒绝无效输入 %j', async (entries, message) => {
  const { service, tasks } = setup();
  await expect(service.importMultiple([...entries])).rejects.toThrow(message);
  expect(tasks.start).not.toHaveBeenCalled();
  expect(tasks.create).not.toHaveBeenCalled();
});
it.each([true, false])('拒绝跨季度或已删除剧集 %s', async (crossSeason) => {
  const { service, tasks, tx } = setup();
  tx.episode.findMany.mockResolvedValueOnce(
    crossSeason
      ? [
          { id: 1, seasonId: 1 },
          { id: 2, seasonId: 2 },
        ]
      : [{ id: 1, seasonId: 1 }],
  );
  await expect(
    service.importMultiple([
      { episodeId: 1, importPath: '/a' },
      { episodeId: 2, importPath: '/b' },
    ]),
  ).rejects.toThrow(crossSeason ? '同一季度' : '不存在');
  expect(tasks.start).not.toHaveBeenCalled();
});

import { toTorrentFile } from '@ctrl/torrent-file';
import { BatchDownloadService } from './batch-download.service';
import { downloadDefinition } from './definition';

jest.mock('@/config', () => ({
  __esModule: true,
  default: {
    jellyfin: { apiEndpoint: 'http://127.0.0.1:1', apiToken: 'test' },
    s3: { bucket: 'test' },
    network: { timeout: { global: 100, local: 100 } },
  },
}));

const torrentLink = 'https://example.test/batch.torrent';
function setup() {
  const tx = {
    episode: {
      findMany: jest.fn(async ({ where }) =>
        where.id.in.map((id: number) => ({ id, seasonId: where.seasonId })),
      ),
    },
    taskEpisode: { createMany: jest.fn() },
  };
  let committed = false;
  const prisma = {
    torrent: { findUnique: jest.fn(async () => ({ torrentLink })) },
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
    }),
  };
  const client = {
    prepareTorrent: jest.fn(async () => ({
      clientHash: 'a'.repeat(40),
      input: Buffer.from(
        toTorrentFile({
          info: {
            name: '合集',
            'piece length': 16384,
            pieces: Buffer.alloc(20),
            files: [
              { path: ['01.mkv'], length: 1 },
              { path: ['02.mkv'], length: 2 },
              { path: ['封面.jpg'], length: 3 },
            ],
          },
        }),
      ),
    })),
    submitTorrent: jest.fn(),
  };
  const service = new BatchDownloadService(
    prisma as never,
    tasks as never,
    client as never,
  );
  return { service, prisma, tasks, client, tx };
}

it('预览只读种子；确认后事务保存选中文件和关联，再后台运行七步流程', async () => {
  const { service, tasks, client, tx, prisma } = setup();
  const preview = await service.previewTorrent(1);
  expect(preview.files).toEqual([
    { path: '合集/01.mkv', size: 1 },
    { path: '合集/02.mkv', size: 2 },
    { path: '合集/封面.jpg', size: 3 },
  ]);
  expect(tasks.create).not.toHaveBeenCalled();
  expect(client.submitTorrent).not.toHaveBeenCalled();
  expect(prisma.$transaction).not.toHaveBeenCalled();
  await expect(
    service.downloadTorrentForSeason(3, preview.token, [
      { episodeId: 2, path: '合集/02.mkv' },
      { episodeId: 1, path: '合集/01.mkv' },
    ]),
  ).resolves.toBe(42);
  expect(tasks.create).toHaveBeenCalledWith(
    tx,
    'BATCH_DOWNLOAD',
    downloadDefinition,
    {
      torrentLink,
      qbtTorrentHash: 'a'.repeat(40),
      batchEntries: [
        { id: expect.any(String), episodeId: 2, sourcePath: '合集/02.mkv' },
        { id: expect.any(String), episodeId: 1, sourcePath: '合集/01.mkv' },
      ],
    },
  );
  expect(tx.taskEpisode.createMany).toHaveBeenCalledWith({
    data: [
      { taskId: 42, episodeId: 2 },
      { taskId: 42, episodeId: 1 },
    ],
  });
  expect(tasks.start).toHaveBeenCalledWith(42);
});

it.each(
  [
    [],
    [{ episodeId: 1, path: '../01.mkv' }],
    [{ episodeId: 1, path: '合集/03.mkv' }],
    [{ episodeId: 1, path: '合集/封面.jpg' }],
    [{ episodeId: 1.5, path: '合集/01.mkv' }],
    [
      { episodeId: 1, path: '合集/01.mkv' },
      { episodeId: 1, path: '合集/02.mkv' },
    ],
    [
      { episodeId: 1, path: '合集/01.mkv' },
      { episodeId: 2, path: '合集/01.mkv' },
    ],
  ].map((entries) => ({ entries })),
)('拒绝无效文件或映射 $entries', async ({ entries }) => {
  const { service, tasks } = setup();
  const preview = await service.previewTorrent(1);
  await expect(
    service.downloadTorrentForSeason(1, preview.token, entries),
  ).rejects.toThrow('请选择');
  expect(tasks.create).not.toHaveBeenCalled();
});

it('拒绝过期预览和重启前的预览', async () => {
  const { service, tasks } = setup();
  const preview = await service.previewTorrent(1);
  const now = jest.spyOn(Date, 'now').mockReturnValue(Date.now() + 900001);
  try {
    await expect(
      service.downloadTorrentForSeason(1, preview.token, []),
    ).rejects.toThrow('预览已失效');
  } finally {
    now.mockRestore();
  }
  await expect(
    setup().service.downloadTorrentForSeason(1, preview.token, []),
  ).rejects.toThrow('预览已失效');
  expect(tasks.create).not.toHaveBeenCalled();
});

it('剧集被删除或不属于本季时不创建任务', async () => {
  const { service, tx, tasks } = setup();
  const preview = await service.previewTorrent(1);
  tx.episode.findMany.mockResolvedValueOnce([]);
  await expect(
    service.downloadTorrentForSeason(2, preview.token, [
      { episodeId: 1, path: '合集/01.mkv' },
    ]),
  ).rejects.toThrow('不属于当前季度');
  expect(tasks.create).not.toHaveBeenCalled();
});

it('读取种子失败与关联事务失败均不启动任务', async () => {
  const { service, client, tasks, tx } = setup();
  client.prepareTorrent.mockRejectedValueOnce(new Error('fetch failed'));
  await expect(service.previewTorrent(1)).rejects.toThrow('fetch failed');
  const preview = await service.previewTorrent(1);
  tx.taskEpisode.createMany.mockRejectedValueOnce(new Error('write failed'));
  await expect(
    service.downloadTorrentForSeason(1, preview.token, [
      { episodeId: 1, path: '合集/01.mkv' },
    ]),
  ).rejects.toThrow('write failed');
  expect(tasks.start).not.toHaveBeenCalled();
});

it('同一预览只允许一个并发提交，成功后不能再次使用', async () => {
  const { service, tasks, tx } = setup();
  const preview = await service.previewTorrent(1);
  let release!: (episodes: { id: number; seasonId: number }[]) => void;
  tx.episode.findMany.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        release = resolve;
      }),
  );
  const entries = [{ episodeId: 1, path: '合集/01.mkv' }];
  const first = service.downloadTorrentForSeason(1, preview.token, entries);
  await expect(
    service.downloadTorrentForSeason(1, preview.token, entries),
  ).rejects.toThrow('正在提交');
  release([{ id: 1, seasonId: 1 }]);
  await expect(first).resolves.toBe(42);
  await expect(
    service.downloadTorrentForSeason(1, preview.token, entries),
  ).rejects.toThrow('预览已失效');
  expect(tasks.create).toHaveBeenCalledTimes(1);
});

it('事务失败释放提交占用，允许修正后重试同一预览', async () => {
  const { service, tx, tasks } = setup();
  const preview = await service.previewTorrent(1);
  const entries = [{ episodeId: 1, path: '合集/01.mkv' }];
  tx.taskEpisode.createMany.mockRejectedValueOnce(new Error('write failed'));
  await expect(
    service.downloadTorrentForSeason(1, preview.token, entries),
  ).rejects.toThrow('write failed');
  await expect(
    service.downloadTorrentForSeason(1, preview.token, entries),
  ).resolves.toBe(42);
  expect(tasks.start).toHaveBeenCalledTimes(1);
});

import { RefreshPlayerAtom } from './refresh-player.atom';
import {
  JellyfinHelp,
  TvShowsService,
  CancelablePromise,
} from '@/api/jellyfin';
import { PrismaService } from '@/common/prisma.service';
import { AtomContext } from '@/task/atom';
import { PlayerRefreshService } from './refresh/player-refresh.service';
jest.mock('./publication', () => ({
  claimEpisodePublication: jest.fn(async () => undefined),
}));

jest.mock('@/config', () => ({
  __esModule: true,
  default: {
    jellyfin: {
      apiEndpoint: 'http://127.0.0.1:1',
      dummyUserId: 'test',
      pathMapping: [],
    },
  },
}));

beforeEach(() => jest.useFakeTimers());
afterEach(() => {
  jest.clearAllTimers();
  jest.useRealTimers();
  jest.restoreAllMocks();
});

function setup() {
  const refresh = new PlayerRefreshService();
  const atom = new RefreshPlayerAtom(
    {
      episode: {
        findUnique: jest.fn(async () => ({
          id: 1,
          index: 1,
          episodeType: 'EPISODE',
          season: { jellyfinId: 'series' },
        })),
      },
    } as unknown as PrismaService,
    refresh,
  );
  const context: AtomContext = {
    stepId: 'player',
    attempt: 1,
    waitFor: async (operation) => operation,
    checkpoint: { refreshStartedAt: '2000-01-01T00:00:00Z' },
    assertActive: jest.fn(async () => undefined),
    wait: jest.fn(async () => undefined),
    transaction: jest.fn(),
    updateCheckpoint: jest.fn(),
    saveCheckpoint: jest.fn(async (value) => {
      Object.assign(context.checkpoint, value);
    }),
  };
  const input = {
    type: 'DOWNLOAD' as const,
    sourcePath: null,
    batchEntries: null,
    id: 1,
    episodeId: 1,
    torrentLink: 'test',
    qbtTorrentHash: null,
    torrentTitle: null,
    downloadPath: null,
    importPath: null,
    filePath: '/media/episode.mkv',
    nfoPath: null,
    jellyfinEpisodeId: null,
  };
  return { atom, context, input, refresh };
}

it('恢复时等待新的批量刷新后重新计时，不因旧检查点立即超时', async () => {
  const { atom, context, input, refresh } = setup();
  const now = Date.now();
  jest.spyOn(JellyfinHelp, 'refreshItem').mockImplementation(
    () =>
      new CancelablePromise<void>((resolve) => {
        expect(context.saveCheckpoint).not.toHaveBeenCalled();
        resolve();
      }),
  );
  jest
    .spyOn(TvShowsService, 'getEpisodes')
    .mockResolvedValueOnce({ Items: [] })
    .mockResolvedValueOnce({
      Items: [
        {
          Id: 'episode',
          IndexNumber: 1,
          ParentIndexNumber: 1,
          Path: '/media/episode.mkv',
        },
      ],
    });
  const result = atom.recover(1, input, context);
  // 让 atom 完成依赖读取并入队。
  for (let i = 0; i < 10; ++i) await Promise.resolve();
  await refresh.refreshAllPlayerWaitingStatus();
  expect(
    Date.parse(context.checkpoint.refreshStartedAt!),
  ).toBeGreaterThanOrEqual(now);
  await refresh.refreshAllPlayerWaitingStatus();
  await expect(result).resolves.toEqual({ jellyfinEpisodeId: 'episode' });
  expect(JellyfinHelp.refreshItem).toHaveBeenCalledTimes(1);
});
it('刷新失败不写计时起点，并将失败任务移出队列', async () => {
  const { atom, context, input, refresh } = setup();
  jest
    .spyOn(JellyfinHelp, 'refreshItem')
    .mockRejectedValue(new Error('offline'));
  const result = expect(atom.recover(1, input, context)).rejects.toThrow(
    'offline',
  );
  for (let i = 0; i < 10; ++i) await Promise.resolve();
  await refresh.refreshAllPlayerWaitingStatus();
  await result;
  expect(context.saveCheckpoint).not.toHaveBeenCalled();
  expect(await refresh.refreshAllPlayerWaitingStatus()).toBe(0);
});

it('缺少导入路径时拒绝刷新，避免仅凭集号关联旧条目', async () => {
  const { atom, context, input, refresh } = setup();
  const enqueue = jest.spyOn(refresh, 'enqueue');
  await expect(
    atom.recover(1, { ...input, filePath: null }, context),
  ).rejects.toThrow('缺少已导入的视频路径');
  expect(enqueue).not.toHaveBeenCalled();
});

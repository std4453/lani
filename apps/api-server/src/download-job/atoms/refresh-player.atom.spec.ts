import { RefreshPlayerAtom } from './refresh-player.atom';
import {
  JellyfinHelp,
  TvShowsService,
  CancelablePromise,
} from '@/api/jellyfin';
import { PrismaService } from '@/common/prisma.service';
import { AtomContext } from './index';

jest.mock('@/config', () => ({
  __esModule: true,
  default: {
    jellyfin: { apiEndpoint: 'http://127.0.0.1:1', dummyUserId: 'test' },
  },
}));

afterEach(() => jest.restoreAllMocks());

function setup() {
  const atom = new RefreshPlayerAtom({
    episode: {
      findUnique: jest.fn(async () => ({
        id: 1,
        index: 1,
        episodeType: 'EPISODE',
        season: { jellyfinId: 'series' },
      })),
    },
  } as unknown as PrismaService);
  const context: AtomContext = {
    checkpoint: { refreshStartedAt: '2000-01-01T00:00:00Z' },
    assertActive: jest.fn(async () => undefined),
    wait: jest.fn(async () => undefined),
    saveCheckpoint: jest.fn(async (value) => {
      Object.assign(context.checkpoint, value);
    }),
  };
  const input = {
    id: 1,
    params: { episodeId: 1, torrentLink: 'test' },
    steps: {},
  };
  return { atom, context, input };
}

it('恢复时等待新刷新完成再重新计时，不因旧检查点立即超时', async () => {
  const { atom, context, input } = setup();
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
      Items: [{ Id: 'episode', IndexNumber: 1, ParentIndexNumber: 1 }],
    });
  await expect(atom.recover(1, input, context)).resolves.toEqual({
    jellyfinEpisodeId: 'episode',
  });
  expect(
    Date.parse(context.checkpoint.refreshStartedAt!),
  ).toBeGreaterThanOrEqual(now);
  expect(context.wait).toHaveBeenCalledTimes(1);
});

it('刷新请求失败时不写入新的等待起点', async () => {
  const { atom, context, input } = setup();
  jest
    .spyOn(JellyfinHelp, 'refreshItem')
    .mockRejectedValue(new Error('offline'));
  await expect(atom.recover(1, input, context)).rejects.toThrow('offline');
  expect(context.saveCheckpoint).not.toHaveBeenCalled();
});

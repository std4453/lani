import { ApolloClient } from '@apollo/client';
import { syncTorrentHistory } from './history';

function setup() {
  const client = {
    mutate: jest
      .fn()
      .mockResolvedValue({ data: { syncTorrentHistory: 'run-1' } }),
    query: jest.fn().mockResolvedValue({
      data: {
        torrentHistorySyncState: { running: false, added: 10, error: null },
      },
    }),
  };
  const controller = new AbortController();
  return {
    client,
    controller,
    run: () =>
      syncTorrentHistory(
        client as unknown as ApolloClient<object>,
        controller.signal,
      ),
  };
}
async function flush() {
  for (let i = 0; i < 5; i++) await Promise.resolve();
}
beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

it.each([0, 10])(
  'polls with the UUID until completion and returns %i added torrents',
  async (added) => {
    const { client, run } = setup();
    client.query.mockResolvedValue({
      data: { torrentHistorySyncState: { running: false, added, error: null } },
    });
    client.query.mockResolvedValueOnce({
      data: {
        torrentHistorySyncState: { running: true, added: 0, error: null },
      },
    });
    const promise = run();
    await flush();
    expect(client.query).not.toHaveBeenCalled();
    jest.advanceTimersByTime(2000);
    await flush();
    jest.advanceTimersByTime(2000);
    await expect(promise).resolves.toBe(added);
    expect(client.mutate).toHaveBeenCalledTimes(1);
    expect(client.query).toHaveBeenCalledTimes(2);
    expect(client.query).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: { id: 'run-1' },
        fetchPolicy: 'network-only',
      }),
    );
  },
);

it.each(['background', 'query'])('reports %s failure', async (kind) => {
  const { client, run } = setup();
  if (kind === 'background')
    client.query.mockResolvedValue({
      data: { torrentHistorySyncState: { running: false, error: '同步失败' } },
    });
  else client.query.mockRejectedValue(new Error('同步任务不存在或服务已重启'));
  const promise = run();
  const rejection = expect(promise).rejects.toThrow();
  await flush();
  jest.advanceTimersByTime(2000);
  await rejection;
});

it('does not poll when starting fails', async () => {
  const { client, run } = setup();
  client.mutate.mockResolvedValue({ data: null });
  await expect(run()).rejects.toThrow('无法启动');
  expect(client.query).not.toHaveBeenCalled();
});

it('stops polling when the page is closed', async () => {
  const { client, controller, run } = setup();
  const promise = run();
  const rejection = expect(promise).rejects.toThrow('已停止等待');
  await flush();
  controller.abort();
  await rejection;
  expect(client.query).not.toHaveBeenCalled();
  expect(jest.getTimerCount()).toBe(0);
});

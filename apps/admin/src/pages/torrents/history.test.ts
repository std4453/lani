import { ApolloClient } from '@apollo/client';
import { syncNyaaHistory } from './history';

const state = { id: 'run-1', running: true, added: 0, error: null };
function setup(result = { ...state, running: false, added: 7 }) {
  const client = {
    mutate: jest.fn().mockResolvedValue({ data: { syncNyaaHistory: state } }),
    query: jest.fn().mockResolvedValue({ data: { nyaaHistorySync: result } }),
  };
  const controller = new AbortController();
  return {
    client,
    controller,
    run: () =>
      syncNyaaHistory(
        client as unknown as ApolloClient<object>,
        controller.signal,
      ),
  };
}

async function flushPromises() {
  for (let i = 0; i < 5; i++) await Promise.resolve();
}

beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

it('polls a background run without holding one HTTP request open', async () => {
  const { client, run } = setup();
  const promise = run();
  await flushPromises();
  expect(client.query).not.toHaveBeenCalled();
  jest.advanceTimersByTime(2000);
  await expect(promise).resolves.toBe(7);
  expect(client.query).toHaveBeenCalledWith(
    expect.objectContaining({ fetchPolicy: 'network-only' }),
  );
});

it('reports background failure and service restarts instead of claiming success', async () => {
  for (const result of [
    { ...state, running: false, error: '同步失败' },
    { ...state, id: '' },
  ]) {
    const { client, run } = setup();
    client.query.mockResolvedValue({ data: { nyaaHistorySync: result } });
    const promise = run();
    const rejection = expect(promise).rejects.toThrow();
    await flushPromises();
    jest.advanceTimersByTime(2000);
    await rejection;
  }
});

it('stops polling when the page is closed', async () => {
  const { client, controller, run } = setup();
  const promise = run();
  const rejection = expect(promise).rejects.toThrow('已停止等待');
  await flushPromises();
  controller.abort();
  await rejection;
  expect(client.query).not.toHaveBeenCalled();
  expect(jest.getTimerCount()).toBe(0);
});

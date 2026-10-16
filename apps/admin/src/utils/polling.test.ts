import { createPoller } from './polling';
beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());
const tick = async () => {
  for (let i = 0; i < 10; ++i) await Promise.resolve();
};
it('隐藏或离线时不刷新，恢复立即刷新，卸载清除计时器', async () => {
  let available = false;
  const refresh = jest.fn(async () => undefined);
  const poller = createPoller({
    refresh,
    interval: 3000,
    available: () => available,
  });
  jest.advanceTimersByTime(30000);
  expect(refresh).not.toHaveBeenCalled();
  available = true;
  poller.changed();
  await tick();
  expect(refresh).toHaveBeenCalledTimes(1);
  jest.advanceTimersByTime(3000);
  await tick();
  expect(refresh).toHaveBeenCalledTimes(2);
  available = false;
  poller.changed();
  jest.advanceTimersByTime(30000);
  expect(refresh).toHaveBeenCalledTimes(2);
  available = true;
  poller.changed();
  await tick();
  expect(refresh).toHaveBeenCalledTimes(3);
  poller.dispose();
  jest.advanceTimersByTime(30000);
  expect(refresh).toHaveBeenCalledTimes(3);
});
it('慢请求不重叠，恢复事件合并为一次补刷新', async () => {
  let finish!: () => void;
  const refresh = jest.fn(
    () =>
      new Promise<void>((resolve) => {
        finish = resolve;
      }),
  );
  const poller = createPoller({
    refresh,
    interval: 3000,
    available: () => true,
  });
  jest.advanceTimersByTime(3000);
  await tick();
  expect(refresh).toHaveBeenCalledTimes(1);
  jest.advanceTimersByTime(30000);
  poller.changed();
  poller.changed();
  expect(refresh).toHaveBeenCalledTimes(1);
  finish();
  await tick();
  expect(refresh).toHaveBeenCalledTimes(2);
  poller.dispose();
  finish();
  await tick();
  jest.advanceTimersByTime(30000);
  expect(refresh).toHaveBeenCalledTimes(2);
});
it('网络请求失败后仍可刷新', async () => {
  const refresh = jest
    .fn()
    .mockRejectedValueOnce(new Error('offline'))
    .mockResolvedValue(undefined);
  const poller = createPoller({
    refresh,
    interval: 3000,
    available: () => true,
  });
  jest.advanceTimersByTime(3000);
  await tick();
  jest.advanceTimersByTime(3000);
  await tick();
  expect(refresh).toHaveBeenCalledTimes(2);
  poller.dispose();
});

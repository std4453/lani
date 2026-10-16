import React from 'react';
import ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';
import { useApolloPoll } from './useApolloPoll';
const flush = async () => {
  for (let i = 0; i < 10; ++i) await Promise.resolve();
};
it('实际监听可见性和联网事件，禁用及卸载后不再刷新', async () => {
  jest.useFakeTimers();
  let hidden = false,
    online = true;
  Object.defineProperty(document, 'hidden', {
    configurable: true,
    get: () => hidden,
  });
  Object.defineProperty(navigator, 'onLine', {
    configurable: true,
    get: () => online,
  });
  const refresh = jest.fn(async () => undefined);
  const stop = jest.fn();
  function Harness({ enabled }: { enabled: boolean }) {
    useApolloPoll({
      refetch: refresh,
      stopPolling: stop,
      pollInterval: 3000,
      enabled,
    });
    return null;
  }
  const node = document.createElement('div');
  document.body.appendChild(node);
  act(() => {
    ReactDOM.render(<Harness enabled />, node);
  });
  await act(async () => {
    jest.advanceTimersByTime(3000);
    await flush();
  });
  expect(refresh).toHaveBeenCalledTimes(1);
  await act(async () => {
    hidden = true;
    document.dispatchEvent(new Event('visibilitychange'));
    jest.advanceTimersByTime(30000);
    await flush();
  });
  expect(refresh).toHaveBeenCalledTimes(1);
  await act(async () => {
    hidden = false;
    document.dispatchEvent(new Event('visibilitychange'));
    await flush();
  });
  expect(refresh).toHaveBeenCalledTimes(2);
  await act(async () => {
    online = false;
    window.dispatchEvent(new Event('offline'));
    jest.advanceTimersByTime(30000);
    await flush();
  });
  expect(refresh).toHaveBeenCalledTimes(2);
  await act(async () => {
    online = true;
    window.dispatchEvent(new Event('online'));
    await flush();
  });
  expect(refresh).toHaveBeenCalledTimes(3);
  act(() => {
    ReactDOM.render(<Harness enabled={false} />, node);
  });
  await act(async () => {
    window.dispatchEvent(new Event('online'));
    jest.advanceTimersByTime(30000);
    await flush();
  });
  expect(refresh).toHaveBeenCalledTimes(3);
  act(() => {
    ReactDOM.unmountComponentAtNode(node);
  });
  node.remove();
  expect(stop).toHaveBeenCalled();
  jest.useRealTimers();
});

const mockQuery = jest.fn();
const mockClient = { query: mockQuery };
jest.mock('@apollo/client', () => ({ useApolloClient: () => mockClient }));
import React from 'react';
import ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';
import { usePreviewState } from './usePreviewState';

let container: HTMLDivElement;
let current: ReturnType<typeof usePreviewState>;
const result = (status = 'running', mode = 'semantic') => ({
  data: {
    config: { matching: { mode } },
    allTasks: {
      nodes: [
        {
          id: 1,
          smartDownloadTorrentHash: 'ABC',
          statusSummary: { version: 1, workflow: { status } },
        },
      ],
      pageInfo: { endCursor: null, hasNextPage: false },
    },
  },
});
function Harness({ enabled = true }: { enabled?: boolean }) {
  current = usePreviewState(1, enabled);
  return null;
}
async function tick(ms = 0) {
  await act(async () => {
    jest.advanceTimersByTime(ms);
    await Promise.resolve();
  });
}
beforeEach(async () => {
  jest.useFakeTimers();
  mockQuery.mockReset().mockResolvedValue(result());
  container = document.createElement('div');
  await act(async () => {
    ReactDOM.render(<Harness />, container);
  });
});
afterEach(() => {
  act(() => {
    ReactDOM.unmountComponentAtNode(container);
  });
  jest.restoreAllMocks();
  jest.useRealTimers();
});
test('任务状态每五秒后台更新，同时取得 matcher 模式', async () => {
  expect(current.tasks.get('abc')?.summary.workflow?.status).toBe('running');
  mockQuery.mockResolvedValue(result('cancelled', 'lexical'));
  await tick(5000);
  expect(current.tasks.get('abc')?.summary.workflow?.status).toBe('cancelled');
  expect(current.mode).toBe('lexical');
});
test('隐藏页面或离线时取消在途请求，恢复后立即读取且迟到结果不回退状态', async () => {
  let finish!: (value: unknown) => void;
  mockQuery.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  await tick(5000);
  const signal = mockQuery.mock.calls[1][0].context.fetchOptions.signal;
  const hidden = jest.spyOn(document, 'hidden', 'get').mockReturnValue(true);
  act(() => {
    document.dispatchEvent(new Event('visibilitychange'));
  });
  expect(signal.aborted).toBe(true);
  await tick(10000);
  expect(mockQuery).toHaveBeenCalledTimes(2);
  hidden.mockReturnValue(false);
  const online = jest.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);
  act(() => {
    document.dispatchEvent(new Event('visibilitychange'));
    window.dispatchEvent(new Event('offline'));
  });
  await tick(10000);
  expect(mockQuery).toHaveBeenCalledTimes(2);
  mockQuery.mockResolvedValue(result('succeeded'));
  online.mockReturnValue(true);
  act(() => {
    window.dispatchEvent(new Event('online'));
  });
  await tick();
  expect(current.tasks.get('abc')?.summary.workflow?.status).toBe('succeeded');
  await act(async () => {
    finish(result('running'));
  });
  expect(current.tasks.get('abc')?.summary.workflow?.status).toBe('succeeded');
});
test('刷新失败保留标签，关闭动画期间取消请求并停止轮询', async () => {
  mockQuery.mockRejectedValueOnce(new Error('offline'));
  await tick(5000);
  expect(current.tasks.size).toBe(1);
  let finish!: (value: unknown) => void;
  mockQuery.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  await tick(5000);
  const calls = mockQuery.mock.calls.length;
  const signal = mockQuery.mock.calls[calls - 1][0].context.fetchOptions.signal;
  act(() => {
    ReactDOM.render(<Harness enabled={false} />, container);
  });
  expect(signal.aborted).toBe(true);
  await act(async () => {
    finish(result('cancelled'));
  });
  await tick(10000);
  expect(mockQuery).toHaveBeenCalledTimes(calls);
  expect(current.tasks.get('abc')?.summary.workflow?.status).toBe('running');
});

test('原生游标翻完所有任务，同 hash 保留最新记录，分页失败保留上轮状态', async () => {
  const first = result();
  first.data.allTasks.pageInfo = {
    endCursor: 'page-1' as any,
    hasNextPage: true,
  };
  const second = result('cancelled');
  second.data.allTasks.nodes.push({
    id: 2,
    smartDownloadTorrentHash: 'OTHER',
    statusSummary: { version: 1, workflow: { status: 'succeeded' } },
  });
  mockQuery.mockResolvedValueOnce(first).mockResolvedValueOnce(second);
  await tick(5000);
  expect(current.tasks.size).toBe(2);
  expect(current.tasks.get('abc')?.summary.workflow?.status).toBe('running');
  expect(mockQuery.mock.calls[2][0].variables.after).toBe('page-1');
  mockQuery
    .mockResolvedValueOnce(first)
    .mockRejectedValueOnce(new Error('offline'));
  await tick(5000);
  expect(current.tasks.size).toBe(2);
});

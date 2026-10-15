const query = jest.fn();
let table: {
  request: (params: object, sort: object, filter: object) => Promise<unknown>;
  dataSource: { id: number }[];
};
let poll: { refetch: () => Promise<unknown> };
jest.mock('@apollo/client', () => ({
  ...jest.requireActual('@apollo/client'),
  useApolloClient: () => ({ query }),
}));
jest.mock('@/components/MainTable', () => ({
  __esModule: true,
  default: (props: typeof table) => {
    table = props;
    return null;
  },
}));
jest.mock('@/components/MainTable/index.module.less', () => ({}));
jest.mock('@/components/Layout', () => ({ Hamburger: () => null }));
jest.mock('@/components/TaskDetailsDialog', () => ({
  useTaskDetailsDialog: () => [null, null, jest.fn()],
}));
jest.mock('@/components/TaskWorkflow', () => ({}));
jest.mock('@/constants/download-status', () => ({}));
jest.mock('@/constants/link', () => ({}));
jest.mock('@/utils/useTaskStates', () => ({
  useTaskStates: () => ({}),
}));
jest.mock('@/utils/useApolloPoll', () => ({
  useApolloPoll: (options: typeof poll) => {
    poll = options;
  },
}));
jest.mock('umi', () => ({ Link: () => null }));

import React from 'react';
import ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';
import JobsPage from './index';
import { TaskType } from '@/generated/types';
import { taskStateFilter } from './status';

it('翻页和筛选请求逆序完成时，行数据与列表签名基准只采用最新结果', async () => {
  const container = document.createElement('div');
  const finish: ((value: unknown) => void)[] = [];
  query.mockImplementation(
    () => new Promise((resolve) => finish.push(resolve)),
  );
  act(() => {
    ReactDOM.render(<JobsPage />, container);
  });
  try {
    let first: Promise<unknown>, second: Promise<unknown>;
    act(() => {
      first = table.request({ current: 1, pageSize: 10 }, {}, {});
      second = table.request(
        { current: 2, pageSize: 10 },
        {},
        { lifecycle: ['failed'], type: [TaskType.Download] },
      );
    });
    const result = (id: number) => ({
      data: {
        allTasks: {
          edges: [{ node: { id, version: 1 } }],
          totalCount: 20,
        },
      },
    });
    await act(async () => {
      finish[1](result(12));
      await second;
    });
    await act(async () => {
      finish[0](result(1));
      await first;
    });
    expect(table.dataSource.map((row) => row.id)).toEqual([12]);
    query.mockResolvedValue({
      data: {
        allTasks: { edges: [{ node: { id: 12 } }], totalCount: 20 },
      },
    });
    await act(async () => {
      await poll.refetch();
    });
    expect(query.mock.calls[2][0].variables).toEqual({
      offset: 10,
      first: 10,
      filter: {
        ...taskStateFilter(['failed']),
        type: { in: [TaskType.Download] },
      },
    });
    expect(query.mock.calls[1][0].variables.filter).toEqual(
      query.mock.calls[2][0].variables.filter,
    );
    expect(container.textContent).not.toContain('任务列表有变化');
  } finally {
    act(() => {
      ReactDOM.unmountComponentAtNode(container);
    });
  }
});

import { applyTaskStates } from './index';
it('新增、删除和过滤条件变化不会改变当前页成员或顺序', () => {
  const rows = [
    { id: 2, version: 3, isFailed: false },
    { id: 1, version: 1, isFailed: false },
  ] as never;
  const live = [
    { id: 3, version: 1, isFailed: false },
    { id: 1, version: 2, isFailed: true },
  ] as never;
  const displayed = applyTaskStates(rows, live);
  expect(displayed.map((row) => row.id)).toEqual([2, 1]);
  expect(displayed[1].isFailed).toBe(true);
  expect(displayed[0]).toBe(rows[0]);
});
it('迟到的旧版本响应不能覆盖当前页状态', () => {
  const rows = [{ id: 1, version: 3, isCancelled: true }] as never;
  const result = applyTaskStates(rows, [
    { id: 1, version: 2, isCancelled: false },
  ] as never);
  expect(result[0]).toBe(rows[0]);
});

const query = jest.fn();
let table: {
  request: (params: object, sort: object, filter: object) => Promise<unknown>;
  dataSource: { id: number }[];
  actionRef: { current: { reload: () => Promise<unknown> } };
  columns: {
    render?: (_: unknown, row: { id: number }) => React.ReactNode;
  }[];
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
    return props.dataSource.length
      ? props.columns[props.columns.length - 1].render?.(
          null,
          props.dataSource[0],
        )
      : null;
  },
}));
jest.mock('@/components/MainTable/index.module.less', () => ({}));
jest.mock('@/components/Layout', () => ({ Hamburger: () => null }));
jest.mock('@/components/TaskDetailsDialog', () => {
  const { createUseDialog } = jest.requireActual('@/utils/useDialog');
  return {
    useTaskDetailsDialog: createUseDialog(
      ({ visible, reject }: { visible: boolean; reject: () => void }) =>
        visible ? <button onClick={reject}>关闭任务详情</button> : null,
    ),
  };
});
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
import { act, Simulate } from 'react-dom/test-utils';
import JobsPage from './index';
import { TaskType } from '@/generated/types';
import { taskStateFilter } from './filters';

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
        { lifecycle: ['failed'], type: [TaskType.BatchImport] },
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
        type: { in: [TaskType.BatchImport] },
      },
    });
    expect(query.mock.calls[1][0].variables.filter).toEqual(
      query.mock.calls[2][0].variables.filter,
    );
    expect(document.body.textContent).not.toContain('任务列表有更新');
  } finally {
    act(() => {
      ReactDOM.unmountComponentAtNode(container);
    });
  }
});

it('更新提示浮在表格外且持续显示，刷新失败可重试，成功或离开页面后清理', async () => {
  jest.useFakeTimers();
  query.mockReset();
  const container = document.createElement('div');
  document.body.appendChild(container);
  const result = (id: number) => ({
    data: {
      allTasks: {
        edges: [{ node: { id, version: 1 } }],
        totalCount: 1,
      },
    },
  });
  const notices = () => document.querySelectorAll('.ant-message-notice');
  const settle = async () => {
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
  };
  act(() => {
    ReactDOM.render(<JobsPage />, container);
  });
  try {
    query.mockResolvedValue(result(1));
    await act(async () => {
      await table.request({ current: 1 }, {}, {});
    });
    expect(notices()).toHaveLength(0);

    query.mockResolvedValue(result(2));
    await act(async () => {
      await poll.refetch();
    });
    await settle();
    expect(notices()).toHaveLength(1);
    expect(document.body.textContent).toContain('任务列表有更新');
    expect(container.textContent).not.toContain('任务列表有更新');
    await act(async () => {
      jest.advanceTimersByTime(60000);
      await poll.refetch();
    });
    expect(notices()).toHaveLength(1);
    expect(table.dataSource.map((row) => row.id)).toEqual([1]);

    const reload = jest.fn(() => table.request({ current: 1 }, {}, {}));
    table.actionRef.current = { reload };
    query.mockResolvedValue({ data: { allTasks: null } });
    await act(async () => {
      (
        document.querySelector('.ant-message button') as HTMLButtonElement
      ).click();
    });
    await settle();
    expect(reload).toHaveBeenCalledTimes(1);
    expect(notices()).toHaveLength(1);
    expect(table.dataSource.map((row) => row.id)).toEqual([1]);

    query.mockResolvedValue(result(2));
    await act(async () => {
      (
        document.querySelector('.ant-message button') as HTMLButtonElement
      ).click();
    });
    await settle();
    expect(reload).toHaveBeenCalledTimes(2);
    expect(notices()).toHaveLength(0);
    expect(table.dataSource.map((row) => row.id)).toEqual([2]);

    query.mockResolvedValue(result(3));
    await act(async () => {
      await poll.refetch();
    });
    await settle();
    expect(notices()).toHaveLength(1);
    act(() => {
      ReactDOM.unmountComponentAtNode(container);
    });
    await settle();
    expect(notices()).toHaveLength(0);
  } finally {
    act(() => {
      ReactDOM.unmountComponentAtNode(container);
    });
    container.remove();
    jest.useRealTimers();
  }
});

it.each([false, true])(
  '任务弹窗保持更新提示挂载，关闭后仍按最新签名显示（打开前已有更新：%s）',
  async (changedBeforeOpen) => {
    jest.useFakeTimers();
    query.mockReset();
    const container = document.createElement('div');
    document.body.appendChild(container);
    const result = (id: number) => ({
      data: {
        allTasks: { edges: [{ node: { id, version: 1 } }], totalCount: 1 },
      },
    });
    const notices = () => document.querySelectorAll('.ant-message-notice');
    const settle = async () => {
      await act(async () => {
        jest.advanceTimersByTime(1000);
      });
    };
    const open = async () => {
      act(() => {
        Simulate.click(container.querySelector('a')!);
      });
      await settle();
    };
    const close = async () => {
      await act(async () => {
        container.querySelector('button')!.click();
      });
      await settle();
    };
    act(() => {
      ReactDOM.render(<JobsPage />, container);
    });
    try {
      query.mockResolvedValue(result(1));
      await act(async () => {
        await table.request({ current: 1 }, {}, {});
      });
      if (changedBeforeOpen) {
        query.mockResolvedValue(result(2));
        await act(async () => {
          await poll.refetch();
        });
        await settle();
        expect(notices()).toHaveLength(1);
      }

      await open();
      expect(container.textContent).toContain('关闭任务详情');
      expect(notices()).toHaveLength(changedBeforeOpen ? 1 : 0);
      query.mockResolvedValue(result(2));
      await act(async () => {
        await poll.refetch();
      });
      await settle();
      expect(notices()).toHaveLength(1);
      const toast = notices()[0];
      expect(toast.className).not.toContain('leave');
      expect(toast.querySelector('button')!.disabled).toBe(true);
      await close();
      expect(notices()).toHaveLength(1);
      expect(notices()[0]).toBe(toast);
      expect(toast.querySelector('button')!.disabled).toBe(false);

      await open();
      expect(notices()).toHaveLength(1);
      expect(notices()[0]).toBe(toast);
      query.mockResolvedValue(result(1));
      await act(async () => {
        await poll.refetch();
      });
      await close();
      expect(notices()).toHaveLength(0);
    } finally {
      act(() => {
        ReactDOM.unmountComponentAtNode(container);
      });
      container.remove();
      jest.useRealTimers();
    }
  },
);

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

it('无筛选及清除筛选后的签名轮询省略空 filter，避免接口返回 400', async () => {
  query.mockReset();
  query.mockImplementation(async ({ variables }) => {
    if (variables.filter && !Object.keys(variables.filter).length)
      throw new Error('Empty filter rejected');
    return { data: { allTasks: { edges: [], totalCount: 0 } } };
  });
  const container = document.createElement('div');
  act(() => {
    ReactDOM.render(<JobsPage />, container);
  });
  try {
    await act(async () => {
      await poll.refetch();
    });
    expect(query.mock.calls[0][0].variables).not.toHaveProperty('filter');
    await act(async () => {
      await table.request({ current: 1 }, {}, { type: [TaskType.Import] });
    });
    await act(async () => {
      await poll.refetch();
    });
    expect(query.mock.calls[2][0].variables.filter).toEqual({
      type: { in: [TaskType.Import] },
    });
    await act(async () => {
      await table.request({ current: 1 }, {}, { type: [], lifecycle: [] });
    });
    await act(async () => {
      await poll.refetch();
    });
    expect(query.mock.calls[4][0].variables).not.toHaveProperty('filter');
  } finally {
    act(() => {
      ReactDOM.unmountComponentAtNode(container);
    });
  }
});

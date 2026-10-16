const mutate = jest.fn(async () => ({}));
jest.mock('@apollo/client', () => ({
  ...jest.requireActual('@apollo/client'),
  useApolloClient: () => ({ mutate }),
  useQuery: () => ({ data: undefined, refetch: jest.fn() }),
}));
jest.mock('@/utils/useApolloPoll', () => ({
  useApolloPoll: jest.fn(),
  useForegroundOnline: () => true,
}));
import React from 'react';
import ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';
import TaskWorkflowView from './index';
import {
  AtomRegistry,
  atomTypes,
  buildWorkflowSnapshot,
  requestCancellation,
  Workflow,
} from '@lani/workflow';
import {
  CancelTaskDocument,
  RetryTaskDocument,
  LegacyTaskStage,
  TaskDetailsFieldsFragment,
} from '@/generated/types';
const registry = Object.fromEntries(
  atomTypes.map((atom) => [atom, { wants: [] }]),
) as unknown as AtomRegistry;
const workflow = () =>
  buildWorkflowSnapshot(
    [
      { id: 'metadata', atom: 'writeMetadata', title: '自定义第一步' },
      { id: 'submit', atom: 'submitDownload', title: '自定义第二步' },
    ],
    registry,
    '2026-10-14T12:00:00Z',
  );
let container: HTMLDivElement;
const refresh = jest.fn(async () => undefined);
const render = (flow: Workflow) =>
  act(() => {
    ReactDOM.render(
      <TaskWorkflowView
        task={{ id: 1, createdAt: '2026-10-14', workflow: flow } as never}
        active
        refresh={refresh}
      />,
      container,
    );
  });
beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  mutate.mockClear();
  refresh.mockClear();
});
afterEach(() => {
  act(() => {
    ReactDOM.unmountComponentAtNode(container);
  });
  container.remove();
});
it('任务信息默认展开，当前步骤固定展示，只有成功步骤可以折叠且轮询保留选择', () => {
  const flow = workflow();
  render(flow);
  expect(
    [...container.querySelectorAll('.ant-steps-item-title')].map(
      (node) => node.textContent,
    ),
  ).toEqual(['任务信息', '自定义第一步', '自定义第二步']);
  expect(
    container.querySelector('button[aria-expanded="true"]')?.textContent,
  ).toBe('任务信息');
  expect(container.querySelectorAll('button[aria-expanded]')).toHaveLength(1);
  flow.steps[0].status = 'running';
  flow.steps[0].attempt = 1;
  render(flow);
  const current = container.querySelector('.ant-steps-item-process')!;
  expect(current.querySelector('button[aria-expanded]')).toBeNull();
  expect(current.querySelector('[aria-hidden="false"]')).not.toBeNull();
  expect(
    container.querySelector('button[aria-expanded="false"]')?.textContent,
  ).toBe('任务信息');
  flow.steps[0].status = 'succeeded';
  flow.steps[1].status = 'running';
  flow.currentStepId = 'submit';
  render(flow);
  const completed = [
    ...container.querySelectorAll<HTMLButtonElement>('button[aria-expanded]'),
  ].find((button) => button.textContent === '自定义第一步')!;
  expect(completed.getAttribute('aria-expanded')).toBe('false');
  act(() => completed.click());
  render(flow);
  expect(completed.getAttribute('aria-expanded')).toBe('true');
  act(() => completed.click());
  render(flow);
  expect(completed.getAttribute('aria-expanded')).toBe('false');
  expect(
    container.querySelector('.ant-steps-item-process button[aria-expanded]'),
  ).toBeNull();
  expect(
    container.querySelector('.ant-steps-item-process [aria-hidden="false"]'),
  ).not.toBeNull();
  expect(container.querySelector('.ant-tag')).toBeNull();
});
it.each(['execute', 'cancel'] as const)(
  '失败表单只显示时间和原因，%s 失败统一使用行内重试',
  async (operation) => {
    const flow =
      operation === 'cancel'
        ? requestCancellation(workflow(), '2026-10-14T12:01:00Z')
        : workflow();
    flow.status = 'failed';
    flow.steps[0].status = 'failed';
    flow.error = {
      operation,
      stepId: 'metadata',
      message: '下载器断连',
      at: '2026-10-14T12:02:00Z',
    };
    render(flow);
    const failed = container.querySelector('.ant-steps-item-error')!;
    expect(failed.querySelector('.ant-steps-item-title')?.textContent).toBe(
      `自定义第一步${operation === 'cancel' ? '（取消失败）' : ''}重试`,
    );
    expect(failed.querySelector('button[aria-expanded]')).toBeNull();
    expect(failed.querySelector('[aria-hidden="false"]')).not.toBeNull();
    const details = failed.querySelector('.ant-steps-item-description')!;
    expect(details.textContent).toContain('失败时间：');
    expect(details.textContent).toContain('失败原因：下载器断连');
    expect(details.textContent).not.toMatch(/开始时间|结束时间|元数据路径/);
    const button = failed.querySelector<HTMLButtonElement>(
      'button.ant-btn-link',
    )!;
    await act(async () => {
      button.click();
    });
    expect(mutate).toHaveBeenCalledWith({
      mutation: RetryTaskDocument,
      variables: { taskId: 1 },
    });
    expect(refresh).toHaveBeenCalledTimes(1);
  },
);
it('取消中默认无表单和操作，取消完成只有当前位置显示取消时间且不可折叠', () => {
  const base = workflow();
  base.steps[0].status = 'running';
  const flow: Workflow = requestCancellation(base, '2026-10-14T12:01:00Z');
  render(flow);
  expect(container.querySelector('[aria-label="loading"]')).not.toBeNull();
  const current = container.querySelector('.ant-steps-item-process')!;
  expect(current.querySelector('button')).toBeNull();
  expect(
    current.querySelector('.ant-steps-item-description')?.textContent,
  ).toBe('');
  expect(container.textContent).toContain('自定义第一步（取消中）');
  flow.status = 'cancelled';
  flow.steps[0].status = 'cancelled';
  flow.finishedAt = '2026-10-14T12:02:00Z';
  render(flow);
  expect(
    [...container.querySelectorAll('.ant-steps-item-title')].map(
      (node) => node.textContent,
    ),
  ).toEqual(['任务信息', '自定义第一步（已取消）', '自定义第二步']);
  expect(container.querySelectorAll('button[aria-expanded]')).toHaveLength(1);
  expect(container.querySelectorAll('[aria-label="已取消"]')).toHaveLength(2);
  expect(container.querySelectorAll('button.ant-btn')).toHaveLength(0);
  const details = container.querySelectorAll('.ant-steps-item-description')[1];
  expect(details.textContent).toContain('取消时间：');
  expect(details.textContent).not.toMatch(/开始时间|失败原因|元数据路径/);
});
it('取消任务先确认，接口返回后立即刷新', async () => {
  const flow = workflow();
  flow.steps[0].status = 'running';
  render(flow);
  act(() =>
    container
      .querySelector<HTMLButtonElement>('button.ant-btn-dangerous')!
      .click(),
  );
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 20));
  });
  expect(mutate).not.toHaveBeenCalled();
  const confirm = document.querySelector('.ant-popover')!;
  expect(
    confirm.querySelector('.ant-popover-message-title div:first-child')
      ?.textContent,
  ).toBe('确认取消任务？');
  expect(
    confirm.querySelector('.ant-popover-message-title div:last-child')
      ?.textContent,
  ).toBe('取消后需重新发起下载，已下载的文件会保留');
  await act(async () => {
    confirm
      .querySelector<HTMLButtonElement>('button.ant-btn-dangerous')!
      .click();
  });
  expect(mutate).toHaveBeenCalledWith({
    mutation: CancelTaskDocument,
    variables: { taskId: 1 },
  });
  expect(refresh).toHaveBeenCalledTimes(1);
  expect(mutate.mock.invocationCallOrder[0]).toBeLessThan(
    refresh.mock.invocationCallOrder[0],
  );
});

it.each([true, false])(
  '旧任务复用可折叠步骤和失败表单（已记录失败：%s），重试仍调用原接口',
  async (isFailed) => {
    const task = {
      id: 9,
      workflow: null,
      legacyStage: LegacyTaskStage.Downloading,
      isFailed,
      isCancelled: false,
      createdAt: '2026-10-14',
      failedAt: '2026-10-14T12:03:00Z',
      failedReason: '种子不存在',
      qbtTorrentHash: 'existing-hash',
    } as TaskDetailsFieldsFragment;
    const original = JSON.stringify(task);
    act(() => {
      ReactDOM.render(
        <TaskWorkflowView task={task} active refresh={refresh} />,
        container,
      );
    });
    const toggles = container.querySelectorAll<HTMLButtonElement>(
      'button[aria-expanded]',
    );
    expect([...toggles].map((button) => button.textContent)).toEqual([
      '任务信息',
      '提交下载',
    ]);
    expect(toggles[1].getAttribute('aria-expanded')).toBe('false');
    act(() => toggles[1].click());
    expect(toggles[1].getAttribute('aria-expanded')).toBe('true');
    const failed = container.querySelector('.ant-steps-item-error')!;
    expect(failed.textContent).toContain('失败原因：种子不存在');
    expect(failed.querySelector('button[aria-expanded]')).toBeNull();
    expect(container.querySelector('button.ant-btn-dangerous')).toBeNull();
    await act(async () =>
      failed.querySelector<HTMLButtonElement>('button.ant-btn-link')!.click(),
    );
    expect(mutate).toHaveBeenCalledWith({
      mutation: RetryTaskDocument,
      variables: { taskId: 9 },
    });
    expect(JSON.stringify(task)).toBe(original);
  },
);

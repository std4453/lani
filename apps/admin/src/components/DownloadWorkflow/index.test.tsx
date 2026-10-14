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
import DownloadWorkflowView from './index';
import {
  AtomRegistry,
  atomTypes,
  createWorkflow,
  requestCancellation,
} from '@lani/download-workflow';
import { RetryJobStepDocument } from '@/generated/types';
const registry = Object.fromEntries(
  atomTypes.map((atom) => [atom, { wants: [] }]),
) as unknown as AtomRegistry;
const workflow = () =>
  createWorkflow(
    [
      { id: 'metadata', atom: 'writeMetadata', title: '自定义第一步' },
      { id: 'submit', atom: 'submitDownload', title: '自定义第二步' },
    ],
    registry,
    '2026-10-14T12:00:00Z',
  );
let container: HTMLDivElement;
beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  mutate.mockClear();
});
afterEach(() => {
  act(() => {
    ReactDOM.unmountComponentAtNode(container);
  });
  container.remove();
});
it('按后端步骤顺序渲染，轮询更新不重置手动折叠，新步骤自动展开', () => {
  const flow = workflow();
  const job = { id: 1, createdAt: '2026-10-14', workflow: flow } as never;
  const render = () =>
    act(() => {
      ReactDOM.render(
        <DownloadWorkflowView
          job={job}
          active
          refresh={async () => undefined}
        />,
        container,
      );
    });
  render();
  expect(
    [...container.querySelectorAll('.ant-collapse-header')].map(
      (node) => node.textContent,
    ),
  ).toEqual(['自定义第一步待执行', '自定义第二步待执行']);
  expect(container.querySelectorAll('.ant-collapse-item-active')).toHaveLength(
    1,
  );
  act(() =>
    (container.querySelector('.ant-collapse-header') as HTMLElement).click(),
  );
  render();
  expect(container.querySelectorAll('.ant-collapse-item-active')).toHaveLength(
    0,
  );
  flow.currentStepId = 'submit';
  render();
  expect(
    container.querySelector('.ant-collapse-item-active')?.textContent,
  ).toContain('自定义第二步');
});
it('取消失败操作仍显示重试，调用统一重试接口', async () => {
  const flow = requestCancellation(workflow(), '2026-10-14T12:01:00Z');
  flow.status = 'failed';
  flow.steps[0].status = 'failed';
  flow.error = {
    operation: 'cancel',
    stepId: 'metadata',
    message: '下载器断连',
    at: '2026-10-14T12:02:00Z',
  };
  const refresh = jest.fn(async () => undefined);
  await act(async () => {
    ReactDOM.render(
      <DownloadWorkflowView
        job={{ id: 1, workflow: flow } as never}
        active
        refresh={refresh}
      />,
      container,
    );
  });
  expect(container.textContent).toContain('取消操作失败：下载器断连');
  const buttons = [...container.querySelectorAll('button')];
  expect(
    buttons.map((button) => button.textContent?.replace(/\s/g, '')),
  ).toEqual(['重试']);
  await act(async () => {
    buttons[0].click();
  });
  expect(mutate).toHaveBeenCalledWith({
    mutation: RetryJobStepDocument,
    variables: { jobId: 1 },
  });
  expect(refresh).toHaveBeenCalledTimes(1);
});

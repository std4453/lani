jest.mock('@/utils/useTaskStates', () => ({
  useTaskStates: () => ({ refetch: jest.fn() }),
}));
jest.mock('@/utils/useApolloPoll', () => ({
  useApolloPoll: jest.fn(),
  useForegroundOnline: () => true,
}));
import React from 'react';
import ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';
import { MockedProvider } from '@apollo/client/testing';
import TaskDetailsDialog from './index';
import {
  LegacyTaskStage,
  GetTaskByIdDocument,
  TaskDetailsFieldsFragment,
  TaskType,
} from '@/generated/types';
import { atomTypes, AtomRegistry, buildWorkflowSnapshot } from '@lani/workflow';

it('生成的任务详情查询不重复定义嵌套复用的片段', () => {
  const names = GetTaskByIdDocument.definitions.flatMap((definition) =>
    definition.kind === 'FragmentDefinition' ? [definition.name.value] : [],
  );
  expect(new Set(names).size).toBe(names.length);
});

const registry = Object.fromEntries(
  atomTypes.map((atom) => [atom, { wants: [] }]),
) as unknown as AtomRegistry;
const task: TaskDetailsFieldsFragment = {
  __typename: 'Task',
  id: 42,
  type: TaskType.Download,
  taskEpisodesByTaskId: { nodes: [] },
  episodeId: 7,
  createdAt: '2026-10-14T12:00:00Z',
  downloadPath: null,
  failedAt: null,
  failedReason: '',
  filePath: null,
  importPath: null,
  isFailed: false,
  isCancelled: false,
  version: 0,
  nfoPath: null,
  qbtTorrentHash: null,
  legacyStage: LegacyTaskStage.DownloadSubmitting,
  torrentLink: null,
  jellyfinEpisodeId: null,
  torrentTitle: null,
  workflow: buildWorkflowSnapshot(
    [{ id: 'custom', atom: 'submitDownload', title: '自定义提交' }],
    registry,
    '2026-10-14T12:00:00Z',
  ),
};
let container: HTMLDivElement;
beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
});
afterEach(() => {
  act(() => {
    ReactDOM.unmountComponentAtNode(container);
  });
  container.remove();
});
const settle = async (ms = 20) =>
  act(async () => {
    await new Promise((resolve) => setTimeout(resolve, ms));
  });

it('任务弹窗立即显示骨架，并在同一弹窗加载剧集、任务列表与选中任务', async () => {
  act(() => {
    ReactDOM.render(
      <MockedProvider
        mocks={[
          {
            request: { query: GetTaskByIdDocument, variables: { id: 42 } },
            delay: 100,
            result: {
              data: {
                taskById: {
                  ...task,
                  episodeByEpisodeId: {
                    __typename: 'Episode',
                    id: 7,
                    title: '异步剧集标题',
                    index: 3,
                    createdAt: task.createdAt,
                    jellyfinEpisodeId: null,
                    tasksByEpisodeId: {
                      __typename: 'TasksConnection',
                      edges: [{ node: { ...task, id: 43 } }, { node: task }],
                    },
                    numbering: { type: 'episode', number: '3', sort: '3' },
                    rawAirTime: null,
                    airTime: null,
                    description: '加载后的说明',
                    seasonBySeasonId: {
                      __typename: 'Season',
                      id: 2,
                      title: '测试季度',
                      downloadOffsetHours: 0,
                    },
                  },
                },
              },
            },
          },
        ]}
      >
        <TaskDetailsDialog
          input={{ taskId: 42, taskType: TaskType.Download }}
          visible
          reject={jest.fn()}
          resolve={jest.fn()}
        />
      </MockedProvider>,
      container,
    );
  });
  const modal = document.querySelector('.ant-modal');
  expect(modal).not.toBeNull();
  expect(modal?.querySelector('.ant-skeleton')).not.toBeNull();
  expect(
    modal?.querySelector('.ant-modal-title [role="heading"]')?.textContent,
  ).toBe('剧集详情');
  await settle(150);
  expect(document.querySelector('.ant-modal')).toBe(modal);
  expect(modal?.querySelector('.ant-skeleton')).toBeNull();
  expect(
    document.querySelector('.ant-modal-title [role="heading"]')?.textContent,
  ).toContain('异步剧集标题');
  expect(document.querySelector('.ant-modal-body')?.textContent).toContain(
    '加载后的说明',
  );
  expect(document.querySelector('.ant-tabs-tab-active')?.textContent).toContain(
    '#42',
  );
  expect(document.querySelectorAll('.ant-tabs-tab')).toHaveLength(2);
  expect(
    document.querySelector('.ant-modal-title [role="heading"]')?.textContent,
  ).toBe('#3 - 异步剧集标题');
  expect(document.querySelector('.ant-modal-body')?.textContent).not.toContain(
    '任务类型',
  );
  expect(
    document.querySelector('.ant-tabs-tabpane-active .ant-steps')?.textContent,
  ).toContain('自定义提交');
});
it('任务没有关联剧集仍可查看流程，不依赖调用侧提供剧集信息', async () => {
  act(() => {
    ReactDOM.render(
      <MockedProvider
        mocks={[
          {
            request: { query: GetTaskByIdDocument, variables: { id: 42 } },
            result: {
              data: {
                taskById: {
                  ...task,
                  episodeId: null,
                  episodeByEpisodeId: null,
                },
              },
            },
          },
        ]}
      >
        <TaskDetailsDialog
          input={{ taskId: 42, taskType: TaskType.Download }}
          visible
          reject={jest.fn()}
          resolve={jest.fn()}
        />
      </MockedProvider>,
      container,
    );
  });
  await settle();
  expect(document.querySelector('.ant-modal-body')?.textContent).toContain(
    '关联剧集不存在',
  );
  expect(document.querySelector('.ant-steps')?.textContent).toContain(
    '自定义提交',
  );
});
it('切换任务立即清除旧内容，不存在的任务显示空结果', async () => {
  const render = (taskId: number) =>
    act(() => {
      ReactDOM.render(
        <MockedProvider
          mocks={[
            {
              request: { query: GetTaskByIdDocument, variables: { id: 42 } },
              result: {
                data: { taskById: { ...task, episodeByEpisodeId: null } },
              },
            },
            {
              request: { query: GetTaskByIdDocument, variables: { id: 99 } },
              delay: 100,
              result: { data: { taskById: null } },
            },
          ]}
        >
          <TaskDetailsDialog
            input={{ taskId, taskType: TaskType.Download }}
            visible
            reject={jest.fn()}
            resolve={jest.fn()}
          />
        </MockedProvider>,
        container,
      );
    });
  render(42);
  await settle();
  expect(document.querySelector('.ant-steps')).not.toBeNull();
  const modal = document.querySelector('.ant-modal');
  render(99);
  expect(document.querySelector('.ant-modal')).toBe(modal);
  expect(document.querySelector('.ant-steps')).toBeNull();
  expect(document.querySelector('.ant-skeleton')).not.toBeNull();
  await settle(150);
  expect(document.querySelector('.ant-modal-body')?.textContent).toContain(
    '任务不存在',
  );
  expect(document.querySelector('.ant-steps')).toBeNull();
});

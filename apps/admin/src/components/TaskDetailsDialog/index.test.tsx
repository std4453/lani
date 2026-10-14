jest.mock('pretty-bytes', () => () => '0 B');
jest.mock('@/utils/useDownloadJobStates', () => ({
  useDownloadJobStates: () => ({ refetch: jest.fn() }),
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
  DownloadStatus,
  GetTaskByIdDocument,
  GetEpisodeByIdDocument,
  TaskDetailsFieldsFragment,
  TaskType,
} from '@/generated/types';
import {
  atomTypes,
  AtomRegistry,
  createWorkflow,
} from '@lani/download-workflow';

const registry = Object.fromEntries(
  atomTypes.map((atom) => [atom, { wants: [] }]),
) as unknown as AtomRegistry;
const job: TaskDetailsFieldsFragment = {
  __typename: 'DownloadJob',
  id: 42,
  type: TaskType.Download,
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
  status: DownloadStatus.DownloadSubmitting,
  torrentLink: null,
  jellyfinEpisodeId: null,
  torrentTitle: null,
  workflow: createWorkflow(
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

it('只传任务 ID 加载剧集弹窗和任务列表，并选中指定任务', async () => {
  act(() => {
    ReactDOM.render(
      <MockedProvider
        mocks={[
          {
            request: { query: GetTaskByIdDocument, variables: { id: 42 } },
            result: { data: { downloadJobById: job } },
          },
          {
            request: {
              query: GetEpisodeByIdDocument,
              variables: { episodeByIdId: 7 },
            },
            delay: 100,
            result: {
              data: {
                episodeById: {
                  __typename: 'Episode',
                  id: 7,
                  title: '异步剧集标题',
                  index: 3,
                  createdAt: job.createdAt,
                  jellyfinEpisodeId: null,
                  downloadJobsByEpisodeId: {
                    __typename: 'DownloadJobsConnection',
                    edges: [{ node: { ...job, id: 43 } }, { node: job }],
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
        ]}
      >
        <TaskDetailsDialog
          input={{ jobId: 42 }}
          visible
          reject={jest.fn()}
          resolve={jest.fn()}
        />
      </MockedProvider>,
      container,
    );
  });
  await settle();
  await settle(150);
  expect(document.querySelector('.ant-modal-title')?.textContent).toContain(
    '异步剧集标题',
  );
  expect(document.querySelector('.ant-modal-body')?.textContent).toContain(
    '加载后的说明',
  );
  expect(document.querySelector('.ant-tabs-tab-active')?.textContent).toContain(
    '#42',
  );
  expect(document.querySelectorAll('.ant-tabs-tab')).toHaveLength(2);
  expect(document.querySelector('.ant-modal-title')?.textContent).toBe(
    '#3 - 异步剧集标题',
  );
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
            result: { data: { downloadJobById: { ...job, episodeId: null } } },
          },
        ]}
      >
        <TaskDetailsDialog
          input={{ jobId: 42 }}
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
it('不存在的任务显示空结果，不显示其他任务信息', async () => {
  act(() => {
    ReactDOM.render(
      <MockedProvider
        mocks={[
          {
            request: { query: GetTaskByIdDocument, variables: { id: 99 } },
            result: { data: { downloadJobById: null } },
          },
        ]}
      >
        <TaskDetailsDialog
          input={{ jobId: 99 }}
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
    '任务不存在',
  );
  expect(document.querySelector('.ant-steps')).toBeNull();
});

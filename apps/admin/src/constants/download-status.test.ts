import { atomTypes, WorkflowSummary, WorkflowStatus } from '@lani/workflow';
import {
  EpisodeStatusFieldsFragment,
  TaskSummaryFieldsFragment,
  TaskType,
} from '@/generated/types';
import { calcEpisodeStatus, EPISODE_STATUS_TAGS } from './download-status';

const workflow: WorkflowSummary = {
  status: 'running',
  currentStepId: 'custom-step',
  steps: [
    {
      id: 'custom-step',
      atom: 'download',
      title: '自定义下载步骤',
      status: 'running',
    },
  ],
};
const episode = (
  statusSummary: TaskSummaryFieldsFragment['statusSummary'],
): EpisodeStatusFieldsFragment => ({
  id: 1,
  jellyfinEpisodeId: null,
  airTime: null,
  tasks: {
    edges: [{ node: { id: 5, type: TaskType.Download, statusSummary } }],
  },
});

it('按快照中的当前步骤展示，标题不使用固定阶段文案', () => {
  for (const atom of atomTypes) {
    const state = calcEpisodeStatus(
      episode({
        version: 1,
        workflow: {
          ...workflow,
          steps: [{ ...workflow.steps[0], atom }],
        },
      }),
    );
    expect(state).toEqual({
      status: atom,
      label: '自定义下载步骤',
      taskId: 5,
      taskType: TaskType.Download,
    });
    expect(EPISODE_STATUS_TAGS[atom]).toBeDefined();
  }
});
it('步骤重排后按 ID 定位，未知 atom 仍显示服务端标题', () => {
  expect(
    calcEpisodeStatus(
      episode({
        version: 2,
        workflow: {
          ...workflow,
          steps: [
            {
              id: 'later',
              atom: 'importFile',
              title: '后续步骤',
              status: 'pending',
            },
            { ...workflow.steps[0], atom: 'futureAtom', title: '新流程步骤' },
          ],
        },
      }),
    ),
  ).toMatchObject({ status: 'RUNNING', label: '新流程步骤' });
});
it.each<[WorkflowStatus, string]>([
  ['failed', 'DOWNLOAD_FAILED'],
  ['cancelling', 'CANCELLING'],
  ['cancelled', 'CANCELLED'],
  ['succeeded', 'AVAILABLE'],
])('保留终态和取消状态 %s', (status, expected) => {
  expect(
    calcEpisodeStatus(
      episode({ version: 1, workflow: { ...workflow, status } }),
    ).status,
  ).toBe(expected);
});
it('兼容旧任务，并将损坏或缺失摘要显示为未知', () => {
  const legacy = { stage: 'AVAILABLE', isFailed: false, isCancelled: false };
  expect(calcEpisodeStatus(episode({ version: 1, legacy })).status).toBe(
    'AVAILABLE',
  );
  expect(
    calcEpisodeStatus(
      episode({ version: 1, legacy: { ...legacy, stage: 'IMPORTING' } }),
    ).status,
  ).toBe('DOWNLOAD_FAILED');
  expect(
    calcEpisodeStatus(
      episode({ version: 1, legacy: { ...legacy, isCancelled: true } }),
    ).status,
  ).toBe('CANCELLED');
  expect(calcEpisodeStatus(episode({ version: 1 })).status).toBe('UNKNOWN');
  expect(calcEpisodeStatus(episode(null)).status).toBe('UNKNOWN');
});
it('媒体可用优先，无任务时继续按放送时间判断', () => {
  expect(
    calcEpisodeStatus({ ...episode(null), jellyfinEpisodeId: 'media' }).status,
  ).toBe('AVAILABLE');
  const empty = { ...episode(null), tasks: { edges: [] } };
  expect(calcEpisodeStatus(empty).status).toBe('DATE_UNKNOWN');
  expect(
    calcEpisodeStatus({ ...empty, airTime: '2099-01-01T00:00:00Z' }).status,
  ).toBe('NOT_AIRED');
  expect(
    calcEpisodeStatus({ ...empty, airTime: '2000-01-01T00:00:00Z' }).status,
  ).toBe('RESOURCE_MISSING');
});

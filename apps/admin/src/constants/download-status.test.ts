import { atomTypes, Workflow } from '@lani/workflow';
import {
  EpisodeStatusFieldsFragment,
  LegacyTaskStage,
  TaskStatusFieldsFragment,
} from '@/generated/types';
import {
  calcEpisodeStatus,
  EPISODE_STATUS_TAGS,
  LEGACY_EPISODE_STATUS,
} from './download-status';

const workflow: Workflow = {
  schemaVersion: 1,
  definitionVersion: 1,
  status: 'running',
  currentStepId: 'step',
  createdAt: '2026-10-16T00:00:00Z',
  steps: [
    {
      id: 'step',
      atom: 'download',
      title: '下载中',
      status: 'running',
      attempt: 1,
      checkpoint: {},
    },
  ],
};
const episode = (
  task: Partial<TaskStatusFieldsFragment>,
): EpisodeStatusFieldsFragment => ({
  id: 1,
  jellyfinEpisodeId: null,
  airTime: null,
  tasks: {
    edges: [
      {
        node: {
          id: 5,
          version: 1,
          workflow: null,
          legacyStage: LegacyTaskStage.Unavailable,
          isFailed: false,
          isCancelled: false,
          ...task,
        },
      },
    ],
  },
});

it('新任务按当前 atom 显示，旧阶段和兼容标记不覆盖流程状态', () => {
  for (const atom of atomTypes) {
    const state = calcEpisodeStatus(
      episode({
        workflow: { ...workflow, steps: [{ ...workflow.steps[0], atom }] },
        isFailed: true,
        isCancelled: true,
      }),
    );
    expect(state).toEqual({ status: atom, taskId: 5 });
    expect(EPISODE_STATUS_TAGS[atom]).toBeDefined();
  }
});
it('流程失败、取消中和终态独立于旧阶段枚举', () => {
  for (const [status, expected] of [
    ['failed', 'DOWNLOAD_FAILED'],
    ['cancelling', 'CANCELLING'],
    ['cancelled', 'CANCELLED'],
    ['succeeded', 'AVAILABLE'],
  ] as const) {
    expect(
      calcEpisodeStatus(episode({ workflow: { ...workflow, status } })).status,
    ).toBe(expected);
  }
});
it('旧任务只在边界转译阶段，未结束旧任务保持失败', () => {
  expect(LEGACY_EPISODE_STATUS[LegacyTaskStage.Importing]).toBe('importFile');
  expect(LEGACY_EPISODE_STATUS[LegacyTaskStage.Renaming]).toBe('UNKNOWN');
  expect(
    calcEpisodeStatus(episode({ legacyStage: LegacyTaskStage.Downloading }))
      .status,
  ).toBe('DOWNLOAD_FAILED');
  expect(
    calcEpisodeStatus(episode({ legacyStage: LegacyTaskStage.Available }))
      .status,
  ).toBe('AVAILABLE');
  expect(calcEpisodeStatus(episode({ isCancelled: true })).status).toBe(
    'CANCELLED',
  );
});

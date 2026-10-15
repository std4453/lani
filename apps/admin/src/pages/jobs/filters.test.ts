import { buildWorkflowSnapshot, requestCancellation } from '@lani/workflow';
import { LegacyTaskStage } from '@/generated/types';
import { taskState, selectedTaskStates } from '@/constants/task-status';
import { taskStateFilter } from './filters';

it('显示状态合并执行与取消，并将同一筛选转换为后端流程状态', () => {
  const registry = {
    submitDownload: { wants: [] },
    download: { wants: [] },
    findVideoFile: { wants: [] },
    importFile: { wants: [] },
    writeMetadata: { wants: [] },
    refreshPlayer: { wants: [] },
    publishEpisode: { wants: [] },
  };
  const workflow = buildWorkflowSnapshot(
    [{ id: 'download', atom: 'download', title: '下载中' }],
    registry,
    '2026-10-15T00:00:00Z',
  );
  for (const status of [
    'running',
    'cancelling',
    'failed',
    'cancelled',
    'succeeded',
  ] as const) {
    const task = {
      workflow: {
        ...(status === 'cancelling' || status === 'cancelled'
          ? requestCancellation(workflow, '2026-10-15T00:00:01Z')
          : workflow),
        status,
      },
      isFailed: false,
      isCancelled: false,
      legacyStage: LegacyTaskStage.Downloading,
    };
    expect(taskState(task)).toBe(status === 'cancelling' ? 'running' : status);
  }
  expect(taskStateFilter(['running'])).toEqual({
    or: [
      { workflow: { contains: { status: 'running' } } },
      { workflow: { contains: { status: 'cancelling' } } },
    ],
  });
  expect(selectedTaskStates(['running', 'invalid', 'cancelled'])).toEqual([
    'running',
    'cancelled',
  ]);
  expect(taskStateFilter([])).toEqual({});
});
it('旧任务终态和未结束任务对应正常、取消或运行失败', () => {
  const base = {
    workflow: null,
    legacyStage: LegacyTaskStage.Available,
    isFailed: false,
    isCancelled: false,
  };
  expect(taskState(base)).toBe('succeeded');
  expect(taskState({ ...base, isCancelled: true })).toBe('cancelled');
  expect(taskState({ ...base, isFailed: true })).toBe('failed');
  expect(taskState({ ...base, legacyStage: LegacyTaskStage.Downloading })).toBe(
    'failed',
  );
  expect(taskStateFilter(['failed']).or?.[1]).toEqual({
    workflow: { isNull: true },
    isCancelled: { equalTo: false },
    or: [
      { isFailed: { equalTo: true } },
      { legacyStage: { notEqualTo: LegacyTaskStage.Available } },
    ],
  });
});

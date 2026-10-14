import { createWorkflow, requestCancellation } from '@lani/download-workflow';
import { DownloadStatus } from '@/generated/types';
import { jobState, jobStateFilter, selectedJobStates } from './status';

it('显示状态合并执行与取消，并将同一筛选转换为后端流程状态', () => {
  const registry = {
    submitDownload: { wants: [] },
    download: { wants: [] },
    findVideoFile: { wants: [] },
    importFile: { wants: [] },
    writeMetadata: { wants: [] },
    refreshPlayer: { wants: [] },
  };
  const workflow = createWorkflow(
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
    const job = {
      workflow: {
        ...(status === 'cancelling' || status === 'cancelled'
          ? requestCancellation(workflow, '2026-10-15T00:00:01Z')
          : workflow),
        status,
      },
      isFailed: false,
      isCancelled: false,
      status: DownloadStatus.Downloading,
    };
    expect(jobState(job)).toBe(status === 'cancelling' ? 'running' : status);
  }
  expect(jobStateFilter(['running'])).toEqual({
    or: [
      { workflow: { contains: { status: 'running' } } },
      { workflow: { contains: { status: 'cancelling' } } },
    ],
  });
  expect(selectedJobStates(['running', 'invalid', 'cancelled'])).toEqual([
    'running',
    'cancelled',
  ]);
  expect(jobStateFilter([])).toEqual({});
});
it('旧任务终态和未结束任务对应正常、取消或运行失败', () => {
  const base = {
    workflow: null,
    status: DownloadStatus.Available,
    isFailed: false,
    isCancelled: false,
  };
  expect(jobState(base)).toBe('succeeded');
  expect(jobState({ ...base, isCancelled: true })).toBe('cancelled');
  expect(jobState({ ...base, isFailed: true })).toBe('failed');
  expect(jobState({ ...base, status: DownloadStatus.Downloading })).toBe(
    'failed',
  );
  expect(jobStateFilter(['failed']).or?.[1]).toEqual({
    workflow: { isNull: true },
    isCancelled: { equalTo: false },
    or: [
      { isFailed: { equalTo: true } },
      { status: { notEqualTo: DownloadStatus.Available } },
    ],
  });
});

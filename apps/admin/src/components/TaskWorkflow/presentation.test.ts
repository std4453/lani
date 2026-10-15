import { DownloadStatus, TaskDetailsFieldsFragment } from '@/generated/types';
import { presentJob } from './presentation';
const legacy = (status: DownloadStatus, isCancelled = false) =>
  ({
    workflow: null,
    status,
    isFailed: false,
    isCancelled,
  } as TaskDetailsFieldsFragment);

it('旧任务成功步骤均可展开，不伪造任何时间或取消权限', () => {
  const view = presentJob(legacy(DownloadStatus.Available));
  expect(view.steps.every((step) => step.status === 'succeeded')).toBe(true);
  expect(view.status).toBe('succeeded');
  expect(view.canCancel).toBe(false);
  expect(view.cancelledAt).toBeUndefined();
  expect(view.error).toBeUndefined();
});
it.each([
  DownloadStatus.DownloadSubmitting,
  DownloadStatus.Downloading,
  DownloadStatus.DownloadCompleted,
  DownloadStatus.Importing,
  DownloadStatus.WritingMetadata,
  DownloadStatus.PlayerWaiting,
])(
  '旧取消任务按保留的 %s 定位，之前成功、之后取消且不推算取消时间',
  (status) => {
    const view = presentJob(legacy(status, true));
    const position = view.steps.findIndex(
      (step) => step.id === view.currentStepId,
    );
    expect(view.status).toBe('cancelled');
    expect(view.cancelledStepId).toBe(view.currentStepId);
    expect(
      view.steps
        .slice(0, position)
        .every((step) => step.status === 'succeeded'),
    ).toBe(true);
    expect(
      view.steps.slice(position).every((step) => step.status === 'cancelled'),
    ).toBe(true);
    expect(view.cancelledAt).toBeUndefined();
    expect(view.canCancel).toBe(false);
  },
);
it('旧任务缺失的失败时间保持为空，不使用创建时间替代', () => {
  const view = presentJob(legacy(DownloadStatus.Downloading));
  expect(view.status).toBe('failed');
  expect(view.error?.at).toBeUndefined();
  expect(view.steps.map((step) => step.status)).toEqual([
    'succeeded',
    'failed',
    'pending',
    'pending',
    'pending',
    'pending',
  ]);
});

it.each([DownloadStatus.Renaming, DownloadStatus.Unavailable])(
  '无法确认对应步骤的旧状态 %s 显示未知阶段，不推算第一步或成功历史',
  (status) => {
    for (const cancelled of [false, true]) {
      const view = presentJob(legacy(status, cancelled));
      expect(view.steps).toEqual([
        {
          id: 'legacy-unknown',
          title: '未知阶段',
          status: cancelled ? 'cancelled' : 'failed',
        },
      ]);
      expect(view.currentStepId).toBe('legacy-unknown');
      expect(view.canCancel).toBe(false);
      expect(view.cancelledAt).toBeUndefined();
    }
  },
);

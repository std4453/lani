import { LegacyTaskStage, TaskDetailsFieldsFragment } from '@/generated/types';
import { StepDefinition, StepStatus, WorkflowStatus } from '@lani/workflow';

const legacySteps: (StepDefinition & { legacyStage: LegacyTaskStage })[] = [
  {
    id: 'submit',
    atom: 'submitDownload',
    title: '提交下载',
    legacyStage: LegacyTaskStage.DownloadSubmitting,
  },
  {
    id: 'download',
    atom: 'download',
    title: '下载中',
    legacyStage: LegacyTaskStage.Downloading,
  },
  {
    id: 'find',
    atom: 'findVideoFile',
    title: '寻找视频文件',
    legacyStage: LegacyTaskStage.DownloadCompleted,
  },
  {
    id: 'import',
    atom: 'importFile',
    title: '导入文件',
    legacyStage: LegacyTaskStage.Importing,
  },
  {
    id: 'metadata',
    atom: 'writeMetadata',
    title: '写入元数据',
    legacyStage: LegacyTaskStage.WritingMetadata,
  },
  {
    id: 'refresh',
    atom: 'refreshPlayer',
    title: '刷新 Jellyfin',
    legacyStage: LegacyTaskStage.PlayerWaiting,
  },
  {
    id: 'publish',
    atom: 'publishEpisode',
    title: '完成',
    legacyStage: LegacyTaskStage.Available,
  },
];

/** 只在前端映射旧任务，缺失的历史时间保持为空；绝不回写流程。 */
export function legacyWorkflow(task: TaskDetailsFieldsFragment) {
  const status: WorkflowStatus = task.isCancelled
    ? 'cancelled'
    : task.isFailed || task.legacyStage !== LegacyTaskStage.Available
    ? 'failed'
    : 'succeeded';
  const position =
    task.legacyStage === LegacyTaskStage.Available
      ? legacySteps.length - 1
      : legacySteps.findIndex((step) => step.legacyStage === task.legacyStage);
  const steps: (Pick<StepDefinition, 'id' | 'title'> & {
    atom?: StepDefinition['atom'];
    status: StepStatus;
  })[] =
    position < 0
      ? // 无可靠阶段对应关系时，不推算第一步或已经完成的步骤。
        [{ id: 'legacy-unknown', title: '未知阶段', atom: undefined, status }]
      : legacySteps.map(({ id, atom, title }, index) => ({
          id,
          atom,
          title,
          status: (status === 'succeeded' || index < position
            ? 'succeeded'
            : status === 'cancelled'
            ? 'cancelled'
            : index === position
            ? 'failed'
            : 'pending') as StepStatus,
        }));
  const currentStepId = steps[Math.max(position, 0)].id;
  return {
    status,
    steps,
    currentStepId,
    cancellation:
      status === 'cancelled' ? { stepId: currentStepId } : undefined,
    finishedAt: undefined,
    error:
      status === 'failed'
        ? {
            at: task.failedAt ?? undefined,
            message: task.failedReason ?? undefined,
          }
        : undefined,
  };
}

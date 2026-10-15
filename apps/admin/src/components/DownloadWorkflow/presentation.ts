import { DownloadStatus, TaskDetailsFieldsFragment } from '@/generated/types';
import {
  currentStep,
  parseWorkflow,
  StepDefinition,
  StepStatus,
  WorkflowStatus,
} from '@lani/download-workflow';

/** 仅用于渲染，不生成或回写旧任务的流程快照、检查点及历史时间。 */
export interface JobPresentation {
  status: WorkflowStatus;
  steps: (StepDefinition & { status: StepStatus })[];
  currentStepId: string;
  hasStarted: boolean;
  canCancel: boolean;
  cancelledStepId?: string;
  cancelledAt?: string;
  error?: { at?: string; message?: string };
}

const legacySteps: (StepDefinition & { legacyStatus: DownloadStatus })[] = [
  {
    id: 'submit',
    atom: 'submitDownload',
    title: '提交下载',
    legacyStatus: DownloadStatus.DownloadSubmitting,
  },
  {
    id: 'download',
    atom: 'download',
    title: '下载中',
    legacyStatus: DownloadStatus.Downloading,
  },
  {
    id: 'find',
    atom: 'findVideoFile',
    title: '寻找视频文件',
    legacyStatus: DownloadStatus.DownloadCompleted,
  },
  {
    id: 'import',
    atom: 'importFile',
    title: '导入文件',
    legacyStatus: DownloadStatus.Importing,
  },
  {
    id: 'metadata',
    atom: 'writeMetadata',
    title: '写入元数据',
    legacyStatus: DownloadStatus.WritingMetadata,
  },
  {
    id: 'refresh',
    atom: 'refreshPlayer',
    title: '刷新 Jellyfin',
    legacyStatus: DownloadStatus.PlayerWaiting,
  },
];

export function presentJob(job: TaskDetailsFieldsFragment): JobPresentation {
  if (job.workflow) {
    const workflow = parseWorkflow(job.workflow);
    return {
      status: workflow.status,
      steps: workflow.steps,
      currentStepId: currentStep(workflow).id,
      hasStarted: workflow.steps.some(
        (step) =>
          step.attempt > 0 ||
          !!step.startedAt ||
          !['pending', 'cancelled'].includes(step.status),
      ),
      canCancel: workflow.status === 'running' && !workflow.cancellation,
      cancelledStepId: workflow.cancellation?.stepId,
      cancelledAt: workflow.finishedAt,
      error: workflow.error,
    };
  }
  const status = job.isCancelled
    ? 'cancelled'
    : job.isFailed || job.status !== DownloadStatus.Available
    ? 'failed'
    : 'succeeded';
  const position =
    job.status === DownloadStatus.Available
      ? legacySteps.length - 1
      : Math.max(
          0,
          legacySteps.findIndex((step) => step.legacyStatus === job.status),
        );
  return {
    status,
    currentStepId: legacySteps[position].id,
    hasStarted: true,
    canCancel: false,
    cancelledStepId:
      status === 'cancelled' ? legacySteps[position].id : undefined,
    error:
      status === 'failed'
        ? {
            at: job.failedAt ?? undefined,
            message: job.failedReason ?? undefined,
          }
        : undefined,
    steps: legacySteps.map(({ id, atom, title }, index) => ({
      id,
      atom,
      title,
      status:
        status === 'succeeded' || index < position
          ? 'succeeded'
          : status === 'cancelled'
          ? 'cancelled'
          : index === position
          ? 'failed'
          : 'pending',
    })),
  };
}

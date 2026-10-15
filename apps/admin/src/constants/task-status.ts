import { DownloadStatus } from '@/generated/types';
import { parseWorkflow, WorkflowStatus } from '@lani/download-workflow';
export const taskStatusLabels = {
  pending: '待执行',
  running: '进行中',
  cancelling: '取消中',
  failed: '失败',
  succeeded: '成功',
  cancelled: '已取消',
};
export const jobStates = {
  succeeded: { text: '正常', status: 'Default' },
  running: { text: '运行中', status: 'Processing' },
  failed: { text: '运行失败', status: 'Error' },
  cancelled: { text: '取消', status: 'Default' },
} as const;
export type JobState = keyof typeof jobStates;
export function selectedJobStates(
  values?: readonly unknown[] | null,
): JobState[] {
  return (Object.keys(jobStates) as JobState[]).filter((state) =>
    values?.includes(state),
  );
}
export function jobState(job: {
  workflow?: unknown;
  isFailed: boolean;
  isCancelled: boolean;
  status: string;
}): JobState {
  const state = taskStatus(job);
  return state === 'cancelling' ? 'running' : state;
}
export function taskStatus(job: {
  workflow?: unknown;
  isFailed: boolean;
  isCancelled: boolean;
  status: string;
}): WorkflowStatus {
  if (job.workflow) return parseWorkflow(job.workflow).status;
  if (job.isCancelled) return 'cancelled';
  if (job.isFailed || job.status !== DownloadStatus.Available) return 'failed';
  return 'succeeded';
}

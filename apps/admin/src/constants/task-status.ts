import { LegacyTaskStage } from '@/generated/types';
import { parseWorkflow, WorkflowStatus } from '@lani/workflow';
export const TASK_STATUS_LABELS = {
  pending: '待执行',
  running: '进行中',
  cancelling: '取消中',
  failed: '失败',
  succeeded: '成功',
  cancelled: '已取消',
};
export const TASK_STATES = {
  succeeded: { text: '正常', status: 'Default' },
  running: { text: '运行中', status: 'Processing' },
  failed: { text: '运行失败', status: 'Error' },
  cancelled: { text: '取消', status: 'Default' },
} as const;
export type TaskState = keyof typeof TASK_STATES;
export function selectedTaskStates(
  values?: readonly unknown[] | null,
): TaskState[] {
  return (Object.keys(TASK_STATES) as TaskState[]).filter((state) =>
    values?.includes(state),
  );
}
export function taskState(task: {
  workflow?: unknown;
  isFailed: boolean;
  isCancelled: boolean;
  legacyStage: string;
}): TaskState {
  const state = taskStatus(task);
  return state === 'cancelling' ? 'running' : state;
}
export function taskStatus(task: {
  workflow?: unknown;
  isFailed: boolean;
  isCancelled: boolean;
  legacyStage: string;
}): WorkflowStatus {
  if (task.workflow) return parseWorkflow(task.workflow).status;
  if (task.isCancelled) return 'cancelled';
  if (task.isFailed || task.legacyStage !== LegacyTaskStage.Available)
    return 'failed';
  return 'succeeded';
}

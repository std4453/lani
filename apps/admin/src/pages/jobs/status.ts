import { DownloadJobFilter, DownloadStatus } from '@/generated/types';
import { parseWorkflow } from '@lani/download-workflow';

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
  if (job.workflow) {
    const state = parseWorkflow(job.workflow).status;
    return state === 'cancelling' ? 'running' : state;
  }
  if (job.isCancelled) return 'cancelled';
  if (job.isFailed || job.status !== DownloadStatus.Available) return 'failed';
  return 'succeeded';
}
/** 列表与集合检查共用筛选，旧任务的未结束状态按失败处理。 */
export function jobStateFilter(states: JobState[]): DownloadJobFilter {
  if (!states.length) return {};
  return {
    or: states.flatMap((state): DownloadJobFilter[] => {
      const workflow = (status: string): DownloadJobFilter => ({
        workflow: { contains: { status } },
      });
      if (state === 'running')
        return [workflow('running'), workflow('cancelling')];
      const legacy: DownloadJobFilter = {
        workflow: { isNull: true },
        ...(state === 'cancelled'
          ? { isCancelled: { equalTo: true } }
          : {
              isCancelled: { equalTo: false },
              ...(state === 'succeeded'
                ? {
                    isFailed: { equalTo: false },
                    status: { equalTo: DownloadStatus.Available },
                  }
                : {
                    or: [
                      { isFailed: { equalTo: true } },
                      { status: { notEqualTo: DownloadStatus.Available } },
                    ],
                  }),
            }),
      };
      return [workflow(state), legacy];
    }),
  };
}

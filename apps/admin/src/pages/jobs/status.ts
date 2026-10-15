import { DownloadJobFilter, DownloadStatus } from '@/generated/types';
import { JobState } from '@/constants/task-status';
export {
  jobStates,
  jobState,
  selectedJobStates,
  JobState,
} from '@/constants/task-status';
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

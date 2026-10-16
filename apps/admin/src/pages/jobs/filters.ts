import { TaskFilter, LegacyTaskStage } from '@/generated/types';
import { TaskState } from '@/constants/task-status';
/** 列表与集合检查共用筛选，旧任务的未结束状态按失败处理。 */
export function taskStateFilter(states: TaskState[]): TaskFilter {
  if (!states.length) return {};
  return {
    or: states.flatMap((state): TaskFilter[] => {
      const workflow = (status: string): TaskFilter => ({
        workflow: { contains: { status } },
      });
      if (state === 'running')
        return [workflow('running'), workflow('cancelling')];
      const legacy: TaskFilter = {
        workflow: { isNull: true },
        ...(state === 'cancelled'
          ? { isCancelled: { equalTo: true } }
          : {
              isCancelled: { equalTo: false },
              ...(state === 'succeeded'
                ? {
                    isFailed: { equalTo: false },
                    legacyStage: { equalTo: LegacyTaskStage.Available },
                  }
                : {
                    or: [
                      { isFailed: { equalTo: true } },
                      {
                        legacyStage: { notEqualTo: LegacyTaskStage.Available },
                      },
                    ],
                  }),
            }),
      };
      return [workflow(state), legacy];
    }),
  };
}

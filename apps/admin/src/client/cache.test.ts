import { TaskSummaryFieldsFragmentDoc, TaskType } from '@/generated/types';
import { createCache } from './cache';

test('摘要按版本合并，不同任务的同名步骤互不覆盖', () => {
  const cache = createCache();
  const write = (id: number, version: number, title: string) =>
    cache.writeFragment({
      id: `Task:${id}`,
      fragment: TaskSummaryFieldsFragmentDoc,
      data: {
        __typename: 'Task',
        id,
        type: TaskType.Download,
        statusSummary: {
          __typename: 'TaskStatusSummary',
          version,
          legacy: null,
          workflow: {
            __typename: 'TaskWorkflowSummary',
            status: 'running',
            currentStepId: 'step',
            steps: [
              {
                __typename: 'TaskStepSummary',
                id: 'step',
                atom: 'download',
                title,
                status: 'running',
              },
            ],
          },
        },
      },
    });
  write(1, 3, '任务一的新步骤');
  write(2, 1, '任务二');
  write(1, 2, '迟到的旧步骤');
  const state = JSON.stringify(cache.extract());
  expect(state).toContain('任务一的新步骤');
  expect(state).toContain('任务二');
  expect(state).not.toContain('迟到的旧步骤');
  expect(cache.extract()).not.toHaveProperty('TaskStepSummary:step');
});

import {
  TaskSummaryFieldsFragment,
  TaskSummaryFieldsFragmentDoc,
  TaskType,
} from '@/generated/types';
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
          version,
          legacy: null,
          workflow: {
            status: 'running',
            currentStepId: 'step',
            steps: [
              {
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

test('新版本 JSON 整体替换旧摘要，空摘要可以清除缓存', () => {
  const cache = createCache();
  const write = (statusSummary: TaskSummaryFieldsFragment['statusSummary']) =>
    cache.writeFragment({
      id: 'Task:1',
      fragment: TaskSummaryFieldsFragmentDoc,
      data: {
        __typename: 'Task',
        id: 1,
        type: TaskType.Download,
        statusSummary,
      },
    });
  const read = () =>
    cache.readFragment<TaskSummaryFieldsFragment>({
      id: 'Task:1',
      fragment: TaskSummaryFieldsFragmentDoc,
    })?.statusSummary;
  write({
    version: 1,
    legacy: { stage: 'AVAILABLE', isFailed: false, isCancelled: false },
  });
  const latest = {
    version: 2,
    workflow: {
      status: 'running' as const,
      currentStepId: 'step',
      steps: [
        {
          id: 'step',
          atom: 'newAtom',
          title: '新步骤',
          status: 'running' as const,
        },
      ],
    },
  };
  write(latest);
  expect(read()).toEqual(latest);
  write({ version: 1 });
  expect(read()).toEqual(latest);
  write(null);
  expect(read()).toBeNull();
});

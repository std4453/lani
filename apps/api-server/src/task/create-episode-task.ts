import { Prisma, TaskType } from '@lani/db';
import { StepDefinition } from '@lani/workflow';
import type { TaskParams, TaskService } from './index.service';

/** 复用调用方事务，让剧集锁、任务和反向关联一起提交或回滚。 */
export async function createEpisodeTask(
  tasks: TaskService,
  tx: Prisma.TransactionClient,
  type: TaskType,
  definition: StepDefinition[],
  params: Omit<TaskParams, 'episodes'>,
  episodeIds: number[],
) {
  const task = await tasks.create(tx, type, definition, params);
  await tx.taskEpisode.createMany({
    data: episodeIds.map((episodeId) => ({ taskId: task.id, episodeId })),
  });
  return task;
}

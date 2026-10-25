import { Prisma } from '@lani/db';

export const activeTaskWhere: Prisma.TaskWhereInput = {
  OR: ['running', 'cancelling', 'failed'].map((status) => ({
    workflow: { path: ['status'], equals: status },
  })),
};

export const seasonTasks = (seasonId: number): Prisma.TaskWhereInput => ({
  OR: [
    { episode: { seasonId } },
    { episodes: { some: { episode: { seasonId } } } },
  ],
});

export function findActiveSeasonTask(
  tx: Prisma.TransactionClient,
  seasonId: number,
) {
  return tx.task.findFirst({
    where: { AND: [activeTaskWhere, seasonTasks(seasonId)] },
    select: { id: true },
  });
}

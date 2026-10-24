import { Prisma } from '@lani/db';
import { batchImportEntries } from '@lani/workflow';
import path from 'path';
import { LaniError } from '@/utils/error';
import { activeTaskWhere } from './atoms/publication';

export const seasonTasks = (seasonId: number): Prisma.TaskWhereInput => ({
  OR: [
    { episode: { seasonId } },
    { episodes: { some: { episode: { seasonId } } } },
  ],
});
export async function assertSeasonIdle(
  tx: Prisma.TransactionClient,
  seasonId: number,
) {
  if (
    await tx.task.findFirst({
      where: { AND: [activeTaskWhere, seasonTasks(seasonId)] },
      select: { id: true },
    })
  )
    throw new LaniError(
      '季度仍有进行中或失败的任务，请先处理任务再修改媒体目录',
    );
}

/** 调用方持有媒体操作互斥；任务行锁保护批量 JSON 的读取、修改、写回。 */
export async function relocateTaskMediaPaths(
  tx: Prisma.TransactionClient,
  seasonId: number,
  oldPath: string,
  newPath: string,
) {
  const relocate = (value: string | null) => {
    if (!value) return value;
    const relative = path.relative(oldPath, value);
    return relative &&
      relative !== '..' &&
      !relative.startsWith('../') &&
      !path.isAbsolute(relative)
      ? path.join(newPath, relative)
      : value;
  };
  const jobs = await tx.task.findMany({
    where: seasonTasks(seasonId),
    select: { id: true },
    orderBy: { id: 'asc' },
  });
  for (const { id } of jobs) {
    await tx.$queryRaw`SELECT id FROM download_jobs WHERE id=${id} FOR UPDATE`;
    const job = await tx.task.findUnique({ where: { id } });
    if (!job) continue;
    await tx.task.update({
      where: { id },
      data: {
        filePath: relocate(job.filePath),
        nfoPath: relocate(job.nfoPath),
        batchEntries:
          job.batchEntries == null
            ? Prisma.DbNull
            : batchImportEntries(job.batchEntries).map((entry) => ({
                ...entry,
                filePath: relocate(entry.filePath ?? null),
                nfoPath: relocate(entry.nfoPath ?? null),
              })),
        version: { increment: 1 },
      },
    });
  }
}

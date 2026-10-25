import { Prisma } from '@lani/db';

/** 剧集互斥供下载和导入发布共用，任务行锁由 AtomContext 管理。 */
export async function lockEpisode(
  tx: Prisma.TransactionClient,
  episodeId: number,
) {
  await tx.$queryRaw`SELECT pg_advisory_xact_lock(14521, ${episodeId})::text`;
}

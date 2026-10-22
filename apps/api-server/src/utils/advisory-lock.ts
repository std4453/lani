import { Prisma } from '@lani/db';

// 锁键是跨进程约定，已有值不能随意修改；14521 留给下载发布流程。
export const AdvisoryLockNamespace = {
  TorrentSync: 1634625901,
} as const;

/**
 * 等待并持有事务级互斥锁，提交或回滚时由 PostgreSQL 释放。
 * 必须在交互式事务内调用，并通过同一个 tx 执行后续受保护的操作。
 * namespace 和 key 均为 PostgreSQL int4，同一组键的操作会串行执行。
 */
export async function acquireAdvisoryTransactionLock(
  tx: Prisma.TransactionClient,
  namespace: number,
  key: number,
): Promise<void> {
  await tx.$executeRaw`SELECT pg_advisory_xact_lock(${namespace}::int4, ${key}::int4)`;
}

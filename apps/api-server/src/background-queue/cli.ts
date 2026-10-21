import { PrismaClient } from '@lani/db';

/** 维护入口只操作指定失败 revision，不启动业务服务。 */
export async function retryJob(db: PrismaClient, id: number, revision: number) {
  if (
    !Number.isSafeInteger(id) ||
    id < 1 ||
    !Number.isSafeInteger(revision) ||
    revision < 1
  )
    throw new Error('Invalid job ID or revision');
  const updated = await db.backgroundJob.updateMany({
    where: { id, revision, status: 'failed' },
    data: { status: 'pending', attempts: 0, availableAt: new Date() },
  });
  if (!updated.count)
    throw new Error(
      'Failed job revision not found; inspect status before retrying',
    );
}

async function main() {
  const [command, id, revision, ...rest] = process.argv.slice(2);
  if (
    rest.length ||
    (command !== 'status' && command !== 'retry') ||
    (command === 'status' && id !== undefined) ||
    (command === 'retry' && revision === undefined)
  )
    throw new Error('Usage: cli.js status | retry <job-id> <revision>');
  const { default: config } = await import('../config');
  const db = new PrismaClient({
    datasources: { db: { url: config.postgresUrl } },
  });
  try {
    if (command === 'retry') {
      await retryJob(db, Number(id), Number(revision));
      console.log(`Job ${id} is pending`);
    } else {
      console.log(
        JSON.stringify(
          await db.backgroundJob.findMany({
            where: { status: 'failed' },
            orderBy: { id: 'asc' },
            take: 100,
            select: {
              id: true,
              queueName: true,
              revision: true,
              attempts: true,
              failedAt: true,
              lastError: true,
            },
          }),
          null,
          2,
        ),
      );
    }
  } finally {
    await db.$disconnect();
  }
}

if (require.main === module) {
  main().catch(() => {
    // 配置错误可能包含连接信息，不直接打印任意异常。
    console.error(
      'Queue maintenance failed; check command, configuration and job revision',
    );
    process.exitCode = 1;
  });
}

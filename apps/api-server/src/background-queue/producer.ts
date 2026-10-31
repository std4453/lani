import { Prisma } from '@lani/db';

/** 缺失时才入队；已有任务（包括正在执行或失败的任务）保持不变。 */
export async function enqueueJobIfAbsent(
  tx: Prisma.TransactionClient,
  queueName: string,
  key: string,
  payload: Prisma.InputJsonValue,
) {
  return tx.backgroundJob.createMany({
    data: [{ queueName, key, payload }],
    skipDuplicates: true,
  });
}

/** 必须使用生产者的事务；替换输入不会自动恢复失败任务。 */
export async function enqueueJob(
  tx: Prisma.TransactionClient,
  queueName: string,
  key: string,
  payload: Prisma.InputJsonValue,
  availableAt = new Date(),
) {
  const job = await tx.backgroundJob.upsert({
    where: { queueName_key: { queueName, key } },
    create: { queueName, key, payload, availableAt },
    update: { payload, availableAt, revision: { increment: 1 } },
  });
  await tx.backgroundJob.updateMany({
    where: { id: job.id, status: { not: 'failed' } },
    data: { status: 'pending', attempts: 0, failedAt: null, lastError: null },
  });
  return job;
}

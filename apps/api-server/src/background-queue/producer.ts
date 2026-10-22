import { Prisma } from '@lani/db';

/** 必须使用生产者的事务；替换输入不会解除已有失败屏障。 */
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

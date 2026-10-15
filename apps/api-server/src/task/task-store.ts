import { PrismaService } from '@/common/prisma.service';
import { Injectable } from '@nestjs/common';
import { Workflow, parseWorkflow } from '@lani/workflow';
import { StoredTask, TaskStorePort } from './workflow-runner';
import { TaskOutput } from './atom';
import { legacyTaskFields } from './legacy-compat';
import { Prisma } from '@lani/db';
import { LaniError } from '@/utils/error';

@Injectable()
export class TaskStore implements TaskStorePort {
  constructor(private prisma: PrismaService) {}
  async read(
    id: number,
    tx: Prisma.TransactionClient = this.prisma,
  ): Promise<StoredTask> {
    const task = await tx.task.findUnique({ where: { id } });
    if (!task) throw new LaniError('任务不存在');
    if (!task.workflow) throw new LaniError('旧任务不允许启动');
    return {
      id,
      version: task.version,
      workflow: parseWorkflow(task.workflow),
      input: task,
    };
  }
  async transaction<T>(
    id: number,
    operation: (tx: Prisma.TransactionClient) => Promise<T>,
  ) {
    return this.prisma.$transaction(async (tx) => {
      await lockTask(tx, id);
      return operation(tx);
    });
  }
  async commit(
    task: StoredTask,
    next: Workflow,
    output: TaskOutput = {},
    tx?: Prisma.TransactionClient,
  ): Promise<boolean> {
    if (!tx)
      return this.prisma.$transaction((tx) =>
        this.commit(task, next, output, tx),
      );
    const workflow = parseWorkflow(next);
    await lockTask(tx, task.id);
    const result = await tx.task.updateMany({
      where: { id: task.id, version: task.version },
      data: {
        ...output,
        ...legacyTaskFields(workflow),
        workflow: JSON.parse(JSON.stringify(workflow)),
        version: { increment: 1 },
        updatedAt: new Date(),
      },
    });
    return result.count > 0;
  }
}
// Prisma 3 updateMany 会先选 ID 再更新；行锁保证版本检查和写入不可分割。
async function lockTask(tx: Prisma.TransactionClient, id: number) {
  await tx.$queryRaw`SELECT id FROM download_jobs WHERE id=${id} FOR UPDATE`;
}

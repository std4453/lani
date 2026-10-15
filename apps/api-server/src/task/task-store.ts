import { PrismaService } from '@/common/prisma.service';
import { Injectable } from '@nestjs/common';
import { Workflow, parseWorkflow } from '@lani/workflow';
import { StoredTask, TaskStorePort } from './workflow-runner';
import { TaskOutput } from './atom';
import { legacyTaskFields } from './legacy-compat';
import { LaniError } from '@/utils/error';

@Injectable()
export class TaskStore implements TaskStorePort {
  constructor(private prisma: PrismaService) {}
  async read(id: number): Promise<StoredTask> {
    const task = await this.prisma.task.findUnique({ where: { id } });
    if (!task) throw new LaniError('任务不存在');
    if (!task.workflow) throw new LaniError('旧任务不允许启动');
    return {
      id,
      version: task.version,
      workflow: parseWorkflow(task.workflow),
      input: task,
    };
  }
  async commit(task: StoredTask, next: Workflow, output: TaskOutput = {}) {
    const workflow = parseWorkflow(next);
    return this.prisma.$transaction(async (tx) => {
      // Prisma 3 updateMany 会先选 ID 再更新；行锁保证版本检查与写入不被并发拆开。
      await tx.$queryRaw`SELECT id FROM download_jobs WHERE id=${task.id} FOR UPDATE`;
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
    });
  }
}

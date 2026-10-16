import { PrismaService } from '@/common/prisma.service';
import { Injectable } from '@nestjs/common';
import { Workflow, parseWorkflow } from '@lani/workflow';
import { StoredTask, TaskStorePort } from './workflow-runner';
import { TaskOutput } from './atom';
import { legacyTaskFields } from './legacy-compat';
import { Prisma } from '@lani/db';
import { LaniError } from '@/utils/error';
import { taskInput } from './task-input';

@Injectable()
export class TaskStore implements TaskStorePort {
  constructor(private prisma: PrismaService) {}
  async read(
    id: number,
    tx: Prisma.TransactionClient = this.prisma,
  ): Promise<StoredTask> {
    const task = await tx.task.findUnique({
      where: { id },
      include: { episodes: { orderBy: { position: 'asc' } } },
    });
    if (!task) throw new LaniError('任务不存在');
    if (!task.workflow) throw new LaniError('旧任务不允许启动');
    return {
      id,
      version: task.version,
      workflow: parseWorkflow(task.workflow),
      input: taskInput(task),
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
    const {
      episodeOutputs,
      importPath,
      filePath,
      nfoPath,
      jellyfinEpisodeId,
      ...taskOutput
    } = output;
    const hasSingleOutput = [
      'importPath',
      'filePath',
      'nfoPath',
      'jellyfinEpisodeId',
    ].some((key) => key in output);
    const outputs =
      episodeOutputs ??
      (hasSingleOutput && task.input.episodes?.[0]
        ? [
            {
              id: task.input.episodes[0].id,
              importPath,
              filePath,
              nfoPath,
              jellyfinEpisodeId,
            },
          ]
        : []);
    const result = await tx.task.updateMany({
      where: { id: task.id, version: task.version },
      data: {
        ...taskOutput,
        ...legacyTaskFields(workflow),
        workflow: JSON.parse(JSON.stringify(workflow)),
        version: { increment: 1 },
        updatedAt: new Date(),
      },
    });
    if (result.count && outputs.length) {
      for (const { id, ...data } of outputs) {
        const changed = await tx.taskEpisode.updateMany({
          where: { id, taskId: task.id },
          data,
        });
        if (!changed.count) throw new LaniError('任务关联已被删除');
      }
    }
    return result.count > 0;
  }
}
// 锁定任务行，使同一任务的事务操作串行执行；锁在事务结束时释放。
async function lockTask(tx: Prisma.TransactionClient, id: number) {
  await tx.$queryRaw`SELECT id FROM download_jobs WHERE id=${id} FOR UPDATE`;
}

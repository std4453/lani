import { PrismaService } from '@/common/prisma.service';
import { BackgroundJob, Prisma } from '@lani/db';
import {
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

export type QueueCommit = (tx: Prisma.TransactionClient) => Promise<void>;
export interface QueueHandler {
  enabled: boolean;
  /** 默认只尝试一次；需自动重试的处理器显式声明有限次数和间隔。 */
  retry?: { maxAttempts: number; delayMs: number };
  ready?(job: BackgroundJob): Promise<boolean>;
  execute(job: BackgroundJob): Promise<QueueCommit>;
  /** 执行和提交结束后释放进程内资源，不能抛出异常。 */
  settled?(): void;
}
class SupersededJob extends Error {}
/** 依赖尚未就绪，保留队头；这不是执行失败。 */
export class QueueWaiting extends Error {}

/** 单实例 FIFO 调度；数据库只保存工作及检查点，不提供分布式消费协议。 */
@Injectable()
export class BackgroundQueueService
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  private readonly logger = new Logger(BackgroundQueueService.name);
  private readonly handlers = new Map<string, QueueHandler>();
  private readonly running = new Map<string, Promise<void>>();
  private readonly storageFaults = new Set<string>();
  private started = false;
  private stopped = false;
  private initialization?: Promise<void>;

  constructor(private prisma: PrismaService) {}

  register(name: string, handler: QueueHandler) {
    if (this.handlers.has(name)) throw new Error(`Duplicate queue ${name}`);
    if (
      handler.retry &&
      (!Number.isInteger(handler.retry.maxAttempts) ||
        handler.retry.maxAttempts < 1 ||
        !Number.isFinite(handler.retry.delayMs) ||
        handler.retry.delayMs < 1000)
    )
      throw new Error('Invalid queue retry policy');
    this.handlers.set(name, handler);
  }

  onApplicationBootstrap() {
    return this.initialize();
  }

  initialize(): Promise<void> {
    if (!this.initialization) this.initialization = this.initializeQueues();
    return this.initialization;
  }

  private async initializeQueues() {
    for (const name of this.handlers.keys()) {
      // 未确认的执行可能已产生结果；处理器负责幂等。failed 不自动恢复。
      await this.prisma.backgroundJob.updateMany({
        where: { queueName: name, status: 'running' },
        data: { status: 'pending' },
      });
    }
    this.started = true;
  }

  async enqueue(
    tx: Prisma.TransactionClient,
    queueName: string,
    key: string,
    payload: Prisma.InputJsonValue,
    availableAt = new Date(),
  ) {
    return enqueueJob(tx, queueName, key, payload, availableAt);
  }

  @Cron('*/5 * * * * *')
  async tick() {
    await Promise.all([...this.handlers.keys()].map((name) => this.wake(name)));
  }

  wake(name: string): Promise<void> {
    if (!this.started || this.stopped || this.storageFaults.has(name))
      return Promise.resolve();
    const previous = this.running.get(name);
    if (previous) return previous;
    const handler = this.handlers.get(name);
    if (!handler?.enabled) return Promise.resolve();
    const task = this.drain(name, handler)
      .catch(async () => {
        // 数据库不可用时也不继续消费。恢复数据库后明确恢复队列。
        this.logger.error(
          `Background queue ${name} stopped after a storage failure`,
        );
        this.storageFaults.add(name);
      })
      .finally(() => this.running.delete(name));
    this.running.set(name, task);
    return task;
  }

  private async drain(name: string, handler: QueueHandler) {
    for (let count = 0; count < 50 && !this.stopped; count++) {
      const job = await this.prisma.backgroundJob.findFirst({
        where: { queueName: name },
        orderBy: { id: 'asc' },
      });
      if (!job || job.status !== 'pending' || job.availableAt > new Date())
        return;
      let executing = false;
      try {
        if (handler.ready && !(await handler.ready(job))) return;
        if (this.stopped) return;
        const claimed = await this.prisma.backgroundJob.updateMany({
          where: { id: job.id, revision: job.revision, status: 'pending' },
          data: { status: 'running', attempts: { increment: 1 } },
        });
        if (!claimed.count) continue;
        executing = true;
        const commit = await handler.execute(job);
        await this.prisma.$transaction(async (tx) => {
          // 按生产者的“业务行 -> 任务行”顺序加锁，避免与重解析事务死锁。
          // 确认失败则整体回滚业务写入，旧执行不能提交更新后的任务。
          await commit(tx);
          const removed = await tx.backgroundJob.deleteMany({
            where: { id: job.id, revision: job.revision, status: 'running' },
          });
          if (!removed.count) throw new SupersededJob();
        });
      } catch (error) {
        if (error instanceof SupersededJob) continue;
        if (error instanceof QueueWaiting) {
          await this.prisma.backgroundJob.updateMany({
            where: { id: job.id, revision: job.revision, status: 'running' },
            data: {
              status: 'pending',
              ...(executing ? { attempts: { decrement: 1 } } : {}),
            },
          });
          return;
        }
        const retry = handler.retry;
        const again = retry && job.attempts + 1 < retry.maxAttempts;
        const failed = await this.prisma.backgroundJob.updateMany({
          where: { id: job.id, revision: job.revision },
          data: {
            status: again ? 'pending' : 'failed',
            failedAt: new Date(),
            ...(!executing ? { attempts: { increment: 1 } } : {}),
            // 不把可能带凭据、请求体或 SQL 参数的任意异常写入持久数据。
            lastError: '后台任务执行失败，请检查组件配置和日志',
            ...(again
              ? { availableAt: new Date(Date.now() + retry.delayMs) }
              : {}),
          },
        });
        if (!failed.count) continue;
        this.logger.error(
          `Background queue ${name} failed at job ${job.id}; retry=${!!again}`,
        );
        return;
      } finally {
        if (executing) handler.settled?.();
      }
    }
  }

  hasStorageFault(name: string) {
    return this.storageFaults.has(name);
  }

  async resume(name: string) {
    if (!this.handlers.has(name)) throw new Error('队列不存在');
    await this.running.get(name);
    await this.prisma.backgroundJob.updateMany({
      where: { queueName: name, status: 'failed' },
      data: { status: 'pending', attempts: 0, availableAt: new Date() },
    });
    this.storageFaults.delete(name);
    void this.wake(name);
  }

  async onApplicationShutdown() {
    this.stopped = true;
    await Promise.all(this.running.values());
  }
}

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

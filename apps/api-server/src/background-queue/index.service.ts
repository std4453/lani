import { PrismaService } from '@/common/prisma.service';
import { QueueHandler, QueueJob, QueueWaiting } from './types';
import {
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

class SupersededJob extends Error {}

/** 单实例按入队顺序领取；数据库不提供分布式消费协议。 */
@Injectable()
export class BackgroundQueueService
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  private readonly logger = new Logger(BackgroundQueueService.name);
  private readonly handlers = new Map<string, QueueHandler<unknown>>();
  private readonly running = new Map<string, Promise<void>>();
  private readonly storageFaults = new Set<string>();
  private started = false;
  private stopped = false;
  private initialization?: Promise<void>;

  constructor(private prisma: PrismaService) {}

  register<TPayload>(name: string, handler: QueueHandler<TPayload>) {
    if (this.handlers.has(name)) throw new Error(`Duplicate queue ${name}`);
    const concurrency = handler.concurrency ?? 1;
    if (!Number.isSafeInteger(concurrency) || concurrency < 1)
      throw new Error('Invalid queue concurrency');
    if (
      handler.retry &&
      (!Number.isInteger(handler.retry.maxAttempts) ||
        handler.retry.maxAttempts < 1 ||
        !Number.isFinite(handler.retry.delayMs) ||
        handler.retry.delayMs < 1000)
    )
      throw new Error('Invalid queue retry policy');
    // 持久化 JSON 的业务类型只在注册边界转换；格式校验由业务处理器负责。
    const ready = handler.ready?.bind(handler);
    this.handlers.set(name, {
      concurrency,
      get enabled() {
        return handler.enabled;
      },
      get retry() {
        return handler.retry;
      },
      settled: handler.settled?.bind(handler),
      ready: ready ? (job) => ready(job as QueueJob<TPayload>) : undefined,
      execute: (job) => handler.execute(job as QueueJob<TPayload>),
    });
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

  private async drain(name: string, handler: QueueHandler<unknown>) {
    const active = new Map<number, Promise<void>>();
    const concurrency = handler.concurrency ?? 1;
    const batchSize = Math.max(50, concurrency);
    let halted = false;
    let storageFailed = false;
    let count = 0;
    try {
      while (count < batchSize && !this.stopped && !halted) {
        if (active.size >= concurrency) {
          await Promise.race(active.values());
          continue;
        }
        // 排除本轮仍在执行的 ID，输入 revision 改变也不能重叠执行同一任务。
        const job = await this.prisma.backgroundJob.findFirst({
          where: {
            queueName: name,
            status: { not: 'failed' },
            id: { notIn: [...active.keys()] },
          },
          orderBy: { id: 'asc' },
        });
        if (this.stopped || halted) break;
        if (!job) {
          if (!active.size) break;
          // 队列暂空时仍定期重查，让空闲并发位领取新入队任务。
          let timer!: NodeJS.Timeout;
          try {
            await Promise.race([
              ...active.values(),
              new Promise<void>((resolve) => {
                timer = setTimeout(resolve, 1000);
              }),
            ]);
          } finally {
            clearTimeout(timer);
          }
          continue;
        }
        if (job.status !== 'pending' || job.availableAt > new Date()) break;
        count++;
        let prepared!: (claimed: boolean) => void;
        const preparation = new Promise<boolean>((resolve) => {
          prepared = resolve;
        });
        const task = this.execute(
          name,
          handler,
          job,
          prepared,
          () => this.stopped || halted,
        )
          .then((proceed) => {
            if (!proceed) halted = true;
          })
          .catch(() => {
            storageFailed = true;
            halted = true;
          })
          .finally(() => active.delete(job.id));
        active.set(job.id, task);
        // 前置条件检查和领取按顺序完成，遇到等待中的队头不再派发后续任务。
        if (!(await preparation)) await task;
      }
    } finally {
      // 暂停和停机均等待已领取的任务收敛，避免下一轮与旧任务重叠。
      await Promise.all(active.values());
    }
    if (storageFailed) throw new Error('Background queue storage failure');
  }

  private async execute(
    name: string,
    handler: QueueHandler<unknown>,
    job: QueueJob<unknown>,
    prepared: (claimed: boolean) => void,
    shouldStop: () => boolean,
  ): Promise<boolean> {
    let executing = false;
    try {
      if (handler.ready && !(await handler.ready(job))) return false;
      if (shouldStop()) return false;
      const claimed = await this.prisma.backgroundJob.updateMany({
        where: { id: job.id, revision: job.revision, status: 'pending' },
        data: { status: 'running', attempts: { increment: 1 } },
      });
      if (!claimed.count) return true;
      executing = true;
      prepared(true);
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
      if (error instanceof SupersededJob) return true;
      if (error instanceof QueueWaiting) {
        await this.prisma.backgroundJob.updateMany({
          where: { id: job.id, revision: job.revision, status: 'running' },
          data: {
            status: 'pending',
            ...(executing ? { attempts: { decrement: 1 } } : {}),
          },
        });
        return false;
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
      if (!failed.count) return true;
      this.logger.error(
        `Background queue ${name} failed at job ${job.id}; retry=${!!again}`,
      );
      if (again) return false;
    } finally {
      prepared(false);
      if (executing) handler.settled?.();
    }
    return true;
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

import { PrismaClient } from '@lani/db';
import { PrismaService } from '@/common/prisma.service';
import { BackgroundQueueService } from './index.service';
import { QueueHandler, QueueJob, QueueWaiting } from './types';
import { enqueueJob, enqueueJobIfAbsent } from './producer';
import {
  validateRetentionPayload,
  TorrentRetentionPayload,
} from '@/torrent-retention/payload';

jest.mock('@/config', () => ({
  __esModule: true,
  default: { postgresUrl: process.env.LANI_LIFECYCLE_TEST_DATABASE_URL },
}));
const url = process.env.LANI_LIFECYCLE_TEST_DATABASE_URL;
const suite = url ? describe : describe.skip;

function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

suite('通用队列的真实 PostgreSQL 事务与恢复', () => {
  let db: PrismaClient;
  let queues: BackgroundQueueService;
  let execute: jest.Mock;
  let ready: boolean;
  const name = 'queue-regression';
  const output = 'queue-regression-output';
  const other = 'queue-regression-other';
  const create = async (handler?: QueueHandler<{ value: number }>) => {
    queues = new BackgroundQueueService(db as unknown as PrismaService);
    queues.register(
      name,
      handler ?? { enabled: true, ready: async () => ready, execute },
    );
    await queues.initialize();
    return queues;
  };
  const enqueue = (key: string, value: number) =>
    db.$transaction((tx) => enqueueJob(tx, name, key, { value }));
  it('并发的缺失入队只保留一个任务，重复请求不打断正在执行的任务', async () => {
    await Promise.all(
      Array.from({ length: 8 }, () =>
        db.$transaction((tx) =>
          enqueueJobIfAbsent(tx, name, 'thumbnail', { value: 1 }),
        ),
      ),
    );
    expect(await db.backgroundJob.count({ where: { queueName: name } })).toBe(
      1,
    );
    const job = await db.backgroundJob.findFirst({
      where: { queueName: name },
    });
    await db.backgroundJob.update({
      where: { id: job!.id },
      data: { status: 'running', attempts: 1 },
    });
    await db.$transaction((tx) =>
      enqueueJobIfAbsent(tx, name, 'thumbnail', { value: 2 }),
    );
    expect(
      await db.backgroundJob.findUnique({ where: { id: job!.id } }),
    ).toMatchObject({
      status: 'running',
      attempts: 1,
      revision: job!.revision,
      payload: { value: 1 },
    });
  });
  beforeAll(async () => {
    const target = new URL(url!);
    if (
      !['127.0.0.1', 'localhost'].includes(target.hostname) ||
      !target.pathname.endsWith('_test')
    )
      throw new Error('An isolated localhost *_test database is required');
    db = new PrismaClient({ datasources: { db: { url } } });
    await db.$connect();
  });
  beforeEach(async () => {
    await db.backgroundJob.deleteMany({
      where: { queueName: { in: [name, output, other] } },
    });
    await db.backgroundJob.create({
      data: { queueName: output, key: output, payload: {} },
    });
    ready = true;
    execute = jest.fn(async (job) => async (tx) => {
      await tx.backgroundJob.update({
        where: { queueName_key: { queueName: output, key: output } },
        data: { payload: job.payload },
      });
    });
    await create();
  });
  afterEach(async () => {
    await queues.onApplicationShutdown();
    await db.backgroundJob.deleteMany({
      where: { queueName: { in: [name, output, other] } },
    });
  });
  afterAll(async () => {
    await db.$disconnect();
  });

  it.each([1, 2, 3])(
    '并发数 %s 限制执行与提交，空位释放后立即补位',
    async (concurrency) => {
      const entered = Array.from({ length: 4 }, deferred);
      const release = Array.from({ length: 4 }, deferred);
      const commits = Array.from({ length: 4 }, deferred);
      const started: number[] = [];
      await queues.onApplicationShutdown();
      await create({
        enabled: true,
        concurrency,
        execute: async (job) => {
          const index = job.payload.value;
          started.push(index);
          entered[index].resolve();
          return async () => {
            commits[index].resolve();
            await release[index].promise;
          };
        },
      });
      for (let i = 0; i < 4; i++) await enqueue(String(i), i);
      const running = queues.wake(name);
      expect(queues.wake(name)).toBe(running);
      try {
        await Promise.all(
          entered.slice(0, concurrency).map((gate) => gate.promise),
        );
        await Promise.all(
          commits.slice(0, concurrency).map((gate) => gate.promise),
        );
        expect(started).toEqual(
          Array.from({ length: concurrency }, (_, i) => i),
        );
        expect(
          await db.backgroundJob.count({
            where: { queueName: name, status: 'running' },
          }),
        ).toBe(concurrency);
        release[concurrency - 1].resolve();
        await entered[concurrency].promise;
        expect(started).toHaveLength(concurrency + 1);
        // 并发时第一项仍未提交，后面的任务已经补上空位。
        if (concurrency > 1)
          expect(
            await db.backgroundJob.findFirst({
              where: { queueName: name, key: '0' },
            }),
          ).not.toBeNull();
      } finally {
        release.forEach((gate) => gate.resolve());
        await running;
      }
      expect(await db.backgroundJob.count({ where: { queueName: name } })).toBe(
        0,
      );
    },
  );

  it('队列暂空后新任务可使用空闲并发位，不等待旧任务完成', async () => {
    const empty = deferred();
    const secondEntered = deferred();
    const release = deferred();
    const findFirst = db.backgroundJob.findFirst.bind(db.backgroundJob);
    const spy = jest
      .spyOn(db.backgroundJob, 'findFirst')
      .mockImplementation((args) => {
        const query = findFirst(args);
        void query.then((job) => {
          if (args?.where?.queueName === name && !job) empty.resolve();
        });
        return query;
      });
    await queues.onApplicationShutdown();
    await create({
      enabled: true,
      concurrency: 2,
      execute: async (job) => {
        if (job.key === 'first') await release.promise;
        else secondEntered.resolve();
        return async () => undefined;
      },
    });
    await enqueue('first', 1);
    const running = queues.wake(name);
    let timer!: NodeJS.Timeout;
    try {
      await empty.promise;
      await enqueue('second', 2);
      expect(queues.wake(name)).toBe(running);
      await Promise.race([
        secondEntered.promise,
        new Promise<void>((_, reject) => {
          timer = setTimeout(
            () => reject(new Error('Idle slot was not used')),
            3000,
          );
        }),
      ]);
      expect(
        await db.backgroundJob.findUnique({
          where: { queueName_key: { queueName: name, key: 'first' } },
        }),
      ).toMatchObject({ status: 'running' });
    } finally {
      clearTimeout(timer);
      release.resolve();
      await running;
      spy.mockRestore();
    }
  });

  it('并发中输入被替换时等待旧执行结束，旧提交回滚且新版只执行一次', async () => {
    const entered = deferred();
    const release = deferred();
    const otherEntered = deferred();
    const otherRelease = deferred();
    const otherSettled = deferred();
    const calls: number[] = [];
    let oldFinished = false;
    await queues.onApplicationShutdown();
    await create({
      enabled: true,
      concurrency: 2,
      settled: () => otherSettled.resolve(),
      execute: async (job) => {
        calls.push(job.payload.value);
        if (job.payload.value === 1) {
          entered.resolve();
          await release.promise;
          oldFinished = true;
        } else if (job.payload.value === 2) {
          otherEntered.resolve();
          await otherRelease.promise;
        }
        if (job.payload.value === 3) expect(oldFinished).toBe(true);
        return async (tx) => {
          if (job.payload.value === 3)
            expect(
              await tx.backgroundJob.findFirst({
                where: { queueName: output },
              }),
            ).toMatchObject({ payload: { value: 2 } });
          await tx.backgroundJob.update({
            where: { queueName_key: { queueName: output, key: output } },
            data: { payload: job.payload },
          });
        };
      },
    });
    await enqueue('a', 1);
    await enqueue('b', 2);
    const running = queues.wake(name);
    try {
      await Promise.all([entered.promise, otherEntered.promise]);
      await enqueue('a', 3);
      otherRelease.resolve();
      // b 提交后调度器仍不能重叠执行 a 的新版。
      await otherSettled.promise;
      expect(calls).toEqual([1, 2]);
    } finally {
      release.resolve();
      otherRelease.resolve();
      await running;
    }
    expect(calls).toEqual([1, 2, 3]);
    expect(
      await db.backgroundJob.findFirst({ where: { queueName: output } }),
    ).toMatchObject({ payload: { value: 3 } });
  });

  it('异步前置条件阻塞时不会越过队头领取其他任务', async () => {
    const checking = deferred();
    const release = deferred();
    const ready = jest.fn(async () => {
      checking.resolve();
      await release.promise;
      return false;
    });
    await queues.onApplicationShutdown();
    await create({
      enabled: true,
      concurrency: 3,
      ready,
      execute,
    });
    await enqueue('a', 1);
    await enqueue('b', 2);
    const running = queues.wake(name);
    await checking.promise;
    release.resolve();
    await running;
    expect(ready).toHaveBeenCalledTimes(1);
    expect(execute).not.toHaveBeenCalled();
    expect(
      await db.backgroundJob.count({
        where: { queueName: name, status: 'pending' },
      }),
    ).toBe(2);
  });

  it('在途任务交回等待后，不再领取仍在检查前置条件的任务', async () => {
    const firstRelease = deferred();
    const secondChecking = deferred();
    const secondRelease = deferred();
    const settled = deferred();
    const execute = jest.fn(async () => {
      await firstRelease.promise;
      throw new QueueWaiting();
    });
    await queues.onApplicationShutdown();
    await create({
      enabled: true,
      concurrency: 2,
      ready: async (job) => {
        if (job.payload.value === 2) {
          secondChecking.resolve();
          await secondRelease.promise;
        }
        return true;
      },
      execute,
      settled: () => settled.resolve(),
    });
    await enqueue('a', 1);
    await enqueue('b', 2);
    const running = queues.wake(name);
    try {
      await secondChecking.promise;
      firstRelease.resolve();
      await settled.promise;
      await new Promise(setImmediate);
    } finally {
      firstRelease.resolve();
      secondRelease.resolve();
      await running;
    }
    expect(execute).toHaveBeenCalledTimes(1);
    expect(
      await db.backgroundJob.count({
        where: { queueName: name, status: 'pending', attempts: 0 },
      }),
    ).toBe(2);
  });

  it.each(['waiting', 'retry', 'failure', 'shutdown'])(
    '并发任务遇到 %s 时保留状态并等待其他在途执行收敛',
    async (mode) => {
      const entered = [deferred(), deferred()];
      const release = [deferred(), deferred()];
      const settled = deferred();
      const calls: number[] = [];
      await queues.onApplicationShutdown();
      await create({
        enabled: true,
        concurrency: 2,
        ...(mode === 'retry'
          ? { retry: { maxAttempts: 2, delayMs: 1000 } }
          : {}),
        execute: async (job) => {
          const index = job.payload.value - 1;
          calls.push(job.payload.value);
          if (index < 2) {
            entered[index].resolve();
            await release[index].promise;
          }
          if (index === 0 && mode === 'waiting') throw new QueueWaiting();
          if (index === 0 && ['retry', 'failure'].includes(mode))
            throw new Error('temporary failure');
          return async () => undefined;
        },
        settled: () => settled.resolve(),
      });
      const first = await enqueue('a', 1);
      await enqueue('b', 2);
      await enqueue('c', 3);
      const running = queues.wake(name);
      let finished = false;
      void running.then(() => {
        finished = true;
      });
      try {
        await Promise.all(entered.map((gate) => gate.promise));
        const shutdown =
          mode === 'shutdown' ? queues.onApplicationShutdown() : undefined;
        release[0].resolve();
        await settled.promise;
        expect(finished).toBe(false);
        release[1].resolve();
        await running;
        await shutdown;
        expect(calls).toEqual(mode === 'failure' ? [1, 2, 3] : [1, 2]);
        const saved = await db.backgroundJob.findUnique({
          where: { id: first.id },
        });
        if (mode === 'waiting')
          expect(saved).toMatchObject({ status: 'pending', attempts: 0 });
        if (mode === 'retry')
          expect(saved).toMatchObject({ status: 'pending', attempts: 1 });
        if (mode === 'failure')
          expect(saved).toMatchObject({ status: 'failed', attempts: 1 });
      } finally {
        release.forEach((gate) => gate.resolve());
        await running;
      }
    },
  );

  it('rolls back enqueue with the producer transaction', async () => {
    await expect(
      db.$transaction(async (tx) => {
        await enqueueJob(tx, name, 'a', {});
        throw new Error('rollback');
      }),
    ).rejects.toThrow('rollback');
    expect(await db.backgroundJob.count({ where: { queueName: name } })).toBe(
      0,
    );
  });

  it('retains FIFO while the head waits, then commits and acknowledges in order', async () => {
    await enqueue('a', 1);
    await enqueue('b', 2);
    ready = false;
    await queues.wake(name);
    expect(execute).not.toHaveBeenCalled();
    expect(await db.backgroundJob.count({ where: { queueName: name } })).toBe(
      2,
    );
    ready = true;
    await queues.wake(name);
    expect(execute.mock.calls.map(([job]) => job.key)).toEqual(['a', 'b']);
    expect(
      (await db.backgroundJob.findUnique({
        where: { queueName_key: { queueName: output, key: output } },
      }))!.payload,
    ).toEqual({ value: 2 });
    expect(await db.backgroundJob.count({ where: { queueName: name } })).toBe(
      0,
    );
  });

  it.each(['failed', 'ready', 'waiting'])(
    'keeps another channel independent of a %s head',
    async (barrier) => {
      if (barrier === 'ready') ready = false;
      else
        execute.mockRejectedValue(
          barrier === 'waiting' ? new QueueWaiting() : new Error('offline'),
        );
      const head = await enqueue('a', 1);
      await enqueue('b', 2);
      const independent = jest.fn();
      queues.register<{ value: number }>(other, {
        enabled: true,
        ready: async (job) => job.payload.value === 42,
        execute: async (job) => {
          independent(job.payload.value);
          return async (tx) => {
            await tx.backgroundJob.update({
              where: { queueName_key: { queueName: output, key: output } },
              data: { payload: { value: job.payload.value } },
            });
          };
        },
      });
      await db.$transaction((tx) => enqueueJob(tx, other, 'a', { value: 42 }));
      await queues.tick();
      expect(independent).toHaveBeenCalledWith(42);
      expect(
        await db.backgroundJob.count({ where: { queueName: other } }),
      ).toBe(0);
      expect(
        await db.backgroundJob.findUnique({
          where: { queueName_key: { queueName: output, key: output } },
        }),
      ).toMatchObject({ payload: { value: 42 } });
      expect(await db.backgroundJob.count({ where: { queueName: name } })).toBe(
        2,
      );
      expect(
        await db.backgroundJob.findUnique({ where: { id: head.id } }),
      ).toMatchObject({
        status: barrier === 'failed' ? 'failed' : 'pending',
        attempts: barrier === 'failed' ? 1 : 0,
      });
      expect(execute).toHaveBeenCalledTimes(
        barrier === 'ready' ? 0 : barrier === 'failed' ? 2 : 1,
      );
    },
  );

  it.each([undefined, 1, 2])(
    'persists retention format version %s with business compatibility checks',
    async (version) => {
      const effect = jest.fn();
      queues.register<TorrentRetentionPayload>(other, {
        enabled: true,
        execute: async ({ payload }) => {
          validateRetentionPayload(payload);
          effect(payload.hashes);
          return async () => undefined;
        },
      });
      const payload = {
        ...(version === undefined ? {} : { version }),
        hashes: ['a'.repeat(40)],
      };
      const job = await db.$transaction((tx) =>
        enqueueJob(tx, other, 'scan', payload),
      );
      await queues.wake(other);
      const persisted = await db.backgroundJob.findUnique({
        where: { id: job.id },
      });
      if (version === 2) {
        expect(persisted).toMatchObject({
          status: 'failed',
          payload,
          attempts: 1,
        });
        expect(effect).not.toHaveBeenCalled();
        await queues.onApplicationShutdown();
        queues = new BackgroundQueueService(db as unknown as PrismaService);
        queues.register(other, { enabled: true, execute: effect });
        await queues.initialize();
        await queues.wake(other);
        expect(effect).not.toHaveBeenCalled();
        expect(
          await db.backgroundJob.findUnique({ where: { id: job.id } }),
        ).toMatchObject({ status: 'failed', payload });
      } else {
        expect(effect).toHaveBeenCalledWith(payload.hashes);
        expect(persisted).toBeNull();
      }
    },
  );

  it('preserves class handler getters and method receivers at the JSON boundary', async () => {
    const settled = jest.fn();
    class Handler implements QueueHandler<{ value: number }> {
      active = true;
      busy = false;
      get enabled() {
        return this.active;
      }
      async ready(job: QueueJob<{ value: number }>) {
        expect(this).toBe(handler);
        return !this.busy && job.payload.value > 0;
      }
      async execute(job: QueueJob<{ value: number }>) {
        expect(this).toBe(handler);
        this.busy = true;
        return async (tx) => {
          await tx.backgroundJob.update({
            where: { queueName_key: { queueName: output, key: output } },
            data: { payload: job.payload },
          });
        };
      }
      settled() {
        expect(this).toBe(handler);
        this.busy = false;
        settled();
      }
    }
    const handler = new Handler();
    await queues.onApplicationShutdown();
    await create(handler);
    await enqueue('a', 1);
    await queues.wake(name);
    expect(handler.busy).toBe(false);
    expect(settled).toHaveBeenCalledTimes(1);
    handler.active = false;
    await enqueue('b', 2);
    await queues.wake(name);
    expect(settled).toHaveBeenCalledTimes(1);
    handler.active = true;
    await queues.wake(name);
    expect(settled).toHaveBeenCalledTimes(2);
    expect(
      await db.backgroundJob.findUnique({
        where: { queueName_key: { queueName: output, key: output } },
      }),
    ).toMatchObject({ payload: { value: 2 } });
  });

  it('does not retry terminal failures across restart until explicitly resumed', async () => {
    execute.mockRejectedValue(new Error('component offline'));
    await enqueue('a', 1);
    await enqueue('b', 2);
    await queues.wake(name);
    await queues.wake(name);
    expect(execute).toHaveBeenCalledTimes(2);
    await queues.onApplicationShutdown();
    await create();
    await queues.wake(name);
    expect(execute).toHaveBeenCalledTimes(2);
    expect(
      (await db.backgroundJob.findFirst({
        where: { queueName: name },
        orderBy: { id: 'asc' },
      }))!.status,
    ).toBe('failed');
    execute.mockImplementation(async () => async () => undefined);
    await queues.resume(name);
    await queues.wake(name);
    expect(execute).toHaveBeenCalledTimes(4);
  });

  it('keeps failure information and does not retry when a producer replaces failed input', async () => {
    execute.mockRejectedValue(new Error('component offline'));
    const job = await enqueue('a', 1);
    await queues.wake(name);
    expect(
      await db.backgroundJob.findUnique({ where: { id: job.id } }),
    ).toMatchObject({
      status: 'failed',
      attempts: 1,
      failedAt: expect.any(Date),
      lastError: expect.any(String),
    });
    await enqueue('a', 2);
    await queues.wake(name);
    expect(execute).toHaveBeenCalledTimes(1);
    expect(
      await db.backgroundJob.findUnique({ where: { id: job.id } }),
    ).toMatchObject({
      status: 'failed',
      attempts: 1,
      revision: 2,
      payload: { value: 2 },
    });
  });

  it.each(['execute', 'commit'])(
    'continues after a terminal %s failure, preserving its record',
    async (phase) => {
      const settled = jest.fn();
      execute.mockImplementation(async (job) => {
        if (job.payload.value === 1 && phase === 'execute')
          throw new Error('private upstream detail');
        if (job.payload.value === 2)
          expect(
            await db.backgroundJob.findUnique({
              where: { queueName_key: { queueName: output, key: output } },
            }),
          ).toMatchObject({ payload: {} });
        return async (tx) => {
          await tx.backgroundJob.update({
            where: { queueName_key: { queueName: output, key: output } },
            data: { payload: job.payload },
          });
          if (job.payload.value === 1) throw new Error('commit failed');
        };
      });
      await queues.onApplicationShutdown();
      await create({
        enabled: true,
        execute,
        settled,
      });
      const failed = await enqueue('a', 1);
      await enqueue('b', 2);
      await queues.wake(name);
      expect(execute.mock.calls.map(([job]) => job.key)).toEqual(['a', 'b']);
      expect(settled).toHaveBeenCalledTimes(2);
      expect(
        await db.backgroundJob.findMany({ where: { queueName: name } }),
      ).toEqual([
        expect.objectContaining({
          id: failed.id,
          status: 'failed',
          attempts: 1,
          failedAt: expect.any(Date),
          lastError: '后台任务执行失败，请检查组件配置和日志',
        }),
      ]);
      expect(
        await db.backgroundJob.findUnique({
          where: { queueName_key: { queueName: output, key: output } },
        }),
      ).toMatchObject({ payload: { value: 2 } });
    },
  );

  it('skips persisted failures across restart and retries them only on explicit resume', async () => {
    const failed = await enqueue('a', 1);
    await db.backgroundJob.update({
      where: { id: failed.id },
      data: { status: 'failed', attempts: 1, failedAt: new Date() },
    });
    await enqueue('b', 2);
    await queues.onApplicationShutdown();
    await create();
    await queues.wake(name);
    expect(execute.mock.calls.map(([job]) => job.key)).toEqual(['b']);
    await enqueue('a', 3);
    await queues.onApplicationShutdown();
    await create();
    await enqueue('c', 4);
    await queues.wake(name);
    expect(execute.mock.calls.map(([job]) => job.key)).toEqual(['b', 'c']);
    expect(
      await db.backgroundJob.findUnique({ where: { id: failed.id } }),
    ).toMatchObject({ status: 'failed', attempts: 1, payload: { value: 3 } });
    await queues.resume(name);
    await queues.wake(name);
    expect(execute.mock.calls.map(([job]) => job.key)).toEqual(['b', 'c', 'a']);
    expect(await db.backgroundJob.count({ where: { queueName: name } })).toBe(
      0,
    );
  });

  it('keeps dependency waits in FIFO even when continuing past failures', async () => {
    await queues.onApplicationShutdown();
    await create({
      enabled: true,
      ready: async () => ready,
      execute,
    });
    const head = await enqueue('a', 1);
    await enqueue('b', 2);
    ready = false;
    await queues.wake(name);
    expect(execute).not.toHaveBeenCalled();
    ready = true;
    execute.mockRejectedValueOnce(new QueueWaiting());
    await queues.wake(name);
    expect(execute.mock.calls.map(([job]) => job.key)).toEqual(['a']);
    expect(
      await db.backgroundJob.findUnique({ where: { id: head.id } }),
    ).toMatchObject({ status: 'pending', attempts: 0 });
    await queues.wake(name);
    expect(execute.mock.calls.map(([job]) => job.key)).toEqual(['a', 'a', 'b']);
  });

  it('preserves retry delays and continues only after attempts are exhausted', async () => {
    execute.mockRejectedValueOnce(new Error('temporary failure'));
    execute.mockRejectedValueOnce(new Error('terminal failure'));
    await queues.onApplicationShutdown();
    await create({
      enabled: true,
      execute,
      retry: { maxAttempts: 2, delayMs: 1000 },
    });
    const head = await enqueue('a', 1);
    await enqueue('b', 2);
    await queues.wake(name);
    await queues.wake(name);
    expect(execute.mock.calls.map(([job]) => job.key)).toEqual(['a']);
    await db.backgroundJob.update({
      where: { id: head.id },
      data: { availableAt: new Date(0) },
    });
    await queues.wake(name);
    expect(execute.mock.calls.map(([job]) => job.key)).toEqual(['a', 'a', 'b']);
    expect(
      await db.backgroundJob.findUnique({ where: { id: head.id } }),
    ).toMatchObject({ status: 'failed', attempts: 2 });
  });

  it('does not skip an in-flight head when continuing past failures', async () => {
    await queues.onApplicationShutdown();
    await create();
    const head = await enqueue('a', 1);
    await enqueue('b', 2);
    await db.backgroundJob.update({
      where: { id: head.id },
      data: { status: 'running' },
    });
    await queues.wake(name);
    expect(execute).not.toHaveBeenCalled();
    await db.backgroundJob.update({
      where: { id: head.id },
      data: { status: 'pending' },
    });
    await queues.wake(name);
    expect(execute.mock.calls.map(([job]) => job.key)).toEqual(['a', 'b']);
  });

  it('preserves delayed retries across restart and continues after terminal failure', async () => {
    await queues.onApplicationShutdown();
    await create({
      enabled: true,
      execute,
      retry: { maxAttempts: 2, delayMs: 1000 },
    });
    execute.mockRejectedValue(new Error('temporary failure'));
    const job = await enqueue('a', 1);
    await enqueue('b', 2);
    await queues.wake(name);
    await queues.wake(name);
    expect(execute).toHaveBeenCalledTimes(1);
    expect(
      await db.backgroundJob.findUnique({ where: { id: job.id } }),
    ).toMatchObject({ status: 'pending', attempts: 1 });
    await db.backgroundJob.update({
      where: { id: job.id },
      data: { availableAt: new Date(0) },
    });
    await queues.onApplicationShutdown();
    await create({
      enabled: true,
      execute,
      retry: { maxAttempts: 2, delayMs: 1000 },
    });
    await queues.wake(name);
    await queues.wake(name);
    expect(execute).toHaveBeenCalledTimes(3);
    expect(
      await db.backgroundJob.findUnique({ where: { id: job.id } }),
    ).toMatchObject({ status: 'failed', attempts: 2 });
    expect(execute.mock.calls.map(([job]) => job.key)).toEqual(['a', 'a', 'b']);
  });

  it('recovers interrupted work but does not lose a job on a failed result transaction', async () => {
    const job = await enqueue('a', 1);
    await db.backgroundJob.update({
      where: { id: job.id },
      data: { status: 'running' },
    });
    await queues.onApplicationShutdown();
    await create();
    expect(
      (await db.backgroundJob.findUnique({ where: { id: job.id } }))!.status,
    ).toBe('pending');
    execute.mockResolvedValue(async (tx) => {
      await tx.backgroundJob.update({
        where: { queueName_key: { queueName: output, key: output } },
        data: { payload: { invalid: true } },
      });
      throw new Error('commit failed');
    });
    await queues.wake(name);
    expect(
      (await db.backgroundJob.findUnique({
        where: { queueName_key: { queueName: output, key: output } },
      }))!.payload,
    ).toEqual({});
    expect(
      (await db.backgroundJob.findUnique({ where: { id: job.id } }))!.status,
    ).toBe('failed');
  });

  it('fences an old execution when a producer replaces its payload', async () => {
    let release!: () => void;
    let started!: () => void;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    const entered = new Promise<void>((resolve) => {
      started = resolve;
    });
    execute.mockImplementationOnce(async (job) => {
      started();
      await gate;
      return async (tx) => {
        await tx.backgroundJob.update({
          where: { queueName_key: { queueName: output, key: output } },
          data: { payload: job.payload },
        });
      };
    });
    await enqueue('a', 1);
    const running = queues.wake(name);
    await entered;
    await enqueue('a', 2);
    release();
    await running;
    expect(execute).toHaveBeenCalledTimes(2);
    expect(
      (await db.backgroundJob.findUnique({
        where: { queueName_key: { queueName: output, key: output } },
      }))!.payload,
    ).toEqual({ value: 2 });
    expect(await db.backgroundJob.count({ where: { queueName: name } })).toBe(
      0,
    );
  });
});

it('halts a queue in memory after storage failure and allows explicit recovery', async () => {
  const database: any = {
    backgroundJob: {
      findFirst: jest.fn().mockRejectedValue(new Error('offline')),
      updateMany: jest.fn(),
    },
  };
  const queues = new BackgroundQueueService(database);
  queues.register('storage-failure', { enabled: true, execute: jest.fn() });
  await queues.initialize();
  await queues.wake('storage-failure');
  await queues.wake('storage-failure');
  expect(queues.hasStorageFault('storage-failure')).toBe(true);
  expect(database.backgroundJob.findFirst).toHaveBeenCalledTimes(1);
  database.backgroundJob.findFirst.mockResolvedValue(null);
  await queues.resume('storage-failure');
  await queues.wake('storage-failure');
  expect(queues.hasStorageFault('storage-failure')).toBe(false);
  await queues.onApplicationShutdown();
});

it.each([0, -1, 1.5, Infinity, NaN, Number.MAX_SAFE_INTEGER + 1])(
  '拒绝非法队列并发数 %s',
  (concurrency) => {
    const queues = new BackgroundQueueService({} as PrismaService);
    expect(() =>
      queues.register('invalid', {
        enabled: true,
        concurrency,
        execute: jest.fn(),
      }),
    ).toThrow('Invalid queue concurrency');
  },
);

it('并发领取遇到存储故障时等待在途任务结束，再暂停整个通道', async () => {
  const release = deferred();
  const failed = deferred();
  const database: any = {
    backgroundJob: {
      findFirst: jest
        .fn()
        .mockResolvedValueOnce({
          id: 1,
          revision: 1,
          status: 'pending',
          availableAt: new Date(0),
        })
        .mockImplementationOnce(async () => {
          failed.resolve();
          throw new Error('offline');
        }),
      updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
    },
    $transaction: (callback) => callback(database),
  };
  const execute = jest.fn(async () => {
    await release.promise;
    return async () => undefined;
  });
  const queues = new BackgroundQueueService(database);
  queues.register('storage', { enabled: true, concurrency: 2, execute });
  await queues.initialize();
  const running = queues.wake('storage');
  let finished = false;
  void running.then(() => {
    finished = true;
  });
  await failed.promise;
  expect(finished).toBe(false);
  expect(queues.wake('storage')).toBe(running);
  release.resolve();
  await running;
  expect(queues.hasStorageFault('storage')).toBe(true);
  await queues.wake('storage');
  expect(execute).toHaveBeenCalledTimes(1);
  expect(database.backgroundJob.findFirst).toHaveBeenCalledTimes(2);
  await queues.onApplicationShutdown();
});

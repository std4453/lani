import { PrismaClient } from '@lani/db';
import { PrismaService } from '@/common/prisma.service';
import { BackgroundQueueService, QueueHandler } from './index.service';
import { retryJob } from './cli';

jest.mock('@/config', () => ({
  __esModule: true,
  default: { postgresUrl: process.env.LANI_LIFECYCLE_TEST_DATABASE_URL },
}));
const url = process.env.LANI_LIFECYCLE_TEST_DATABASE_URL;
const suite = url ? describe : describe.skip;

suite('通用队列的真实 PostgreSQL 事务与恢复', () => {
  let db: PrismaClient;
  let queues: BackgroundQueueService;
  let execute: jest.Mock;
  let ready: boolean;
  const name = 'queue-regression';
  const output = 'queue-regression-output';
  const create = async (handler?: QueueHandler) => {
    queues = new BackgroundQueueService(db as unknown as PrismaService);
    queues.register(
      name,
      handler ?? { enabled: true, ready: async () => ready, execute },
    );
    await queues.initialize();
    return queues;
  };
  const enqueue = (key: string, value: number) =>
    db.$transaction((tx) => queues.enqueue(tx, name, key, { value }));
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
      where: { queueName: { in: [name, output] } },
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
      where: { queueName: { in: [name, output] } },
    });
  });
  afterAll(async () => {
    await db.$disconnect();
  });

  it('rolls back enqueue with the producer transaction', async () => {
    await expect(
      db.$transaction(async (tx) => {
        await queues.enqueue(tx, name, 'a', {});
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

  it('pauses on failure without retries, including across restart', async () => {
    execute.mockRejectedValue(new Error('component offline'));
    await enqueue('a', 1);
    await enqueue('b', 2);
    await queues.wake(name);
    await queues.wake(name);
    expect(execute).toHaveBeenCalledTimes(1);
    await queues.onApplicationShutdown();
    await create();
    await queues.wake(name);
    expect(execute).toHaveBeenCalledTimes(1);
    expect(
      (await db.backgroundJob.findFirst({
        where: { queueName: name },
        orderBy: { id: 'asc' },
      }))!.status,
    ).toBe('failed');
    execute.mockImplementation(async () => async () => undefined);
    await queues.resume(name);
    await queues.wake(name);
    expect(execute).toHaveBeenCalledTimes(3);
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

  it('supports bounded opt-in retries, preserving FIFO and the final failed job', async () => {
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
    expect(execute).toHaveBeenCalledTimes(2);
    expect(
      await db.backgroundJob.findUnique({ where: { id: job.id } }),
    ).toMatchObject({ status: 'failed', attempts: 2 });
    expect(execute.mock.calls.map(([job]) => job.key)).toEqual(['a', 'a']);
  });

  it('recovers only an explicitly selected failed revision through the maintenance command', async () => {
    execute.mockRejectedValue(new Error('offline'));
    const job = await enqueue('a', 1);
    await queues.wake(name);
    await enqueue('a', 2);
    await expect(retryJob(db, job.id, 1)).rejects.toThrow('revision not found');
    await retryJob(db, job.id, 2);
    execute.mockImplementation(async () => async () => undefined);
    await queues.wake(name);
    expect(
      await db.backgroundJob.findUnique({ where: { id: job.id } }),
    ).toBeNull();
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

import { Injectable, Module, Scope } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { PrismaService } from '@/common/prisma.service';
import { QueueConsumer } from './consumer.decorator';
import { QueueExplorer } from './explorer';
import { BackgroundQueueService } from './index.service';
import { QueueHandler, QueueJob } from './types';

jest.mock('@/config', () => ({ __esModule: true, default: {} }));

@Injectable()
@QueueConsumer('decorated')
class Consumer implements QueueHandler<{ value: number }> {
  enabled = true;
  values: number[] = [];
  async execute(job: QueueJob<{ value: number }>) {
    this.values.push(job.payload.value);
    return async () => undefined;
  }
}

@Module({
  providers: [Consumer, { provide: 'alias', useExisting: Consumer }],
  exports: [Consumer],
})
class FeatureModule {}

function createModule(imports: any[] = [], providers: any[] = []) {
  const backgroundJob = {
    updateMany: jest.fn().mockResolvedValue({ count: 1 }),
    findFirst: jest.fn().mockResolvedValue(null),
    deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
  };
  const db = { backgroundJob, $transaction: (fn) => fn(db) };
  return {
    backgroundJob,
    module: Test.createTestingModule({
      imports: [DiscoveryModule, ...imports],
      providers: [
        QueueExplorer,
        BackgroundQueueService,
        { provide: PrismaService, useValue: db },
        ...providers,
      ],
    }).compile(),
  };
}

it('discovers a provider across modules before recovery and invokes its instance, ignoring aliases', async () => {
  const setup = createModule([FeatureModule]);
  const app = await setup.module;
  try {
    await app.init();
    expect(setup.backgroundJob.updateMany).toHaveBeenCalledWith({
      where: { queueName: 'decorated', status: 'running' },
      data: { status: 'pending' },
    });
    const consumer = app.get(Consumer);
    consumer.enabled = false;
    await app.get(BackgroundQueueService).tick();
    expect(setup.backgroundJob.findFirst).not.toHaveBeenCalled();
    consumer.enabled = true;
    setup.backgroundJob.findFirst.mockResolvedValueOnce({
      id: 1,
      revision: 1,
      status: 'pending',
      availableAt: new Date(0),
      payload: { value: 42 },
    });
    await app.get(BackgroundQueueService).tick();
    expect(consumer.values).toEqual([42]);
    expect(setup.backgroundJob.deleteMany).toHaveBeenCalledWith({
      where: { id: 1, revision: 1, status: 'running' },
    });
  } finally {
    await app.close();
  }
});

it('fails startup on duplicate decorated queue names', async () => {
  @Injectable()
  @QueueConsumer('decorated')
  class Duplicate extends Consumer {}
  const app = await createModule([FeatureModule], [Duplicate]).module;
  try {
    await expect(app.init()).rejects.toThrow('Duplicate queue decorated');
  } finally {
    await app.close();
  }
});

it.each([Scope.REQUEST, Scope.TRANSIENT])(
  'rejects non-singleton consumers with scope %s',
  async (scope) => {
    @Injectable({ scope })
    @QueueConsumer('scoped')
    class ScopedConsumer extends Consumer {}
    const app = await createModule([], [ScopedConsumer]).module;
    try {
      await expect(app.init()).rejects.toThrow(
        'Queue consumer scoped must be a singleton',
      );
    } finally {
      await app.close();
    }
  },
);

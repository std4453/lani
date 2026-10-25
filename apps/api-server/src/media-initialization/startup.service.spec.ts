import { Controller, Get, Module, Post } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import http from 'http';
import { MediaStartupService } from './startup.service';
import { MediaOperations } from '@/common/media-operations';
import { TaskService } from '@/task/index.service';
import { LibraryStructureService } from '@/api/jellyfin';
import { probeMediaDirectories } from '@/media-pool/preflight';
jest.mock('@/config', () => ({
  __esModule: true,
  default: {
    mediaPool: { root: '/pool', painfullyAcceptCrossDeviceCopy: false },
    jellyfin: { pathMapping: [] },
  },
}));
jest.mock('@/common/prisma.service', () => ({ PrismaService: class {} }));
jest.mock('@/api/jellyfin', () => ({
  LibraryStructureService: { getVirtualFolders: jest.fn() },
}));
jest.mock('@/media-pool/preflight', () => ({
  ...jest.requireActual('@/media-pool/preflight'),
  probeMediaDirectories: jest.fn(),
}));
beforeEach(() => {
  jest.resetAllMocks();
  (LibraryStructureService.getVirtualFolders as jest.Mock).mockResolvedValue([
    { CollectionType: 'tvshows', Locations: ['/library'] },
  ]);
});
function setup() {
  const pool = { initialize: jest.fn() };
  const seasons = { recoverDirectoryMoves: jest.fn() };
  const backfill = { run: jest.fn(), stop: jest.fn(), fail: jest.fn() };
  const db = {
    task: { updateMany: jest.fn(), findMany: jest.fn().mockResolvedValue([]) },
  };
  const tasks = new TaskService(
    db as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    new MediaOperations(),
  );
  jest.spyOn(tasks, 'onApplicationBootstrap');
  const service = new MediaStartupService(
    pool as never,
    seasons as never,
    backfill as never,
  );
  return { pool, seasons, backfill, tasks, db, service };
}
function request(server: any, method = 'GET') {
  return new Promise<number>((resolve, reject) => {
    const req = http.request(
      { host: '127.0.0.1', port: server.address().port, path: '/', method },
      (res) => {
        res.resume();
        res.on('end', () => resolve(res.statusCode!));
      },
    );
    req.on('error', reject);
    req.end();
  });
}
it('预检和中断恢复先完成；HTTP 写入和任务恢复不等待后台回填', async () => {
  const { pool, backfill, seasons, tasks, db, service } = setup();
  let complete!: () => void;
  backfill.run.mockImplementation(
    () => new Promise<void>((resolve) => (complete = resolve)),
  );
  const order: string[] = [];
  pool.initialize.mockImplementation(() => order.push('pool'));
  seasons.recoverDirectoryMoves.mockImplementation(() => order.push('recover'));
  db.task.updateMany.mockImplementation(() => order.push('tasks'));
  @Controller()
  class Status {
    @Get() read() {
      return {};
    }
    @Post() write() {
      return {};
    }
  }
  @Module({
    controllers: [Status],
    providers: [{ provide: TaskService, useValue: tasks }],
  })
  class TestModule {}
  const app = await NestFactory.create(TestModule, { logger: false });
  try {
    await service.initialize();
    expect(probeMediaDirectories).toHaveBeenCalledWith(
      '/pool',
      ['/library'],
      false,
    );
    expect(order).toEqual(['pool', 'recover']);
    expect(backfill.run).not.toHaveBeenCalled();
    expect(tasks.onApplicationBootstrap).not.toHaveBeenCalled();
    await app.listen(0, '127.0.0.1');
    expect(order).toEqual(['pool', 'recover', 'tasks']);
    expect(backfill.run).not.toHaveBeenCalled();
    const work = service.start();
    expect(await request(app.getHttpServer())).toBe(200);
    expect(await request(app.getHttpServer(), 'POST')).toBe(201);
    expect(tasks.onApplicationBootstrap).toHaveBeenCalledTimes(1);
    complete();
    await work;
    await service.start();
    expect(tasks.onApplicationBootstrap).toHaveBeenCalledTimes(1);
  } finally {
    complete?.();
    await service.onApplicationShutdown();
    await app.close();
  }
});
it.each(['preflight', 'recovery'])(
  '%s 失败交给进程入口，不启动回填或任务',
  async (stage) => {
    const { seasons, backfill, tasks, service } = setup();
    const operation =
      stage === 'preflight'
        ? (probeMediaDirectories as jest.Mock)
        : seasons.recoverDirectoryMoves;
    operation.mockRejectedValue(new Error('unrecoverable'));
    await expect(service.initialize()).rejects.toThrow('unrecoverable');
    expect(backfill.run).not.toHaveBeenCalled();
    expect(tasks.onApplicationBootstrap).not.toHaveBeenCalled();
  },
);
it('回填失败交给进程入口受控关闭，关闭停止后台工作', async () => {
  const { backfill, service } = setup();
  backfill.run.mockRejectedValue(new Error('unrecoverable'));
  await service.initialize();
  await expect(service.start()).rejects.toThrow('unrecoverable');
  expect(backfill.fail).toHaveBeenCalledWith('unrecoverable');
  await service.onApplicationShutdown();
  expect(backfill.stop).toHaveBeenCalled();
});
it('无回填时也恢复任务，重复调用不会重复调度', async () => {
  const { service, tasks, db } = setup();
  await service.initialize();
  await Promise.all([
    tasks.onApplicationBootstrap(),
    tasks.onApplicationBootstrap(),
  ]);
  await service.start();
  expect(db.task.findMany).toHaveBeenCalledTimes(1);
});

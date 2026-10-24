import { Controller, Get, Module, Post } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import http from 'http';
import { MediaStartupService } from './startup.service';
import { WriteGate, MediaOperations } from '@/application-state/write-gate';
import { TaskService } from '@/task/index.service';
jest.mock('@/config', () => ({
  __esModule: true,
  default: { mediaPool: {}, jellyfin: { pathMapping: [] } },
}));
jest.mock('@/common/prisma.service', () => ({ PrismaService: class {} }));
jest.mock('@/download-client/QBittorrentService', () => ({
  QBittorrentService: class {},
}));
jest.mock('@/api/jellyfin', () => ({ LibraryStructureService: {} }));
function setup() {
  const gate = new WriteGate();
  const pool = { initialize: jest.fn() };
  const seasons = { recoverDirectoryMoves: jest.fn() };
  const backfill = { run: jest.fn(), stop: jest.fn(), fail: jest.fn() };
  const tasks = { resumePendingTasks: jest.fn() };
  const service = new MediaStartupService(
    pool as never,
    gate,
    {} as never,
    seasons as never,
    backfill as never,
    tasks as never,
  );
  return { gate, pool, seasons, backfill, tasks, service };
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
it('HTTP 不等待回填，完成必要恢复后开放唯一开关并显式恢复任务一次', async () => {
  const { gate, backfill, seasons, tasks, service } = setup();
  let complete!: () => void;
  backfill.run.mockImplementation(
    () =>
      new Promise<void>((resolve) => {
        complete = resolve;
      }),
  );
  @Controller()
  class Status {
    @Get() read() {
      return { ready: gate.ready };
    }
    @Post() write() {
      gate.assertReady();
      return {};
    }
  }
  @Module({ controllers: [Status] })
  class TestModule {}
  const app = await NestFactory.create(TestModule, { logger: false });
  await app.listen(0, '127.0.0.1');
  try {
    const work = service.start();
    expect(await request(app.getHttpServer())).toBe(200);
    expect(await request(app.getHttpServer(), 'POST')).toBe(500);
    expect(seasons.recoverDirectoryMoves).toHaveBeenCalledTimes(1);
    expect(tasks.resumePendingTasks).not.toHaveBeenCalled();
    complete();
    await work;
    await service.start();
    expect(await request(app.getHttpServer(), 'POST')).toBe(201);
    expect(tasks.resumePendingTasks).toHaveBeenCalledTimes(1);
  } finally {
    await app.close();
  }
});
it('初始化失败不开放写入，不恢复任务，异常交给进程入口受控退出', async () => {
  const { gate, backfill, tasks, service } = setup();
  backfill.run.mockRejectedValue(new Error('unrecoverable'));
  await expect(service.start()).rejects.toThrow('unrecoverable');
  expect(gate.ready).toBe(false);
  expect(tasks.resumePendingTasks).not.toHaveBeenCalled();
  expect(backfill.fail).toHaveBeenCalledWith('unrecoverable');
  await service.onApplicationShutdown();
  expect(backfill.stop).toHaveBeenCalled();
});
it('无回填也经过相同初始化顺序；任务创建启动重试取消遵守必需开关', async () => {
  const { gate, service, tasks } = setup();
  const db = {
    task: { updateMany: jest.fn(), findMany: jest.fn().mockResolvedValue([]) },
  };
  const task = new TaskService(
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
    gate,
    new MediaOperations(),
  );
  expect(() => task.start(1)).toThrow('初始化');
  await expect(task.retryTask(1)).rejects.toThrow('初始化');
  await expect(task.cancelTask(1)).rejects.toThrow('初始化');
  await expect(task.create({} as never, 'IMPORT', [], {})).rejects.toThrow(
    '初始化',
  );
  expect(() => task.resumePendingTasks()).toThrow('初始化');
  expect(db.task.findMany).not.toHaveBeenCalled();
  tasks.resumePendingTasks.mockImplementation(() => task.resumePendingTasks());
  await service.start();
  await task.resumePendingTasks();
  expect(db.task.findMany).toHaveBeenCalledTimes(1);
});

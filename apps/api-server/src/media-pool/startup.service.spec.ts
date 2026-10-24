import { Controller, Get, Module, Post } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import http from 'http';
function request(server: any, method = 'GET') {
  return new Promise<{ status: number; body: any }>((resolve, reject) => {
    const req = http.request(
      { host: '127.0.0.1', port: server.address().port, path: '/', method },
      (res) => {
        let body = '';
        res.on('data', (part) => (body += part));
        res.on('end', () =>
          resolve({ status: res.statusCode!, body: JSON.parse(body) }),
        );
      },
    );
    req.on('error', reject);
    req.end();
  });
}
import axios from 'axios';
import { MediaStartupService } from './startup.service';
import { MediaWriteState } from './write-state';
import { TaskService } from '@/task/index.service';
import { MediaPool } from './media-pool.service';

jest.mock('@/config', () => ({
  __esModule: true,
  default: {
    jellyfin: {
      apiEndpoint: 'http://test.invalid',
      dummyUserId: 'test',
      apiToken: 'test',
      pathMapping: [],
    },
    mediaPool: {},
  },
}));
jest.mock('@/common/prisma.service', () => ({ PrismaService: class {} }));
jest.mock('@/download-client/QBittorrentService', () => ({
  QBittorrentService: class {},
}));
jest.mock('@/api/jellyfin', () => ({ LibraryStructureService: {} }));
jest.mock('axios');

function setup() {
  const state = new MediaWriteState();
  const db = {
    episode: {
      count: jest.fn().mockResolvedValue(0),
      findFirst: jest.fn().mockResolvedValue(null),
    },
    task: { updateMany: jest.fn(), findMany: jest.fn().mockResolvedValue([]) },
  };
  const pool = { initialize: jest.fn() };
  const service = new MediaStartupService(
    db as never,
    pool as never,
    state,
    {} as never,
  );
  return { state, db, pool, service };
}
afterEach(() => jest.restoreAllMocks());

it('HTTP 在回填未完成时响应查询，所有媒体写入共享 initializing 屏障，完成后开放', async () => {
  const { state, pool, service } = setup();
  let complete!: () => void;
  pool.initialize.mockImplementation(
    () =>
      new Promise<void>((resolve) => {
        complete = resolve;
      }),
  );
  @Controller()
  class StatusController {
    @Get() status() {
      return state.status();
    }
    @Post() write() {
      state.assertReady();
      return { ok: true };
    }
  }
  @Module({ controllers: [StatusController] })
  class TestModule {}
  const app = await NestFactory.create(TestModule, { logger: false });
  await app.listen(0, '127.0.0.1');
  try {
    const work = service.start();
    const read = await request(app.getHttpServer());
    expect(read.body.state).toBe('initializing');
    expect((await request(app.getHttpServer(), 'POST')).status).toBe(500);
    const guarded = new MediaPool({} as never, {} as never, () =>
      state.assertReady(),
    );
    expect(() => guarded.register({} as never)).toThrow('正在登记');
    expect(() => guarded.publish(1, {} as never)).toThrow('正在登记');
    expect(() => guarded.unpublish(1)).toThrow('正在登记');
    expect(() => guarded.deleteSeason(1, jest.fn())).toThrow('正在登记');
    expect(() => guarded.renameSeason(1, '', '', '')).toThrow('正在登记');
    complete();
    await work;
    expect((await request(app.getHttpServer(), 'POST')).status).toBe(201);
  } finally {
    await app.close();
  }
});
it('任务启动钩子不恢复任务，登记完成后才恢复，重试和取消也受同一屏障控制', async () => {
  const { state, db } = setup();
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
    state,
  );
  await tasks.onApplicationBootstrap();
  expect(db.task.findMany).not.toHaveBeenCalled();
  expect(() => tasks.start(1)).toThrow('正在登记');
  await expect(tasks.retryTask(1)).rejects.toThrow('正在登记');
  await expect(tasks.cancelTask(1)).rejects.toThrow('正在登记');
  await expect(tasks.create({} as never, 'IMPORT', [], {})).rejects.toThrow(
    '正在登记',
  );
  await state.open();
  expect(db.task.findMany).toHaveBeenCalledTimes(1);
});
it('不可恢复的后台错误可被管理入口捕获，状态关闭且不丢失异常', async () => {
  const { state, pool, service } = setup();
  pool.initialize.mockRejectedValue(new Error('journal identity mismatch'));
  await expect(service.start()).rejects.toThrow('journal identity mismatch');
  expect(state.status()).toMatchObject({
    state: 'failed',
    reason: 'journal identity mismatch',
  });
  await service.onApplicationShutdown();
});
it('瞬时外部错误有限重试，鉴权错误不重试', async () => {
  const { state, db, service } = setup();
  db.episode.findFirst.mockResolvedValue({
    id: 1,
    jellyfinEpisodeId: 'legacy',
  });
  const get = axios.get as jest.Mock;
  get.mockRejectedValue({ code: 'ECONNRESET', message: 'reset' });
  await expect(service.start()).rejects.toThrow('reset');
  expect(get).toHaveBeenCalledTimes(3);
  expect(state.ready).toBe(false);
  get.mockClear();
  const next = setup();
  next.db.episode.findFirst.mockResolvedValue({
    id: 1,
    jellyfinEpisodeId: 'legacy',
  });
  get.mockRejectedValue({ response: { status: 403 }, message: 'forbidden' });
  await expect(next.service.start()).rejects.toThrow('forbidden');
  expect(get).toHaveBeenCalledTimes(1);
});

import { DownloadJobService } from './index.service';
import { downloadDefinition } from './definition';
import { TaskService } from '@/task/index.service';
import { DownloadTaskStore } from './task-store';
import { DownloadTaskRuntime } from './runtime';
import { claimEpisodePublication } from './atoms/publication';
import { PrismaService } from '@/common/prisma.service';
import { DownloadStatus, PrismaClient, TaskType } from '@lani/db';
import {
  atomTypes,
  buildWorkflowSnapshot,
  currentStep,
  parseWorkflow,
} from '@lani/download-workflow';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Atoms as WorkflowAtoms } from '@/task/workflow-runner';
import { DownloadWorkflowDefinition } from './atoms/types';
type Atoms = WorkflowAtoms<DownloadWorkflowDefinition>;

jest.mock('@/config', () => ({
  __esModule: true,
  default: {
    postgresUrl: process.env.LANI_LIFECYCLE_TEST_DATABASE_URL,
    jellyfin: { apiEndpoint: 'http://127.0.0.1:1', apiToken: 'test' },
    s3: { bucket: 'test' },
    network: { timeout: { global: 100, local: 100 } },
  },
}));
const databaseUrl = process.env.LANI_LIFECYCLE_TEST_DATABASE_URL;
const databaseTests = databaseUrl ? describe : describe.skip;
databaseTests('隔离数据库上的生命周期原子更新', () => {
  let prisma: PrismaClient;
  let service: TaskService;
  let downloads: DownloadJobService;
  let store: DownloadTaskStore;
  let episodeId: number;
  let seasonId: number;
  let folderId: number;
  let atoms: Atoms;
  let emitter: EventEmitter2;
  beforeAll(async () => {
    const url = new URL(databaseUrl!);
    if (
      !['127.0.0.1', 'localhost'].includes(url.hostname) ||
      !url.pathname.endsWith('_test')
    )
      throw new Error(
        'Integration tests require an isolated localhost *_test database',
      );
    prisma = new PrismaClient({ datasources: { db: { url: databaseUrl! } } });
    const folder = await prisma.jellyfinFolder.create({
      data: {
        name: 'lifecycle-test',
        jellyfinId: `test-${Date.now()}`,
        location: '/unused',
      },
    });
    folderId = folder.id;
    const season = await prisma.season.create({
      data: {
        title: `lifecycle-test-${Date.now()}`,
        jellyfinFolderId: folder.id,
        tags: [],
      },
    });
    seasonId = season.id;
    episodeId = (await prisma.episode.create({ data: { seasonId, index: 1 } }))
      .id;
  });
  beforeEach(async () => {
    atoms = Object.fromEntries(
      atomTypes.map((type) => [
        type,
        {
          wants: [],
          run: jest.fn(async () => {
            throw new Error('controlled failure');
          }),
          cancel: jest.fn(async () => undefined),
        },
      ]),
    ) as unknown as Atoms;
    emitter = new EventEmitter2();
    store = new DownloadTaskStore(prisma as PrismaService, emitter);
    const runtime = new DownloadTaskRuntime(
      store,
      atoms.submitDownload as never,
      atoms.download as never,
      atoms.findVideoFile as never,
      atoms.importFile as never,
      atoms.writeMetadata as never,
      atoms.refreshPlayer as never,
    );
    service = new TaskService(prisma as PrismaService, runtime);
    downloads = new DownloadJobService(prisma as PrismaService, runtime);
  });
  afterEach(async () => {
    await service?.onApplicationShutdown();
    if (episodeId)
      await prisma.downloadJob.deleteMany({ where: { episodeId } });
  });
  afterAll(async () => {
    if (seasonId) await prisma.season.delete({ where: { id: seasonId } });
    if (folderId)
      await prisma.jellyfinFolder.delete({ where: { id: folderId } });
    await prisma.$disconnect();
  });
  it('旧任务启动后失败、不补写流程，重试直接报错且不启动 atom', async () => {
    const old = await prisma.downloadJob.create({
      data: { episodeId, status: DownloadStatus.DOWNLOADING },
    });
    await service.onApplicationBootstrap();
    const result = await prisma.downloadJob.findUnique({
      where: { id: old.id },
    });
    expect(result?.isFailed).toBe(true);
    expect(result?.workflow).toBeNull();
    expect(result?.type).toBe(TaskType.DOWNLOAD);
    await expect(service.retryJobStep(old.id)).rejects.toThrow(
      '旧任务不允许重试',
    );
    expect(atoms.download.run).not.toHaveBeenCalled();
    expect((await service.getDownloadJobStates([old.id]))[0].canRetry).toBe(
      false,
    );
  });
  it('新建任务保存快照，失败后允许另建任务', async () => {
    const first = await downloads.downloadTorrentForEpisode(
      episodeId,
      'magnet:test',
    );
    // 等待执行失败落库，避免把旧任务仍运行时的重复提交当作新建。
    for (let i = 0; i < 100; ++i) {
      if (
        (await prisma.downloadJob.findUnique({ where: { id: first } }))
          ?.isFailed
      )
        break;
      await new Promise((done) => setTimeout(done, 10));
    }
    const second = await downloads.downloadTorrentForEpisode(
      episodeId,
      'magnet:other',
    );
    expect(second).not.toBe(first);
    const [state] = await service.getDownloadJobStates([second]);
    expect(state.type).toBe(TaskType.DOWNLOAD);
    expect(state.workflow?.steps.map((step) => step.atom)).toEqual(
      downloadDefinition.map((step) => step.atom),
    );
  });
  it('并发创建同集下载时，Prisma 插入事务只创建一个运行任务', async () => {
    const ids = await Promise.all([
      store.create(episodeId, 'magnet:one', atoms),
      store.create(episodeId, 'magnet:two', atoms),
    ]);
    expect(ids[0]).toBe(ids[1]);
    expect(await prisma.downloadJob.count({ where: { episodeId } })).toBe(1);
  });
  it('状态提交 CAS 拒绝旧版本，取消获胜后不能完成或关联剧集', async () => {
    const flow = buildWorkflowSnapshot(
      downloadDefinition,
      atoms,
      new Date().toISOString(),
    );
    const job = await prisma.downloadJob.create({
      data: {
        episodeId,
        status: DownloadStatus.DOWNLOADING,
        workflow: JSON.parse(JSON.stringify(flow)),
      },
    });
    const stale = await store.read(job.id);
    await service.cancelDownloadJob(job.id);
    const succeeded = parseWorkflow(stale.workflow);
    succeeded.status = 'succeeded';
    succeeded.finishedAt = new Date().toISOString();
    expect(
      await store.commit(stale, succeeded, {
        refreshPlayer: { jellyfinEpisodeId: 'late' },
      }),
    ).toBe(false);
    expect(
      (await prisma.episode.findUnique({ where: { id: episodeId } }))
        ?.jellyfinEpisodeId,
    ).toBeNull();
  });
  it('同集另一任务占用发布区段时 fail-fast', async () => {
    const flow = buildWorkflowSnapshot(
      downloadDefinition,
      atoms,
      new Date().toISOString(),
    );
    flow.currentStepId = 'import';
    flow.publicationClaimed = true;
    const first = await prisma.downloadJob.create({
      data: {
        episodeId,
        status: DownloadStatus.IMPORTING,
        workflow: JSON.parse(JSON.stringify(flow)),
      },
    });
    const second = await prisma.downloadJob.create({
      data: {
        episodeId,
        status: DownloadStatus.IMPORTING,
        workflow: JSON.parse(JSON.stringify(flow)),
      },
    });
    const state = await store.read(second.id);
    currentStep(state.workflow).status = 'running';
    await expect(
      claimEpisodePublication(prisma as PrismaService, state.id, {
        stepId: 'import',
        attempt: 0,
        checkpoint: {},
        assertActive: async () => undefined,
        saveCheckpoint: async () => undefined,
        wait: async () => undefined,
        waitFor: async (operation) => operation,
      }),
    ).rejects.toThrow('其他任务正在发布');
    expect(
      (await prisma.downloadJob.findUnique({ where: { id: first.id } }))
        ?.version,
    ).toBe(0);
  });
  it('其他任务已经发布后，旧失败任务不能重新进入发布区段', async () => {
    await prisma.downloadJob.create({
      data: { episodeId, status: DownloadStatus.AVAILABLE },
    });
    const flow = buildWorkflowSnapshot(
      downloadDefinition,
      atoms,
      new Date().toISOString(),
    );
    flow.currentStepId = 'import';
    const retry = await prisma.downloadJob.create({
      data: {
        episodeId,
        status: DownloadStatus.IMPORTING,
        workflow: JSON.parse(JSON.stringify(flow)),
      },
    });
    const state = await store.read(retry.id);
    await expect(
      claimEpisodePublication(prisma as PrismaService, state.id, {
        stepId: 'import',
        attempt: 0,
        checkpoint: {},
        assertActive: async () => undefined,
        saveCheckpoint: async () => undefined,
        wait: async () => undefined,
        waitFor: async (operation) => operation,
      }),
    ).rejects.toThrow('其他任务正在发布或已发布');
  });
  it('仅获胜的成功提交关联剧集并发出一次完成通知', async () => {
    const flow = buildWorkflowSnapshot(
      downloadDefinition,
      atoms,
      new Date().toISOString(),
    );
    const job = await prisma.downloadJob.create({
      data: {
        episodeId,
        status: DownloadStatus.PLAYER_WAITING,
        workflow: JSON.parse(JSON.stringify(flow)),
      },
    });
    const state = await store.read(job.id);
    const succeeded = parseWorkflow(state.workflow);
    succeeded.status = 'succeeded';
    succeeded.finishedAt = new Date().toISOString();
    const emit = jest.spyOn(emitter, 'emit');
    const results = await Promise.all([
      store.commit(state, succeeded, {
        refreshPlayer: { jellyfinEpisodeId: 'winner' },
      }),
      store.commit(state, succeeded, {
        refreshPlayer: { jellyfinEpisodeId: 'loser' },
      }),
    ]);
    expect(results.filter(Boolean)).toHaveLength(1);
    expect(emit).toHaveBeenCalledTimes(1);
    const winner = await prisma.downloadJob.findUnique({
      where: { id: job.id },
    });
    expect(
      (await prisma.episode.findUnique({ where: { id: episodeId } }))
        ?.jellyfinEpisodeId,
    ).toBe(winner?.jellyfinEpisodeId);
    await expect(service.cancelDownloadJob(job.id)).rejects.toThrow(
      '任务已完成',
    );
    await prisma.episode.update({
      where: { id: episodeId },
      data: { jellyfinEpisodeId: null },
    });
  });
});

import { DownloadJobService } from './index.service';
import { downloadDefinition } from './definition';
import { TaskService } from '@/task/index.service';
import { TaskStore } from '@/task/task-store';
import { claimEpisodePublication } from '@/task/atoms/publication';
import { PrismaService } from '@/common/prisma.service';
import { LegacyTaskStage, PrismaClient, TaskType } from '@lani/db';
import {
  atomTypes,
  buildWorkflowSnapshot,
  currentStep,
  parseWorkflow,
} from '@lani/workflow';
import { Atoms } from '@/task/atom';

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
  let store: TaskStore;
  let episodeId: number;
  let seasonId: number;
  let folderId: number;
  let atoms: Atoms;
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
          recover: jest.fn(async () => ({})),
          cancel: jest.fn(async () => undefined),
        },
      ]),
    ) as unknown as Atoms;
    store = new TaskStore(prisma as PrismaService);
    service = new TaskService(
      prisma as PrismaService,
      store,
      atoms.submitDownload as never,
      atoms.download as never,
      atoms.findVideoFile as never,
      atoms.importFile as never,
      atoms.writeMetadata as never,
      atoms.refreshPlayer as never,
      atoms.publishEpisode as never,
    );
    downloads = new DownloadJobService(prisma as PrismaService, service);
  });
  afterEach(async () => {
    await service?.onApplicationShutdown();
    if (episodeId) {
      await prisma.task.deleteMany({ where: { episodeId } });
      await prisma.episode.update({
        where: { id: episodeId },
        data: { jellyfinEpisodeId: null },
      });
    }
  });
  afterAll(async () => {
    if (seasonId) await prisma.season.delete({ where: { id: seasonId } });
    if (folderId)
      await prisma.jellyfinFolder.delete({ where: { id: folderId } });
    await prisma.$disconnect();
  });
  it('旧任务启动后失败、不补写流程，重试直接报错且不启动 atom', async () => {
    const old = await prisma.task.create({
      data: { episodeId, legacyStage: LegacyTaskStage.DOWNLOADING },
    });
    await service.onApplicationBootstrap();
    const result = await prisma.task.findUnique({
      where: { id: old.id },
    });
    expect(result?.isFailed).toBe(true);
    expect(result?.workflow).toBeNull();
    expect(result?.type).toBe(TaskType.DOWNLOAD);
    await expect(service.retryTask(old.id)).rejects.toThrow('旧任务不允许重试');
    expect(atoms.download.run).not.toHaveBeenCalled();
    expect((await service.getTaskStates([old.id]))[0].canRetry).toBe(false);
  });
  it('新建任务保存快照，失败后允许另建任务', async () => {
    const first = await downloads.downloadTorrentForEpisode(
      episodeId,
      'magnet:test',
    );
    // 等待执行失败落库，避免把旧任务仍运行时的重复提交当作新建。
    for (let i = 0; i < 100; ++i) {
      if ((await prisma.task.findUnique({ where: { id: first } }))?.isFailed)
        break;
      await new Promise((done) => setTimeout(done, 10));
    }
    const second = await downloads.downloadTorrentForEpisode(
      episodeId,
      'magnet:other',
    );
    expect(second).not.toBe(first);
    const [state] = await service.getTaskStates([second]);
    expect(state.type).toBe(TaskType.DOWNLOAD);
    expect(state.workflow?.steps.map((step) => step.atom)).toEqual(
      downloadDefinition.map((step) => step.atom),
    );
  });
  it('并发创建同集下载时，Prisma 插入事务只创建一个运行任务', async () => {
    jest.spyOn(service, 'start').mockResolvedValue();
    const ids = await Promise.all([
      downloads.downloadTorrentForEpisode(episodeId, 'magnet:one'),
      downloads.downloadTorrentForEpisode(episodeId, 'magnet:two'),
    ]);
    expect(ids[0]).toBe(ids[1]);
    expect(await prisma.task.count({ where: { episodeId } })).toBe(1);
  });
  it('状态提交 CAS 拒绝旧版本，取消获胜后不能写入迟到产物', async () => {
    const flow = buildWorkflowSnapshot(
      downloadDefinition,
      atoms,
      new Date().toISOString(),
    );
    const job = await prisma.task.create({
      data: {
        episodeId,
        legacyStage: LegacyTaskStage.DOWNLOADING,
        workflow: JSON.parse(JSON.stringify(flow)),
      },
    });
    const stale = await store.read(job.id);
    await service.cancelTask(job.id);
    const succeeded = parseWorkflow(stale.workflow);
    succeeded.status = 'succeeded';
    succeeded.finishedAt = new Date().toISOString();
    expect(
      await store.commit(stale, succeeded, {
        jellyfinEpisodeId: 'late',
      }),
    ).toBe(false);
    expect(
      (await prisma.task.findUnique({ where: { id: job.id } }))
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
    const first = await prisma.task.create({
      data: {
        episodeId,
        legacyStage: LegacyTaskStage.IMPORTING,
        workflow: JSON.parse(JSON.stringify(flow)),
      },
    });
    const second = await prisma.task.create({
      data: {
        episodeId,
        legacyStage: LegacyTaskStage.IMPORTING,
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
      (await prisma.task.findUnique({ where: { id: first.id } }))?.version,
    ).toBe(0);
  });
  it('其他任务已经发布后，旧失败任务不能重新进入发布区段', async () => {
    await prisma.task.create({
      data: { episodeId, legacyStage: LegacyTaskStage.AVAILABLE },
    });
    const flow = buildWorkflowSnapshot(
      downloadDefinition,
      atoms,
      new Date().toISOString(),
    );
    flow.currentStepId = 'import';
    const retry = await prisma.task.create({
      data: {
        episodeId,
        legacyStage: LegacyTaskStage.IMPORTING,
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
  it('并发提交只有一个版本获胜，成功后不能取消', async () => {
    const flow = buildWorkflowSnapshot(
      downloadDefinition,
      atoms,
      new Date().toISOString(),
    );
    const task = await prisma.task.create({
      data: {
        episodeId,
        legacyStage: LegacyTaskStage.PLAYER_WAITING,
        workflow: JSON.parse(JSON.stringify(flow)),
      },
    });
    const state = await store.read(task.id);
    const succeeded = parseWorkflow(state.workflow);
    succeeded.status = 'succeeded';
    succeeded.finishedAt = new Date().toISOString();
    const results = await Promise.all([
      store.commit(state, succeeded, { jellyfinEpisodeId: 'winner' }),
      store.commit(state, succeeded, { jellyfinEpisodeId: 'loser' }),
    ]);
    expect(results.filter(Boolean)).toHaveLength(1);
    const saved = await prisma.task.findUnique({ where: { id: task.id } });
    expect(saved?.version).toBe(1);
    expect(saved?.jellyfinEpisodeId).toBe(results[0] ? 'winner' : 'loser');
    await expect(service.cancelTask(task.id)).rejects.toThrow('任务已完成');
  });
  it.each(['failed', 'cancelled'] as const)(
    '关联完成后任务变为 %s，其他任务仍不能进入发布区段',
    async (status) => {
      const flow = buildWorkflowSnapshot(
        downloadDefinition,
        atoms,
        new Date().toISOString(),
      );
      flow.currentStepId = 'import';
      await prisma.task.create({
        data: {
          episodeId,
          legacyStage: LegacyTaskStage.PLAYER_WAITING,
          isFailed: status === 'failed',
          isCancelled: status === 'cancelled',
          jellyfinEpisodeId: 'published',
          workflow: JSON.parse(
            JSON.stringify({ ...flow, status, publicationClaimed: true }),
          ),
        },
      });
      const retry = await prisma.task.create({
        data: {
          episodeId,
          legacyStage: LegacyTaskStage.IMPORTING,
          workflow: JSON.parse(JSON.stringify(flow)),
        },
      });
      const claim = () =>
        claimEpisodePublication(prisma as PrismaService, retry.id, {
          stepId: 'import',
          attempt: 0,
          checkpoint: {},
          assertActive: async () => undefined,
          saveCheckpoint: async () => undefined,
          wait: async () => undefined,
          waitFor: async (operation) => operation,
        });
      // 仅刷新识别到条目不等于完成发布，不应阻止失败后的另建任务。
      await expect(claim()).resolves.toBeUndefined();
      await prisma.episode.update({
        where: { id: episodeId },
        data: { jellyfinEpisodeId: 'published' },
      });
      await expect(claim()).rejects.toThrow('其他任务正在发布或已发布');
    },
  );
});

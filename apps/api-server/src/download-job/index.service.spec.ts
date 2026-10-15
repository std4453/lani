import { DownloadJobService } from './index.service';
import { downloadDefinition } from './definition';
import { TaskService } from '@/task/index.service';
import { TaskStore } from '@/task/task-store';
import { claimEpisodePublication } from '@/task/atoms/publication';
import { PublishEpisodeAtom } from '@/task/atoms/publish-episode.atom';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '@/common/prisma.service';
import { LegacyTaskStage, PrismaClient, TaskType } from '@lani/db';
import {
  atomTypes,
  buildWorkflowSnapshot,
  currentStep,
  parseWorkflow,
  requestCancellation,
} from '@lani/workflow';
import { WorkflowRunner } from '@/task/workflow-runner';
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
  const contextFor = async (id: number) => {
    const task = await store.read(id);
    return new WorkflowRunner(store, atoms, jest.fn())['context'](
      task,
      task.workflow.currentStepId,
    );
  };
  const createImportTask = async () => {
    const workflow = buildWorkflowSnapshot(
      downloadDefinition,
      atoms,
      new Date().toISOString(),
    );
    workflow.currentStepId = 'import';
    currentStep(workflow).status = 'running';
    return prisma.task.create({
      data: {
        episodeId,
        legacyStage: LegacyTaskStage.IMPORTING,
        workflow: JSON.parse(JSON.stringify(workflow)),
      },
    });
  };
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
  it('原子事务回滚同时撤销业务写入和检查点，内存只在提交后更新', async () => {
    const task = await createImportTask();
    const context = await contextFor(task.id);
    await expect(
      context.transaction(async ({ tx, saveCheckpoint }) => {
        await tx.episode.update({
          where: { id: episodeId },
          data: { jellyfinEpisodeId: 'rollback' },
        });
        await saveCheckpoint({ publicationClaimed: true });
        expect(context.checkpoint.publicationClaimed).toBeUndefined();
        throw new Error('rollback');
      }),
    ).rejects.toThrow('rollback');
    expect(
      (await prisma.episode.findUnique({ where: { id: episodeId } }))
        ?.jellyfinEpisodeId,
    ).toBeNull();
    expect((await store.read(task.id)).version).toBe(0);
    expect(context.checkpoint.publicationClaimed).toBeUndefined();
    await context.transaction(({ saveCheckpoint }) =>
      saveCheckpoint({ publicationClaimed: true }),
    );
    expect(context.checkpoint.publicationClaimed).toBe(true);
    expect((await store.read(task.id)).version).toBe(1);
  });
  it('执行事务与取消串行提交，取消不丢失已写检查点且阻止后续业务事务', async () => {
    const task = await createImportTask();
    const context = await contextFor(task.id);
    const runner = new WorkflowRunner(store, atoms, jest.fn());
    let cancel: Promise<void>;
    await context.transaction(async ({ saveCheckpoint }) => {
      cancel = runner.transition(task.id, (workflow) =>
        requestCancellation(workflow, new Date().toISOString()),
      );
      await saveCheckpoint({ publicationClaimed: true });
    });
    await cancel!;
    const saved = await store.read(task.id);
    expect(saved.workflow.status).toBe('cancelling');
    expect(currentStep(saved.workflow).checkpoint.publicationClaimed).toBe(
      true,
    );
    const operation = jest.fn();
    await expect(context.transaction(operation)).rejects.toThrow();
    expect(operation).not.toHaveBeenCalled();
  });
  it('同集两个任务同时申请发布，只有一个获得占用且不会死锁', async () => {
    const tasks = await Promise.all([createImportTask(), createImportTask()]);
    const results = await Promise.allSettled(
      tasks.map(async (task) =>
        claimEpisodePublication(task.id, await contextFor(task.id)),
      ),
    );
    expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
    expect(results.filter((r) => r.status === 'rejected')).toHaveLength(1);
    const saved = await Promise.all(tasks.map((task) => store.read(task.id)));
    expect(
      saved.filter(
        (task) => currentStep(task.workflow).checkpoint.publicationClaimed,
      ),
    ).toHaveLength(1);
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
    expect(result?.failedReason).toBe('旧版任务已失效，请重新创建');
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
    currentStep(flow).checkpoint.publicationClaimed = true;
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
      claimEpisodePublication(state.id, await contextFor(state.id)),
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
      claimEpisodePublication(state.id, await contextFor(state.id)),
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
    '相同识别ID不阻断发布恢复，真正发布后变为 %s 仍保护成果',
    async (status) => {
      const flow = buildWorkflowSnapshot(
        downloadDefinition,
        atoms,
        new Date().toISOString(),
      );
      flow.currentStepId = 'publish';
      currentStep(flow).status = 'running';
      currentStep(flow).attempt = 1;
      // A 仅识别到 Jellyfin 条目，尚未关联即失败。
      await prisma.task.create({
        data: {
          episodeId,
          legacyStage: LegacyTaskStage.PLAYER_WAITING,
          isFailed: true,
          jellyfinEpisodeId: 'published',
          workflow: JSON.parse(
            JSON.stringify({
              ...flow,
              status: 'failed',
            }),
          ),
        },
      });
      const publisher = await prisma.task.create({
        data: {
          episodeId,
          legacyStage: LegacyTaskStage.PLAYER_WAITING,
          jellyfinEpisodeId: 'published',
          workflow: JSON.parse(JSON.stringify(flow)),
        },
      });
      const context = await contextFor(publisher.id);
      const emitter = new EventEmitter2();
      const emit = jest.spyOn(emitter, 'emit');
      const publish = new PublishEpisodeAtom(prisma as PrismaService, emitter);
      // B 关联已提交、任务尚未收尾时恢复，A 的相同 ID 不能被当作发布归属。
      await publish.run(publisher.id, publisher, context);
      await publish.recover(publisher.id, publisher, context);
      expect(emit).toHaveBeenCalledTimes(1);
      const saved = await store.read(publisher.id);
      expect(currentStep(saved.workflow).checkpoint.episodePublished).toBe(
        true,
      );
      expect(saved.workflow.status).toBe('running');
      expect(
        (await prisma.episode.findUnique({ where: { id: episodeId } }))
          ?.jellyfinEpisodeId,
      ).toBe('published');
      const terminal = parseWorkflow(saved.workflow);
      terminal.status = status;
      terminal.finishedAt = new Date().toISOString();
      expect(await store.commit(saved, terminal)).toBe(true);
      flow.currentStepId = 'import';
      const retry = await prisma.task.create({
        data: {
          episodeId,
          legacyStage: LegacyTaskStage.IMPORTING,
          workflow: JSON.parse(JSON.stringify(flow)),
        },
      });
      await expect(
        claimEpisodePublication(retry.id, await contextFor(retry.id)),
      ).rejects.toThrow('其他任务正在发布或已发布');
    },
  );
});

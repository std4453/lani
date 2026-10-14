import { JobService, downloadDefinition } from './index.service';
import { PrismaService } from '@/common/prisma.service';
import { DownloadStatus, PrismaClient, TaskType } from '@lani/db';
import {
  atomTypes,
  createWorkflow,
  currentStep,
  parseWorkflow,
} from '@lani/download-workflow';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Atoms } from './workflow-runner';

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
  let service: JobService;
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
    service = new JobService(
      prisma as PrismaService,
      emitter,
      atoms.submitDownload as never,
      atoms.download as never,
      atoms.findVideoFile as never,
      atoms.importFile as never,
      atoms.writeMetadata as never,
      atoms.refreshPlayer as never,
    );
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
  });
  it('新建任务保存快照，失败后允许另建任务', async () => {
    const first = await service.downloadTorrentForEpisode(
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
    const second = await service.downloadTorrentForEpisode(
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
  it('状态提交 CAS 拒绝旧版本，取消获胜后不能完成或关联剧集', async () => {
    const flow = createWorkflow(
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
    const stale = await (service as any).read(job.id);
    await service.cancelDownloadJob(job.id);
    const succeeded = parseWorkflow(stale.workflow);
    succeeded.status = 'succeeded';
    succeeded.finishedAt = new Date().toISOString();
    expect(
      await (service as any).commit(stale, succeeded, {
        refreshPlayer: { jellyfinEpisodeId: 'late' },
      }),
    ).toBe(false);
    expect(
      (await prisma.episode.findUnique({ where: { id: episodeId } }))
        ?.jellyfinEpisodeId,
    ).toBeNull();
  });
  it('同集另一任务占用发布区段时 fail-fast', async () => {
    const flow = createWorkflow(
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
    const state = await (service as any).read(second.id);
    currentStep(state.workflow).status = 'running';
    await expect(
      (service as any).commit(state, state.workflow, {}, true),
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
    const flow = createWorkflow(
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
    const state = await (service as any).read(retry.id);
    await expect(
      (service as any).commit(state, state.workflow, {}, true),
    ).rejects.toThrow('其他任务正在发布或已发布');
  });
  it('仅获胜的成功提交关联剧集并发出一次完成通知', async () => {
    const flow = createWorkflow(
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
    const state = await (service as any).read(job.id);
    const succeeded = parseWorkflow(state.workflow);
    succeeded.status = 'succeeded';
    succeeded.finishedAt = new Date().toISOString();
    const emit = jest.spyOn(emitter, 'emit');
    const results = await Promise.all([
      (service as any).commit(state, succeeded, {
        refreshPlayer: { jellyfinEpisodeId: 'winner' },
      }),
      (service as any).commit(state, succeeded, {
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
  it('列表签名只返回所选分页及筛选的任务', async () => {
    await prisma.downloadJob.createMany({
      data: [
        { episodeId, status: DownloadStatus.DOWNLOADING, isFailed: true },
        { episodeId, status: DownloadStatus.DOWNLOADING, isFailed: false },
      ],
    });
    const result = await service.getDownloadJobListSignature(
      0,
      1,
      [true],
      [TaskType.DOWNLOAD],
    );
    expect(result.ids).toHaveLength(1);
    expect(result.total).toBe(1);
  });
});

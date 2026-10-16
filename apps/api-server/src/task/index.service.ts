import { EpisodeAtom } from './episode-atom';
import { taskInput } from './task-input';
import { FindImportFilesAtom } from './atoms/find-import-files.atom';
import { SubmitDownloadAtom } from './atoms/submit-download.atom';
import { DownloadAtom } from './atoms/download-atom';
import { FindVideoFileAtom } from './atoms/find-video-file.atom';
import { ImportFileAtom } from './atoms/import-file.atom';
import { WriteMetadataAtom } from './atoms/write-metadata.atom';
import { RefreshPlayerAtom } from './atoms/refresh-player.atom';
import { PublishEpisodeAtom } from './atoms/publish-episode.atom';
import { PrismaService } from '@/common/prisma.service';
import { LaniError } from '@/utils/error';
import { LegacyTaskStage, Prisma, TaskType } from '@lani/db';
import {
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import { Args, ID, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import {
  parseWorkflow,
  buildWorkflowSnapshot,
  StepDefinition,
  requestCancellation,
  retryWorkflow,
} from '@lani/workflow';
import { TaskState } from './index.model';
import { WorkflowRunner } from './workflow-runner';
import { TaskStore } from './task-store';
import { Atoms } from './atom';
import { legacyTaskFields } from './legacy-compat';

export interface TaskParams {
  episodeId?: number;
  torrentLink?: string;
  entries?: Array<{ episodeId: number; sourcePath?: string }>;
}

@Injectable()
@Resolver()
export class TaskService
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  private readonly atoms: Atoms;
  private readonly runner: WorkflowRunner;
  constructor(
    private prisma: PrismaService,
    store: TaskStore,
    submitDownload: SubmitDownloadAtom,
    download: DownloadAtom,
    findVideoFile: FindVideoFileAtom,
    importFile: ImportFileAtom,
    writeMetadata: WriteMetadataAtom,
    refreshPlayer: RefreshPlayerAtom,
    publishEpisode: PublishEpisodeAtom,
    findImportFiles: FindImportFilesAtom,
  ) {
    this.atoms = {
      submitDownload,
      download,
      findImportFiles: new EpisodeAtom(findImportFiles),
      findVideoFile: new EpisodeAtom(findVideoFile),
      importFile: new EpisodeAtom(importFile),
      writeMetadata: new EpisodeAtom(writeMetadata),
      refreshPlayer: new EpisodeAtom(refreshPlayer),
      publishEpisode: new EpisodeAtom(publishEpisode),
    };
    const logger = new Logger(TaskService.name);
    this.runner = new WorkflowRunner(store, this.atoms, (error) =>
      logger.error(error),
    );
  }
  async create(
    tx: Prisma.TransactionClient,
    type: TaskType,
    definition: StepDefinition[],
    params: TaskParams,
  ) {
    const workflow = buildWorkflowSnapshot(
      definition,
      this.atoms,
      new Date().toISOString(),
    );
    return tx.task.create({
      data: {
        torrentLink: params.torrentLink,
        episodes: {
          create: (
            params.entries ??
            (params.episodeId ? [{ episodeId: params.episodeId }] : [])
          ).map((entry, position) => ({ ...entry, position })),
        },
        type,
        ...legacyTaskFields(workflow),
        workflow: JSON.parse(JSON.stringify(workflow)),
      },
    });
  }
  start(taskId: number) {
    return this.runner.start(taskId);
  }
  @Mutation(() => ID)
  async retryTask(@Args('taskId') taskId: number) {
    const task = await this.prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw new LaniError('任务不存在');
    if (!task.workflow) throw new LaniError('旧任务不允许重试');
    await this.runner.transition(taskId, (workflow) =>
      retryWorkflow(workflow, new Date().toISOString()),
    );
    void this.runner.start(taskId);
    return 'ok';
  }
  @Mutation(() => ID)
  async cancelTask(@Args('taskId') taskId: number) {
    const task = await this.prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw new LaniError('任务不存在');
    if (!task.workflow) throw new LaniError('旧任务不允许取消');
    await this.runner.transition(taskId, (workflow) =>
      requestCancellation(workflow, new Date().toISOString()),
    );
    void this.runner.start(taskId);
    return 'ok';
  }
  @Query(() => [TaskState])
  async getTaskStates(
    @Args({ name: 'taskIds', type: () => [Int] }) taskIds: number[],
  ) {
    if (!taskIds.length) return [];
    const tasks = await this.prisma.task.findMany({
      where: { id: { in: taskIds } },
      include: { episodes: { orderBy: { position: 'asc' } } },
    });
    return tasks.map((task) => {
      const workflow = task.workflow ? parseWorkflow(task.workflow) : null;
      return {
        ...taskInput(task),
        entries: task.episodes,
        workflow,
        canRetry: !!workflow && workflow.status === 'failed',
        canCancel:
          !!workflow &&
          !workflow.cancellation &&
          workflow.status !== 'succeeded' &&
          workflow.status !== 'cancelled',
      };
    });
  }
  async onApplicationBootstrap() {
    await this.prisma.task.updateMany({
      where: {
        workflow: { equals: Prisma.DbNull },
        isFailed: false,
        isCancelled: false,
        legacyStage: { not: LegacyTaskStage.AVAILABLE },
      },
      data: {
        isFailed: true,
        failedAt: new Date(),
        failedReason: '旧版任务已失效，请重新创建',
        updatedAt: new Date(),
        version: { increment: 1 },
      },
    });
    const tasks = await this.prisma.task.findMany({
      where: {
        workflow: { not: Prisma.DbNull },
        isFailed: false,
        isCancelled: false,
        legacyStage: { not: LegacyTaskStage.AVAILABLE },
      },
    });
    for (const task of tasks) void this.runner.start(task.id);
  }
  async onApplicationShutdown() {
    await this.runner.stop();
  }
}

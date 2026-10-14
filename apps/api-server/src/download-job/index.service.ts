import { PrismaService } from '@/common/prisma.service';
import { StepInput } from './atoms';
import { DownloadAtom } from './atoms/download-atom';
import { FindVideoFileAtom } from './atoms/find-video-file.atom';
import { ImportFileAtom } from './atoms/import-file.atom';
import { RefreshPlayerAtom } from './atoms/refresh-player.atom';
import { SubmitDownloadAtom } from './atoms/submit-download.atom';
import { DownloadWorkflowDefinition } from './atoms/types';
import { WriteMetadataAtom } from './atoms/write-metadata.atom';
import { EpisodePublishEvent, EPISODE_PUBLISH_EVENT } from './events';
import { LaniError } from '@/utils/error';
import { LaniFilterCron } from '@/utils/GraphQLExceptionFilter';
import { DownloadJob, DownloadStatus, Prisma, TaskType } from '@lani/db';
import {
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Args, ID, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Cron } from '@nestjs/schedule';
import {
  AtomType,
  createWorkflow,
  currentStep,
  DownloadWorkflow,
  parseWorkflow,
  requestCancellation,
  retryWorkflow,
  StepDefinition,
} from '@lani/download-workflow';
import {
  Atoms,
  Output,
  StoredWorkflow,
  WorkflowRunner,
} from './workflow-runner';
import { DownloadLifecycle, JobListSignature } from './index.model';
import { fileIdentity, sameFile } from './atoms/import-file.operation';

const legacyStatus: Record<AtomType, DownloadStatus> = {
  submitDownload: DownloadStatus.DOWNLOAD_SUBMITTING,
  download: DownloadStatus.DOWNLOADING,
  findVideoFile: DownloadStatus.DOWNLOAD_COMPLETED,
  importFile: DownloadStatus.IMPORTING,
  writeMetadata: DownloadStatus.WRITING_METADATA,
  refreshPlayer: DownloadStatus.PLAYER_WAITING,
};
/** 这是当前下载业务的一个流程定义，执行器不依赖其数量或顺序。 */
export const downloadDefinition: StepDefinition[] = [
  { id: 'submit', atom: 'submitDownload', title: '提交下载' },
  { id: 'download', atom: 'download', title: '下载' },
  { id: 'find', atom: 'findVideoFile', title: '寻找视频文件' },
  { id: 'import', atom: 'importFile', title: '导入文件' },
  { id: 'metadata', atom: 'writeMetadata', title: '写入元数据' },
  { id: 'player', atom: 'refreshPlayer', title: '刷新 Jellyfin' },
];

@Injectable()
@Resolver()
export class JobService
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  private logger = new Logger(JobService.name);
  private atoms: Atoms;
  private runner: WorkflowRunner;
  constructor(
    private prisma: PrismaService,
    private emitter: EventEmitter2,
    submitDownload: SubmitDownloadAtom,
    download: DownloadAtom,
    findVideoFile: FindVideoFileAtom,
    importFile: ImportFileAtom,
    writeMetadata: WriteMetadataAtom,
    refreshPlayer: RefreshPlayerAtom,
  ) {
    this.atoms = {
      submitDownload,
      download,
      findVideoFile,
      importFile,
      writeMetadata,
      refreshPlayer,
    };
    this.runner = new WorkflowRunner(
      {
        read: (id) => this.read(id),
        commit: (...args) => this.commit(...args),
      },
      this.atoms,
      (error) => this.logger.error(error),
    );
  }
  private async read(id: number): Promise<StoredWorkflow> {
    const job = await this.prisma.downloadJob.findUnique({ where: { id } });
    if (!job.workflow) throw new LaniError('旧任务不允许启动');
    return {
      id,
      version: job.version,
      workflow: parseWorkflow(job.workflow),
      input: this.jobToInput(job),
    };
  }
  private async commit(
    job: StoredWorkflow,
    next: DownloadWorkflow,
    output: Output = {},
    claimPublication = false,
  ) {
    const workflow = parseWorkflow(next);
    const episodeId = job.input.params.episodeId;
    if (claimPublication && !episodeId) throw new LaniError('剧集已被删除');
    const file = workflow.steps.find((step) => step.atom === 'importFile')
      ?.checkpoint.file;
    if (
      claimPublication &&
      currentStep(workflow).atom !== 'importFile' &&
      file &&
      !sameFile(await fileIdentity(file.target), file.stagedIdentity)
    ) {
      throw new LaniError('已导入文件已变化或丢失');
    }
    const status =
      workflow.status === 'succeeded'
        ? DownloadStatus.AVAILABLE
        : legacyStatus[currentStep(workflow).atom];
    const hash =
      output.submitDownload?.qbtTorrentHash ??
      workflow.steps.find((step) => step.atom === 'submitDownload')?.checkpoint
        .submission?.hash;
    const result = await this.prisma.$transaction([
      // 锁只跨越数据库检查与状态提交，不在外部网络或文件操作期间持有。
      this.prisma.$queryRaw`SELECT pg_advisory_xact_lock(14521, ${
        episodeId ?? -job.id
      })::text`,
      this.prisma.$queryRaw<{ id: number }[]>`
        UPDATE download_jobs SET workflow=${JSON.stringify(
          workflow,
        )}::jsonb, version=version+1, updated_at=now(),
          status=${status}::download_status, is_failed=${
        workflow.status === 'failed'
      },
          failed_at=${
            workflow.error ? new Date(workflow.error.at) : null
          }, failed_reason=${workflow.error?.message ?? ''},
          is_cancelled=${workflow.status === 'cancelled'}, cancelled_at=${
        workflow.status === 'cancelled' ? new Date(workflow.finishedAt!) : null
      },
          qbt_torrent_hash=COALESCE(${
            hash ?? null
          }, qbt_torrent_hash), torrent_title=COALESCE(${
        output.submitDownload?.torrentTitle ?? null
      }, torrent_title),
          download_path=COALESCE(${
            output.download?.downloadPath ?? null
          }, download_path), import_path=COALESCE(${
        output.findVideoFile?.importPath ?? null
      }, import_path),
          file_path=COALESCE(${
            output.importFile?.filePath ?? null
          }, file_path), nfo_path=COALESCE(${
        output.writeMetadata?.nfoPath ?? null
      }, nfo_path),
          jellyfin_episode_id=COALESCE(${
            output.refreshPlayer?.jellyfinEpisodeId ?? null
          }, jellyfin_episode_id)
        WHERE id=${job.id} AND version=${job.version}
          AND (NOT ${claimPublication} OR NOT EXISTS (
            SELECT 1 FROM download_jobs other WHERE other.episode_id=${
              episodeId ?? null
            } AND other.id<>${job.id}
              AND (other.status='AVAILABLE'::download_status OR
                (other.workflow->>'publicationClaimed'='true' AND other.workflow->>'status' IN ('running','cancelling','succeeded')))
          ))
        RETURNING id`,
      this.prisma.$executeRaw`
        UPDATE episodes SET jellyfin_episode_id=jobs.jellyfin_episode_id FROM download_jobs jobs
        WHERE episodes.id=jobs.episode_id AND jobs.id=${
          job.id
        } AND jobs.version=${job.version + 1}
          AND jobs.workflow->>'status'='succeeded' AND jobs.jellyfin_episode_id IS NOT NULL`,
    ]);
    if (!result[1].length) {
      const latest = await this.prisma.downloadJob.findUnique({
        where: { id: job.id },
      });
      if (claimPublication && latest.version === job.version)
        throw new LaniError('同一剧集的其他任务正在发布或已发布，无法继续');
      return false;
    }
    if (
      workflow.status === 'succeeded' &&
      episodeId &&
      (output.refreshPlayer?.jellyfinEpisodeId ||
        job.input.steps.refreshPlayer?.jellyfinEpisodeId)
    ) {
      const episode = await this.prisma.episode.findUnique({
        where: { id: episodeId },
        include: {
          season: { include: { jellyfinFolder: true, posterImage: true } },
          downloadJobs: { where: { id: job.id } },
        },
      });
      this.emitter.emit(
        EPISODE_PUBLISH_EVENT,
        new EpisodePublishEvent(episode),
      );
    }
    return true;
  }

  @Mutation(() => Int)
  async downloadTorrentForEpisode(
    @Args('episodeId') episodeId: number,
    @Args('torrentLink') torrentLink: string,
  ) {
    const workflow = createWorkflow(
      downloadDefinition,
      this.atoms,
      new Date().toISOString(),
    );
    const results = await this.prisma.$transaction([
      this.prisma
        .$queryRaw`SELECT pg_advisory_xact_lock(14521, ${episodeId})::text`,
      this.prisma.$queryRaw<{ id: number }[]>`
        WITH existing AS (SELECT id FROM download_jobs WHERE episode_id=${episodeId} AND NOT is_failed AND NOT is_cancelled AND status<>'AVAILABLE'::download_status ORDER BY id DESC LIMIT 1),
        inserted AS (INSERT INTO download_jobs (type,episode_id,torrent_link,status,workflow) SELECT 'DOWNLOAD'::task_type,${episodeId},${torrentLink},'DOWNLOAD_SUBMITTING'::download_status,${JSON.stringify(
        workflow,
      )}::jsonb WHERE NOT EXISTS (SELECT 1 FROM existing) RETURNING id)
        SELECT id FROM existing UNION ALL SELECT id FROM inserted`,
    ]);
    const id = results[1][0].id;
    void this.runner.start(id);
    return id;
  }
  @Mutation(() => ID)
  async retryJobStep(@Args('jobId') jobId: number) {
    const original = await this.prisma.downloadJob.findUnique({
      where: { id: jobId },
    });
    if (!original.workflow) throw new LaniError('旧任务不允许重试');
    for (;;) {
      const job = await this.read(jobId);
      const next = retryWorkflow(job.workflow, new Date().toISOString());
      if (next === job.workflow || (await this.commit(job, next))) break;
    }
    void this.runner.start(jobId);
    return 'ok';
  }
  @Mutation(() => ID)
  async cancelDownloadJob(@Args('jobId') jobId: number) {
    for (;;) {
      const job = await this.read(jobId);
      if (job.workflow.status === 'succeeded')
        throw new LaniError('任务已完成');
      const next = requestCancellation(job.workflow, new Date().toISOString());
      if (next === job.workflow || (await this.commit(job, next))) break;
    }
    void this.runner.start(jobId);
    return 'ok';
  }
  @Query(() => [DownloadLifecycle])
  async getDownloadJobStates(
    @Args({ name: 'jobIds', type: () => [Int] }) jobIds: number[],
  ) {
    if (!jobIds.length) return [];
    const jobs = await this.prisma.downloadJob.findMany({
      where: { id: { in: jobIds } },
    });
    return jobs.map((job) => {
      const workflow = job.workflow ? parseWorkflow(job.workflow) : null;
      return {
        ...job,
        id: job.id,
        version: job.version,
        workflow,
        status: job.status,
        isFailed: job.isFailed,
        isCancelled: job.isCancelled,
        failedReason: job.failedReason,
        canRetry: !!workflow && workflow.status === 'failed',
        canCancel:
          !!workflow &&
          !workflow.cancellation &&
          workflow.status !== 'succeeded' &&
          workflow.status !== 'cancelled',
      };
    });
  }
  @Query(() => JobListSignature)
  async getDownloadJobListSignature(
    @Args({ name: 'offset', type: () => Int, defaultValue: 0 }) offset: number,
    @Args({ name: 'first', type: () => Int, defaultValue: 30 }) first: number,
    @Args({ name: 'isFailed', type: () => [Boolean], nullable: true })
    isFailed?: boolean[],
    @Args({ name: 'types', type: () => [TaskType], nullable: true })
    types?: TaskType[],
  ) {
    const where: Prisma.DownloadJobWhereInput = {
      ...(isFailed?.length
        ? { OR: isFailed.map((value) => ({ isFailed: value })) }
        : {}),
      ...(types?.length ? { type: { in: types } } : {}),
    };
    const [jobs, total] = await this.prisma.$transaction([
      this.prisma.downloadJob.findMany({
        where,
        orderBy: { id: 'desc' },
        skip: Math.max(0, offset),
        take: Math.min(100, Math.max(1, first)),
        select: { id: true },
      }),
      this.prisma.downloadJob.count({ where }),
    ]);
    return { ids: jobs.map((job) => job.id), total };
  }
  @Mutation(() => Int)
  async refreshAllDownloadStatus() {
    return this.wakeStatus(DownloadStatus.DOWNLOADING);
  }
  @Mutation(() => Int)
  async refreshAllPlayerWaitingStatus() {
    return this.wakeStatus(DownloadStatus.PLAYER_WAITING);
  }
  private async wakeStatus(status: DownloadStatus) {
    const jobs = await this.prisma.downloadJob.findMany({
      where: {
        status,
        isFailed: false,
        isCancelled: false,
        workflow: { not: Prisma.DbNull },
      },
    });
    for (const job of jobs) void this.runner.start(job.id);
    return jobs.length;
  }
  async onApplicationBootstrap() {
    await this.prisma.downloadJob.updateMany({
      where: {
        workflow: { equals: Prisma.DbNull },
        isFailed: false,
        isCancelled: false,
        status: { not: DownloadStatus.AVAILABLE },
      },
      data: {
        isFailed: true,
        failedAt: new Date(),
        failedReason: '',
        updatedAt: new Date(),
        version: { increment: 1 },
      },
    });
    const jobs = await this.prisma.downloadJob.findMany({
      where: {
        workflow: { not: Prisma.DbNull },
        isFailed: false,
        isCancelled: false,
        status: { not: DownloadStatus.AVAILABLE },
      },
    });
    for (const job of jobs) void this.runner.start(job.id);
  }
  async onApplicationShutdown() {
    await this.runner.stop();
  }
  async findTorrentsToDownload() {
    // pattern 可跨季度复用；按 season_id 关联，按 episodes.id 去重，避免多条规则重复入队。
    // 选择所有：
    // 种子标题符合（未停用的）下载定义、且对应的季度未被删除、对应的剧集已经发布
    // 且没有对应的任务（如果有对应的任务，一般是已经在下载中，无需创建新的下载任务）
    // TODO: 这里目前是根据 jellyfin_episode_id 判断是否已下载的，当前为了快速迭代
    // 先放着，之后需要改成基于具体的剧集状态枚举进行判断
    return this.prisma.$queryRaw<
      {
        torrent_link: string;
        episode_id: number;
      }[]
    >`
      SELECT 
        DISTINCT ON (episodes.id) episodes.id AS episode_id,
		    torrents.torrent_link
      FROM torrents,
        download_sources,
        seasons,
        episodes
      WHERE download_sources.is_disabled = false
        AND torrents.title LIKE download_sources.pattern
        AND download_sources.season_id = episodes.season_id
        AND episodes.season_id = seasons.id
        AND seasons.jellyfin_id != ''
        AND episodes.episode_type = 'EPISODE'
        AND COALESCE(episodes.episode_number, episodes.index) + download_sources.offset = torrents_match_number(torrents)
        AND episodes.jellyfin_episode_id IS NULL
        AND episodes.air_time < now()
		    AND NOT EXISTS (
			    SELECT id from download_jobs WHERE episodes.id = download_jobs.episode_id
	    	)
    `;
  }

  @Cron('*/1 * * * *') // 每分钟运行一次
  @LaniFilterCron()
  async enqueueDownloadJobsScheduledTask() {
    return this.enqueueDownloadJobsInternal();
  }

  @Mutation(() => Int)
  async enqueueDownloadJobs() {
    return this.enqueueDownloadJobsInternal();
  }

  async enqueueDownloadJobsInternal() {
    // 选择所有：
    // 种子标题符合（未停用的）下载定义、且对应的季度未被删除、对应的剧集已经发布
    // 且没有对应的任务（如果有对应的任务，一般是已经在下载中，无需创建新的下载任务）
    const result = await this.findTorrentsToDownload();
    if (result.length > 0) {
      this.logger.log(`Found ${result.length} new torrents to download`);
    }
    for (const { episode_id, torrent_link } of result) {
      try {
        await this.downloadTorrentForEpisode(episode_id, torrent_link);
      } catch (error) {
        this.logger.error(error);
      }
    }
    return result.length;
  }

  private jobToInput(job: DownloadJob): StepInput<DownloadWorkflowDefinition> {
    return {
      id: job.id,
      params: {
        episodeId: job.episodeId ?? undefined,
        torrentLink: job.torrentLink ?? '',
      },
      steps: {
        submitDownload: job.qbtTorrentHash
          ? {
              qbtTorrentHash: job.qbtTorrentHash,
            }
          : undefined,
        download: job.downloadPath
          ? { downloadPath: job.downloadPath }
          : undefined,
        findVideoFile: job.importPath
          ? { importPath: job.importPath }
          : undefined,
        importFile: job.filePath ? { filePath: job.filePath } : undefined,
        writeMetadata: job.nfoPath ? { nfoPath: job.nfoPath } : undefined,
        refreshPlayer: job.jellyfinEpisodeId
          ? { jellyfinEpisodeId: job.jellyfinEpisodeId }
          : undefined,
      },
    };
  }
}

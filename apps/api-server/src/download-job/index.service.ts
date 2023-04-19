import { PrismaService } from '@/common/prisma.service';
import {
  StepCompletion,
  StepInput,
  WorkflowManager,
  WorkflowState,
} from '@/download-job/atoms';
import { DownloadAtom } from '@/download-job/atoms/download-atom';
import { FindVideoFileAtom } from '@/download-job/atoms/find-video-file.atom';
import { ImportFileAtom } from '@/download-job/atoms/import-file.atom';
import { RefreshPlayerAtom } from '@/download-job/atoms/refresh-player.atom';
import { SubmitDownloadAtom } from '@/download-job/atoms/submit-download.atom';
import { DownloadWorkflowDefinition } from '@/download-job/atoms/types';
import { WriteMetadataAtom } from '@/download-job/atoms/write-metadata.atom';
import {
  EpisodePublishEvent,
  EPISODE_PUBLISH_EVENT,
} from '@/download-job/events';
import { LaniError } from '@/utils/error';
import { LaniFilterCron } from '@/utils/GraphQLExceptionFilter';
import { DownloadJob, DownloadStatus } from '@lani/db';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Args, ID, Int, Mutation, Resolver } from '@nestjs/graphql';
import { Cron } from '@nestjs/schedule';

@Injectable()
@Resolver()
export class JobService
  extends WorkflowManager<DownloadWorkflowDefinition>
  implements OnModuleInit
{
  private logger = new Logger(JobService.name);

  constructor(
    private prisma: PrismaService,
    private emitter: EventEmitter2,

    // atoms
    submitDownload: SubmitDownloadAtom,
    download: DownloadAtom,
    findVideoFile: FindVideoFileAtom,
    importFile: ImportFileAtom,
    writeMetadata: WriteMetadataAtom,
    refreshPlayer: RefreshPlayerAtom,
  ) {
    super({
      initialType: 'submitDownload',
      steps: {
        submitDownload: {
          atom: submitDownload,
          next: 'download',
        },
        download: {
          atom: download,
          next: 'findVideoFile',
        },
        findVideoFile: {
          atom: findVideoFile,
          next: 'importFile',
        },
        importFile: {
          atom: importFile,
          next: 'writeMetadata',
        },
        writeMetadata: {
          atom: writeMetadata,
          next: 'refreshPlayer',
        },
        refreshPlayer: {
          atom: refreshPlayer,
        },
      },
    });
  }

  @Mutation(() => Int)
  async downloadTorrentForEpisode(
    @Args('episodeId') episodeId: number,
    @Args('torrentLink') torrentLink: string,
  ) {
    const currentJob = await this.prisma.downloadJob.findFirst({
      where: {
        episodeId,
        isFailed: false,
        isCancelled: false,
        status: {
          not: DownloadStatus.AVAILABLE,
        },
      },
    });
    if (currentJob) {
      throw new LaniError('剧集已在下载中');
    } else {
      return await this.triggerWorkflow({ episodeId, torrentLink });
    }
  }

  @Mutation(() => ID)
  async retryJobStep(@Args('jobId') jobId: number) {
    const job = await this.prisma.downloadJob.findUnique({
      where: { id: jobId },
      include: {
        episode: {
          include: {
            season: true,
          },
        },
      },
    });
    if (!job.isFailed) {
      throw new Error('not failed');
    }
    this.logger.log(
      `Retrying job #${jobId}${
        job.episode
          ? ` (for ${job.episode.season.title} / #${job.episode.index})`
          : ''
      } at step ${job.status}...`,
    );
    await this.prisma.downloadJob.update({
      where: { id: jobId },
      data: {
        isFailed: false,
        failedAt: null,
        failedReason: '',
      },
    });
    this.triggerWorkflowStep(this.jobToInput(job));
    return 'ok';
  }

  async findTorrentsToDownload() {
    // 选择所有：
    // 种子标题符合（未停用的）下载定义、且对应的季度未被删除、对应的剧集已经发布
    // 且没有对应的任务（如果有对应的任务，一般是已经在下载中，无需创建新的下载任务）
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
        AND episodes.index + download_sources.offset = torrents.episode_index
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
        await this.triggerWorkflow({
          episodeId: episode_id,
          torrentLink: torrent_link,
        });
      } catch (error) {
        this.logger.error(error);
      }
    }
    return result.length;
  }

  private completionToStatus(
    completion: StepCompletion<DownloadWorkflowDefinition>,
  ): DownloadStatus {
    switch (completion) {
      case 'submitDownload':
        return DownloadStatus.DOWNLOAD_SUBMITTING;
      case 'download':
        return DownloadStatus.DOWNLOADING;
      case 'findVideoFile':
        return DownloadStatus.DOWNLOAD_COMPLETED;
      case 'writeMetadata':
        return DownloadStatus.WRITING_METADATA;
      case 'importFile':
        return DownloadStatus.IMPORTING;
      case 'refreshPlayer':
        return DownloadStatus.PLAYER_WAITING;
    }
  }

  private statusToCompletion(
    status: DownloadStatus,
  ): StepCompletion<DownloadWorkflowDefinition> {
    switch (status) {
      case DownloadStatus.DOWNLOAD_SUBMITTING:
        return 'submitDownload';
      case DownloadStatus.DOWNLOADING:
        return 'download';
      case DownloadStatus.DOWNLOAD_COMPLETED:
        return 'findVideoFile';
      case DownloadStatus.WRITING_METADATA:
        return 'writeMetadata';
      case DownloadStatus.IMPORTING:
        return 'importFile';
      case DownloadStatus.PLAYER_WAITING:
        return 'refreshPlayer';
      case DownloadStatus.AVAILABLE:
        return 'refreshPlayer';
      default:
        throw new Error(`Unknown status: ${status}`);
    }
  }

  private jobToInput(job: DownloadJob): StepInput<DownloadWorkflowDefinition> {
    return {
      id: job.id,
      completion: this.statusToCompletion(job.status),
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

  protected async createWorkflow(
    completion: StepCompletion<DownloadWorkflowDefinition>,
    params: { episodeId: number; torrentLink: string },
  ) {
    const status = this.completionToStatus(completion);
    this.logger.log(
      `Creating download workflow for episode #${params.episodeId}, starting with status = ${status} (torrent = ${params.torrentLink})`,
    );
    const newJob = await this.prisma.downloadJob.create({
      data: {
        status,
        episodeId: params.episodeId,
        torrentLink: params.torrentLink,
      },
    });
    return this.jobToInput(newJob);
  }

  protected async persistWorkflowState(
    id: number,
    state: WorkflowState<DownloadWorkflowDefinition>,
    finished: boolean,
  ) {
    if (finished) {
      this.logger.log(`Job #${id} completed`);
    } else {
      this.logger.log(`Job #${id} is now at step ${state.completion}`);
    }
    const { episode, ...newJob } = await this.prisma.downloadJob.update({
      where: { id },
      data: {
        status: finished
          ? DownloadStatus.AVAILABLE
          : this.completionToStatus(state.completion),
        qbtTorrentHash: state.steps.submitDownload?.qbtTorrentHash,
        torrentTitle: state.steps.submitDownload?.torrentTitle,
        downloadPath: state.steps.download?.downloadPath,
        importPath: state.steps.findVideoFile?.importPath,
        filePath: state.steps.importFile?.filePath,
        nfoPath: state.steps.writeMetadata?.nfoPath,
        jellyfinEpisodeId: state.steps.refreshPlayer?.jellyfinEpisodeId,
        isFailed: false,
        failedAt: null,
        failedReason: '',
        // 完成流程后设置剧集上的jellyfinEpisodeId
        ...(finished
          ? {
              episode: {
                update: {
                  jellyfinEpisodeId:
                    state.steps.refreshPlayer?.jellyfinEpisodeId,
                },
              },
            }
          : undefined),
      },
      include: {
        episode: {
          include: {
            season: {
              include: {
                jellyfinFolder: true,
                posterImage: true,
              },
            },
          },
        },
      },
    });
    if (finished && episode) {
      this.emitter.emit(
        EPISODE_PUBLISH_EVENT,
        new EpisodePublishEvent(episode),
      );
    }
    return this.jobToInput(newJob);
  }

  protected async persistWorkflowError(id: number, reason: any) {
    this.logger.error(`Job #${id} failed, fail reason:`);
    this.logger.error(reason);
    await this.prisma.downloadJob.update({
      where: { id },
      data: {
        isFailed: true,
        failedAt: new Date(),
        failedReason: reason?.message,
      },
    });
  }

  async onModuleInit() {
    const jobs = await this.prisma.downloadJob.findMany({
      where: {
        isFailed: false,
        status: {
          in: [
            DownloadStatus.DOWNLOAD_SUBMITTING,
            DownloadStatus.DOWNLOADING,
            DownloadStatus.DOWNLOAD_COMPLETED,
            DownloadStatus.WRITING_METADATA,
            DownloadStatus.IMPORTING,
            DownloadStatus.PLAYER_WAITING,
          ],
        },
      },
    });
    for (const job of jobs) {
      const input = this.jobToInput(job);
      this.logger.log(`Resuming job #${job.id} from step ${input.completion}`);
      this.triggerWorkflowStep(input);
    }
  }
}

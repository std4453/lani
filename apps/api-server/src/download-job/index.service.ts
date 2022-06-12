import { PrismaService } from '@/common/prisma.service';
import { DateFormat } from '@/constants/date-format';
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
import { ConflictException, Injectable, OnModuleInit } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Args, ID, Int, Mutation, Resolver } from '@nestjs/graphql';
import { Cron } from '@nestjs/schedule';
import { DownloadJob, DownloadStatus } from '@lani/db';
import dayjs from 'dayjs';

@Injectable()
@Resolver()
export class JobService
  extends WorkflowManager<DownloadWorkflowDefinition>
  implements OnModuleInit
{
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
      throw new ConflictException('A job is already running for this episode');
    } else {
      return await this.triggerWorkflow({ episodeId, torrentLink });
    }
  }

  @Mutation(() => ID)
  async retryJobStep(@Args('jobId') jobId: number) {
    const job = await this.prisma.downloadJob.findUnique({
      where: { id: jobId },
    });
    if (!job.isFailed) {
      return 'not failed';
    }
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

  @Cron('*/1 * * * *') // 每分钟运行一次
  async enqueueDownloadJobs() {
    // this.prisma.episode.findMany({
    //   where: {
    //     jellyfinEpisodeId: null,
    //     season: {
    //       isArchived: false,
    //       jellyfinFolderId: {
    //         not: null,
    //       },
    //       title: {},
    //       downloadSources: {
    //         some: {
    //           isDisabled: false,
    //           isArchived: false,
    //         },
    //       },
    //     },
    //     downloadJobs: {
    //       none: {},
    //     },
    //     airTime: {
    //       lt: new Date(),
    //     },
    //   },
    // });

    // 选择所有：
    // 种子标题符合（未停用的）下载定义、且对应的季度未被删除、对应的剧集已经发布
    // 且没有对应的任务（如果有对应的任务，一般是已经在下载中，无需创建新的下载任务）
    const result = await this.prisma.$queryRaw<
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
        AND download_sources.is_archived = false
        AND torrents.title LIKE download_sources.pattern
        AND download_sources.season_id = episodes.season_id
        AND episodes.season_id = seasons.id
        AND seasons.is_archived = false
        AND seasons.jellyfin_folder_id IS NOT NULL
        AND episodes.index + download_sources.offset = torrents.episode_index
        AND episodes.jellyfin_episode_id IS NULL
        AND episodes.air_time < now()
		    AND NOT EXISTS (
			    SELECT id from download_jobs WHERE episodes.id = download_jobs.episode_id
	    	)
    `;
    if (result.length > 0) {
      console.debug('queued', result.length, 'jobs');
    }
    for (const { episode_id, torrent_link } of result) {
      try {
        await this.triggerWorkflow({
          episodeId: episode_id,
          torrentLink: torrent_link,
        });
      } catch (error) {
        console.error(error);
      }
    }
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
        episodeId: job.episodeId,
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
    const newJob = await this.prisma.downloadJob.create({
      data: {
        status: this.completionToStatus(completion),
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
      console.debug('Job', id, 'finished');
    } else {
      console.debug(
        dayjs().format(DateFormat.DateTime),
        'Running step',
        state.completion,
        'for job',
        id,
      );
    }
    const { episode, ...newJob } = await this.prisma.downloadJob.update({
      where: { id },
      data: {
        status: finished
          ? DownloadStatus.AVAILABLE
          : this.completionToStatus(state.completion),
        qbtTorrentHash: state.steps.submitDownload?.qbtTorrentHash,
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
    if (finished) {
      this.emitter.emit(
        EPISODE_PUBLISH_EVENT,
        new EpisodePublishEvent(episode),
      );
    }
    return this.jobToInput(newJob);
  }

  protected async persistWorkflowError(id: number, reason: any) {
    console.debug('job', id, 'failed:', reason);
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
      console.debug('Enqueuing step', input.completion, 'for job', job.id);
      this.triggerWorkflowStep(input);
    }
  }
}

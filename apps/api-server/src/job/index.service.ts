import { PrismaService } from '@/common/prisma.service';
import {
  StepCompletion,
  StepInput,
  WorkflowManager,
  WorkflowState,
} from '@/job/atoms';
import { DownloadAtom } from '@/job/atoms/download-atom';
import { FindVideoFileAtom } from '@/job/atoms/find-video-file.atom';
import { ImportFileAtom } from '@/job/atoms/import-file.atom';
import { RefreshPlayerAtom } from '@/job/atoms/refresh-player.atom';
import { SubmitDownloadAtom } from '@/job/atoms/submit-download.atom';
import { DownloadWorkflowDefinition } from '@/job/atoms/types';
import { WriteMetadataAtom } from '@/job/atoms/write-metadata.atom';
import { ConflictException, Injectable, OnModuleInit } from '@nestjs/common';
import { Args, ID, Int, Mutation, Resolver } from '@nestjs/graphql';
import { Cron } from '@nestjs/schedule';
import { DownloadJob, DownloadStatus } from '@prisma/client';

@Injectable()
@Resolver()
export class JobService
  extends WorkflowManager<DownloadWorkflowDefinition>
  implements OnModuleInit
{
  constructor(
    private prisma: PrismaService,

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
    // TODO: 检查
    this.triggerWorkflowStep(this.jobToInput(job));
    return 'ok';
  }

  @Cron('*/1 * * * *') // 每分钟运行一次
  async enqueueDownloadJobs() {
    // 选择所有：
    // 种子标题符合（未停用的）下载定义、且对应的季度未被删除、对应的剧集已经发布
    // 且没有对应的任务（如果有对应的任务，一般是已经在下载中，无需创建新的下载任务）
    const result = await this.prisma.$queryRaw<
      {
        torrent_link: string;
        episode_id: number;
      }[]
    >`
      SELECT torrents.torrent_link,
        episodes.id AS episode_id
      FROM torrents,
        download_sources,
        seasons,
        episodes,
        download_jobs
      WHERE download_sources.is_disabled = false
        AND download_sources.is_archived = false
        AND torrents.title ~ download_sources.pattern
        AND download_sources.season_id = episodes.season_id
        AND episodes.season_id = seasons.id
        AND seasons.is_archived = false
        AND seasons.season_root IS NOT NULL
        AND episodes.index = cast(substring(torrents.title FROM download_sources.pattern) AS integer)
        AND episodes.jellyfin_episode_id IS NULL
        AND episodes.air_time < now()
        AND download_jobs.episode_id IS NULL
		    AND episodes.id = download_jobs.episode_id
    `;
    if (result.length > 0) {
      console.debug('queued', result.length, 'jobs');
    }
    for (const { episode_id, torrent_link } of result) {
      this.triggerWorkflow({
        episodeId: episode_id,
        torrentLink: torrent_link,
      });
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
      console.debug('Running step', state.completion, 'for job', id);
    }
    const newJob = await this.prisma.downloadJob.update({
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
      },
    });
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

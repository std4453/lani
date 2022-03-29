import { PrismaService } from '@/common/prisma.service';
import { Atom } from '@/job/atoms';
import { DownloadAtom } from '@/job/atoms/download-atom';
import { FindVideoFileAtom } from '@/job/atoms/find-video-file.atom';
import { ImportFileAtom } from '@/job/atoms/import-file.atom';
import { RefreshPlayerAtom } from '@/job/atoms/refresh-player.atom';
import { SubmitDownloadAtom } from '@/job/atoms/submit-download.atom';
import { WriteMetadataAtom } from '@/job/atoms/write-metadata.atom';
import { RefreshDownloadResult } from '@/job/index.model';
import { ConflictException, Injectable } from '@nestjs/common';
import { Args, ID, Int, Mutation, Resolver } from '@nestjs/graphql';
import { Cron } from '@nestjs/schedule';
import { DownloadJob, DownloadStatus } from '@prisma/client';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

interface JobStep {
  id: DownloadStatus;
  atom: Atom;
  next: DownloadStatus;
}

type JobConfig = JobStep[];

@Injectable()
@Resolver()
export class JobService {
  constructor(
    private prisma: PrismaService,

    // atoms
    private submitDownload: SubmitDownloadAtom,
    private download: DownloadAtom,
    private findVideoFile: FindVideoFileAtom,
    private importFile: ImportFileAtom,
    private writeMetadata: WriteMetadataAtom,
    private refreshPlayer: RefreshPlayerAtom,
  ) {
    dayjs.extend(utc);
  }

  private readonly jobConfig: JobConfig = [
    {
      id: DownloadStatus.DOWNLOAD_SUBMITTING,
      atom: this.submitDownload,
      next: DownloadStatus.DOWNLOADING,
    },
    {
      id: DownloadStatus.DOWNLOADING,
      atom: this.download,
      next: DownloadStatus.DOWNLOAD_COMPLETED,
    },
    {
      id: DownloadStatus.DOWNLOAD_COMPLETED,
      atom: this.findVideoFile,
      next: DownloadStatus.IMPORTING,
    },
    {
      id: DownloadStatus.IMPORTING,
      atom: this.importFile,
      next: DownloadStatus.WRITING_METADATA,
    },
    {
      id: DownloadStatus.WRITING_METADATA,
      atom: this.writeMetadata,
      next: DownloadStatus.PLAYER_WAITING,
    },
    {
      id: DownloadStatus.PLAYER_WAITING,
      atom: this.refreshPlayer,
      next: DownloadStatus.AVAILABLE,
    },
  ];

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
      this.createDownloadJobNoCheck(episodeId, torrentLink);
    }
  }

  private async createDownloadJobNoCheck(
    episodeId: number,
    torrentLink: string,
  ) {
    const newJob = await this.prisma.downloadJob.create({
      data: {
        episodeId,
        torrentLink,
        status: DownloadStatus.DOWNLOAD_SUBMITTING,
      },
    });
    this.triggerJobStep(newJob);
    return newJob.id;
  }

  private triggerJobStep(job: DownloadJob) {
    const step = this.jobConfig.find((step) => step.id === job.status);
    // 如果当前步骤已经是最后一步，则不再执行
    if (step) {
      console.debug('Running step', step.id, 'for job', job.id);
      void this.runStep(job, step);
    } else {
      console.debug('Job', job.id, 'finished');
      // TODO: 错误处理
      void this.prisma.episode.update({
        where: { id: job.episodeId },
        data: {
          jellyfinEpisodeId: job.jellyfinEpisodeId,
        },
      });
    }
  }

  private async runStep(job: DownloadJob, step: JobStep) {
    try {
      const result = await step.atom.run(job);
      const newJob = await this.prisma.downloadJob.update({
        where: { id: job.id },
        data: {
          ...result,
          status: step.next,
          isFailed: false,
          failedAt: null,
          failedReason: '',
        },
      });
      this.triggerJobStep(newJob);
    } catch (error) {
      this.onError(job.id, error);
    }
  }

  @Mutation(() => ID)
  async retryJobStep(@Args('jobId') jobId: number) {
    const job = await this.prisma.downloadJob.findUnique({
      where: { id: jobId },
    });
    this.triggerJobStep(job);
    return 'ok';
  }

  @Mutation(() => RefreshDownloadResult)
  async refreshDownloadStatus(
    @Args('jobId') jobId: number,
  ): Promise<RefreshDownloadResult> {
    const job = await this.prisma.downloadJob.findUnique({
      where: { id: jobId },
    });
    const { status, isFailed } = job;
    if (status !== DownloadStatus.DOWNLOADING) {
      throw new ConflictException(`Job ${jobId} not downloading`);
    }
    if (isFailed) {
      return {
        changed: false,
      };
    }
    // 由于 worker（也就是本进程）不能保证稳定，服务重启时内存中的下载队列会丢失，
    // 所以这里需要重新将下载任务加入队列
    if (!this.download.isTracked(job)) {
      this.triggerJobStep(job);
    }
    return {
      changed: await this.download.refreshDownloadStatus(job),
    };
  }

  @Cron('*/30 * * * * *') // 每 30 秒
  @Mutation(() => Int)
  async refreshAllDownloadStatus() {
    const jobs = await this.prisma.downloadJob.findMany({
      where: { status: DownloadStatus.DOWNLOADING, isFailed: false },
    });
    for (const job of jobs) {
      if (!this.download.isTracked(job)) {
        this.triggerJobStep(job);
      }
    }
    return this.download.batchRefreshDownloadStatus(jobs);
  }

  private async onError(jobId, error: Error) {
    try {
      console.debug('job', jobId, 'failed:', error);
      await this.prisma.downloadJob.update({
        where: { id: jobId },
        data: {
          isFailed: true,
          failedAt: new Date(),
          failedReason: error.message,
        },
      });
    } catch (e) {
      console.error(e);
    }
  }

  @Cron('*/1 * * * *') // 每分钟运行一次
  async enqueueDownloadJobs() {
    // 选择所有：
    // 种子标题符合（未停用的）下载定义、且对应的季度未被删除、对应的剧集已经发布
    // 且没有对应的任务（如果有对应的任务，一般是已经在下载中，无需创建新的下载任务）
    // TODO: 这个查询的性能比较迷幻，性能出问题了再优化吧
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
        episodes
      LEFT JOIN download_jobs ON episodes.id = download_jobs.episode_id
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
    `;
    if (result.length > 0) {
      console.debug('queued', result.length, 'jobs');
    }
    for (const { episode_id, torrent_link } of result) {
      this.createDownloadJobNoCheck(episode_id, torrent_link);
    }
  }
}

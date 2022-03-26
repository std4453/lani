import { GlobalAxiosService } from '@/common/axios.service';
import { PrismaService } from '@/common/prisma.service';
import { ConfigType } from '@/config';
import { RefreshDownloadResult } from '@/job/index.model';
import { QBittorrentService } from '@/job/qbt.service';
import { QBTTorrentState, VIDEO_FILE_MATCHER } from '@/job/types';
import { mapPath, PathMapping } from '@/utils/path';
import { ConflictException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Args, ID, Int, Mutation, Resolver } from '@nestjs/graphql';
import { DownloadStatus } from '@prisma/client';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import FormData from 'form-data';
import fs from 'fs/promises';
import parseTorrent from 'parse-torrent';
import path from 'path';

@Injectable()
@Resolver()
export class JobService {
  constructor(
    private prisma: PrismaService,
    private qbt: QBittorrentService,
    private global: GlobalAxiosService,
    private config: ConfigService<ConfigType>,
  ) {
    dayjs.extend(utc);
  }

  @Mutation(() => Int)
  async downloadTorrentForEpisode(
    @Args('episodeId') episodeId: number,
    @Args('torrentId') torrentId: number,
  ) {
    const { id } = await this.prisma.downloadJob.create({
      data: {
        episodeId,
        torrentId,
        status: DownloadStatus.DOWNLOAD_SUBMITTING,
      },
    });
    void this.submitDownload(id);
    return id;
  }

  private async triggerJobStep(jobId: number) {
    const { status } = await this.prisma.downloadJob.findUnique({
      where: { id: jobId },
    });
    console.debug('running job', jobId, 'step', status, '...');
    switch (status) {
      case DownloadStatus.DOWNLOAD_SUBMITTING:
        void this.submitDownload(jobId);
        return true;
      case DownloadStatus.DOWNLOAD_COMPLETED:
        void this.findVideoFile(jobId);
        return true;
      case DownloadStatus.IMPORTING:
        void this.importFile(jobId);
        return true;
      case DownloadStatus.WRITING_METADATA:
        void this.writeMetadata(jobId);
        return true;
    }
    return false;
  }

  @Mutation(() => ID)
  async retryJobStep(@Args('jobId') jobId: number) {
    if (await this.triggerJobStep(jobId)) {
      return 'ok';
    } else {
      throw new ConflictException(`Cannot trigger job with status '${status}'`);
    }
  }

  private async submitDownload(jobId: number) {
    try {
      const {
        torrent: { torrentLink },
      } = await this.prisma.downloadJob.findUnique({
        where: { id: jobId },
        include: {
          torrent: true,
        },
      });
      const { data } = await this.global.get<Buffer>(torrentLink, {
        responseType: 'arraybuffer',
      });
      const torrent = parseTorrent(data);
      if (!torrent.name || !torrent.infoHash) {
        throw new Error('Invalid torrent file');
      }
      const params = new FormData();
      params.append('torrents', data, {
        filename: torrent.name as string | undefined,
      });
      await this.qbt.post('/torrents/add', params.getBuffer(), {
        headers: params.getHeaders(),
      });
      console.debug(`torrent ${torrent.name} (${torrent.infoHash}) submitted`);
      await this.prisma.downloadJob.update({
        where: { id: jobId },
        data: {
          status: DownloadStatus.DOWNLOADING,
          qbtTorrentHash: torrent.infoHash,
          isFailed: false,
          failedAt: null,
          failedReason: '',
        },
      });
    } catch (error) {
      this.onError(jobId, error);
    }
  }

  @Mutation(() => RefreshDownloadResult)
  async refreshDownloadStatus(
    @Args('jobId') jobId: number,
  ): Promise<RefreshDownloadResult> {
    const { status, qbtTorrentHash, qbtLastSync, isFailed } =
      await this.prisma.downloadJob.findUnique({
        where: { id: jobId },
      });
    if (status !== DownloadStatus.DOWNLOADING) {
      throw new ConflictException(`Job ${jobId} not downloading`);
    }
    if (isFailed) {
      return {
        changed: false,
      };
    }
    const torrent = await this.qbt.getTorrent(qbtTorrentHash);
    if (!torrent) {
      await this.onError(jobId, new Error('Torrent missing'));
      return {
        changed: true,
      };
    }
    switch (torrent.state as QBTTorrentState) {
      case 'error':
      case 'missingFiles':
        await this.onError(
          jobId,
          new Error(`Torrent at invalid state: ${torrent.state}`),
        );
        return {
          changed: true,
        };
    }
    const lastSyncTime = qbtLastSync ? dayjs(qbtLastSync) : dayjs.unix(0);
    if (dayjs.unix(torrent.completion_on).isAfter(lastSyncTime)) {
      await this.prisma.downloadJob.update({
        where: { id: jobId },
        data: {
          status: DownloadStatus.DOWNLOAD_COMPLETED,
          downloadPath: torrent.save_path,
          isFailed: false,
          failedAt: null,
          failedReason: '',
        },
      });
      void this.triggerJobStep(jobId);
      return {
        changed: true,
      };
    }
    return {
      changed: false,
    };
  }

  private async findVideoFile(jobId: number) {
    try {
      const { qbtTorrentHash, downloadPath } =
        await this.prisma.downloadJob.findUnique({
          where: { id: jobId },
        });
      const files = await this.qbt.getFiles(qbtTorrentHash);
      const totalSize = files.reduce((acc, { size }) => acc + size, 0);
      const videoFile = files.find(
        ({ name, size }) =>
          VIDEO_FILE_MATCHER.test(name) && size > 0 && size < totalSize * 0.9,
      );
      if (!videoFile) {
        throw new Error('No video file found or multiple video files');
      }
      await this.prisma.downloadJob.update({
        where: { id: jobId },
        data: {
          status: DownloadStatus.IMPORTING,
          importPath: `${downloadPath}${videoFile.name}`,
          isFailed: false,
          failedAt: null,
          failedReason: '',
        },
      });
      void this.triggerJobStep(jobId);
    } catch (error) {
      this.onError(jobId, error);
    }
  }

  private async importFile(jobId: number) {
    try {
      const {
        importPath,
        episode: {
          title: episodeTitle,
          index,
          season: { title: seasonTitle, seasonRoot },
        },
      } = await this.prisma.downloadJob.findUnique({
        where: { id: jobId },
        include: {
          episode: {
            include: {
              season: true,
            },
          },
        },
      });
      if (!seasonRoot) {
        throw new Error('Season root not set');
      }
      const mappedImportPath = mapPath(
        this.config.get<PathMapping>('qbtPathMapping'),
        importPath,
      );
      const filePath = path.join(
        seasonRoot,
        seasonTitle,
        'Season 1',
        `${seasonTitle} - S01E${index
          .toString()
          .padStart(2, '0')} - ${episodeTitle}${path.extname(importPath)}`,
      );
      const absoluteFilePath = path.join(
        this.config.get('mediaRoot'),
        filePath,
      );
      await fs.mkdir(path.dirname(absoluteFilePath), { recursive: true });
      await fs.link(mappedImportPath, absoluteFilePath);
      await this.prisma.downloadJob.update({
        where: { id: jobId },
        data: {
          status: DownloadStatus.WRITING_METADATA,
          filePath,
          isFailed: false,
          failedAt: null,
          failedReason: '',
        },
      });
      this.triggerJobStep(jobId);
    } catch (error) {
      this.onError(jobId, error);
    }
  }

  private async writeMetadata(jobId: number) {
    try {
    } catch (error) {
      this.onError(jobId, error);
    }
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
}

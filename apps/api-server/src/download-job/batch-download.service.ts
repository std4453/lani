import { PrismaService } from '@/common/prisma.service';
import { IDownloadClient } from '@/download-client/IDownloadClient';
import { readTorrentFiles } from '@/download-client/torrent-files';
import { createEpisodeTask } from '@/task/create-episode-task';
import { TaskService } from '@/task/index.service';
import { VIDEO_FILE_MATCHER } from '@/utils/video-file';
import { LaniError } from '@/utils/error';
import { TaskType } from '@lani/db';
import { Injectable } from '@nestjs/common';
import { Args, Int, Mutation, Resolver } from '@nestjs/graphql';
import { randomUUID } from 'crypto';
import { downloadDefinition } from './definition';
import { BatchDownloadEntry, TorrentPreview } from './batch-download.model';

const PREVIEW_TTL = 15 * 60 * 1000;
const MAX_PREVIEWS = 100;

@Injectable()
@Resolver()
export class BatchDownloadService {
  private submittingPreviews = new Set<string>();
  private previews = new Map<
    string,
    {
      expiresAt: number;
      torrentLink: string;
      clientHash: string;
      files: TorrentPreview['files'];
    }
  >();

  constructor(
    private prisma: PrismaService,
    private tasks: TaskService,
    private client: IDownloadClient,
  ) {}

  @Mutation(() => TorrentPreview)
  async previewTorrent(@Args('torrentId') torrentId: number) {
    const torrent = await this.prisma.torrent.findUnique({
      where: { id: torrentId },
    });
    if (!torrent) throw new LaniError('种子不存在');
    const prepared = await this.client.prepareTorrent(torrent.torrentLink);
    if (!Buffer.isBuffer(prepared.input))
      throw new LaniError('无法从磁力链接预览文件，请选择提供种子文件的资源');
    let files: TorrentPreview['files'];
    try {
      files = readTorrentFiles(prepared.input);
    } catch {
      throw new LaniError('读取种子文件列表失败：种子内容或文件路径无效');
    }
    for (const [token, preview] of this.previews)
      if (preview.expiresAt <= Date.now()) this.previews.delete(token);
    while (this.previews.size >= MAX_PREVIEWS)
      this.previews.delete(this.previews.keys().next().value);
    const token = randomUUID();
    this.previews.set(token, {
      expiresAt: Date.now() + PREVIEW_TTL,
      torrentLink: torrent.torrentLink,
      clientHash: prepared.clientHash,
      files,
    });
    return { token, files };
  }

  @Mutation(() => Int)
  async downloadTorrentForSeason(
    @Args('seasonId') seasonId: number,
    @Args('previewToken') previewToken: string,
    @Args({ name: 'entries', type: () => [BatchDownloadEntry] })
    entries: BatchDownloadEntry[],
  ) {
    const preview = this.previews.get(previewToken);
    if (!preview || preview.expiresAt <= Date.now()) {
      this.previews.delete(previewToken);
      throw new LaniError('种子预览已失效，请返回上一步重新读取');
    }
    if (this.submittingPreviews.has(previewToken))
      throw new LaniError('此种子预览正在提交，请勿重复操作');
    const available = new Set(preview.files.map((file) => file.path));
    if (
      !entries.length ||
      entries.some(
        (entry) =>
          !Number.isInteger(entry.episodeId) ||
          !available.has(entry.path) ||
          !VIDEO_FILE_MATCHER.test(entry.path),
      ) ||
      new Set(entries.map((entry) => entry.path)).size !== entries.length ||
      new Set(entries.map((entry) => entry.episodeId)).size !== entries.length
    )
      throw new LaniError(
        '请选择种子内的视频文件，且每个文件与剧集只能选择一次',
      );
    this.submittingPreviews.add(previewToken);
    try {
      const id = await this.prisma.$transaction(async (tx) => {
        const episodes = await tx.episode.findMany({
          where: {
            id: { in: entries.map((entry) => entry.episodeId) },
            seasonId,
          },
        });
        if (episodes.length !== entries.length)
          throw new LaniError('部分剧集不存在或不属于当前季度');
        const task = await createEpisodeTask(
          this.tasks,
          tx,
          TaskType.BATCH_DOWNLOAD,
          downloadDefinition,
          {
            torrentLink: preview.torrentLink,
            // 提交阶段重新读取种子时核对身份，避免预览之后链接内容被替换。
            qbtTorrentHash: preview.clientHash,
            batchEntries: entries.map((entry) => ({
              id: randomUUID(),
              episodeId: entry.episodeId,
              sourcePath: entry.path,
            })),
          },
          entries.map((entry) => entry.episodeId),
        );
        return task.id;
      });
      this.previews.delete(previewToken);
      void this.tasks.start(id);
      return id;
    } finally {
      this.submittingPreviews.delete(previewToken);
    }
  }
}

import { BatchableEpisodeAtom } from '../batchable-episode-atom';
import { claimEpisodePublication, checkPublication } from './publication';
import {
  getSeasonDirectory,
  resolveSeasonPath,
} from '@/utils/season-directory';
import { jellyfinNumber } from '@/utils/episode-number';
import { PrismaService } from '@/common/prisma.service';
import config from '@/config';
import { AtomContext, TaskInput } from '@/task/atom';
import { mapPath } from '@/utils/path';
import { Injectable } from '@nestjs/common';
import { MediaPoolService } from '@/media-pool/media-pool.service';
import { companions, SUBTITLE } from '@/utils/media-companions';
import fs from 'fs/promises';
import path from 'path';

@Injectable()
export class ImportFileAtom extends BatchableEpisodeAtom {
  readonly wants = [['findVideoFile', 'findImportFiles']] as const;
  constructor(
    private prisma: PrismaService,
    private mediaPool: MediaPoolService,
  ) {
    super();
  }

  protected async runEpisode(
    id: number,
    { episodeId, importPath }: TaskInput,
    context: AtomContext,
  ) {
    if (!importPath) {
      throw new Error('寻找视频文件步骤尚未完成');
    }
    if (!episodeId) {
      throw new Error('剧集已被删除');
    }
    const episode = await this.prisma.episode.findUnique({
      where: { id: episodeId },
      include: {
        season: {
          include: {
            jellyfinFolder: true,
          },
        },
      },
    });
    const {
      season: { jellyfinFolder },
    } = episode;
    const { season: mediaSeason, index } = jellyfinNumber(episode);
    const jellyfinFolderRoot = jellyfinFolder.location;
    const seasonRoot = mapPath(config.jellyfin.pathMapping, jellyfinFolderRoot);

    const sourcePath = mapPath(
      config.downloadClient[config.downloadClient.kind].pathMapping,
      importPath,
    );
    const targetPath = path.join(
      resolveSeasonPath(seasonRoot, getSeasonDirectory(episode.season)),
      // 不加这个 jellyfin识别就会很成问题，还是加上
      `Season ${mediaSeason}`,
      `Episode - S${String(mediaSeason).padStart(2, '0')}E${index
        .toString()
        .padStart(2, '0')}${path.extname(importPath)}`,
    );
    if (context.checkpoint.file && !context.checkpoint.mediaVersionId)
      throw new Error('旧任务缺少媒体版本关联，请重新创建任务');
    let versionId = context.checkpoint.mediaVersionId;
    if (!versionId) {
      const sourceStem = sourcePath.slice(0, -path.extname(sourcePath).length);
      const targetStem = targetPath.slice(0, -path.extname(targetPath).length);
      const subtitles = await companions(sourcePath);
      versionId = await this.mediaPool.register(
        {
          episodeId,
          registrationKey: `task:${id}:${context.entryId ?? 'single'}`,
          mode: 'import',
          files: [
            {
              source: sourcePath,
              target: path.relative(
                resolveSeasonPath(
                  seasonRoot,
                  getSeasonDirectory(episode.season),
                ),
                targetPath,
              ),
              role: 'video',
            },
            ...subtitles.map((source) => ({
              source,
              target: path.relative(
                resolveSeasonPath(
                  seasonRoot,
                  getSeasonDirectory(episode.season),
                ),
                targetStem + source.slice(sourceStem.length),
              ),
              role: 'subtitle' as const,
            })),
          ],
        },
        {
          assertActive: () => context.assertActive(),
          transaction: (write) => context.transaction(({ tx }) => write(tx)),
        },
      );
      await context.saveCheckpoint({ mediaVersionId: versionId });
    }
    await claimEpisodePublication(id, context);
    return { filePath: await this.publish(id, versionId, context) };
  }

  private publish(id: number, versionId: number, context: AtomContext) {
    return this.mediaPool.publish(versionId, {
      assertActive: () => context.assertActive(),
      beforeFiles: async (files) => {
        for (const video of files.filter((file) => file.role === 'video')) {
          // 发布前检查目标命名空间，包括视频尚不存在时遗留的字幕。
          const directory = path.dirname(video.targetPath);
          const stem = path.basename(
            video.targetPath,
            path.extname(video.targetPath),
          );
          const names: string[] = await fs.readdir(directory).catch((error) => {
            if (error.code === 'ENOENT') return [];
            throw error;
          });
          if (
            names.some(
              (name) =>
                SUBTITLE.test(name) &&
                name.startsWith(`${stem}.`) &&
                !files.some(
                  (file) => file.targetPath === path.join(directory, name),
                ),
            )
          )
            throw new Error('媒体目录存在未登记字幕，请确认归属后再替换');
        }
      },
      commit: (write, video) =>
        context.transaction(async (transaction) => {
          if (!context.checkpoint.publicationClaimed)
            throw new Error('任务尚未取得发布资格');
          await checkPublication(id, transaction, false);
          await write(transaction.tx);
          await transaction.saveCheckpoint(
            { mediaPublished: true },
            { filePath: video },
          );
        }),
    });
  }

  protected async cancelEpisode(
    _id: number,
    input: TaskInput,
    context: AtomContext,
  ) {
    if (
      context.checkpoint.publicationClaimed &&
      context.checkpoint.mediaVersionId
    ) {
      await claimEpisodePublication(_id, context);
      await this.publish(_id, context.checkpoint.mediaVersionId, context);
    }
  }
}

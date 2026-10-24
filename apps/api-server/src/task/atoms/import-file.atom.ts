import { BatchableEpisodeAtom } from '../batchable-episode-atom';
import { claimEpisodePublication } from './publication';
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
import { companions } from '@/media-pool/files';
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
    { episodeId, importPath, type }: TaskInput,
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
          operationKey: `task:${id}:${context.entryId ?? 'single'}`,
          source:
            type === 'DOWNLOAD' || type === 'BATCH_DOWNLOAD'
              ? 'download'
              : 'import',
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
        context,
      );
      await context.saveCheckpoint({ mediaVersionId: versionId });
    }
    await claimEpisodePublication(id, context);
    return { filePath: await this.mediaPool.publish(versionId, context) };
  }

  protected async cancelEpisode(
    _id: number,
    input: TaskInput,
    context: AtomContext,
  ) {
    if (context.checkpoint.publicationClaimed && input.episodeId)
      await this.mediaPool.recoverEpisode(input.episodeId);
  }
}

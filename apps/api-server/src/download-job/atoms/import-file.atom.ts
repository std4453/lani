import {
  getSeasonDirectory,
  resolveSeasonPath,
} from '@/utils/season-directory';
import { jellyfinNumber } from '@/utils/episode-number';
import { PrismaService } from '@/common/prisma.service';
import config from '@/config';
import { AsyncAtom, AtomContext, StepInput } from '@/download-job/atoms';
import { DownloadWorkflowDefinition } from '@/download-job/atoms/types';
import { mapPath } from '@/utils/path';
import { Injectable } from '@nestjs/common';
import { importFile } from './import-file.operation';
import path from 'path';

@Injectable()
export class ImportFileAtom extends AsyncAtom<
  DownloadWorkflowDefinition,
  'importFile'
> {
  readonly wants = [['findVideoFile']] as const;
  constructor(private prisma: PrismaService) {
    super();
  }

  async run(
    _id: number,
    { params: { episodeId }, steps }: StepInput<DownloadWorkflowDefinition>,
    context: AtomContext,
  ) {
    if (!steps.findVideoFile) {
      throw new Error('findVideoFile step not finished');
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
      steps.findVideoFile.importPath,
    );
    const targetPath = path.join(
      resolveSeasonPath(seasonRoot, getSeasonDirectory(episode.season)),
      // 不加这个 jellyfin识别就会很成问题，还是加上
      `Season ${mediaSeason}`,
      `Episode - S${String(mediaSeason).padStart(2, '0')}E${index
        .toString()
        .padStart(2, '0')}${path.extname(steps.findVideoFile.importPath)}`,
    );
    const filePath = await importFile(
      _id,
      sourcePath,
      targetPath,
      config.lani.moveStrategy,
      context,
    );
    return { filePath };
  }
}

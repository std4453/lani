import { PrismaService } from '@/common/prisma.service';
import config from '@/config';
import { AsyncAtom, StepInput } from '@/download-job/atoms';
import { DownloadWorkflowDefinition } from '@/download-job/atoms/types';
import { mapPath } from '@/utils/path';
import { resolveChroot } from '@lani/framework';
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import fs from 'fs/promises';
import path from 'path';

@Injectable()
export class ImportFileAtom extends AsyncAtom<
  DownloadWorkflowDefinition,
  'importFile'
> {
  constructor(emitter: EventEmitter2, private prisma: PrismaService) {
    super(emitter, 'importFile');
  }

  async run(
    _id: number,
    { params: { episodeId }, steps }: StepInput<DownloadWorkflowDefinition>,
  ) {
    if (!steps.findVideoFile) {
      throw new Error('findVideoFile step not finished');
    }
    const {
      index,
      season: { title: seasonTitle, jellyfinFolder },
    } = await this.prisma.episode.findUnique({
      where: { id: episodeId },
      include: {
        season: {
          include: {
            jellyfinFolder: true,
          },
        },
      },
    });
    const seasonRoot = jellyfinFolder?.location;
    if (!seasonRoot) {
      throw new Error('jellyfinFolder not set');
    }
    const mappedImportPath = resolveChroot(
      mapPath(
        config.downloadClient.pathMapping,
        steps.findVideoFile.importPath,
      ),
    );
    const filePath = path.join(
      seasonRoot,
      seasonTitle,
      // 不加这个 jellyfin识别就会很成问题，还是加上
      'Season 1',
      `Episode - S01E${index.toString().padStart(2, '0')}${path.extname(
        steps.findVideoFile.importPath,
      )}`,
    );
    const absoluteFilePath = resolveChroot(
      path.join(config.lani.mediaRoot, filePath),
    );
    await fs.mkdir(path.dirname(absoluteFilePath), { recursive: true });
    // 如果源文件不存在，这里直接报错
    const { ino: sourceIno } = await fs.stat(mappedImportPath);
    try {
      const { ino: targetIno } = await fs.stat(absoluteFilePath);
      // 如果目标文件存在但ino不同，覆盖之
      if (sourceIno !== targetIno) {
        await fs.unlink(absoluteFilePath);
        await fs.link(mappedImportPath, absoluteFilePath);
      }
      // 如果ino相同，则内容一定相同，不需要操作
    } catch (error) {
      if (error.code === 'ENOENT') {
        // 如果目标文件不存在，无视错误
        await fs.link(mappedImportPath, absoluteFilePath);
      } else {
        throw error;
      }
    }
    return {
      filePath,
    };
  }
}

import { PrismaService } from '@/common/prisma.service';
import config from '@/config';
import { AsyncAtom, StepInput } from '@/download-job/atoms';
import { DownloadWorkflowDefinition } from '@/download-job/atoms/types';
import { mapPath } from '@/utils/path';
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

  private async tryHardLink(
    sourcePath: string,
    targetPath: string,
  ): Promise<boolean> {
    // 源文件不存在，报错
    const { ino: sourceIno } = await fs.stat(sourcePath);
    try {
      const { ino: targetIno } = await fs.stat(targetPath);
      // 如果目标文件存在但ino不同，覆盖之
      if (sourceIno !== targetIno) {
        await fs.unlink(targetPath);
        try {
          await fs.link(sourcePath, targetPath);
        } catch (error) {
          if (error.code === 'EXDEV') {
            // mount point 不同，无法硬链接
            return false;
          } else {
            throw error;
          }
        }
      }
      // 如果ino相同，则内容一定相同，不需要操作
    } catch (error) {
      if (error.code === 'ENOENT') {
        // 如果目标文件不存在，无视错误
        try {
          await fs.link(sourcePath, targetPath);
        } catch (error) {
          if (error.code === 'EXDEV') {
            // mount point 不同，无法硬链接
            return false;
          } else {
            throw error;
          }
        }
      } else {
        throw error;
      }
    }
    return true;
  }

  private async copy(sourcePath: string, targetPath: string) {
    // 自动覆盖目标文件
    await fs.copyFile(sourcePath, targetPath);
  }

  private async move(sourcePath: string, targetPath: string) {
    // 自动覆盖目标文件
    await fs.rename(sourcePath, targetPath);
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
    const jellyfinFolderRoot = jellyfinFolder.location;
    const seasonRoot = mapPath(config.jellyfin.pathMapping, jellyfinFolderRoot);

    const sourcePath = mapPath(
      config.downloadClient[config.downloadClient.kind].pathMapping,
      steps.findVideoFile.importPath,
    );
    const targetPath = path.join(
      seasonRoot,
      seasonTitle,
      // 不加这个 jellyfin识别就会很成问题，还是加上
      'Season 1',
      `Episode - S01E${index.toString().padStart(2, '0')}${path.extname(
        steps.findVideoFile.importPath,
      )}`,
    );
    await fs.mkdir(path.dirname(targetPath), { recursive: true });

    switch (config.lani.moveStrategy) {
      case 'hardLinkOnly':
        if (!(await this.tryHardLink(sourcePath, targetPath))) {
          throw new Error('无法在不同文件系统之间建立硬链接');
        }
        break;
      case 'hardLinkOrCopy':
        if (await this.tryHardLink(sourcePath, targetPath)) {
          break;
        }
        await this.copy(sourcePath, targetPath);
        break;
      case 'hardLinkOrMove':
        if (await this.tryHardLink(sourcePath, targetPath)) {
          break;
        }
        await this.move(sourcePath, targetPath);
        break;
      case 'copyOnly':
        await this.copy(sourcePath, targetPath);
        break;
      case 'moveOnly':
        await this.move(sourcePath, targetPath);
        break;
    }

    return {
      filePath: targetPath,
    };
  }
}

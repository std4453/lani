import { PrismaService } from '@/common/prisma.service';
import { ConfigType } from '@/config';
import { Atom } from '@/job/atoms';
import { mapPath, PathMapping } from '@/utils/path';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DownloadJob } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';

@Injectable()
export class ImportFileAtom extends Atom {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService<ConfigType, true>,
  ) {
    super();
  }

  async run({ importPath, episodeId }: DownloadJob) {
    if (!importPath) {
      throw new Error('importPath not set');
    }
    const {
      index,
      season: { title: seasonTitle, seasonRoot },
    } = await this.prisma.episode.findUnique({
      where: { id: episodeId },
      include: {
        season: true,
      },
    });
    if (!seasonRoot) {
      throw new Error('seasonRoot not set');
    }
    const mappedImportPath = mapPath(
      this.config.get<PathMapping>('qbtPathMapping'),
      importPath,
    );
    const filePath = path.join(
      seasonRoot,
      seasonTitle,
      // 不加这个 jellyfin识别就会很成问题，还是加上
      'Season 1',
      `Episode - S01E${index.toString().padStart(2, '0')}${path.extname(
        importPath,
      )}`,
    );
    const absoluteFilePath = path.join(this.config.get('mediaRoot'), filePath);
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

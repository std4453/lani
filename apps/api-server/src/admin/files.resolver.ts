import { FileEntry, FileEntryType } from '@/admin/files.model';
import { LaniError } from '@/utils/error';
import { Injectable, Logger } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';
import { readdir, stat } from 'fs/promises';
import nodePath from 'path';

@Injectable()
@Resolver()
export class FilesResolver {
  private logger = new Logger(FilesResolver.name);

  @Query(() => [FileEntry])
  async listFiles(@Args('path') path: string) {
    this.logger.log(`listFiles ${path}`);

    try {
      const files = await readdir(path);

      const filesFullPath = files.map((file) => nodePath.join(path, file));

      const filesWithStat = await Promise.all(
        filesFullPath.map((path) =>
          stat(path, {
            bigint: true,
          }),
        ),
      );

      return files.map((file, index) => {
        const fullPath = filesFullPath[index];
        const stat = filesWithStat[index];
        return <FileEntry>{
          path: fullPath,
          type: stat.isFile() ? FileEntryType.FILE : FileEntryType.DIRECTORY,
          name: file,
          lastModified: stat.mtime,
          size: stat.isFile() ? stat.size : undefined,
        };
      });
    } catch (e) {
      if (e?.code === 'ENOENT') {
        throw new LaniError('目录不存在');
      }
    }
  }
}

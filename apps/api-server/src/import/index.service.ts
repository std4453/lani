import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/prisma.service';
import { TaskService } from '@/task/index.service';
import { TaskType } from '@lani/db';
import { StepDefinition } from '@lani/workflow';
import { LaniError } from '@/utils/error';
import path from 'path';

export const importDefinition: StepDefinition[] = [
  { id: 'find', atom: 'findImportFiles', title: '寻找视频文件' },
  { id: 'import', atom: 'importFile', title: '导入文件' },
  { id: 'metadata', atom: 'writeMetadata', title: '写入元数据' },
  { id: 'player', atom: 'refreshPlayer', title: '刷新 Jellyfin' },
  { id: 'publish', atom: 'publishEpisode', title: '完成' },
];
@Injectable()
export class ImportService {
  constructor(private prisma: PrismaService, private tasks: TaskService) {}
  importSingle(episodeId: number, importPath: string) {
    return this.create([{ episodeId, importPath }], TaskType.IMPORT);
  }
  importMultiple(entries: Array<{ episodeId: number; importPath: string }>) {
    return this.create(entries, TaskType.BATCH_IMPORT);
  }
  private async create(
    entries: Array<{ episodeId: number; importPath: string }>,
    type: TaskType,
  ) {
    if (!entries.length) throw new LaniError('请选择需要导入的文件');
    if (
      entries.some(
        (e) =>
          !Number.isInteger(e.episodeId) ||
          !e.importPath ||
          !path.posix.isAbsolute(e.importPath),
      )
    )
      throw new LaniError('导入参数无效');
    const normalized = entries.map((e) => ({
      episodeId: e.episodeId,
      sourcePath: path.posix.normalize(e.importPath),
    }));
    if (new Set(normalized.map((e) => e.episodeId)).size !== entries.length)
      throw new LaniError('多个文件不能导入同一剧集');
    if (new Set(normalized.map((e) => e.sourcePath)).size !== entries.length)
      throw new LaniError('不能重复选择同一文件');
    const id = await this.prisma.$transaction(async (tx) => {
      const episodes = await tx.episode.findMany({
        where: { id: { in: entries.map((e) => e.episodeId) } },
      });
      if (episodes.length !== entries.length)
        throw new LaniError('部分剧集不存在');
      if (new Set(episodes.map((e) => e.seasonId)).size !== 1)
        throw new LaniError('批量导入必须属于同一季度');
      const task = await this.tasks.create(tx, type, importDefinition, {
        entries: normalized,
      });
      return task.id;
    });
    void this.tasks.start(id);
    return id;
  }
}

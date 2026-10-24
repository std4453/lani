import { Injectable } from '@nestjs/common';
import { Prisma } from '@lani/db';
import fs from 'fs/promises';
import path from 'path';
import config from '@/config';
import { PrismaService } from '@/common/prisma.service';
import { WriteGate, MediaOperations } from '@/application-state/write-gate';
import { MediaPoolService } from '@/media-pool/media-pool.service';
import {
  DirectoryMove,
  prepareDirectoryMove,
  executeDirectoryMove,
  finishDirectoryMove,
  discardUnstartedMove,
} from '@/media-pool/directory-move';
import { assertSeasonIdle, relocateTaskMediaPaths } from '@/task/media-paths';
import { lockEpisode } from '@/task/atoms/publication';
import { seasonMediaRoot } from '@/media-pool/paths';
import { removeDirectoryIdempotent } from '@/utils/idempotency';
import { canonical } from '@/media-pool/files';
import { SeasonWithJellyfinFolder } from '@/types/entities';

interface SeasonMove extends DirectoryMove {
  seasonId: number;
  directory: string;
}

@Injectable()
export class SeasonMediaService {
  constructor(
    private db: PrismaService,
    private pool: MediaPoolService,
    private gate: WriteGate,
    private operations: MediaOperations,
  ) {
    this.operations.recovery = () => this.recoverDirectoryMoves();
  }
  /** 初始化期间由上层显式调用；运行期在共享互斥内先完成未提交的改名。 */
  async recoverDirectoryMoves() {
    const directory = path.join(config.mediaPool.root, 'directory-moves');
    let files: string[];
    try {
      files = await fs.readdir(directory);
    } catch (error) {
      if (error.code === 'ENOENT') return;
      throw error;
    }
    for (const file of files.filter((name) => name.endsWith('.json'))) {
      const filename = path.join(directory, file);
      const move: SeasonMove = JSON.parse(await fs.readFile(filename, 'utf8'));
      await this.finishMove(filename, move);
    }
  }
  private async finishMove(filename: string, move: SeasonMove) {
    await assertSeasonIdle(this.db, move.seasonId);
    await executeDirectoryMove(move);
    await this.db.$transaction(async (tx) => {
      await relocateTaskMediaPaths(
        tx,
        move.seasonId,
        move.oldPath,
        move.newPath,
      );
      await this.pool.relocatePublished(tx, move.oldPath, move.newPath);
      await tx.season.update({
        where: { id: move.seasonId },
        data: {
          directory: move.directory,
          lastWriteDirectory: move.directory,
          jellyfinId: '',
        },
      });
    });
    await finishDirectoryMove(filename);
  }
  /** 调用方持有 MediaOperations，完整元数据写入期间不释放。 */
  async renameWithinOperation(
    seasonId: number,
    oldPath: string,
    newPath: string,
    directory: string,
  ) {
    this.gate.assertReady();
    await assertSeasonIdle(this.db, seasonId);
    const season = await this.db.season.findUnique({
      where: { id: seasonId },
    });
    if (season?.lastWriteDirectory === directory) return;
    const filename = path.join(
      config.mediaPool.root,
      'directory-moves',
      `${seasonId}.json`,
    );
    const move = await prepareDirectoryMove(filename, {
      seasonId,
      oldPath,
      newPath,
      directory,
    });
    try {
      await this.finishMove(filename, move);
    } catch (error) {
      await discardUnstartedMove(filename, move);
      throw error;
    }
  }
  delete(
    seasonId: number,
    afterFiles: (season: SeasonWithJellyfinFolder) => Promise<void>,
  ) {
    this.gate.assertReady();
    return this.operations.run(async () => {
      const season = await this.db.season.findUnique({
        rejectOnNotFound: false,
        where: { id: seasonId },
        include: { jellyfinFolder: true },
      });
      if (!season) return;
      await assertSeasonIdle(this.db, seasonId);
      const directory = seasonMediaRoot(season);
      try {
        const stat = await fs.lstat(directory);
        if (!stat.isDirectory() || stat.isSymbolicLink())
          throw new Error('季度媒体目录不是普通目录');
        await canonical(directory);
      } catch (error) {
        if (error.code !== 'ENOENT') throw error;
      }
      // 保留定位与关联直到递归删除完成；中断后继续删除同一目录。
      await removeDirectoryIdempotent(directory);
      // 刷新失败仍保留季度定位，重试可处理已不存在的目录。
      await afterFiles(season);
      await this.db.$transaction(async (tx) => {
        await assertSeasonIdle(tx, seasonId);
        const episodes = await tx.episode.findMany({
          where: { seasonId },
          orderBy: { id: 'asc' },
        });
        for (const episode of episodes) await lockEpisode(tx, episode.id);
        await tx.mediaAsset.updateMany({
          where: { jellyfinPath: { startsWith: directory + path.sep } },
          data: {
            jellyfinPath: null,
            jellyfinMode: null,
            jellyfinIdentity: Prisma.DbNull,
          },
        });
        await tx.episode.updateMany({
          where: { seasonId },
          data: { currentVersionId: null },
        });
        await tx.episodeVersion.deleteMany({
          where: { episode: { seasonId } },
        });
        await tx.season.delete({ where: { id: seasonId } });
      });
    });
  }
}

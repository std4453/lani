import { Injectable } from '@nestjs/common';
import { Prisma } from '@lani/db';
import fs from 'fs/promises';
import path from 'path';
import config from '@/config';
import { PrismaService } from '@/common/prisma.service';
import { MediaOperations } from '@/common/media-operations';
import { MediaPoolService } from '@/media-pool/media-pool.service';
import {
  DirectoryMove,
  prepareDirectoryMove,
  executeDirectoryMove,
  finishDirectoryMove,
  discardUnstartedMove,
} from '@/media-pool/directory-move';
import { relocateTaskMediaPaths } from '@/task/media-paths';
import { findActiveSeasonTask } from '@/task/queries';
import { lockEpisode } from '@/common/episode-lock';
import { seasonMediaRoot } from '@/media-pool/paths';
import { removeDirectoryIdempotent } from '@/utils/idempotency';
import { canonical } from '@/media-pool/files';
import { SeasonWithJellyfinFolder } from '@/types/entities';
import { getSeasonDirectory } from '@/utils/season-directory';
import { LaniError } from '@/utils/error';

interface SeasonMove extends DirectoryMove {
  seasonId: number;
  directory: string;
}

@Injectable()
export class SeasonMediaService {
  constructor(
    private db: PrismaService,
    private pool: MediaPoolService,
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
    await this.assertSeasonIdle(this.db, move.seasonId);
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
  private async assertSeasonIdle(
    tx: Prisma.TransactionClient,
    seasonId: number,
  ) {
    if (await findActiveSeasonTask(tx, seasonId))
      throw new LaniError(
        '季度仍有进行中或失败的任务，请先处理任务再修改媒体目录',
      );
  }
  private async assertRegistered(seasonId: number) {
    const pending = await this.db.episode.findFirst({
      where: {
        seasonId,
        jellyfinEpisodeId: { not: null },
        currentVersionId: null,
      },
      select: { id: true },
    });
    if (pending)
      throw new LaniError(
        '该季度还有历史媒体待回填，暂时不能改名或删除，请稍后重试',
      );
  }
  /** 调用方持有 MediaOperations，完整元数据写入期间不释放。 */
  async renameWithinOperation(
    seasonId: number,
    oldPath: string,
    newPath: string,
    directory: string,
  ) {
    await this.assertSeasonIdle(this.db, seasonId);
    const season = await this.db.season.findUnique({
      where: { id: seasonId },
    });
    if (season?.lastWriteDirectory === directory) return;
    await this.assertRegistered(seasonId);
    // 在文件操作前保留实际旧位置，并用唯一约束检查目标目录冲突。
    await this.db.season.update({
      where: { id: seasonId },
      data: {
        directory,
        ...(season && !season.lastWriteDirectory && !season.lastWriteTitle
          ? { lastWriteDirectory: getSeasonDirectory(season) }
          : {}),
      },
    });
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
    return this.operations.run(async () => {
      const season = await this.db.season.findUnique({
        rejectOnNotFound: false,
        where: { id: seasonId },
        include: { jellyfinFolder: true },
      });
      if (!season) return;
      await this.assertRegistered(seasonId);
      await this.assertSeasonIdle(this.db, seasonId);
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
        await this.assertSeasonIdle(tx, seasonId);
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

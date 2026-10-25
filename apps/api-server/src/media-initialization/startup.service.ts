import { Injectable, Logger, OnApplicationShutdown } from '@nestjs/common';
import path from 'path';
import config from '@/config';
import { LibraryStructureService } from '@/api/jellyfin';
import { mapPath } from '@/utils/path';
import { MediaPoolService } from '@/media-pool/media-pool.service';
import {
  bounded,
  MEDIA_MIGRATION_GUIDE,
  probeMediaDirectories,
} from '@/media-pool/preflight';
import { SeasonMediaService } from '@/season-emit/media.service';
import { MediaBackfillService } from './backfill.service';

@Injectable()
export class MediaStartupService implements OnApplicationShutdown {
  private readonly logger = new Logger(MediaStartupService.name);
  private stopping = false;
  private work?: Promise<void>;
  constructor(
    private pool: MediaPoolService,
    private seasons: SeasonMediaService,
    private backfill: MediaBackfillService,
  ) {}
  /** 监听 HTTP、启动定时任务前完成运行条件检查和中断恢复。 */
  async initialize() {
    await bounded(
      this.inspectEnvironment(),
      30000,
      'Media environment preflight',
    ).catch((error) => {
      throw new Error(
        `lani startup preflight failed: ${error.message}. Check configuration, permissions and mounts. Guide: ${MEDIA_MIGRATION_GUIDE}`,
      );
    });
    await this.pool.initialize();
    await this.seasons.recoverDirectoryMoves();
  }
  private async inspectEnvironment() {
    const folders = await LibraryStructureService.getVirtualFolders();
    const libraries = [
      ...new Set(
        folders
          .filter(
            (folder) => folder.CollectionType?.toLowerCase() === 'tvshows',
          )
          .flatMap((folder) => folder.Locations ?? [])
          .map((value) => mapPath(config.jellyfin.pathMapping, value)),
      ),
    ];
    for (const value of libraries)
      if (!path.isAbsolute(value))
        throw new Error(`Mapped directory is not absolute: ${value}`);
    await probeMediaDirectories(
      config.mediaPool.root,
      libraries,
      config.mediaPool.painfullyAcceptCrossDeviceCopy,
    );
  }

  /** HTTP 监听后启动；入口负责捕获失败、受控关闭并非零退出。 */
  start() {
    return this.work ?? (this.work = this.run());
  }
  private async run() {
    try {
      if (this.stopping) return;
      await this.backfill.run();
      this.logger.log('Media registration complete');
    } catch (error) {
      if (this.stopping) return;
      this.backfill.fail(error.message);
      throw new Error(
        `Media initialization failed: ${error.message}. Guide: ${MEDIA_MIGRATION_GUIDE}`,
      );
    }
  }
  async onApplicationShutdown() {
    this.stopping = true;
    this.backfill.stop();
    await this.work?.catch(() => undefined);
  }
}

import { Injectable, Logger, OnApplicationShutdown } from '@nestjs/common';
import path from 'path';
import config from '@/config';
import { QBittorrentService } from '@/download-client/QBittorrentService';
import { LibraryStructureService } from '@/api/jellyfin';
import { mapPath } from '@/utils/path';
import { MediaPoolService } from '@/media-pool/media-pool.service';
import { WriteGate } from '@/application-state/write-gate';
import {
  bounded,
  MEDIA_MIGRATION_GUIDE,
  probeMediaDirectories,
} from '@/media-pool/preflight';
import { SeasonMediaService } from '@/season-emit/media.service';
import { TaskService } from '@/task/index.service';
import { MediaBackfillService } from './backfill.service';

@Injectable()
export class MediaStartupService implements OnApplicationShutdown {
  private readonly logger = new Logger(MediaStartupService.name);
  private stopping = false;
  private work?: Promise<void>;
  constructor(
    private pool: MediaPoolService,
    private gate: WriteGate,
    private qbt: QBittorrentService,
    private seasons: SeasonMediaService,
    private backfill: MediaBackfillService,
    private tasks: TaskService,
  ) {}
  async preflight() {
    await bounded(
      this.inspectEnvironment(),
      30000,
      'Media environment preflight',
    ).catch((error) => {
      throw new Error(
        `lani startup preflight failed: ${error.message}. Check configuration, permissions and mounts. Guide: ${MEDIA_MIGRATION_GUIDE}`,
      );
    });
  }
  private async inspectEnvironment() {
    const [preferences, categories, torrents, folders] = await Promise.all([
      this.qbt.get('/app/preferences'),
      this.qbt.get('/torrents/categories'),
      this.qbt.listTorrents(),
      LibraryStructureService.getVirtualFolders(),
    ]);
    const rawDownloads = [
      preferences.data.save_path,
      ...(preferences.data.temp_path_enabled
        ? [preferences.data.temp_path]
        : []),
      ...Object.values(
        categories.data as Record<string, { savePath: string }>,
      ).map((category) => category.savePath),
      ...torrents.map((torrent) => torrent.save_path),
    ].filter((value): value is string => typeof value === 'string' && !!value);
    const downloads = [
      ...new Set(
        rawDownloads.map((value) =>
          mapPath(config.downloadClient.qbittorrent.pathMapping, value),
        ),
      ),
    ];
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
    for (const value of [...downloads, ...libraries])
      if (!path.isAbsolute(value))
        throw new Error(`Mapped directory is not absolute: ${value}`);
    await probeMediaDirectories(
      config.mediaPool.root,
      downloads,
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
      await this.pool.initialize();
      await this.seasons.recoverDirectoryMoves();
      await this.backfill.run();
      if (this.stopping) return;
      this.gate.open();
      await this.tasks.resumePendingTasks();
      this.logger.log('Media initialization complete; writes enabled');
    } catch (error) {
      if (this.stopping) return;
      this.gate.fail();
      this.backfill.fail(error.message);
      throw new Error(
        `Media initialization failed: ${error.message}. Guide: ${MEDIA_MIGRATION_GUIDE}`,
      );
    }
  }
  async onApplicationShutdown() {
    this.stopping = true;
    this.gate.fail();
    this.backfill.stop();
    await this.work?.catch(() => undefined);
  }
}

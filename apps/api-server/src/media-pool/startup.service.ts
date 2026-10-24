import { Injectable, Logger, OnApplicationShutdown } from '@nestjs/common';
import { Field, Int, ObjectType, Query, Resolver } from '@nestjs/graphql';
import axios from 'axios';
import path from 'path';
import config from '@/config';
import { PrismaService } from '@/common/prisma.service';
import { QBittorrentService } from '@/download-client/QBittorrentService';
import { LibraryStructureService } from '@/api/jellyfin';
import { mapPath } from '@/utils/path';
import { BaseItemDto } from '@/api/jellyfin/generated/models/BaseItemDto';
import { MediaPoolService } from './media-pool.service';
import { MediaWriteState } from './write-state';
import {
  bounded,
  MEDIA_MIGRATION_GUIDE,
  probeMediaDirectories,
} from './preflight';
import { applyBackfill, inspectBackfillFile } from './backfill';
import { companions } from './files';

@ObjectType()
class MediaRegistrationProgress {
  @Field() state: string;
  @Field(() => Int) completed: number;
  @Field(() => Int) total: number;
  @Field({ nullable: true }) reason?: string;
}
@Injectable()
@Resolver()
export class MediaStartupService implements OnApplicationShutdown {
  private readonly logger = new Logger(MediaStartupService.name);
  private stopping = false;
  private work?: Promise<void>;
  private readonly abort = new AbortController();
  constructor(
    private db: PrismaService,
    private pool: MediaPoolService,
    private state: MediaWriteState,
    private qbt: QBittorrentService,
  ) {}

  @Query(() => MediaRegistrationProgress)
  mediaRegistrationProgress() {
    return this.state.status();
  }

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

  /** 只在 HTTP listen 成功后调用；异步失败由入口统一关闭服务并以非零状态退出。 */
  start() {
    return this.work ?? (this.work = this.run());
  }
  private async retry<T>(run: () => Promise<T>): Promise<T> {
    for (let attempt = 0; ; attempt++) {
      try {
        return await run();
      } catch (error) {
        const transient =
          [
            'ECONNRESET',
            'ECONNREFUSED',
            'ETIMEDOUT',
            'ECONNABORTED',
            'EAI_AGAIN',
            'P1001',
            'P1002',
          ].includes(error.code) ||
          [408, 429, 500, 502, 503, 504].includes(error.response?.status);
        if (!transient || attempt >= 2 || this.stopping) throw error;
        this.logger.warn(
          `Media registration transient error; retry ${attempt + 1}/2`,
        );
        await new Promise((resolve) => setTimeout(resolve, 500 * 2 ** attempt));
      }
    }
  }
  private async run() {
    try {
      await this.pool.initialize();
      this.state.total = await this.db.episode.count({
        where: { jellyfinEpisodeId: { not: null } },
      });
      this.state.completed = await this.db.episode.count({
        where: {
          jellyfinEpisodeId: { not: null },
          currentVersionId: { not: null },
        },
      });
      while (!this.stopping) {
        const episode = await this.retry(() =>
          this.db.episode.findFirst({
            where: { jellyfinEpisodeId: { not: null }, currentVersionId: null },
            orderBy: { id: 'asc' },
          }),
        );
        if (!episode) break;
        await this.retry(async () => {
          const response = await axios.get<BaseItemDto>(
            `${config.jellyfin.apiEndpoint}/Users/${encodeURIComponent(
              config.jellyfin.dummyUserId,
            )}/Items/${encodeURIComponent(episode.jellyfinEpisodeId!)}`,
            {
              headers: { 'X-Emby-Token': config.jellyfin.apiToken },
              timeout: 30000,
              signal: this.abort.signal,
            },
          );
          const item = response.data;
          if (!item.Path || (item.MediaSources?.length ?? 0) > 1)
            throw new Error(
              `Episode ${episode.id}: ambiguous or missing media path`,
            );
          const video = mapPath(config.jellyfin.pathMapping, item.Path);
          const streams =
            item.MediaSources?.[0]?.MediaStreams ?? item.MediaStreams ?? [];
          const subtitles = new Set(await companions(video));
          for (const stream of streams.filter(
            (stream) => stream.IsExternal && stream.Type === 'Subtitle',
          )) {
            if (!stream.Path)
              throw new Error(`Episode ${episode.id}: subtitle path missing`);
            subtitles.add(mapPath(config.jellyfin.pathMapping, stream.Path));
          }
          const files = [await inspectBackfillFile(video, 'video')];
          for (const subtitle of subtitles)
            files.push(await inspectBackfillFile(subtitle, 'subtitle'));
          if (this.stopping) return;
          await applyBackfill(this.db, this.pool, [
            {
              episodeId: episode.id,
              jellyfinEpisodeId: episode.jellyfinEpisodeId!,
              files,
            },
          ]);
        });
        if (this.stopping) return;
        this.state.completed++;
        this.logger.log(
          `Media registration: ${this.state.completed}/${this.state.total}`,
        );
      }
      if (!this.stopping) {
        await this.state.open();
        this.logger.log('Media registration complete; media writes enabled');
      }
    } catch (error) {
      if (this.stopping) return;
      // HTTP 对象可能携带凭据，仅记录可定位的状态或业务原因。
      const reason = axios.isAxiosError(error)
        ? `Jellyfin request failed (${
            error.response?.status ?? error.code ?? 'network error'
          })`
        : error.message;
      this.state.fail(reason);
      throw new Error(
        `Media registration failed: ${reason}. Guide: ${MEDIA_MIGRATION_GUIDE}`,
      );
    }
  }
  async onApplicationShutdown() {
    this.stopping = true;
    this.abort.abort();
    await this.work?.catch(() => undefined);
  }
}

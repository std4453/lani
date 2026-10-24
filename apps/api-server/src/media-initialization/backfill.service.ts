import { Injectable, Logger } from '@nestjs/common';
import { Field, Int, ObjectType, Query, Resolver } from '@nestjs/graphql';
import config from '@/config';
import { PrismaService } from '@/common/prisma.service';
import { MediaPoolService } from '@/media-pool/media-pool.service';
import { getLibraryItem } from '@/api/jellyfin/library-item';
import { mapPath } from '@/utils/path';
import { companions } from '@/utils/media-companions';
import { applyBackfill, inspectBackfillFile } from './backfill';

@ObjectType()
class MediaRegistrationProgress {
  @Field() state: string;
  @Field(() => Int) completed: number;
  @Field(() => Int) total: number;
  @Field({ nullable: true }) reason?: string;
}
@Injectable()
@Resolver()
export class MediaBackfillService {
  private logger = new Logger(MediaBackfillService.name);
  private stopping = false;
  private abort = new AbortController();
  private state = 'initializing';
  private completed = 0;
  private total = 0;
  private reason?: string;
  constructor(private db: PrismaService, private pool: MediaPoolService) {}
  @Query(() => MediaRegistrationProgress)
  mediaRegistrationProgress() {
    return {
      state: this.state,
      completed: this.completed,
      total: this.total,
      reason: this.reason,
    };
  }
  stop() {
    this.stopping = true;
    this.abort.abort();
  }
  fail(reason: string) {
    this.state = 'failed';
    this.reason = reason;
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
          [408, 429, 500, 502, 503, 504].includes(
            error.status ?? error.response?.status,
          );
        if (!transient || attempt >= 2 || this.stopping) throw error;
        this.logger.warn(
          `Media registration transient error; retry ${attempt + 1}/2`,
        );
        await new Promise((resolve) => setTimeout(resolve, 500 * 2 ** attempt));
      }
    }
  }
  async run() {
    this.total = await this.db.episode.count({
      where: { jellyfinEpisodeId: { not: null } },
    });
    this.completed = await this.db.episode.count({
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
        const item = await getLibraryItem(
          config.jellyfin.dummyUserId,
          episode.jellyfinEpisodeId!,
          this.abort.signal,
        );
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
      this.completed++;
      this.logger.log(`Media registration: ${this.completed}/${this.total}`);
    }
    if (!this.stopping) this.state = 'ready';
  }
}

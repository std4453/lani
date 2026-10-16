import { claimEpisodePublication } from './publication';
import { jellyfinNumber } from '@/utils/episode-number';
import { PlayerRefreshService } from './refresh/player-refresh.service';
import { PrismaService } from '@/common/prisma.service';
import { AsyncAtom, AtomContext, TaskInput } from '@/task/atom';
import { Injectable } from '@nestjs/common';

@Injectable()
export class RefreshPlayerAtom extends AsyncAtom {
  readonly wants = [['writeMetadata']] as const;
  constructor(
    private prisma: PrismaService,
    private refresh: PlayerRefreshService,
  ) {
    super();
  }
  async run(id: number, { episodeId }: TaskInput, context: AtomContext) {
    await claimEpisodePublication(id, context, true);
    if (!episodeId) throw new Error('剧集已被删除');
    const episode = await this.prisma.episode.findUnique({
      where: { id: episodeId },
      include: { season: true },
    });
    const jellyfinSeriesId = episode.season.jellyfinId;
    if (!jellyfinSeriesId)
      throw new Error('未获取到季度对应的 Jellyfin ID，无法刷新');
    const { season, index } = jellyfinNumber(episode);
    await context.assertActive();
    const key =
      context.entryId === undefined
        ? id
        : `${id}:${context.entryId}:${context.attempt}`;
    try {
      return await context.waitFor(
        this.refresh.enqueue(key, {
          seriesId: jellyfinSeriesId,
          season,
          index,
          refreshed: async (refreshStartedAt) => {
            await context.assertActive();
            await context.saveCheckpoint({ refreshStartedAt });
          },
        }),
      );
    } finally {
      this.refresh.remove(key);
    }
  }
}

import { claimEpisodePublication } from './publication';
import { jellyfinNumber } from '@/utils/episode-number';
import { PlayerRefreshService } from './refresh/player-refresh.service';
import { PrismaService } from '@/common/prisma.service';
import { AsyncAtom, AtomContext, StepInput } from '@/task/atom';
import { DownloadWorkflowDefinition } from '@/download-job/atoms/types';
import { Injectable } from '@nestjs/common';

@Injectable()
export class RefreshPlayerAtom extends AsyncAtom<
  DownloadWorkflowDefinition,
  'refreshPlayer'
> {
  readonly wants = [['writeMetadata']] as const;
  constructor(
    private prisma: PrismaService,
    private refresh: PlayerRefreshService,
  ) {
    super();
  }
  async run(
    _id: number,
    { params: { episodeId } }: StepInput<DownloadWorkflowDefinition>,
    context: AtomContext,
  ) {
    await claimEpisodePublication(this.prisma, _id, context, true);
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
    try {
      return await context.waitFor(
        this.refresh.enqueue(_id, {
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
      this.refresh.remove(_id);
    }
  }
}

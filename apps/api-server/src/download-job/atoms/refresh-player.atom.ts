import { jellyfinNumber } from '@/utils/episode-number';
import {
  JellyfinHelp,
  MetadataRefreshMode,
  TvShowsService,
} from '@/api/jellyfin';
import { PrismaService } from '@/common/prisma.service';
import config from '@/config';
import { AsyncAtom, AtomContext, StepInput } from '@/download-job/atoms';
import { DownloadWorkflowDefinition } from '@/download-job/atoms/types';
import { Injectable } from '@nestjs/common';

@Injectable()
export class RefreshPlayerAtom extends AsyncAtom<
  DownloadWorkflowDefinition,
  'refreshPlayer'
> {
  readonly wants = [['writeMetadata']] as const;
  constructor(private prisma: PrismaService) {
    super();
  }
  async run(
    _id: number,
    { params: { episodeId } }: StepInput<DownloadWorkflowDefinition>,
    context: AtomContext,
  ) {
    if (!episodeId) throw new Error('剧集已被删除');
    const episode = await this.prisma.episode.findUnique({
      where: { id: episodeId },
      include: { season: true },
    });
    const jellyfinSeriesId = episode.season.jellyfinId;
    if (!jellyfinSeriesId)
      throw new Error('未获取到季度对应的 Jellyfin ID，无法刷新');
    const { season, index } = jellyfinNumber(episode);
    if (!context.checkpoint.refreshStartedAt) {
      await context.saveCheckpoint({
        refreshStartedAt: new Date().toISOString(),
      });
    }
    await context.assertActive();
    await JellyfinHelp.refreshItem({
      itemId: jellyfinSeriesId,
      metadataRefreshMode: MetadataRefreshMode.FULL_REFRESH,
      imageRefreshMode: MetadataRefreshMode.FULL_REFRESH,
    });
    for (;;) {
      await context.assertActive();
      const { Items } = await TvShowsService.getEpisodes(
        jellyfinSeriesId,
        config.jellyfin.dummyUserId,
      );
      const id = (Items ?? []).find(
        (item) =>
          item.IndexNumber === index && item.ParentIndexNumber === season,
      )?.Id;
      if (id) return { jellyfinEpisodeId: id };
      if (
        Date.now() - Date.parse(context.checkpoint.refreshStartedAt!) >
        5 * 60 * 1000
      )
        throw new Error('超过5分钟未被识别，请检查 Jellyfin 设置');
      await context.wait(15000);
    }
  }
}

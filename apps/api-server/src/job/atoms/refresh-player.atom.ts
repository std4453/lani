import { PrismaService } from '@/common/prisma.service';
import { ConfigType } from '@/config';
import { ItemRefreshService, TvShowsService } from '@/jellyfin';
import { AsyncAtom, StepInput } from '@/job/atoms';
import { DownloadWorkflowDefinition } from '@/job/atoms/types';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class RefreshPlayerAtom extends AsyncAtom<
  DownloadWorkflowDefinition,
  'refreshPlayer'
> {
  constructor(
    emitter: EventEmitter2,
    private prisma: PrismaService,
    private config: ConfigService<ConfigType, true>,
  ) {
    super(emitter, 'refreshPlayer');
  }

  async run(
    _id: number,
    { params: { episodeId }, steps }: StepInput<DownloadWorkflowDefinition>,
  ) {
    if (!steps.writeMetadata) {
      throw new Error('writeMetadata step not finished');
    }
    const {
      index,
      season: { jellyfinId: jellyfinSeriesId },
    } = await this.prisma.episode.findUnique({
      where: { id: episodeId },
      include: {
        season: true,
      },
    });
    if (!jellyfinSeriesId) {
      throw new Error('cannot refresh since season has no jellyfinId');
    }
    await ItemRefreshService.post(jellyfinSeriesId);
    const { Items: episodes } = await TvShowsService.getEpisodes(
      jellyfinSeriesId,
      this.config.get('jellyfinUserId'),
    );
    const jellyfinEpisodeId = (episodes ?? []).find(
      (episode) =>
        episode.IndexNumber === index && episode.ParentIndexNumber === 1,
    )?.Id;
    if (!jellyfinEpisodeId) {
      throw new Error('jellyfin episode not found');
    }
    return {
      jellyfinEpisodeId,
    };
  }
}

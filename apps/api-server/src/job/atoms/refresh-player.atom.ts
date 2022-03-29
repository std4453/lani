import { PrismaService } from '@/common/prisma.service';
import { ConfigType } from '@/config';
import { ItemRefreshService, TvShowsService } from '@/jellyfin';
import { Atom } from '@/job/atoms';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DownloadJob } from '@prisma/client';

@Injectable()
export class RefreshPlayerAtom extends Atom {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService<ConfigType, true>,
  ) {
    super();
  }

  async run({ episodeId }: DownloadJob) {
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

import { MetadataRefreshMode, TvShowsService } from '@/api/jellyfin';
import { PrismaService } from '@/common/prisma.service';
import { ConfigType } from '@/config';
import { Atom, StepInput } from '@/download-job/atoms';
import { DownloadWorkflowDefinition } from '@/download-job/atoms/types';
import { JellyfinHelp } from '@/utils/JellyfinHelp';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Int, Mutation } from '@nestjs/graphql';
import { Cron } from '@nestjs/schedule';

interface QueueItem {
  jellyfinSeriesId: string;
  index: number;
  enqueueTime: number;
}

@Injectable()
export class RefreshPlayerAtom extends Atom<
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

  private queue: Record<number, QueueItem> = {};

  async enqueue(
    id: number,
    { steps, params: { episodeId } }: StepInput<DownloadWorkflowDefinition>,
  ) {
    if (!steps.writeMetadata) {
      this.jobFail(id, new Error('writeMetadata step not finished'));
      return;
    }
    try {
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
        this.jobFail(
          id,
          new Error('cannot refresh since season has no jellyfinId'),
        );
        return;
      }
      const jellyfinEpisodeId = await this.getJellyfinEpisode(
        index,
        jellyfinSeriesId,
      );
      // 如果已经存在，则跳过刷新，直接获取
      if (jellyfinEpisodeId) {
        this.jobSuccess(id, {
          jellyfinEpisodeId,
        });
      } else {
        await JellyfinHelp.refreshItem({
          itemId: jellyfinSeriesId,
          metadataRefreshMode: MetadataRefreshMode.FULL_REFRESH,
          imageRefreshMode: MetadataRefreshMode.FULL_REFRESH,
        });
        this.queue[id] = {
          jellyfinSeriesId,
          index,
          enqueueTime: new Date().getTime(),
        };
      }
    } catch (error) {
      this.jobFail(id, error);
    }
  }

  private async getJellyfinEpisode(index: number, jellyfinSeriesId: string) {
    const { Items: episodes } = await TvShowsService.getEpisodes(
      jellyfinSeriesId,
      this.config.get('jellyfinUserId'),
    );
    const jellyfinEpisodeId = (episodes ?? []).find(
      (episode) =>
        episode.IndexNumber === index && episode.ParentIndexNumber === 1,
    )?.Id;
    return jellyfinEpisodeId;
  }

  private async refreshQueueItem(
    id: number,
    { enqueueTime, index, jellyfinSeriesId }: QueueItem,
  ) {
    try {
      const jellyfinEpisodeId = await this.getJellyfinEpisode(
        index,
        jellyfinSeriesId,
      );
      if (!jellyfinEpisodeId) {
        const now = new Date().getTime();
        // 5分钟内没有完成就算失败
        if (now - enqueueTime > 5 * 60 * 1000) {
          this.jobFail(
            id,
            new Error('episode waiting for more than 5 minutes'),
          );
          return true;
        }
        return false;
      }
      this.jobSuccess(id, {
        jellyfinEpisodeId,
      });
      return true;
    } catch (error) {
      this.jobFail(id, error);
      return true;
    }
  }

  @Cron('*/15 * * * * *') // 每 15 秒
  @Mutation(() => Int)
  async refreshAllPlayerWaitingStatus() {
    const ids = Object.keys(this.queue).map((idStr) => parseInt(idStr, 10));
    if (ids.length === 0) {
      return 0;
    }
    const changes = await Promise.all(
      ids.map(async (id) => {
        const changed = await this.refreshQueueItem(id, this.queue[id]);
        if (changed) {
          delete this.queue[id];
        }
        return changed;
      }),
    );
    return changes.filter((change) => change).length;
  }
}

import { BatchableEpisodeAtom } from '../batchable-episode-atom';
import { PrismaService } from '@/common/prisma.service';
import {
  EpisodePublishEvent,
  EPISODE_PUBLISH_EVENT,
} from './publish-episode.event';
import { AtomContext, AtomTransaction, TaskInput } from '@/task/atom';
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { completeEpisodePublication } from './publication';

@Injectable()
export class PublishEpisodeAtom extends BatchableEpisodeAtom {
  readonly wants = [['refreshPlayer']] as const;
  constructor(private prisma: PrismaService, private emitter: EventEmitter2) {
    super();
  }
  protected async runEpisode(
    id: number,
    input: TaskInput,
    context: AtomContext,
  ) {
    const published = await completeEpisodePublication(
      id,
      context,
      (transaction) => this.publishEpisode(transaction),
    );
    if (published === 'published' && input.type === 'DOWNLOAD') {
      const episodeId = input.episodeId!;
      const episode = await this.prisma.episode.findUnique({
        where: { id: episodeId },
        include: {
          season: { include: { jellyfinFolder: true, posterImage: true } },
          taskEpisodes: { where: { taskId: id }, include: { task: true } },
        },
      });
      this.emitter.emit(
        EPISODE_PUBLISH_EVENT,
        new EpisodePublishEvent({
          ...episode,
          tasks: episode.taskEpisodes.map(({ task }) => task),
        }),
      );
    }
    return {};
  }

  private async publishEpisode({ tx, input }: AtomTransaction) {
    if (!input.jellyfinEpisodeId)
      throw new Error('未获取到剧集对应的 Jellyfin ID');
    const episodeId = input.episodeId!;
    const result = await tx.episode.updateMany({
      where: { id: episodeId, jellyfinEpisodeId: null },
      data: { jellyfinEpisodeId: input.jellyfinEpisodeId },
    });
    if (!result.count) {
      const episode = await tx.episode.findUnique({ where: { id: episodeId } });
      if (!episode) throw new Error('剧集已被删除');
      if (episode.jellyfinEpisodeId !== input.jellyfinEpisodeId)
        throw new Error('剧集已关联其他 Jellyfin 条目，无法继续发布');
    }
  }
}

import { PrismaService } from '@/common/prisma.service';
import {
  EpisodePublishEvent,
  EPISODE_PUBLISH_EVENT,
} from './publish-episode.event';
import { AsyncAtom, AtomContext, TaskInput } from '@/task/atom';
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { completeEpisodePublication } from './publication';

@Injectable()
export class PublishEpisodeAtom extends AsyncAtom {
  readonly wants = [['refreshPlayer']] as const;
  constructor(private prisma: PrismaService, private emitter: EventEmitter2) {
    super();
  }
  async run(id: number, input: TaskInput, context: AtomContext) {
    const published = await completeEpisodePublication(id, context);
    if (
      published === 'published' &&
      (!input.type || input.type === 'DOWNLOAD')
    ) {
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
}

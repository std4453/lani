import { PrismaService } from '@/common/prisma.service';
import {
  EpisodePublishEvent,
  EPISODE_PUBLISH_EVENT,
} from './publish-episode.event';
import { AsyncAtom, AtomContext, TaskInput } from '@/task/atom';
import { currentStep } from '@lani/workflow';
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { claimEpisodePublication, lockEpisode } from './publication';

@Injectable()
export class PublishEpisodeAtom extends AsyncAtom {
  readonly wants = [['refreshPlayer']] as const;
  constructor(private prisma: PrismaService, private emitter: EventEmitter2) {
    super();
  }
  async run(id: number, input: TaskInput, context: AtomContext) {
    const { episodeId, jellyfinEpisodeId } = input;
    if (!episodeId) throw new Error('剧集已被删除');
    if (!jellyfinEpisodeId) throw new Error('未获取到剧集对应的 Jellyfin ID');
    await claimEpisodePublication(id, context, true);
    const published = await context.transaction(
      async ({ tx, workflow, saveCheckpoint }) => {
        await lockEpisode(tx, episodeId);
        const step = currentStep(workflow);
        // 关联独立于任务收尾提交；恢复时相同关联不重复发布或发送通知。
        const result = await tx.episode.updateMany({
          where: { id: episodeId, jellyfinEpisodeId: null },
          data: { jellyfinEpisodeId },
        });
        if (!result.count) {
          const episode = await tx.episode.findUnique({
            where: { id: episodeId },
          });
          if (!episode) throw new Error('剧集已被删除');
          if (episode.jellyfinEpisodeId !== jellyfinEpisodeId)
            throw new Error('剧集已关联其他 Jellyfin 条目，无法继续发布');
        }
        const previouslyPublished = step.checkpoint.episodePublished;
        if (!previouslyPublished) {
          // 发布归属和关联同时提交；任务终态仍由执行器独立推进。
          await saveCheckpoint({ episodePublished: true });
        }
        return !!result.count && !previouslyPublished;
      },
    );
    if (published) {
      const episode = await this.prisma.episode.findUnique({
        where: { id: episodeId },
        include: {
          season: { include: { jellyfinFolder: true, posterImage: true } },
          tasks: { where: { id } },
        },
      });
      this.emitter.emit(
        EPISODE_PUBLISH_EVENT,
        new EpisodePublishEvent(episode),
      );
    }
    return {};
  }
}

import { PrismaService } from '@/common/prisma.service';
import {
  EpisodePublishEvent,
  EPISODE_PUBLISH_EVENT,
} from './publish-episode.event';
import {
  AsyncAtom,
  AtomContext,
  ExecutionStopped,
  TaskInput,
} from '@/task/atom';
import { currentStep, parseWorkflow } from '@lani/workflow';
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { claimEpisodePublication } from './publication';

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
    await claimEpisodePublication(this.prisma, id, context, true);
    const published = await this.prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT pg_advisory_xact_lock(14521, ${episodeId})::text`;
      await tx.$queryRaw`SELECT id FROM download_jobs WHERE id=${id} FOR UPDATE`;
      const task = await tx.task.findUnique({ where: { id } });
      if (!task) throw new ExecutionStopped();
      const workflow = parseWorkflow(task.workflow);
      const step = currentStep(workflow);
      if (
        workflow.status !== 'running' ||
        workflow.cancellation ||
        step.id !== context.stepId ||
        step.attempt !== context.attempt
      )
        throw new ExecutionStopped();
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
        step.checkpoint.episodePublished = true;
        await tx.task.update({
          where: { id },
          data: {
            workflow: JSON.parse(JSON.stringify(workflow)),
            version: { increment: 1 },
            updatedAt: new Date(),
          },
        });
      }
      return !!result.count && !previouslyPublished;
    });
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

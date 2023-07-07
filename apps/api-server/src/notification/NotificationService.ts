import { PrismaService } from '@/common/prisma.service';
import {
  EpisodePublishEvent,
  EPISODE_PUBLISH_EVENT,
} from '@/download-job/events';
import { env } from '@/env';
import { ManagementNotificationProvider } from '@/notification/ManagementNotificationProvider';
import { UserNotificationProvider } from '@/notification/UserNotificationProvider';
import { LaniFilterCron } from '@/utils/GraphQLExceptionFilter';
import {
  ForbiddenException,
  Injectable,
  Logger,
  Optional,
} from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { Args, ID, Int, Mutation, Resolver } from '@nestjs/graphql';
import { Cron } from '@nestjs/schedule';
import dayjs from 'dayjs';

@Injectable()
@Resolver()
export class NotificationService {
  private logger = new Logger(NotificationService.name);

  constructor(
    private prisma: PrismaService,
    private emitter: EventEmitter2,
    @Optional() private management?: ManagementNotificationProvider,
    @Optional() private user?: UserNotificationProvider,
  ) {}

  @Mutation(() => ID)
  async mockEpisodePublish(@Args('episodeId') episodeId: number) {
    if (env !== 'dev') {
      throw new ForbiddenException('only available in dev mode');
    }
    const episode = await this.prisma.episode.findUnique({
      where: { id: episodeId },
      include: {
        season: {
          include: {
            jellyfinFolder: true,
            posterImage: true,
          },
        },
        downloadJobs: {
          orderBy: {
            id: 'desc',
          },
          take: 1,
        },
      },
    });
    this.emitter.emit(EPISODE_PUBLISH_EVENT, new EpisodePublishEvent(episode));
    return 'ok';
  }

  @OnEvent(EPISODE_PUBLISH_EVENT)
  @LaniFilterCron()
  async onEpisodePublish(event: EpisodePublishEvent) {
    return this.onEpisodePublishInternal(event);
  }

  private async onEpisodePublishInternal(event: EpisodePublishEvent) {
    if (event.episode.season.notifyPublish) {
      if (!this.user) {
        this.logger.verbose(
          'Episode publish notification skipped (no user notification provider)',
        );
      } else {
        this.logger.verbose(
          `Sending episode publish notification for episode #${event.episode.id} (${event.episode.season.title} / #${event.episode.index})...`,
        );
        await this.user?.onEpisodePublish(event.episode);
      }
    }
  }

  @Cron('0 10,16,22 * * *') // 10:00, 16:00, 22:00 通知
  @LaniFilterCron()
  async notifyMissingEpisodesCronTask() {
    return this.notifyMissingEpisodesInternal();
  }

  @Mutation(() => Int)
  async notifyMissingEpisodes() {
    return this.notifyMissingEpisodesInternal();
  }

  private async notifyMissingEpisodesInternal() {
    const episodes = await this.prisma.episode.findMany({
      where: {
        jellyfinEpisodeId: null,
        season: {
          isMonitoring: true,
          notifyMissing: true,
        },
        // 缺失超过12小时
        airTime: {
          lte: dayjs().subtract(12, 'h').toDate(),
        },
      },
      include: {
        season: true,
        downloadJobs: {
          orderBy: {
            id: 'desc',
          },
          take: 1,
        },
      },
      orderBy: [
        {
          seasonId: 'asc',
        },
        {
          index: 'asc',
        },
      ],
    });

    if (episodes.length > 0 && this.management) {
      this.logger.verbose(
        `Sending missing episodes notification for ${episodes.length} episodes...`,
      );
      await this.management.onEpisodesMissing(episodes);
      return episodes.length;
    } else if (episodes.length > 0) {
      this.logger.verbose(
        'Missing episodes notification skipped (no management notification provider)',
      );
      // 没有配置management时不提醒，也不更新lastMissingNotifyTime
      return 0;
    } else {
      this.logger.verbose(
        'Missing episodes notification skipped (no missing episodes)',
      );
      return 0;
    }
  }
}

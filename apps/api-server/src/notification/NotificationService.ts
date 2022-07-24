import { PrismaService } from '@/common/prisma.service';
import {
  EpisodePublishEvent,
  EPISODE_PUBLISH_EVENT,
} from '@/download-job/events';
import { env } from '@/env';
import { ManagementNotificationProvider } from '@/notification/ManagementNotificationProvider';
import {
  OnEpisodePublishEpisode,
  UserNotificationProvider,
} from '@/notification/UserNotificationProvider';
import { ForbiddenException, Injectable, Optional } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Args, ID, Int, Mutation, Resolver } from '@nestjs/graphql';
import { Cron } from '@nestjs/schedule';
import dayjs from 'dayjs';

@Injectable()
@Resolver()
export class NotificationService {
  constructor(
    private prisma: PrismaService,
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
      },
    });
    await this.onEpisodePublish(new EpisodePublishEvent(episode));
    return 'ok';
  }

  @OnEvent(EPISODE_PUBLISH_EVENT)
  async onEpisodePublish(event: EpisodePublishEvent) {
    if (event.episode.season.notifyPublish) {
      await this.user?.onEpisodePublish(event.episode);
    }
  }

  @Mutation(() => Int)
  @Cron('0 10,16,22 * * *') // 10:00, 16:00, 22:00 通知
  async notifyMissingEpisodes() {
    const episodes = await this.prisma.episode.findMany({
      where: {
        jellyfinEpisodeId: null,
        season: {
          isArchived: false,
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
      await this.management.onEpisodesMissing(episodes);
      return episodes.length;
    } else {
      // 没有配置management时不提醒，也不更新lastMissingNotifyTime
      return 0;
    }
  }
}

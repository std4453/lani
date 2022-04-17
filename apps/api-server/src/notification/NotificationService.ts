import { PrismaService } from '@/common/prisma.service';
import { EPISODE_PUBLISH_EVENT } from '@/download-job/events';
import { ManagementNotificationProvider } from '@/notification/ManagementNotificationProvider';
import {
  OnEpisodePublishEpisode,
  UserNotificationProvider,
} from '@/notification/UserNotificationProvider';
import { env } from '@lani/framework';
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
    await this.onEpisodePublish(episode);
    return 'ok';
  }

  @OnEvent(EPISODE_PUBLISH_EVENT)
  async onEpisodePublish(episode: OnEpisodePublishEpisode) {
    if (episode.season.notifyPublish) {
      await this.user?.onEpisodePublish(episode);
    }
  }

  @Mutation(() => Int)
  @Cron('*/15 * * * *') // 15 分钟
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
        OR: [
          {
            // 从未通知过
            lastMissingNotifyTime: null,
          },
          {
            lastMissingNotifyTime: {
              // 距离上次通知超过12小时
              lte: dayjs().subtract(12, 'h').toDate(),
            },
          },
        ],
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
      await this.prisma.episode.updateMany({
        where: {
          id: {
            in: episodes.map((e) => e.id),
          },
        },
        data: {
          lastMissingNotifyTime: dayjs().toDate(),
        },
      });
      return episodes.length;
    } else {
      // 没有配置management时不提醒，也不更新lastMissingNotifyTime
      return 0;
    }
  }
}

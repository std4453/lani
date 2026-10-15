import { PrismaService } from '@/common/prisma.service';
import { Injectable, Logger } from '@nestjs/common';
import { Args, Int, Mutation, Resolver } from '@nestjs/graphql';
import { Cron } from '@nestjs/schedule';
import { LaniFilterCron } from '@/utils/GraphQLExceptionFilter';
import { DownloadTaskRuntime } from './runtime';
@Injectable()
@Resolver()
export class DownloadJobService {
  private logger = new Logger(DownloadJobService.name);
  constructor(
    private prisma: PrismaService,
    private runtime: DownloadTaskRuntime,
  ) {}
  @Mutation(() => Int)
  async downloadTorrentForEpisode(
    @Args('episodeId') episodeId: number,
    @Args('torrentLink') torrentLink: string,
  ) {
    return this.runtime.create(episodeId, torrentLink);
  }
  async findTorrentsToDownload() {
    // pattern 可跨季度复用；按 season_id 关联，按 episodes.id 去重，避免多条规则重复入队。
    // 选择所有：
    // 种子标题符合（未停用的）下载定义、且对应的季度未被删除、对应的剧集已经发布
    // 且没有对应的任务（如果有对应的任务，一般是已经在下载中，无需创建新的下载任务）
    // TODO: 这里目前是根据 jellyfin_episode_id 判断是否已下载的，当前为了快速迭代
    // 先放着，之后需要改成基于具体的剧集状态枚举进行判断
    return this.prisma.$queryRaw<
      {
        torrent_link: string;
        episode_id: number;
      }[]
    >`
      SELECT 
        DISTINCT ON (episodes.id) episodes.id AS episode_id,
		    torrents.torrent_link
      FROM torrents,
        download_sources,
        seasons,
        episodes
      WHERE download_sources.is_disabled = false
        AND torrents.title LIKE download_sources.pattern
        AND download_sources.season_id = episodes.season_id
        AND episodes.season_id = seasons.id
        AND seasons.jellyfin_id != ''
        AND episodes.episode_type = 'EPISODE'
        AND COALESCE(episodes.episode_number, episodes.index) + download_sources.offset = torrents_match_number(torrents)
        AND episodes.jellyfin_episode_id IS NULL
        AND episodes.air_time < now()
		    AND NOT EXISTS (
			    SELECT id from download_jobs WHERE episodes.id = download_jobs.episode_id
	    	)
    `;
  }

  @Cron('*/1 * * * *') // 每分钟运行一次
  @LaniFilterCron()
  async enqueueDownloadJobsScheduledTask() {
    return this.enqueueDownloadJobsInternal();
  }

  @Mutation(() => Int)
  async enqueueDownloadJobs() {
    return this.enqueueDownloadJobsInternal();
  }

  async enqueueDownloadJobsInternal() {
    // 选择所有：
    // 种子标题符合（未停用的）下载定义、且对应的季度未被删除、对应的剧集已经发布
    // 且没有对应的任务（如果有对应的任务，一般是已经在下载中，无需创建新的下载任务）
    const result = await this.findTorrentsToDownload();
    if (result.length > 0) {
      this.logger.log(`Found ${result.length} new torrents to download`);
    }
    for (const { episode_id, torrent_link } of result) {
      try {
        await this.downloadTorrentForEpisode(episode_id, torrent_link);
      } catch (error) {
        this.logger.error(error);
      }
    }
    return result.length;
  }
}

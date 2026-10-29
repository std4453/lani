import { createEpisodeTask } from '@/task/create-episode-task';
import { lockEpisode } from '@/common/episode-lock';
import { PrismaService } from '@/common/prisma.service';
import { Injectable, Logger } from '@nestjs/common';
import { Args, Int, Mutation, Resolver } from '@nestjs/graphql';
import { Cron } from '@nestjs/schedule';
import { LaniFilterCron } from '@/utils/GraphQLExceptionFilter';
import { TaskService } from '@/task/index.service';
import { LegacyTaskStage, TaskType } from '@lani/db';
import { downloadDefinition } from './definition';
import { parseWorkflow } from '@lani/workflow';
import { LaniError } from '@/utils/error';
@Injectable()
@Resolver()
export class DownloadJobService {
  private logger = new Logger(DownloadJobService.name);
  constructor(private prisma: PrismaService, private tasks: TaskService) {}
  /** 已越过提交阶段的下载证明归属；同 hash 仍被未完成任务使用时暂不清理。 */
  async getTorrentOwnership(hashes?: readonly string[]) {
    const identities = hashes?.map((hash) => hash.toLowerCase());
    const tasks = await this.prisma.task.findMany({
      where: {
        type: { in: ['DOWNLOAD', 'BATCH_DOWNLOAD'] },
        qbtTorrentHash:
          identities === undefined
            ? { not: null }
            : { in: [...new Set(identities)], mode: 'insensitive' },
      },
      select: {
        qbtTorrentHash: true,
        legacyStage: true,
        isCancelled: true,
        isFailed: true,
      },
    });
    const owned = new Set<string>();
    const active = new Set<string>();
    for (const task of tasks) {
      if (!task.qbtTorrentHash) continue;
      const hash = task.qbtTorrentHash.toLowerCase();
      if (!['UNAVAILABLE', 'DOWNLOAD_SUBMITTING'].includes(task.legacyStage))
        owned.add(hash);
      if (
        task.legacyStage !== 'AVAILABLE' &&
        !task.isCancelled &&
        !task.isFailed
      )
        active.add(hash);
    }
    return { owned, active };
  }

  @Mutation(() => Int)
  async downloadTorrentForEpisode(
    @Args('episodeId') episodeId: number,
    @Args('torrentLink') torrentLink: string,
  ) {
    return this.createDownload(episodeId, torrentLink);
  }
  private async createDownload(
    episodeId: number,
    torrentLink: string,
    automatic = false,
  ) {
    const id = await this.tasks.creationTransaction(async (tx) => {
      if (automatic) {
        // 候选查询与入队之间用户可能开启智能下载；与配置更新互斥后再检查。
        await tx.$queryRaw`SELECT s.id FROM seasons s JOIN episodes e ON e.season_id=s.id WHERE e.id=${episodeId} FOR SHARE OF s`;
      }
      await lockEpisode(tx, episodeId);
      if (automatic) {
        const episode = await tx.episode.findUnique({
          where: { id: episodeId },
          include: { season: true },
        });
        if (!episode || episode.season.smartDownloadEnabled) return 0;
      }
      const existing = await tx.task.findFirst({
        where: {
          episodes: { some: { episodeId } },
          type: TaskType.DOWNLOAD,
          isFailed: false,
          isCancelled: false,
          legacyStage: { not: LegacyTaskStage.AVAILABLE },
        },
        orderBy: { id: 'desc' },
      });
      if (existing) {
        if (existing.workflow && parseWorkflow(existing.workflow).cancellation)
          throw new LaniError('该剧集的任务正在取消，请稍后重试');
        return existing.id;
      }
      const task = await createEpisodeTask(
        this.tasks,
        tx,
        TaskType.DOWNLOAD,
        downloadDefinition,
        { episodeId, torrentLink },
        [episodeId],
      );
      return task.id;
    });
    if (id) void this.tasks.start(id);
    return id;
  }
  async findTorrentsToDownload() {
    // pattern 可跨季度复用；按 season_id 关联，按 episodes.id 去重，避免多条规则重复入队。
    // 选择所有：
    // 种子标题符合（未停用的）下载定义、且对应的季度未被删除、对应的剧集已经发布
    // 已有下载任务保留原有去重行为；失败/取消且未发布的导入不阻止自动下载。
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
        AND seasons.smart_download_enabled = false
        AND episodes.episode_type = 'EPISODE'
        AND COALESCE(episodes.episode_number, episodes.index) + download_sources.offset = torrents_match_number(torrents)
        AND episodes.jellyfin_episode_id IS NULL
        AND episodes.air_time < now()
		    AND NOT EXISTS (
			    SELECT 1 FROM task_episodes te JOIN download_jobs task ON task.id=te.task_id
          WHERE episodes.id = te.episode_id
            AND (task.type='DOWNLOAD' OR (NOT task.is_failed AND NOT task.is_cancelled))
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
    // 已有下载任务保留原有去重行为；失败/取消且未发布的导入不阻止自动下载。
    const result = await this.findTorrentsToDownload();
    if (result.length > 0) {
      this.logger.log(`Found ${result.length} new torrents to download`);
    }
    for (const { episode_id, torrent_link } of result) {
      try {
        await this.createDownload(episode_id, torrent_link, true);
      } catch (error) {
        this.logger.error(error);
      }
    }
    return result.length;
  }
}

import { PrismaService } from '@/common/prisma.service';
import config from '@/config';
import { EpisodeScrapeService } from '@/season-scrape/EpisodeScrapeService';
import { SeasonScrapeService } from '@/season-scrape/SeasonScrapeService';
import { JellyfinHelp } from '@/utils/JellyfinHelp';
import { MetadataSource } from '@lani/db';
import { ConflictException } from '@nestjs/common';
import { Args, ID, Int, Mutation, Resolver } from '@nestjs/graphql';
import { Cron } from '@nestjs/schedule';
import dayjs from 'dayjs';

@Resolver()
export class ScrapeMetadataResolver {
  constructor(
    private prisma: PrismaService,
    private seasonScrape: SeasonScrapeService,
    private episodeScrape: EpisodeScrapeService,
  ) {}

  @Mutation(() => ID)
  async syncMetadata(@Args('seasonId') seasonId: number) {
    const season = await this.prisma.season.findUnique({
      where: { id: seasonId },
    });
    if (season.isArchived) {
      throw new ConflictException('season is archived (deleted)');
    }
    await this.seasonScrape.syncMetadata(season);
    return 'ok';
  }

  @Mutation(() => ID)
  async syncEpisodeData(@Args('seasonId') seasonId: number) {
    const season = await this.prisma.season.findUnique({
      where: { id: seasonId },
    });
    const result = await this.episodeScrape.syncEpisodeData(season);
    return result ? 'ok' : 'no change';
  }

  @Cron('*/10 * * * *') // 每 10 分钟
  @Mutation(() => Int)
  async syncAllSeasonsEpisodeData() {
    const seasons = await this.prisma.season.findMany({
      where: {
        AND: [
          {
            // 不同步已删除或未追番中的季度
            isArchived: false,
            isMonitoring: true,
          },
          {
            // 从未同步过，或距离上次同步时间超过12小时
            OR: [
              {
                episodesLastSync: null,
              },
              {
                episodesLastSync: {
                  lt: dayjs().subtract(12, 'hours').toDate(),
                },
              },
            ],
          },
          {
            // 设置了同步数据源和关联信息
            OR: [
              {
                episodesSource: MetadataSource.BGM_CN,
                bangumiId: {
                  not: '',
                },
              },
              {
                episodesSource: MetadataSource.SKYHOOK,
                tvdbId: {
                  not: '',
                },
                tvdbSeason: {
                  not: null,
                },
              },
            ],
          },
          {
            // 没有剧集或者存在未完成下载的剧集，这是为了避免频繁同步已完结的剧集，导致API调用限频
            OR: [
              {
                episodes: {
                  none: {},
                },
              },
              {
                episodes: {
                  some: {
                    jellyfinEpisodeId: null,
                  },
                },
              },
            ],
          },
        ],
      },
    });
    const results = await Promise.all(
      seasons.map(async (season) => {
        try {
          return await this.episodeScrape.syncEpisodeData(season);
        } catch (e) {
          console.error(e);
          return false;
        }
      }),
    );
    return results.filter((result) => result).length;
  }

  @Mutation(() => Boolean)
  async syncJellyfinSeriesId(@Args('seasonId') seasonId: number) {
    const { jellyfinId, title, jellyfinFolder } =
      await this.prisma.season.findUnique({
        where: { id: seasonId },
        include: {
          jellyfinFolder: true,
        },
      });
    if (!jellyfinFolder) {
      return false;
    }
    const items = await JellyfinHelp.getItemsByUserId({
      userId: config.jellyfin.dummyUserId,
      searchTerm: title,
      limit: 10,
      parentId: jellyfinFolder.jellyfinId,
      recursive: true,
      includeItemTypes: ['Series'],
    });
    const id = (items.Items ?? []).find((item) => item.Name === title)?.Id;
    if (!id) {
      return false;
    }
    if (id === jellyfinId) {
      return true;
    }
    await this.prisma.season.update({
      where: { id: seasonId },
      data: {
        jellyfinId: id,
      },
    });
    return true;
  }
}

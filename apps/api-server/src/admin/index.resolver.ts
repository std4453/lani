import {
  AdminConfig,
  DownloadJobStatus,
  SaveSeasonPatch,
  SearchBangumiSeason,
  UpdateSeasonDownloadSourcesInput,
} from '@/admin/index.model';
import {
  ApiError,
  BangumiAPIService,
  Legacy_SubjectType,
  SubjectType,
} from '@/api/bangumi';
import { PrismaService } from '@/common/prisma.service';
import config from '@/config';
import { IDownloadClient } from '@/download-job/client/IDownloadClient';
import { JobService } from '@/download-job/index.service';
import { env } from '@/env';
import { SeasonEmitService } from '@/season-emit/index.service';
import { DownloadSource, DownloadStatus, Prisma } from '@lani/db';
import { Injectable } from '@nestjs/common';
import { Args, ID, Int, Mutation, Query, Resolver } from '@nestjs/graphql';

@Injectable()
@Resolver()
export class AdminResolver {
  constructor(
    private prisma: PrismaService,
    private job: JobService,
    private seasonEmit: SeasonEmitService,
    private client: IDownloadClient,
  ) {}

  @Query(() => ID)
  environment() {
    return env;
  }

  @Query(() => AdminConfig)
  config(): AdminConfig {
    return {
      jellyfin: config.jellyfin.publicHost
        ? {
            publicHost: config.jellyfin.publicHost,
          }
        : undefined,
    };
  }

  @Mutation(() => ID)
  async updateSeasonDownloadSources(
    @Args({
      name: 'input',
      type: () => UpdateSeasonDownloadSourcesInput,
    })
    { seasonId, sources }: UpdateSeasonDownloadSourcesInput,
  ) {
    await this.prisma.$transaction([
      this.prisma.downloadSource.deleteMany({
        where: {
          seasonId: seasonId,
          id: {
            notIn: sources.filter(({ id }) => id !== 0).map(({ id }) => id),
          },
        },
      }),
      ...sources
        .filter(({ id }) => id !== 0)
        .map(({ id, pattern, offset }) =>
          this.prisma.downloadSource.update({
            where: {
              id: id,
            },
            data: {
              pattern,
              offset,
            },
          }),
        ),
      this.prisma.downloadSource.createMany({
        data: sources
          .filter(({ id }) => id === 0)
          .map(({ pattern, offset }) => ({
            seasonId,
            pattern,
            offset,
          })),
      }),
    ]);
    await this.job.enqueueDownloadJobs();
    return 'ok';
  }

  @Query(() => [SearchBangumiSeason])
  async searchBangumi(
    @Args('keywords') keywords: string,
    @Args({
      name: 'useNewBangumiSearchApi',
      nullable: true,
      type: () => Boolean,
    })
    useNewBangumiSearchApi = true,
  ): Promise<SearchBangumiSeason[]> {
    const match = keywords.match(
      /^(bgmid|bangumiid|bangumi_id):(\s)*(?<bgmid>(\d)+)$/,
    );
    if (match?.groups?.bgmid) {
      const bgmid = parseInt(match.groups.bgmid);
      try {
        const item = await BangumiAPIService.getSubjectById(bgmid);
        if (item.type !== SubjectType.Anime) {
          return [];
        }
        const added =
          (await this.prisma.season.findFirst({
            where: {
              bangumiId: `${item.id}`,
            },
          })) !== null;
        return [
          {
            id: `${item.id}`,
            name: item.name_cn || item.name || '未命名',
            airDate: item.date,
            image: item.images?.small,
            added,
          },
        ];
      } catch (error: unknown) {
        if (error instanceof ApiError) {
          if (error.status === 404) {
            return [];
          }
        }
        throw error;
      }
    }

    // 兼容新旧bangumi搜索API
    const entries = useNewBangumiSearchApi
      ? (
          await BangumiAPIService.searchSubjects(50, 0, {
            keyword: keywords,
            sort: 'match',
            filter: {
              type: [SubjectType.Anime],
            },
          })
        ).data ?? []
      : (
          await BangumiAPIService.searchSubjectByKeywords(
            keywords,
            Legacy_SubjectType._2,
            'small',
            0,
            25,
          )
        ).list ?? [];
    const ids = entries.map(({ id }) => `${id}`);
    const added = await this.prisma.season.findMany({
      where: {
        bangumiId: {
          in: ids,
        },
      },
    });
    return entries.map((item) => ({
      id: `${item.id}`,
      name: item.name_cn || item.name || '未命名',
      airDate: item.date || item.air_date,
      image: item.image || item.images?.small,
      added:
        added.find((season) => season.bangumiId === `${item.id}`) !== undefined,
    }));
  }

  @Query(() => [String])
  async getAvailableSemesters() {
    const results = await this.prisma.season.findMany({
      select: {
        yearAndSemester: true,
      },
      distinct: ['yearAndSemester'],
      orderBy: {
        yearAndSemester: 'desc',
      },
    });
    return results.map((result) => result.yearAndSemester);
  }

  @Mutation(() => ID)
  async deleteSeasonById(@Args('id') id: number) {
    const season = await this.prisma.season.findUnique({
      where: { id },
      include: {
        jellyfinFolder: true,
      },
    });
    await this.seasonEmit.deleteSeasonFiles(season);
    await this.prisma.season.delete({
      where: {
        id,
      },
    });
    return 'ok';
  }

  @Mutation(() => ID)
  async setJellyfinFolderDefault(@Args('id') id: number) {
    await this.prisma.$transaction([
      this.prisma.jellyfinFolder.updateMany({
        data: {
          isDefault: false,
        },
        where: {
          isDefault: true,
        },
      }),
      this.prisma.jellyfinFolder.update({
        data: {
          isDefault: true,
        },
        where: {
          id,
        },
      }),
    ]);
    return 'ok';
  }

  @Mutation(() => ID)
  async saveSeason(
    @Args('id') id: number,
    @Args({
      name: 'patch',
      type: () => SaveSeasonPatch,
    })
    { sources, ...seasonPatch }: SaveSeasonPatch,
  ) {
    const results = await this.prisma.$transaction([
      // 更新下载链接
      this.prisma.downloadSource.deleteMany({
        where: {
          seasonId: id,
          id: {
            notIn: sources.filter(({ id }) => id !== 0).map(({ id }) => id),
          },
        },
      }),
      ...sources
        .filter(({ id }) => id !== 0)
        .map(({ id, pattern, offset }) =>
          this.prisma.downloadSource.update({
            where: {
              id,
            },
            data: {
              pattern,
              offset,
            },
          }),
        ),
      this.prisma.downloadSource.createMany({
        data: sources
          .filter(({ id }) => id === 0)
          .map(({ pattern, offset }) => ({
            seasonId: id,
            pattern,
            offset,
          })),
      }),
      // 更新其他字段并获取结果
      this.prisma.season.update({
        where: {
          id,
        },
        data: {
          ...seasonPatch,
        },
        include: {
          jellyfinFolder: true,
          bannerImage: true,
          fanartImage: true,
          posterImage: true,
        },
      }),
      // 更新剧集放送时间，注意这个是在其他字段更新之后，但不影响上一个查询的结果
      this.prisma.$queryRaw<number>`
        UPDATE episodes
        SET air_time = episodes.raw_air_time - seasons.download_offset_hours * interval '1 hour'
        FROM seasons
        WHERE episodes.season_id = ${id}
          AND episodes.raw_air_time IS NOT NULL
          AND episodes.season_id = seasons.id
      `,
    ]);
    const season = results[results.length - 2];

    await this.job.enqueueDownloadJobs();
    await this.seasonEmit.writeSeasonMetadata(
      season as Exclude<
        typeof season,
        number | Prisma.BatchPayload | DownloadSource
      >,
    );

    return 'ok';
  }

  @Query(() => [DownloadJobStatus])
  async getActiveDownloadJobStatus(
    @Args({
      name: 'jobIds',
      type: () => [Int],
    })
    jobIds: number[],
  ) {
    const jobs = await this.prisma.downloadJob.findMany({
      where: {
        id: {
          in: jobIds,
        },
        status: DownloadStatus.DOWNLOADING,
        qbtTorrentHash: {
          not: null,
        },
      },
    });
    const torrents = await this.client.getActiveTorrentsStatus(
      jobs
        .map((job) => job.qbtTorrentHash)
        .filter((hash): hash is Exclude<typeof hash, null> => hash !== null),
    );
    const result: DownloadJobStatus[] = [];
    for (const torrent of torrents) {
      const job = jobs.find((job) => job.qbtTorrentHash === torrent.hash);
      if (!job) {
        continue;
      }
      result.push({
        id: job.id,
        downloaded: BigInt(torrent.downloaded),
        speed: torrent.speed,
        total: BigInt(torrent.total),
        eta: torrent.eta,
        peers: torrent.peers,
      });
    }
    return result;
  }
}

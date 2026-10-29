import { parseWorkflow } from '@lani/workflow';
import {
  AdminConfig,
  DownloadProgress,
  SaveSeasonPatch,
  SearchBangumiSeason,
} from '@/admin/index.model';
import {
  ApiError,
  BangumiAPIService,
  Legacy_SubjectType,
  SubjectType,
} from '@/api/bangumi';
import { PrismaService } from '@/common/prisma.service';
import config from '@/config';
import { IDownloadClient } from '@/download-client/IDownloadClient';
import { DownloadJobService } from '@/download-job/index.service';
import { env } from '@/env';
import { SeasonEmitService } from '@/season-emit/index.service';
import { DownloadSource, LegacyTaskStage, Prisma } from '@lani/db';
import { Injectable, Logger } from '@nestjs/common';
import { Args, ID, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SeasonSaveEvent, SEASON_SAVE_EVENT } from '@/integrations/events';
import {
  defaultSettings,
  validateSettings,
  SubtitleRequirement,
} from '@lani/smart-download';

@Injectable()
@Resolver()
export class AdminResolver {
  private logger = new Logger(AdminResolver.name);

  constructor(
    private prisma: PrismaService,
    private job: DownloadJobService,
    private seasonEmit: SeasonEmitService,
    private client: IDownloadClient,
    private emitter: EventEmitter2,
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
      lania: config.integrations.lania.enabled
        ? {
            publicHost: config.integrations.lania.publicHost,
          }
        : undefined,
      features: config.features,
      env,
    };
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
      this.logger.verbose(
        `Input keyword '${keywords}' is precise search, bgmid = ${bgmid}`,
      );
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

    this.logger.verbose(
      `Searching bangumi for '${keywords}' using ${
        useNewBangumiSearchApi ? 'new' : 'legacy'
      } API...`,
    );
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
      rejectOnNotFound: false,
      where: { id },
      include: {
        jellyfinFolder: true,
      },
    });
    if (!season) return 'ok';
    this.logger.log(`Deleting season #${id} (${season.title})...`);
    this.logger.verbose(
      `Deleting files for season #${id} (${season.title})...`,
    );
    await this.seasonEmit.deleteSeason(season);
    this.logger.log(`Delete #${id} (${season.title}) success`);
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
    validateSettings({
      ...defaultSettings,
      subtitle: (seasonPatch.smartDownloadSubtitle ??
        defaultSettings.subtitle) as SubtitleRequirement,
      windowHours:
        seasonPatch.smartDownloadWindowHours ?? defaultSettings.windowHours,
      timeoutMinutes:
        seasonPatch.smartDownloadTimeoutMinutes === undefined
          ? defaultSettings.timeoutMinutes
          : seasonPatch.smartDownloadTimeoutMinutes,
    });
    this.logger.log(`Updating season #${id}...`);
    this.logger.verbose(`Writing season #${id} to db...`);
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
          yearAndSemesterCanonical: ((yearAndSemester?: string) => {
            if (!yearAndSemester) {
              return undefined;
            }
            const yearAndSemesterInt = parseInt(yearAndSemester);
            // yearAndSemesterCanonical字段粗略做到可排序，原先的yearAndSemester冬季番
            //（XXXX年1月开播）录入的是XXXX04，会显得大于当年4月开播的春季番。出于兼容性考虑，
            // yearAndSemester字段的含义保持不变，写入的时候如果是春季则需要把年份-1
            if (yearAndSemesterInt % 100 === 4) {
              return yearAndSemesterInt - 100;
            } else {
              return yearAndSemesterInt;
            }
          })(seasonPatch.yearAndSemester),
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
    const season = results[results.length - 2] as Exclude<
      typeof results[number],
      number | Prisma.BatchPayload | DownloadSource
    >;

    this.logger.verbose(
      `Writing metadata to disk after season #${id} updated...`,
    );
    await this.seasonEmit.writeSeasonMetadata(season);
    this.logger.verbose(
      `Enqueuing new download jobs after season #${id} updated...`,
    );
    await this.job.enqueueDownloadJobsInternal();
    this.logger.log(`Update season #${id} success`);

    this.emitter.emit(SEASON_SAVE_EVENT, new SeasonSaveEvent(season));

    return 'ok';
  }

  @Query(() => [DownloadProgress])
  async getDownloadProgress(
    @Args({
      name: 'taskIds',
      type: () => [Int],
    })
    taskIds: number[],
  ) {
    if (!taskIds.length) return [];
    const jobs = await this.prisma.task.findMany({
      where: {
        isFailed: false,
        isCancelled: false,
        id: {
          in: taskIds,
        },
        legacyStage: LegacyTaskStage.DOWNLOADING,
        qbtTorrentHash: {
          not: null,
        },
      },
    });
    const activeJobs = jobs.filter(
      (job) => job.workflow && parseWorkflow(job.workflow).status === 'running',
    );
    if (!activeJobs.length) return [];
    const torrents = await this.client.getActiveTorrentsStatus(
      activeJobs
        .map((job) => job.qbtTorrentHash)
        .filter((hash): hash is Exclude<typeof hash, null> => hash !== null),
    );
    const result: DownloadProgress[] = [];
    for (const torrent of torrents) {
      for (const job of activeJobs.filter(
        (job) => job.qbtTorrentHash === torrent.hash,
      )) {
        result.push({
          id: job.id,
          downloaded: BigInt(torrent.downloaded),
          speed: torrent.speed,
          total: BigInt(torrent.total),
          eta: torrent.eta,
          peers: torrent.peers,
          seeds: torrent.seeds,
        });
      }
    }
    return result;
  }
}

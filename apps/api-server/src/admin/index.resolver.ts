import {
  SearchBangumiSeason,
  UpdateSeasonDownloadSourcesInput,
} from '@/admin/index.model';
import {
  ApiError,
  BangumiAPIService,
  ResponseGroup,
  SubjectType,
} from '@/api/bangumi';
import { PrismaService } from '@/common/prisma.service';
import { JobService } from '@/download-job/index.service';
import { env } from '@/env';
import { SeasonEmitService } from '@/season-emit/index.service';
import { Injectable } from '@nestjs/common';
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';

@Injectable()
@Resolver()
export class AdminResolver {
  constructor(
    private prisma: PrismaService,
    private job: JobService,
    private seasonEmit: SeasonEmitService,
  ) {}

  @Query(() => ID)
  environment() {
    return env;
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
  ): Promise<SearchBangumiSeason[]> {
    const match = keywords.match(
      /^(bgmid|bangumiid|bangumi_id):(\s)*(?<bgmid>(\d)+)$/,
    );
    if (match?.groups?.bgmid) {
      const bgmid = parseInt(match.groups.bgmid);
      try {
        const item =
          await BangumiAPIService.getSubjectByIdV0SubjectsSubjectIdGet(bgmid);
        if (item.type !== SubjectType._2) {
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

    const results = await BangumiAPIService.getSearchSubject(
      keywords,
      SubjectType._2,
      ResponseGroup.SMALL,
      0,
      25,
    );
    const ids = (results.list ?? []).map(({ id }) => `${id}`);
    const added = await this.prisma.season.findMany({
      where: {
        bangumiId: {
          in: ids,
        },
      },
    });
    return (results.list ?? []).map((item) => ({
      id: `${item.id}`,
      name: item.name_cn || item.name || '未命名',
      airDate: item.air_date,
      image: item.images?.small,
      added:
        added.find((season) => season.bangumiId === `${item.id}`) !== undefined,
    }));
  }

  @Query(() => [String])
  async getAvailableSemesters() {
    const results = await this.prisma.season.findMany({
      where: {
        isArchived: false,
      },
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
}

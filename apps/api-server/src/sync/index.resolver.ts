import { PrismaService } from '@/common/prisma.service';
import { ConfigType } from '@/config';
import { DateFormat } from '@/constants/date-format';
import { BangumiSeasonService } from '@/sync/bangumi/index.service';
import { PartialSeason } from '@/sync/index.model';
import { SkyhookSeasonService } from '@/sync/skyhook/index.service';
import { ensureXMLRoot, mergeXMLNode } from '@/utils/xml';
import { ConflictException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  Args,
  ID,
  Mutation,
  registerEnumType,
  Resolver,
} from '@nestjs/graphql';
import { Episode, MetadataSource, Season } from '@prisma/client';
import dayjs from 'dayjs';
import fs from 'fs/promises';
import path from 'path';
import xml2js from 'xml2js';

export enum InfoSource {
  BANGUMI = 'BANGUMI',
  SKYHOOK = 'SKYHOOK',
}

registerEnumType(InfoSource, { name: 'InfoSource' });

@Resolver()
export class SyncMetadataResolver {
  constructor(
    private skyhook: SkyhookSeasonService,
    private bangumi: BangumiSeasonService,
    private prisma: PrismaService,
    private config: ConfigService<ConfigType, true>,
  ) {}

  private readonly builder = new xml2js.Builder();
  private readonly parser = new xml2js.Parser();

  @Mutation(() => ID)
  async syncMetadata(
    @Args('seasonId') seasonId: number,
    @Args({ name: 'infoSource', type: () => InfoSource })
    infoSource: InfoSource,
  ) {
    const { bangumiId, tvdbId, tvdbSeason, isArchived } =
      await this.prisma.season.findUnique({
        where: { id: seasonId },
      });
    if (isArchived) {
      throw new ConflictException('season is archived (deleted)');
    }
    let result: PartialSeason = {};
    switch (infoSource) {
      case InfoSource.BANGUMI:
        if (!bangumiId) {
          throw new ConflictException('bangumiId not set');
        }
        result = await this.bangumi.fetch(
          {
            info: true,
            characters: true,
          },
          bangumiId,
        );
        break;
      case InfoSource.SKYHOOK:
        if (!tvdbId) {
          throw new ConflictException('tvdbid not set');
        }
        if (tvdbSeason === null) {
          throw new ConflictException('tvdbSeason not set');
        }
        result = await this.skyhook.fetch(
          {
            info: true,
            characters: true,
          },
          tvdbId,
          tvdbSeason,
        );
        break;
    }
    const { info } = result;
    const newSeason = await this.prisma.season.update({
      where: { id: seasonId },
      data: {
        description: info?.description ?? '',
        infoSource: {
          [InfoSource.BANGUMI]: MetadataSource.BGM_CN,
          [InfoSource.SKYHOOK]: MetadataSource.SKYHOOK,
        }[infoSource],
        tags: info?.tags ?? info?.genres ?? [],
        weekday: info?.weekday ?? null,
        airTime: info?.time ?? '',
      },
    });
    await this.writeSeasonMetadata(newSeason);
    return 'ok';
  }

  @Mutation(() => ID)
  async writeMetadata(@Args('seasonId') seasonId: number) {
    const season = await this.prisma.season.findUnique({
      where: { id: seasonId },
    });
    if (season.isArchived) {
      throw new ConflictException('season is archived (deleted)');
    }
    await this.writeSeasonMetadata(season);
    return 'ok';
  }

  private async writeSeasonMetadata({
    seasonRoot,
    title,
    description,
    tags,
    tvdbId,
    bangumiId,
    id,
    yearAndSemester,
  }: Season) {
    if (!seasonRoot) {
      throw new ConflictException('seasonRoot not set');
    }
    console.log(`writing metadata for season '${title}'`);
    const nfoPath = path.join(
      this.config.get('mediaRoot'),
      seasonRoot,
      title,
      'tvshow.nfo',
    );
    let xmlObj: any = {};
    try {
      await fs.stat(nfoPath);
      const currentContent = await fs.readFile(nfoPath, 'utf8');
      xmlObj = await this.parser.parseStringPromise(currentContent);
    } catch (error) {
      // 若文件不存在，xml格式有问题，无视报错，因为之后会覆盖它
      // 如果是没有读权限，或是目录，之后写入时肯定会报错，现在也可以无视
    }
    ensureXMLRoot(xmlObj, 'tvshow');
    // https://kodi.wiki/view/NFO_files/TV_shows
    mergeXMLNode(
      {
        title: [title],
        ...(description ? { plot: [description] } : undefined),
        tag: tags.length > 0 ? tags : undefined,
        uniqueId: [
          {
            $: {
              type: 'lani',
              default: 'true',
            },
            _: id,
          },
          tvdbId
            ? {
                $: {
                  type: 'tvdb',
                },
                _: tvdbId,
              }
            : undefined,
          bangumiId
            ? {
                $: {
                  type: 'bangumi',
                },
                _: bangumiId,
              }
            : undefined,
        ].filter(Boolean),
        ...(yearAndSemester
          ? { year: [yearAndSemester.substring(0, 4)] }
          : undefined),
      },
      xmlObj.tvshow,
    );
    const nfoContent = this.builder.buildObject(xmlObj);
    await fs.writeFile(nfoPath, nfoContent, 'utf-8');
  }

  @Mutation(() => ID)
  async syncEpisodeData(
    @Args('seasonId') seasonId: number,
    @Args({
      name: 'forced',
      description: 'to override episodes even when possible data loss',
      defaultValue: false,
    })
    forced: boolean,
  ) {
    const { episodesSource, bangumiId, tvdbId, tvdbSeason, episodes, airTime } =
      await this.prisma.season.findUnique({
        where: { id: seasonId },
        include: {
          episodes: true,
        },
      });
    let result: PartialSeason = {};
    switch (episodesSource) {
      case MetadataSource.BGM_CN:
        if (!bangumiId) {
          throw new ConflictException('bangumiId not set');
        }
        result = await this.bangumi.fetch(
          {
            episodes: true,
          },
          bangumiId,
        );
        break;
      case MetadataSource.SKYHOOK:
        if (!tvdbId) {
          throw new ConflictException('tvdbid not set');
        }
        if (tvdbSeason === null) {
          throw new ConflictException('tvdbSeason not set');
        }
        result = await this.skyhook.fetch(
          {
            episodes: true,
          },
          tvdbId,
          tvdbSeason,
        );
        break;
      default:
        return 'no effect';
    }
    const newEpisodes = result.episodes ?? [];
    const newIndices = new Set(newEpisodes.map(({ index }) => index));
    const oldMap: Record<number, Episode> = {};
    for (const episode of episodes) {
      oldMap[episode.index] = episode;
    }
    // 旧episode刷新后不存在，这里报错
    if (!forced && episodes.some(({ index }) => !newIndices.has(index))) {
      throw new ConflictException('new episodes not matching old episodes');
    }
    await this.prisma.$transaction(
      newEpisodes.map((episode) =>
        Boolean(oldMap[episode.index])
          ? this.prisma.episode.update({
              where: {
                id: oldMap[episode.index].id,
              },
              data: {
                title: episode.title,
                description: episode.description ?? '',
                airTime: this.getEpisodeAirTime(airTime, episode.airDate),
              },
            })
          : this.prisma.episode.create({
              data: {
                index: episode.index,
                title: episode.title,
                description: episode.description ?? '',
                seasonId: seasonId,
                airTime: this.getEpisodeAirTime(airTime, episode.airDate),
              },
            }),
      ),
    );
    return 'ok';
  }

  private getEpisodeAirTime(
    seasonAirTime: string,
    airDate: string | undefined,
  ) {
    if (!airDate) {
      return undefined;
    }
    if (!seasonAirTime) {
      return undefined;
    }
    const airTimeHours = parseInt(seasonAirTime.substring(0, 2));
    const airTimeMinutes = parseInt(seasonAirTime.substring(3, 5));
    const airTime = dayjs(airDate, DateFormat.NothingDay)
      .add(airTimeHours, 'h')
      .add(airTimeMinutes, 'm');
    return airTime.toDate();
  }
}

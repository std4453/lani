import { BangumiAPIService, Episode, EpType } from '@/api/bangumi';
import { DateFormat } from '@/constants/date-format';
import { decomposeAirDate } from '@/season-scrape/help';
import {
  FetchPartialSeasonRequest,
  PartialSeason,
  SeasonCharacter,
} from '@/season-scrape/index.model';
import { Injectable, Logger } from '@nestjs/common';
import dayjs from 'dayjs';
import { bangumiAliases } from '../aliases';
import {
  normalizeDeclaredEpisodeCount,
  normalizePremiereDate,
} from '../match-metadata';

@Injectable()
export class BangumiSeasonService {
  private logger = new Logger(BangumiSeasonService.name);

  private async fetchSubject(
    result: PartialSeason,
    bangumiId: number,
    includeInfo: boolean,
  ) {
    const season = await BangumiAPIService.getSubjectById(bangumiId);
    result.matchMetadata = {
      declaredEpisodeCount: normalizeDeclaredEpisodeCount(season.eps),
      premiereDate: normalizePremiereDate(season.date),
    };
    if (!includeInfo) return;
    result.info = {
      aliases: bangumiAliases(season.name, season.name_cn, season.infobox),
      description: season.summary,
      genres: [],
      tags: season.tags
        .filter((tag) => tag.count > 20)
        .map((tag) => tag.name)
        .filter((tag) => !tag.match(/[\u0001-\u001F]/)), // 不包含控制字符，否则无法写入 XML
      ...result.matchMetadata,
    };
    if (result.info.premiereDate) {
      const { semester, weekday, year } = decomposeAirDate(
        result.info.premiereDate,
      );
      result.info.year = year;
      result.info.semester = semester;
      result.info.weekday = weekday;
    }
    // 很不幸，bangumi的数据没有放送时间，只能手动录入
    result.images = {
      posterURL: season.images?.large,
    };
  }

  private async fetchEpisodes(result: PartialSeason, bangumiId: number) {
    const pageSize = 100;
    const episodes: Episode[] = [];
    while (true) {
      const { data = [], total } = await BangumiAPIService.getEpisodes(
        bangumiId,
        undefined, // 抓取所有类型，完成分页后选取本篇和 SP
        pageSize,
        episodes.length,
      );
      if (data.length === 0) {
        if (total !== undefined && episodes.length < total) {
          throw new Error(
            'Bangumi returned an empty page before all episodes were fetched',
          );
        }
        break;
      }
      episodes.push(...data);
      if (
        total !== undefined ? episodes.length >= total : data.length < pageSize
      ) {
        break;
      }
    }

    result.episodes = episodes
      .filter(
        (episode) =>
          episode.type === EpType.MainStory || episode.type === EpType.SP,
      )
      .flatMap((episode) => {
        const number =
          episode.type === EpType.MainStory ? episode.ep : episode.sort;
        // 对应 numeric(10,3) 的范围和精度，避免溢出或舍入造成编号冲突。
        for (const value of [number, episode.sort]) {
          if (
            typeof value !== 'number' ||
            !Number.isFinite(value) ||
            value < 0 ||
            !/^\d+(?:\.\d{1,3})?$/.test(String(value)) ||
            value >= 10000000
          ) {
            this.logger.warn(
              `Skipping Bangumi episode ${episode.id} in subject ${bangumiId}: invalid number or sort`,
            );
            return [];
          }
        }
        return [
          {
            index:
              episode.type === EpType.MainStory && Number.isInteger(number)
                ? number
                : undefined,
            episodeType: episode.type === EpType.MainStory ? 'EPISODE' : 'SP',
            episodeNumber: String(number),
            bangumiEpisodeId: episode.id,
            bangumiSort: String(episode.sort),
            sourceData: episode,
            title:
              episode.name_cn ||
              episode.name ||
              `${episode.type === EpType.SP ? 'SP ' : '第'}${number}${
                episode.type === EpType.SP ? '' : '话'
              }`,
            description: episode.desc,
            airDate:
              episode.airdate &&
              dayjs(episode.airdate).isValid() &&
              dayjs(episode.airdate).format(DateFormat.BarDay) ===
                episode.airdate
                ? dayjs(episode.airdate, DateFormat.BarDay).format(
                    DateFormat.NothingDay,
                  )
                : undefined,
          },
        ];
      });
  }

  private async fetchCharacters(result: PartialSeason, bangumiId: number) {
    const characters = await BangumiAPIService.getRelatedCharactersBySubjectId(
      bangumiId,
    );
    const mapped: SeasonCharacter[] = [];
    for (const character of characters) {
      for (const actor of character.actors ?? []) {
        mapped.push({
          character: character.name,
          characterImageURL: character.images?.large,
          actor: actor.name,
          actorImageURL: actor.images?.large,
        });
      }
    }
    result.characters = mapped;
  }

  async fetch(
    {
      episodes: needEpisodes,
      info: needInfo,
      characters: needCharacters,
      images: needImages,
    }: FetchPartialSeasonRequest,
    bangumiId: string,
  ): Promise<PartialSeason> {
    if (!bangumiId) {
      throw new Error('insufficient data to fetch');
    }
    const numBangumiId = parseInt(bangumiId);

    const result: PartialSeason = {};
    const promises: Promise<void>[] = [];

    if (needInfo || needImages || needEpisodes) {
      promises.push(
        this.fetchSubject(result, numBangumiId, !!(needInfo || needImages)),
      );
    }
    if (needEpisodes) {
      promises.push(this.fetchEpisodes(result, numBangumiId));
    }
    if (needCharacters) {
      promises.push(this.fetchCharacters(result, numBangumiId));
    }

    await Promise.all(promises);

    return result;
  }
}

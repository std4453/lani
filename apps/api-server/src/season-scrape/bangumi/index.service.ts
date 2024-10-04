import { BangumiAPIService, EpType } from '@/api/bangumi';
import { DateFormat } from '@/constants/date-format';
import { decomposeAirDate } from '@/season-scrape/help';
import {
  FetchPartialSeasonRequest,
  PartialSeason,
  SeasonCharacter,
} from '@/season-scrape/index.model';
import { Injectable } from '@nestjs/common';
import dayjs from 'dayjs';

@Injectable()
export class BangumiSeasonService {
  private async fetchInfoAndImages(result: PartialSeason, bangumiId: number) {
    const season = await BangumiAPIService.getSubjectById(bangumiId);
    result.info = {
      description: season.summary,
      genres: [],
      tags: season.tags
        .filter((tag) => tag.count > 20)
        .map((tag) => tag.name)
        .filter((tag) => !tag.match(/[\u0001-\u001F]/)), // 不包含控制字符，否则无法写入 XML
    };
    if (season.date) {
      const { semester, weekday, year } = decomposeAirDate(season.date);
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
    const { data: episodes = [] } = await BangumiAPIService.getEpisodes(
      bangumiId,
      EpType.MainStory, // 本篇
      100,
      0,
    );
    result.episodes = episodes
      // 因为过滤了本篇，应当总有ep字段，为了避免类似 https://github.com/bangumi/api/issues/146
      // 这样的事故造成的数据错误，且episode的逻辑是只增不删，因此进行额外的检查保证不录入错误数据
      .filter((episode) => typeof episode.ep === 'number' && episode.airdate)
      .map((episode) => ({
        index: episode.ep ?? 0,
        // 兜底文案
        title:
          episode.name_cn ||
          episode.name ||
          (typeof episode.ep === 'number' ? `第${episode.ep}话` : '未定'),
        description: episode.desc,
        airDate: dayjs(episode.airdate, DateFormat.BarDay).format(
          DateFormat.NothingDay,
        ),
      }));
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

    if (needInfo || needImages) {
      promises.push(this.fetchInfoAndImages(result, numBangumiId));
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

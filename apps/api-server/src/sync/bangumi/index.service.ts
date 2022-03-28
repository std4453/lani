import { BangumiAPIService, EpType } from '@/bangumi';
import { DateFormat } from '@/constants/date-format';
import {
  FetchPartialSeasonRequest,
  PartialSeason,
  SeasonCharacter,
} from '@/sync/index.model';
import { Injectable } from '@nestjs/common';
import dayjs from 'dayjs';

@Injectable()
export class BangumiSeasonService {
  private static userAgent = 'bangumi-skyhook/v1.0.0';

  private async fetchInfoAndImages(result: PartialSeason, bangumiId: number) {
    const season = await BangumiAPIService.getSubjectByIdV0SubjectsSubjectIdGet(
      bangumiId,
    );
    result.info = {
      description: season.summary,
      genres: [],
      tags: season.tags.map((tag) => tag.name),
    };
    result.images = {
      posterURL: season.images?.large,
    };
  }

  private async fetchEpisodes(result: PartialSeason, bangumiId: number) {
    const { data: episodes = [] } =
      await BangumiAPIService.getEpisodesV0EpisodesGet(
        bangumiId,
        EpType._0, // 本篇
        100,
        0,
      );
    result.episodes = episodes.map((episode) => ({
      // 因为过滤了本篇，应当总有此字段
      index: episode.ep ?? 0,
      // 兜底文案
      title: episode.name_cn || episode.name || '未定',
      description: episode.desc,
      airDate: dayjs(episode.airdate, DateFormat.BarDay).format(
        DateFormat.NothingDay,
      ),
    }));
  }

  private async fetchCharacters(result: PartialSeason, bangumiId: number) {
    const characters =
      await BangumiAPIService.getSubjectCharactersV0SubjectsSubjectIdCharactersGet(
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

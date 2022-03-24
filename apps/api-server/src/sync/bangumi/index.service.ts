import { ChinaAxiosService } from '@/common/axios.service';
import { DateFormat } from '@/constants/date-format';
import {
  BangumiCharacters,
  BangumiEpisodes,
  BangumiSeason,
} from '@/sync/bangumi/types';
import {
  FetchPartialSeasonRequest,
  PartialSeason,
  SeasonCharacter,
} from '@/sync/index.model';
import { Injectable } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import dayjs from 'dayjs';

@Injectable()
export class BangumiSeasonService {
  constructor(private axios: ChinaAxiosService) {}

  private static userAgent = 'bangumi-skyhook/v1.0.0';

  private async fetchInfoAndImages(result: PartialSeason, bangumiId: string) {
    const resp = await this.axios.get(
      `https://api.bgm.tv/v0/subjects/${bangumiId}`,
      {
        headers: {
          'user-agent': BangumiSeasonService.userAgent,
        },
      },
    );
    const season = plainToClass(BangumiSeason, resp.data);
    await validateOrReject(season);
    result.info = {
      description: season.summary,
      genres: [],
      tags: season.tags.map((tag) => tag.name),
    };
    result.images = {
      posterURL: season.images?.large,
    };
  }

  private async fetchEpisodes(result: PartialSeason, bangumiId: string) {
    const resp = await this.axios.get(
      `https://api.bgm.tv/v0/episodes?subject_id=${bangumiId}&limit=100&offset=0`,
      {
        headers: {
          'user-agent': BangumiSeasonService.userAgent,
        },
      },
    );
    const episodes = plainToClass(BangumiEpisodes, resp.data);
    await validateOrReject(episodes);
    result.episodes = episodes.data.map((episode) => ({
      index: episode.ep,
      // 兜底文案
      title: episode.name_cn || episode.name || 'TBA',
      description: episode.desc,
      airDate: dayjs(episode.airdate, DateFormat.BarDay).format(
        DateFormat.NothingDay,
      ),
    }));
  }

  private async fetchCharacters(result: PartialSeason, bangumiId: string) {
    const resp = await this.axios.get(
      `https://api.bgm.tv/v0/subjects/${bangumiId}/characters`,
      {
        headers: {
          'user-agent': BangumiSeasonService.userAgent,
        },
      },
    );
    const obj = plainToClass(BangumiCharacters, {
      characters: resp.data,
    });
    await validateOrReject(obj);
    const { characters } = obj;
    const mapped: SeasonCharacter[] = [];
    for (const character of Array.from(characters)) {
      for (const actor of Array.from(character.actors)) {
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

    const result: PartialSeason = {};
    const promises: Promise<void>[] = [];

    if (needInfo || needImages) {
      promises.push(this.fetchInfoAndImages(result, bangumiId));
    }
    if (needEpisodes) {
      promises.push(this.fetchEpisodes(result, bangumiId));
    }
    if (needCharacters) {
      promises.push(this.fetchCharacters(result, bangumiId));
    }

    await Promise.all(promises);

    return result;
  }
}

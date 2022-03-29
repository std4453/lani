import { GlobalAxiosService } from '@/common/axios.service';
import { DateFormat } from '@/constants/date-format';
import {
  FetchPartialSeasonRequest,
  PartialSeason,
  SeasonImages,
} from '@/sync/index.model';
import { SkyhookShow } from '@/sync/skyhook/types';
import { Injectable } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import dayjs from 'dayjs';

@Injectable()
export class SkyhookSeasonService {
  constructor(private axios: GlobalAxiosService) {}

  async fetch(
    {
      episodes: needEpisodes,
      info: needInfo,
      characters: needCharacters,
      images: needImages,
    }: FetchPartialSeasonRequest,
    tvdbId: string,
    seasonId: number | null,
  ): Promise<PartialSeason> {
    if (!tvdbId || seasonId === null) {
      throw new Error('insufficient data for fetching');
    }

    const resp = await this.axios.get(
      `https://skyhook.sonarr.tv/v1/tvdb/shows/en/${tvdbId}`,
    );
    const show = plainToClass(SkyhookShow, resp.data);
    await validateOrReject(show);
    if (!show.seasons.find((season) => season.seasonNumber === seasonId)) {
      throw new Error(`required season ${seasonId} does not exist`);
    }

    const result: PartialSeason = {};

    if (needInfo) {
      // XXX: 这里使用 tvdb 中全系列的数据来描述季度，其实是错误的
      result.info = {
        description: show.overview,
        genres: show.genres ?? [],
        tags: [],
        time: show.timeOfDay
          ? `${show.timeOfDay.hours
              .toString()
              .padStart(2, '0')}:${show.timeOfDay.minutes
              .toString()
              .padStart(2, '0')}`
          : undefined,
      };
    }

    if (needEpisodes) {
      const episodes = show.episodes
        .filter((episode) => episode.seasonNumer === seasonId)
        .filter((episode) => Boolean(episode.title));
      if (episodes.length === 0) {
        result.episodes = [];
      } else {
        result.episodes = episodes
          .filter((episode) => Boolean(episode.title))
          .map((episode) => ({
            index: episode.episodeNumber,
            title: episode.title ?? '',
            description: episode.overview ?? '',
            airDate: dayjs(episode.airDate, DateFormat.BarDay).format(
              DateFormat.NothingDay,
            ),
          }));
      }
    }

    if (needCharacters) {
      result.characters = show.actors.map((actor) => ({
        character: actor.character,
        actor: actor.name,
      }));
    }

    if (needImages) {
      const images: SeasonImages = {};
      for (const { coverType, url } of Array.from(show.images)) {
        if (coverType === 'Banner') {
          images.bannerURL = url;
        }
        if (coverType === 'Poster') {
          images.posterURL = url;
        }
        if (coverType === 'Fanart') {
          images.fanartURL = url;
        }
      }
      result.images = images;
    }

    return result;
  }
}

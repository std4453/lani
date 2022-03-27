import { InputType, ObjectType } from '@nestjs/graphql';
import { string } from 'fp-ts';

@ObjectType()
export class SeasonInfo {
  description?: string;
  tags: string[];
  genres: string[];
  // TODO: 卡司
  /**
   * 0 (Monday) - 6 (Sunday)
   */
  weekday?: number;
  /**
   * HH:mm (00:00-24:00)
   */
  time?: string;
}

@ObjectType()
export class SeasonEpisode {
  /**
   * starting from 1
   */
  index: number;
  title: string;
  description?: string;
  /**
   * YYYYMMDD
   */
  airDate?: string;
}

@ObjectType()
export class SeasonCharacter {
  character: string;
  actor: string;
  characterImageURL?: string;
  actorImageURL?: string;
}

@ObjectType()
export class SeasonImages {
  posterURL?: string;
  bannerURL?: string;
  fanartURL?: string;
}

@ObjectType()
export class PartialSeason {
  info?: SeasonInfo;
  episodes?: SeasonEpisode[];
  characters?: SeasonCharacter[];
  images?: SeasonImages;
}

@InputType()
export class FetchPartialSeasonRequest {
  info?: boolean;
  episodes?: boolean;
  characters?: boolean;
  images?: boolean;
}

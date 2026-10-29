import { Field, HideField, InputType, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class SeasonInfo {
  aliases: string[];
  description?: string;
  tags: string[];
  genres: string[];
  year?: number;
  semester?: number;
  @Field(() => Int, { nullable: true })
  declaredEpisodeCount?: number | null;
  @Field(() => String, { nullable: true })
  premiereDate?: string | null;
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
  index?: number;
  episodeNumber?: string;
  episodeType?: string;
  bangumiEpisodeId?: number;
  bangumiSort?: string;
  @HideField()
  sourceData?: any;
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
  @HideField()
  matchMetadata?: Pick<SeasonInfo, 'declaredEpisodeCount' | 'premiereDate'>;
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

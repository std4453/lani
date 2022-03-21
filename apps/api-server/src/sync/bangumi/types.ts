import { IsNotEmpty, IsOptional, IsUrl, ValidateNested } from 'class-validator';

export class BangumiImages {
  @IsOptional()
  @IsUrl()
  small?: string;

  @IsOptional()
  @IsUrl()
  grid?: string;

  @IsOptional()
  @IsUrl()
  large?: string;

  @IsOptional()
  @IsUrl()
  medium?: string;

  @IsOptional()
  @IsUrl()
  common?: string;
}

export class BangumiTag {
  name: string;
  count: number;
}

export class BangumiInfoBox {
  key: string;
  value: any;
}

export class BangumiRating {
  rank: number;
  total: number;
  count: Record<number, number>;
  score: number;
}

export class BangumiCollection {
  on_hold: number;
  dropped: number;
  wish: number;
  collect: number;
  doing: number;
}

export class BangumiSeason {
  /**
   * air date
   */
  date: string;
  @IsOptional()
  platform?: string;

  @ValidateNested()
  images: BangumiImages;

  @IsNotEmpty()
  name: string;
  /**
   * may be empty
   */
  name_cn: string;
  summary: string;

  @ValidateNested()
  tags: BangumiTag[];

  @ValidateNested()
  infobox: BangumiInfoBox[];

  total_episodes: number;

  @ValidateNested()
  rating: BangumiRating;

  @ValidateNested()
  collection: BangumiCollection;

  id: number;
  type: number;
  locked: boolean;
  nsfw: boolean;
  volumes: number;
  /**
   * number of episodes
   */
  eps: number;
}

export class BangumiEpisode {
  /**
   * YYYY-MM-DD
   */
  airdate: string;

  /**
   * might be empty if title is unavailable
   */
  name: string;
  /**
   * might be empty if Chinese translation is unavailable
   */
  name_cn: string;
  desc: string;

  /**
   * episode number in season, starting from 1
   */
  ep: number;
  /**
   * absolute episode number, (should be) unique across show
   */
  sort: number;

  id: number;
  subject_id: number;

  comment: number;
  type: number;
  disc: number;

  /**
   * HH:mm:ss
   */
  duration: string;
}

export class BangumiEpisodes {
  @ValidateNested()
  data: BangumiEpisode[];
  total: number;
  limit: number;
  offset: number;
}

export class BangumiActor {
  @IsOptional()
  @ValidateNested()
  images?: BangumiImages;
  name: string;
  short_summary: string;
  career: string[];
  id: number;
  type: number;
  locked: boolean;
}

export class BangumiCharacter {
  @IsOptional()
  @ValidateNested()
  images?: BangumiImages;
  name: string;
  relation: string;
  @ValidateNested()
  actors: BangumiActor[];
  type: number;
  locked: boolean;
}

export class BangumiCharacters {
  @ValidateNested()
  characters: BangumiCharacter[];
}

import { IsISO8601, IsOptional, IsUrl, ValidateNested } from 'class-validator';

export class SkyhookActor {
  name: string;
  character: string;
}

export class SkyhookImage {
  coverType: string;
  url: string;
}

export class SkyhookSeason {
  seasonNumber: number;
}

export class SkyhookEpisode {
  tvdbShowId: number;
  tvdbId: number;

  seasonNumer: number;
  /**
   * starting from 1
   */
  episodeNumber: number;
  @IsOptional()
  absoluteEpisodeNumber?: number;

  @IsOptional()
  title?: string;
  @IsOptional()
  overview?: string;

  @IsOptional()
  airDate?: string;
  @IsISO8601()
  @IsOptional()
  airDateUtc?: string;

  @IsOptional()
  writers?: string[];
  @IsOptional()
  directors?: string[];

  @IsOptional()
  @IsUrl()
  image?: string;
}

export class SkyhookTimeOfDay {
  hours: number;
  minutes: number;
}

export class SkyhookShow {
  tvdbId: number;

  title: string;
  @IsOptional()
  overview?: string;
  slug: string;

  firstAired: string;

  @IsISO8601()
  added: string;
  @IsISO8601()
  lastUpdated: string;

  status: string;
  runtime: number;
  @IsOptional()
  @ValidateNested()
  timeOfDay?: SkyhookTimeOfDay;

  @IsOptional()
  network?: string;
  @IsOptional()
  imdbId?: string;
  @IsOptional()
  tvMazeId?: number;

  genres: string[];
  @IsOptional()
  contentRating?: string;

  @ValidateNested()
  actors: SkyhookActor[];

  @ValidateNested()
  images: SkyhookImage[];

  @ValidateNested()
  seasons: SkyhookSeason[];

  @ValidateNested()
  episodes: SkyhookEpisode[];
}

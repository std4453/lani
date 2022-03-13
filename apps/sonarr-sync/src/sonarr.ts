// https://github.com/Sonarr/Sonarr/issues/445
// 在 Sonarr 提供官方 API 文档之前，先手动标注

/**
 * ISO 8601
 */
export type DateString = string;

export interface AlternativeTitle {
  /**
   * -1 by default
   */
  sceneSeasonNumber: number;
  title: string;
}

export interface SeriesImage {
  coverType: "banner" | "poster" | "fanart";
  /**
   * path only
   */
  url: string;
  remoteUrl: string;
}

export interface Statistics {
  episodeCount: number;
  episodeFileCount: number;
  percentOfEpisodes: number;
  sideOnDisk: number;
  totalEpisodeCount: number;
}

export interface Season {
  monitored: boolean;
  seasonNumber: number;
  statistics: Statistics;
}

export interface Series {
  added: DateString;
  /**
   * HH:mm
   */
  airTime: string;
  alternativeTitles: AlternativeTitle[];
  certification: string;
  /**
   * \w+
   */
  cleanTitle: string;
  ended: boolean;
  firstAired: DateString;
  genres: string[];
  id: number;
  images: SeriesImage[];
  imdbId: string;
  languageProfileId: number;
  monitored: boolean;
  network: string;
  overview: string;
  path: string;
  qualityProfileId: number;
  ratings: {
    votes: number;
    value: number;
  };
  rootFolderPath: string;
  /**
   * in minutes
   */
  runtime: number;
  seasonFolder: boolean;
  seasons: Season[];
  seriesType: "standard" | "daily" | "anime";
  statistics: Statistics;
  tags: string[];
  title: string;
  /**
   * [\w-]+
   */
  titleSlug: string;
  /**
   * 0 by default
   */
  tvMazeId: number;
  /**
   * 0 by default
   */
  tvRageId: number;
  /**
   * 0 by default
   */
  tvdbId: number;
  useSceneNumbering: boolean;
  year: number;
}

export type SonarrSeriesListResponse = Series[];

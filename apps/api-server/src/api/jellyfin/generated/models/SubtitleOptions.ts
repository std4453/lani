/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type SubtitleOptions = {
  SkipIfEmbeddedSubtitlesPresent?: boolean;
  SkipIfAudioTrackMatches?: boolean;
  DownloadLanguages?: Array<string> | null;
  DownloadMovieSubtitles?: boolean;
  DownloadEpisodeSubtitles?: boolean;
  OpenSubtitlesUsername?: string | null;
  OpenSubtitlesPasswordHash?: string | null;
  IsOpenSubtitleVipAccount?: boolean;
  RequirePerfectMatch?: boolean;
};

/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { EmbeddedSubtitleOptions } from './EmbeddedSubtitleOptions';
import type { MediaPathInfo } from './MediaPathInfo';
import type { TypeOptions } from './TypeOptions';

export type LibraryOptions = {
  EnablePhotos?: boolean;
  EnableRealtimeMonitor?: boolean;
  EnableChapterImageExtraction?: boolean;
  ExtractChapterImagesDuringLibraryScan?: boolean;
  PathInfos?: Array<MediaPathInfo>;
  SaveLocalMetadata?: boolean;
  EnableInternetProviders?: boolean;
  EnableAutomaticSeriesGrouping?: boolean;
  EnableEmbeddedTitles?: boolean;
  EnableEmbeddedEpisodeInfos?: boolean;
  AutomaticRefreshIntervalDays?: number;
  /**
   * Gets or sets the preferred metadata language.
   */
  PreferredMetadataLanguage?: string | null;
  /**
   * Gets or sets the metadata country code.
   */
  MetadataCountryCode?: string | null;
  SeasonZeroDisplayName?: string;
  MetadataSavers?: Array<string> | null;
  DisabledLocalMetadataReaders?: Array<string>;
  LocalMetadataReaderOrder?: Array<string> | null;
  DisabledSubtitleFetchers?: Array<string>;
  SubtitleFetcherOrder?: Array<string>;
  SkipSubtitlesIfEmbeddedSubtitlesPresent?: boolean;
  SkipSubtitlesIfAudioTrackMatches?: boolean;
  SubtitleDownloadLanguages?: Array<string> | null;
  RequirePerfectSubtitleMatch?: boolean;
  SaveSubtitlesWithMedia?: boolean;
  AutomaticallyAddToCollection?: boolean;
  /**
   * An enum representing the options to disable embedded subs.
   */
  AllowEmbeddedSubtitles?: EmbeddedSubtitleOptions;
  TypeOptions?: Array<TypeOptions>;
};

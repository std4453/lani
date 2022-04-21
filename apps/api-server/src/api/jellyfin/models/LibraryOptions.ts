/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { MediaPathInfo } from './MediaPathInfo';
import type { TypeOptions } from './TypeOptions';

export type LibraryOptions = {
    EnablePhotos?: boolean;
    EnableRealtimeMonitor?: boolean;
    EnableChapterImageExtraction?: boolean;
    ExtractChapterImagesDuringLibraryScan?: boolean;
    PathInfos?: Array<MediaPathInfo> | null;
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
    SeasonZeroDisplayName?: string | null;
    MetadataSavers?: Array<string> | null;
    DisabledLocalMetadataReaders?: Array<string> | null;
    LocalMetadataReaderOrder?: Array<string> | null;
    DisabledSubtitleFetchers?: Array<string> | null;
    SubtitleFetcherOrder?: Array<string> | null;
    SkipSubtitlesIfEmbeddedSubtitlesPresent?: boolean;
    SkipSubtitlesIfAudioTrackMatches?: boolean;
    SubtitleDownloadLanguages?: Array<string> | null;
    RequirePerfectSubtitleMatch?: boolean;
    SaveSubtitlesWithMedia?: boolean;
    TypeOptions?: Array<TypeOptions> | null;
};

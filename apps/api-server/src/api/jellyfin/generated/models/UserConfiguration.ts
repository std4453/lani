/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { SubtitlePlaybackMode } from './SubtitlePlaybackMode';

/**
 * Class UserConfiguration.
 */
export type UserConfiguration = {
  /**
   * Gets or sets the audio language preference.
   */
  AudioLanguagePreference?: string | null;
  /**
   * Gets or sets a value indicating whether [play default audio track].
   */
  PlayDefaultAudioTrack?: boolean;
  /**
   * Gets or sets the subtitle language preference.
   */
  SubtitleLanguagePreference?: string | null;
  DisplayMissingEpisodes?: boolean;
  GroupedFolders?: Array<string>;
  /**
   * An enum representing a subtitle playback mode.
   */
  SubtitleMode?: SubtitlePlaybackMode;
  DisplayCollectionsView?: boolean;
  EnableLocalPassword?: boolean;
  OrderedViews?: Array<string>;
  LatestItemsExcludes?: Array<string>;
  MyMediaExcludes?: Array<string>;
  HidePlayedInLatest?: boolean;
  RememberAudioSelections?: boolean;
  RememberSubtitleSelections?: boolean;
  EnableNextEpisodeAutoPlay?: boolean;
};

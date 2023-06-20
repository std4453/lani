/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ImageSavingConvention } from './ImageSavingConvention';
import type { MetadataOptions } from './MetadataOptions';
import type { NameValuePair } from './NameValuePair';
import type { PathSubstitution } from './PathSubstitution';
import type { RepositoryInfo } from './RepositoryInfo';

/**
 * Represents the server configuration.
 */
export type ServerConfiguration = {
  /**
   * Gets or sets the number of days we should retain log files.
   */
  LogFileRetentionDays?: number;
  /**
   * Gets or sets a value indicating whether this instance is first run.
   */
  IsStartupWizardCompleted?: boolean;
  /**
   * Gets or sets the cache path.
   */
  CachePath?: string | null;
  /**
   * Gets or sets the last known version that was ran using the configuration.
   */
  PreviousVersion?: string | null;
  /**
   * Gets or sets the stringified PreviousVersion to be stored/loaded,
   * because System.Version itself isn't xml-serializable.
   */
  PreviousVersionStr?: string | null;
  /**
   * Gets or sets a value indicating whether to enable prometheus metrics exporting.
   */
  EnableMetrics?: boolean;
  EnableNormalizedItemByNameIds?: boolean;
  /**
   * Gets or sets a value indicating whether this instance is port authorized.
   */
  IsPortAuthorized?: boolean;
  /**
   * Gets or sets a value indicating whether quick connect is available for use on this server.
   */
  QuickConnectAvailable?: boolean;
  /**
   * Gets or sets a value indicating whether [enable case sensitive item ids].
   */
  EnableCaseSensitiveItemIds?: boolean;
  DisableLiveTvChannelUserDataName?: boolean;
  /**
   * Gets or sets the metadata path.
   */
  MetadataPath?: string;
  MetadataNetworkPath?: string;
  /**
   * Gets or sets the preferred metadata language.
   */
  PreferredMetadataLanguage?: string;
  /**
   * Gets or sets the metadata country code.
   */
  MetadataCountryCode?: string;
  /**
   * Gets or sets characters to be replaced with a ' ' in strings to create a sort name.
   */
  SortReplaceCharacters?: Array<string>;
  /**
   * Gets or sets characters to be removed from strings to create a sort name.
   */
  SortRemoveCharacters?: Array<string>;
  /**
   * Gets or sets words to be removed from strings to create a sort name.
   */
  SortRemoveWords?: Array<string>;
  /**
   * Gets or sets the minimum percentage of an item that must be played in order for playstate to be updated.
   */
  MinResumePct?: number;
  /**
   * Gets or sets the maximum percentage of an item that can be played while still saving playstate. If this percentage is crossed playstate will be reset to the beginning and the item will be marked watched.
   */
  MaxResumePct?: number;
  /**
   * Gets or sets the minimum duration that an item must have in order to be eligible for playstate updates..
   */
  MinResumeDurationSeconds?: number;
  /**
   * Gets or sets the minimum minutes of a book that must be played in order for playstate to be updated.
   */
  MinAudiobookResume?: number;
  /**
   * Gets or sets the remaining minutes of a book that can be played while still saving playstate. If this percentage is crossed playstate will be reset to the beginning and the item will be marked watched.
   */
  MaxAudiobookResume?: number;
  /**
   * Gets or sets the delay in seconds that we will wait after a file system change to try and discover what has been added/removed
   * Some delay is necessary with some items because their creation is not atomic.  It involves the creation of several
   * different directories and files.
   */
  LibraryMonitorDelay?: number;
  /**
   * Gets or sets the image saving convention.
   */
  ImageSavingConvention?: ImageSavingConvention;
  MetadataOptions?: Array<MetadataOptions>;
  SkipDeserializationForBasicTypes?: boolean;
  ServerName?: string;
  UICulture?: string;
  SaveMetadataHidden?: boolean;
  ContentTypes?: Array<NameValuePair>;
  RemoteClientBitrateLimit?: number;
  EnableFolderView?: boolean;
  EnableGroupingIntoCollections?: boolean;
  DisplaySpecialsWithinSeasons?: boolean;
  CodecsUsed?: Array<string>;
  PluginRepositories?: Array<RepositoryInfo>;
  EnableExternalContentInSuggestions?: boolean;
  ImageExtractionTimeoutMs?: number;
  PathSubstitutions?: Array<PathSubstitution>;
  /**
   * Gets or sets a value indicating whether slow server responses should be logged as a warning.
   */
  EnableSlowResponseWarning?: boolean;
  /**
   * Gets or sets the threshold for the slow response time warning in ms.
   */
  SlowResponseThresholdMs?: number;
  /**
   * Gets or sets the cors hosts.
   */
  CorsHosts?: Array<string>;
  /**
   * Gets or sets the number of days we should retain activity logs.
   */
  ActivityLogRetentionDays?: number | null;
  /**
   * Gets or sets the how the library scan fans out.
   */
  LibraryScanFanoutConcurrency?: number;
  /**
   * Gets or sets the how many metadata refreshes can run concurrently.
   */
  LibraryMetadataRefreshConcurrency?: number;
  /**
   * Gets or sets a value indicating whether older plugins should automatically be deleted from the plugin folder.
   */
  RemoveOldPlugins?: boolean;
  /**
   * Gets or sets a value indicating whether clients should be allowed to upload logs.
   */
  AllowClientLogUpload?: boolean;
};

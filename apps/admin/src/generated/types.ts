import { TaskSummary } from '@lani/workflow';
import { Workflow } from '@lani/workflow';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  /** A floating point number that requires more precision than IEEE 754 binary 64 */
  BigFloat: any;
  /**
   * A signed eight-byte integer. The upper big integer values are greater than the
   * max value for a JavaScript number. Therefore all big integers will be output as
   * strings and not numbers.
   */
  BigInt: any;
  /** A location in a connection that can be used for resuming pagination. */
  Cursor: any;
  /** A date-time string at UTC, such as 2019-12-03T09:54:33Z, compliant with the date-time format. */
  DateTime: string;
  /**
   * A point in time as described by the [ISO
   * 8601](https://en.wikipedia.org/wiki/ISO_8601) standard. May or may not include a timezone.
   */
  Datetime: any;
  /** The `JSON` scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
  JSON: any;
  /** 任务展示摘要的 JSON 快照；协议由 @lani/workflow 定义。 */
  TaskSummary: TaskSummary;
  /** 版本化的任务流程快照；协议由 @lani/workflow 定义。 */
  Workflow: Workflow;
};

export type AdminConfig = {
  __typename?: 'AdminConfig';
  env: Scalars['String'];
  features: FeaturesConfig;
  jellyfin?: Maybe<JellyfinConfig>;
  lania?: Maybe<LaniaConfig>;
  matching?: Maybe<PublicMatchingConfig>;
  smartDownloadTitleExcludes?: Maybe<Array<Scalars['String']>>;
};

export type BatchDownloadEntry = {
  episodeId: Scalars['Int'];
  path: Scalars['String'];
};

export type BatchImportEntryState = {
  __typename?: 'BatchImportEntryState';
  episodeId: Scalars['Int'];
  filePath?: Maybe<Scalars['String']>;
  id: Scalars['String'];
  importPath?: Maybe<Scalars['String']>;
  jellyfinEpisodeId?: Maybe<Scalars['String']>;
  nfoPath?: Maybe<Scalars['String']>;
  sourcePath: Scalars['String'];
};

/** A filter to be used against BigFloat fields. All fields are combined with a logical ‘and.’ */
export type BigFloatFilter = {
  /** Not equal to the specified value, treating null like an ordinary value. */
  distinctFrom?: InputMaybe<Scalars['BigFloat']>;
  /** Equal to the specified value. */
  equalTo?: InputMaybe<Scalars['BigFloat']>;
  /** Greater than the specified value. */
  greaterThan?: InputMaybe<Scalars['BigFloat']>;
  /** Greater than or equal to the specified value. */
  greaterThanOrEqualTo?: InputMaybe<Scalars['BigFloat']>;
  /** Included in the specified list. */
  in?: InputMaybe<Array<Scalars['BigFloat']>>;
  /** Is null (if `true` is specified) or is not null (if `false` is specified). */
  isNull?: InputMaybe<Scalars['Boolean']>;
  /** Less than the specified value. */
  lessThan?: InputMaybe<Scalars['BigFloat']>;
  /** Less than or equal to the specified value. */
  lessThanOrEqualTo?: InputMaybe<Scalars['BigFloat']>;
  /** Equal to the specified value, treating null like an ordinary value. */
  notDistinctFrom?: InputMaybe<Scalars['BigFloat']>;
  /** Not equal to the specified value. */
  notEqualTo?: InputMaybe<Scalars['BigFloat']>;
  /** Not included in the specified list. */
  notIn?: InputMaybe<Array<Scalars['BigFloat']>>;
};

/** A filter to be used against BigInt fields. All fields are combined with a logical ‘and.’ */
export type BigIntFilter = {
  /** Not equal to the specified value, treating null like an ordinary value. */
  distinctFrom?: InputMaybe<Scalars['BigInt']>;
  /** Equal to the specified value. */
  equalTo?: InputMaybe<Scalars['BigInt']>;
  /** Greater than the specified value. */
  greaterThan?: InputMaybe<Scalars['BigInt']>;
  /** Greater than or equal to the specified value. */
  greaterThanOrEqualTo?: InputMaybe<Scalars['BigInt']>;
  /** Included in the specified list. */
  in?: InputMaybe<Array<Scalars['BigInt']>>;
  /** Is null (if `true` is specified) or is not null (if `false` is specified). */
  isNull?: InputMaybe<Scalars['Boolean']>;
  /** Less than the specified value. */
  lessThan?: InputMaybe<Scalars['BigInt']>;
  /** Less than or equal to the specified value. */
  lessThanOrEqualTo?: InputMaybe<Scalars['BigInt']>;
  /** Equal to the specified value, treating null like an ordinary value. */
  notDistinctFrom?: InputMaybe<Scalars['BigInt']>;
  /** Not equal to the specified value. */
  notEqualTo?: InputMaybe<Scalars['BigInt']>;
  /** Not included in the specified list. */
  notIn?: InputMaybe<Array<Scalars['BigInt']>>;
};

/** A filter to be used against Boolean fields. All fields are combined with a logical ‘and.’ */
export type BooleanFilter = {
  /** Not equal to the specified value, treating null like an ordinary value. */
  distinctFrom?: InputMaybe<Scalars['Boolean']>;
  /** Equal to the specified value. */
  equalTo?: InputMaybe<Scalars['Boolean']>;
  /** Greater than the specified value. */
  greaterThan?: InputMaybe<Scalars['Boolean']>;
  /** Greater than or equal to the specified value. */
  greaterThanOrEqualTo?: InputMaybe<Scalars['Boolean']>;
  /** Included in the specified list. */
  in?: InputMaybe<Array<Scalars['Boolean']>>;
  /** Is null (if `true` is specified) or is not null (if `false` is specified). */
  isNull?: InputMaybe<Scalars['Boolean']>;
  /** Less than the specified value. */
  lessThan?: InputMaybe<Scalars['Boolean']>;
  /** Less than or equal to the specified value. */
  lessThanOrEqualTo?: InputMaybe<Scalars['Boolean']>;
  /** Equal to the specified value, treating null like an ordinary value. */
  notDistinctFrom?: InputMaybe<Scalars['Boolean']>;
  /** Not equal to the specified value. */
  notEqualTo?: InputMaybe<Scalars['Boolean']>;
  /** Not included in the specified list. */
  notIn?: InputMaybe<Array<Scalars['Boolean']>>;
};

/** All input for the create `Image` mutation. */
export type CreateImageInput = {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** The `Image` to be created by this mutation. */
  image: ImageInput;
};

/** The output of our create `Image` mutation. */
export type CreateImagePayload = {
  __typename?: 'CreateImagePayload';
  /**
   * The exact same `clientMutationId` that was provided in the mutation input,
   * unchanged and unused. May be used by a client to track mutations.
   */
  clientMutationId?: Maybe<Scalars['String']>;
  /** The `Image` that was created by this mutation. */
  image?: Maybe<Image>;
  /** An edge for our `Image`. May be used by Relay 1. */
  imageEdge?: Maybe<ImagesEdge>;
  /** Our root query field type. Allows us to run any query from our mutation payload. */
  query?: Maybe<Query>;
};


/** The output of our create `Image` mutation. */
export type CreateImagePayloadImageEdgeArgs = {
  orderBy?: InputMaybe<Array<ImagesOrderBy>>;
};

/** All input for the create `Season` mutation. */
export type CreateSeasonInput = {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** The `Season` to be created by this mutation. */
  season: SeasonInput;
};

/** The output of our create `Season` mutation. */
export type CreateSeasonPayload = {
  __typename?: 'CreateSeasonPayload';
  /**
   * The exact same `clientMutationId` that was provided in the mutation input,
   * unchanged and unused. May be used by a client to track mutations.
   */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Reads a single `Image` that is related to this `Season`. */
  imageByBannerImageId?: Maybe<Image>;
  /** Reads a single `Image` that is related to this `Season`. */
  imageByFanartImageId?: Maybe<Image>;
  /** Reads a single `Image` that is related to this `Season`. */
  imageByPosterImageId?: Maybe<Image>;
  /** Reads a single `JellyfinFolder` that is related to this `Season`. */
  jellyfinFolderByJellyfinFolderId?: Maybe<JellyfinFolder>;
  /** Our root query field type. Allows us to run any query from our mutation payload. */
  query?: Maybe<Query>;
  /** The `Season` that was created by this mutation. */
  season?: Maybe<Season>;
  /** An edge for our `Season`. May be used by Relay 1. */
  seasonEdge?: Maybe<SeasonsEdge>;
};


/** The output of our create `Season` mutation. */
export type CreateSeasonPayloadSeasonEdgeArgs = {
  orderBy?: InputMaybe<Array<SeasonsOrderBy>>;
};

/** A filter to be used against Datetime fields. All fields are combined with a logical ‘and.’ */
export type DatetimeFilter = {
  /** Not equal to the specified value, treating null like an ordinary value. */
  distinctFrom?: InputMaybe<Scalars['Datetime']>;
  /** Equal to the specified value. */
  equalTo?: InputMaybe<Scalars['Datetime']>;
  /** Greater than the specified value. */
  greaterThan?: InputMaybe<Scalars['Datetime']>;
  /** Greater than or equal to the specified value. */
  greaterThanOrEqualTo?: InputMaybe<Scalars['Datetime']>;
  /** Included in the specified list. */
  in?: InputMaybe<Array<Scalars['Datetime']>>;
  /** Is null (if `true` is specified) or is not null (if `false` is specified). */
  isNull?: InputMaybe<Scalars['Boolean']>;
  /** Less than the specified value. */
  lessThan?: InputMaybe<Scalars['Datetime']>;
  /** Less than or equal to the specified value. */
  lessThanOrEqualTo?: InputMaybe<Scalars['Datetime']>;
  /** Equal to the specified value, treating null like an ordinary value. */
  notDistinctFrom?: InputMaybe<Scalars['Datetime']>;
  /** Not equal to the specified value. */
  notEqualTo?: InputMaybe<Scalars['Datetime']>;
  /** Not included in the specified list. */
  notIn?: InputMaybe<Array<Scalars['Datetime']>>;
};

/** All input for the `deleteImageById` mutation. */
export type DeleteImageByIdInput = {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']>;
  id: Scalars['Int'];
};

/** All input for the `deleteImageBySourceUrl` mutation. */
export type DeleteImageBySourceUrlInput = {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']>;
  sourceUrl: Scalars['String'];
};

/** All input for the `deleteImage` mutation. */
export type DeleteImageInput = {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** The globally unique `ID` which will identify a single `Image` to be deleted. */
  nodeId: Scalars['ID'];
};

/** The output of our delete `Image` mutation. */
export type DeleteImagePayload = {
  __typename?: 'DeleteImagePayload';
  /**
   * The exact same `clientMutationId` that was provided in the mutation input,
   * unchanged and unused. May be used by a client to track mutations.
   */
  clientMutationId?: Maybe<Scalars['String']>;
  deletedImageId?: Maybe<Scalars['ID']>;
  /** The `Image` that was deleted by this mutation. */
  image?: Maybe<Image>;
  /** An edge for our `Image`. May be used by Relay 1. */
  imageEdge?: Maybe<ImagesEdge>;
  /** Our root query field type. Allows us to run any query from our mutation payload. */
  query?: Maybe<Query>;
};


/** The output of our delete `Image` mutation. */
export type DeleteImagePayloadImageEdgeArgs = {
  orderBy?: InputMaybe<Array<ImagesOrderBy>>;
};

/** All input for the `deleteTorrentByHash` mutation. */
export type DeleteTorrentByHashInput = {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']>;
  hash: Scalars['String'];
};

/** All input for the `deleteTorrentById` mutation. */
export type DeleteTorrentByIdInput = {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']>;
  id: Scalars['Int'];
};

/** All input for the `deleteTorrent` mutation. */
export type DeleteTorrentInput = {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** The globally unique `ID` which will identify a single `Torrent` to be deleted. */
  nodeId: Scalars['ID'];
};

/** The output of our delete `Torrent` mutation. */
export type DeleteTorrentPayload = {
  __typename?: 'DeleteTorrentPayload';
  /**
   * The exact same `clientMutationId` that was provided in the mutation input,
   * unchanged and unused. May be used by a client to track mutations.
   */
  clientMutationId?: Maybe<Scalars['String']>;
  deletedTorrentId?: Maybe<Scalars['ID']>;
  /** Our root query field type. Allows us to run any query from our mutation payload. */
  query?: Maybe<Query>;
  /** Reads a single `Season` that is related to this `Torrent`. */
  seasonByMatchedSeasonId?: Maybe<Season>;
  /** The `Torrent` that was deleted by this mutation. */
  torrent?: Maybe<Torrent>;
  /** An edge for our `Torrent`. May be used by Relay 1. */
  torrentEdge?: Maybe<TorrentsEdge>;
};


/** The output of our delete `Torrent` mutation. */
export type DeleteTorrentPayloadTorrentEdgeArgs = {
  orderBy?: InputMaybe<Array<TorrentsOrderBy>>;
};

export type DownloadProgress = {
  __typename?: 'DownloadProgress';
  downloaded: Scalars['BigInt'];
  eta?: Maybe<Scalars['Int']>;
  id: Scalars['Int'];
  peers?: Maybe<Scalars['Int']>;
  seeds?: Maybe<Scalars['Int']>;
  speed: Scalars['Int'];
  total: Scalars['BigInt'];
};

export type DownloadSource = Node & {
  __typename?: 'DownloadSource';
  createdAt: Scalars['Datetime'];
  groupId: Scalars['String'];
  id: Scalars['Int'];
  isDisabled: Scalars['Boolean'];
  /** A globally unique identifier. Can be used in various places throughout the system to identify this single value. */
  nodeId: Scalars['ID'];
  offset: Scalars['Int'];
  pattern: Scalars['String'];
  /** Reads a single `Season` that is related to this `DownloadSource`. */
  seasonBySeasonId?: Maybe<Season>;
  seasonId: Scalars['Int'];
};

/**
 * A condition to be used against `DownloadSource` object types. All fields are
 * tested for equality and combined with a logical ‘and.’
 */
export type DownloadSourceCondition = {
  /** Checks for equality with the object’s `createdAt` field. */
  createdAt?: InputMaybe<Scalars['Datetime']>;
  /** Checks for equality with the object’s `groupId` field. */
  groupId?: InputMaybe<Scalars['String']>;
  /** Checks for equality with the object’s `id` field. */
  id?: InputMaybe<Scalars['Int']>;
  /** Checks for equality with the object’s `isDisabled` field. */
  isDisabled?: InputMaybe<Scalars['Boolean']>;
  /** Checks for equality with the object’s `offset` field. */
  offset?: InputMaybe<Scalars['Int']>;
  /** Checks for equality with the object’s `pattern` field. */
  pattern?: InputMaybe<Scalars['String']>;
  /** Checks for equality with the object’s `seasonId` field. */
  seasonId?: InputMaybe<Scalars['Int']>;
};

/** A filter to be used against `DownloadSource` object types. All fields are combined with a logical ‘and.’ */
export type DownloadSourceFilter = {
  /** Checks for all expressions in this list. */
  and?: InputMaybe<Array<DownloadSourceFilter>>;
  /** Filter by the object’s `createdAt` field. */
  createdAt?: InputMaybe<DatetimeFilter>;
  /** Filter by the object’s `groupId` field. */
  groupId?: InputMaybe<StringFilter>;
  /** Filter by the object’s `id` field. */
  id?: InputMaybe<IntFilter>;
  /** Filter by the object’s `isDisabled` field. */
  isDisabled?: InputMaybe<BooleanFilter>;
  /** Negates the expression. */
  not?: InputMaybe<DownloadSourceFilter>;
  /** Filter by the object’s `offset` field. */
  offset?: InputMaybe<IntFilter>;
  /** Checks for any expressions in this list. */
  or?: InputMaybe<Array<DownloadSourceFilter>>;
  /** Filter by the object’s `pattern` field. */
  pattern?: InputMaybe<StringFilter>;
  /** Filter by the object’s `seasonBySeasonId` relation. */
  seasonBySeasonId?: InputMaybe<SeasonFilter>;
  /** Filter by the object’s `seasonId` field. */
  seasonId?: InputMaybe<IntFilter>;
};

/** A connection to a list of `DownloadSource` values. */
export type DownloadSourcesConnection = {
  __typename?: 'DownloadSourcesConnection';
  /** A list of edges which contains the `DownloadSource` and cursor to aid in pagination. */
  edges: Array<DownloadSourcesEdge>;
  /** A list of `DownloadSource` objects. */
  nodes: Array<Maybe<DownloadSource>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** The count of *all* `DownloadSource` you could get from the connection. */
  totalCount: Scalars['Int'];
};

/** A `DownloadSource` edge in the connection. */
export type DownloadSourcesEdge = {
  __typename?: 'DownloadSourcesEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']>;
  /** The `DownloadSource` at the end of the edge. */
  node?: Maybe<DownloadSource>;
};

export type DownloadSourcesInput = {
  id: Scalars['Int'];
  offset: Scalars['Int'];
  pattern: Scalars['String'];
};

/** Methods to use when ordering `DownloadSource`. */
export enum DownloadSourcesOrderBy {
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
  GroupIdAsc = 'GROUP_ID_ASC',
  GroupIdDesc = 'GROUP_ID_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  IsDisabledAsc = 'IS_DISABLED_ASC',
  IsDisabledDesc = 'IS_DISABLED_DESC',
  Natural = 'NATURAL',
  OffsetAsc = 'OFFSET_ASC',
  OffsetDesc = 'OFFSET_DESC',
  PatternAsc = 'PATTERN_ASC',
  PatternDesc = 'PATTERN_DESC',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  SeasonBySeasonIdAirTimeAsc = 'SEASON_BY_SEASON_ID__AIR_TIME_ASC',
  SeasonBySeasonIdAirTimeDesc = 'SEASON_BY_SEASON_ID__AIR_TIME_DESC',
  SeasonBySeasonIdAliasesAsc = 'SEASON_BY_SEASON_ID__ALIASES_ASC',
  SeasonBySeasonIdAliasesDesc = 'SEASON_BY_SEASON_ID__ALIASES_DESC',
  SeasonBySeasonIdBangumiIdAsc = 'SEASON_BY_SEASON_ID__BANGUMI_ID_ASC',
  SeasonBySeasonIdBangumiIdDesc = 'SEASON_BY_SEASON_ID__BANGUMI_ID_DESC',
  SeasonBySeasonIdBannerImageIdAsc = 'SEASON_BY_SEASON_ID__BANNER_IMAGE_ID_ASC',
  SeasonBySeasonIdBannerImageIdDesc = 'SEASON_BY_SEASON_ID__BANNER_IMAGE_ID_DESC',
  SeasonBySeasonIdBilibiliMainlandIdAsc = 'SEASON_BY_SEASON_ID__BILIBILI_MAINLAND_ID_ASC',
  SeasonBySeasonIdBilibiliMainlandIdDesc = 'SEASON_BY_SEASON_ID__BILIBILI_MAINLAND_ID_DESC',
  SeasonBySeasonIdBilibiliThmIdAsc = 'SEASON_BY_SEASON_ID__BILIBILI_THM_ID_ASC',
  SeasonBySeasonIdBilibiliThmIdDesc = 'SEASON_BY_SEASON_ID__BILIBILI_THM_ID_DESC',
  SeasonBySeasonIdCreatedAtAsc = 'SEASON_BY_SEASON_ID__CREATED_AT_ASC',
  SeasonBySeasonIdCreatedAtDesc = 'SEASON_BY_SEASON_ID__CREATED_AT_DESC',
  SeasonBySeasonIdDandanplayAnimeIdAsc = 'SEASON_BY_SEASON_ID__DANDANPLAY_ANIME_ID_ASC',
  SeasonBySeasonIdDandanplayAnimeIdDesc = 'SEASON_BY_SEASON_ID__DANDANPLAY_ANIME_ID_DESC',
  SeasonBySeasonIdDeclaredEpisodeCountAsc = 'SEASON_BY_SEASON_ID__DECLARED_EPISODE_COUNT_ASC',
  SeasonBySeasonIdDeclaredEpisodeCountDesc = 'SEASON_BY_SEASON_ID__DECLARED_EPISODE_COUNT_DESC',
  SeasonBySeasonIdDescriptionAsc = 'SEASON_BY_SEASON_ID__DESCRIPTION_ASC',
  SeasonBySeasonIdDescriptionDesc = 'SEASON_BY_SEASON_ID__DESCRIPTION_DESC',
  SeasonBySeasonIdDirectoryAsc = 'SEASON_BY_SEASON_ID__DIRECTORY_ASC',
  SeasonBySeasonIdDirectoryDesc = 'SEASON_BY_SEASON_ID__DIRECTORY_DESC',
  SeasonBySeasonIdDownloadOffsetHoursAsc = 'SEASON_BY_SEASON_ID__DOWNLOAD_OFFSET_HOURS_ASC',
  SeasonBySeasonIdDownloadOffsetHoursDesc = 'SEASON_BY_SEASON_ID__DOWNLOAD_OFFSET_HOURS_DESC',
  SeasonBySeasonIdEpisodesAutoSyncAsc = 'SEASON_BY_SEASON_ID__EPISODES_AUTO_SYNC_ASC',
  SeasonBySeasonIdEpisodesAutoSyncDesc = 'SEASON_BY_SEASON_ID__EPISODES_AUTO_SYNC_DESC',
  SeasonBySeasonIdEpisodesLastSyncAsc = 'SEASON_BY_SEASON_ID__EPISODES_LAST_SYNC_ASC',
  SeasonBySeasonIdEpisodesLastSyncDesc = 'SEASON_BY_SEASON_ID__EPISODES_LAST_SYNC_DESC',
  SeasonBySeasonIdEpisodesSourceAsc = 'SEASON_BY_SEASON_ID__EPISODES_SOURCE_ASC',
  SeasonBySeasonIdEpisodesSourceDesc = 'SEASON_BY_SEASON_ID__EPISODES_SOURCE_DESC',
  SeasonBySeasonIdFanartImageIdAsc = 'SEASON_BY_SEASON_ID__FANART_IMAGE_ID_ASC',
  SeasonBySeasonIdFanartImageIdDesc = 'SEASON_BY_SEASON_ID__FANART_IMAGE_ID_DESC',
  SeasonBySeasonIdIdAsc = 'SEASON_BY_SEASON_ID__ID_ASC',
  SeasonBySeasonIdIdDesc = 'SEASON_BY_SEASON_ID__ID_DESC',
  SeasonBySeasonIdInfoSourceAsc = 'SEASON_BY_SEASON_ID__INFO_SOURCE_ASC',
  SeasonBySeasonIdInfoSourceDesc = 'SEASON_BY_SEASON_ID__INFO_SOURCE_DESC',
  SeasonBySeasonIdIntegrationsLaniaSyncAsc = 'SEASON_BY_SEASON_ID__INTEGRATIONS_LANIA_SYNC_ASC',
  SeasonBySeasonIdIntegrationsLaniaSyncDesc = 'SEASON_BY_SEASON_ID__INTEGRATIONS_LANIA_SYNC_DESC',
  SeasonBySeasonIdIsMonitoringAsc = 'SEASON_BY_SEASON_ID__IS_MONITORING_ASC',
  SeasonBySeasonIdIsMonitoringDesc = 'SEASON_BY_SEASON_ID__IS_MONITORING_DESC',
  SeasonBySeasonIdJellyfinFolderIdAsc = 'SEASON_BY_SEASON_ID__JELLYFIN_FOLDER_ID_ASC',
  SeasonBySeasonIdJellyfinFolderIdDesc = 'SEASON_BY_SEASON_ID__JELLYFIN_FOLDER_ID_DESC',
  SeasonBySeasonIdJellyfinIdAsc = 'SEASON_BY_SEASON_ID__JELLYFIN_ID_ASC',
  SeasonBySeasonIdJellyfinIdDesc = 'SEASON_BY_SEASON_ID__JELLYFIN_ID_DESC',
  SeasonBySeasonIdLastWriteDirectoryAsc = 'SEASON_BY_SEASON_ID__LAST_WRITE_DIRECTORY_ASC',
  SeasonBySeasonIdLastWriteDirectoryDesc = 'SEASON_BY_SEASON_ID__LAST_WRITE_DIRECTORY_DESC',
  SeasonBySeasonIdLastWriteTitleAsc = 'SEASON_BY_SEASON_ID__LAST_WRITE_TITLE_ASC',
  SeasonBySeasonIdLastWriteTitleDesc = 'SEASON_BY_SEASON_ID__LAST_WRITE_TITLE_DESC',
  SeasonBySeasonIdLastWriteToDiskAsc = 'SEASON_BY_SEASON_ID__LAST_WRITE_TO_DISK_ASC',
  SeasonBySeasonIdLastWriteToDiskDesc = 'SEASON_BY_SEASON_ID__LAST_WRITE_TO_DISK_DESC',
  SeasonBySeasonIdMikanAnimeIdAsc = 'SEASON_BY_SEASON_ID__MIKAN_ANIME_ID_ASC',
  SeasonBySeasonIdMikanAnimeIdDesc = 'SEASON_BY_SEASON_ID__MIKAN_ANIME_ID_DESC',
  SeasonBySeasonIdNeedDownloadCcAsc = 'SEASON_BY_SEASON_ID__NEED_DOWNLOAD_CC_ASC',
  SeasonBySeasonIdNeedDownloadCcDesc = 'SEASON_BY_SEASON_ID__NEED_DOWNLOAD_CC_DESC',
  SeasonBySeasonIdNotifyMissingAsc = 'SEASON_BY_SEASON_ID__NOTIFY_MISSING_ASC',
  SeasonBySeasonIdNotifyMissingDesc = 'SEASON_BY_SEASON_ID__NOTIFY_MISSING_DESC',
  SeasonBySeasonIdNotifyPublishAsc = 'SEASON_BY_SEASON_ID__NOTIFY_PUBLISH_ASC',
  SeasonBySeasonIdNotifyPublishDesc = 'SEASON_BY_SEASON_ID__NOTIFY_PUBLISH_DESC',
  SeasonBySeasonIdPosterImageIdAsc = 'SEASON_BY_SEASON_ID__POSTER_IMAGE_ID_ASC',
  SeasonBySeasonIdPosterImageIdDesc = 'SEASON_BY_SEASON_ID__POSTER_IMAGE_ID_DESC',
  SeasonBySeasonIdPremiereDateAsc = 'SEASON_BY_SEASON_ID__PREMIERE_DATE_ASC',
  SeasonBySeasonIdPremiereDateDesc = 'SEASON_BY_SEASON_ID__PREMIERE_DATE_DESC',
  SeasonBySeasonIdSmartDownloadEnabledAsc = 'SEASON_BY_SEASON_ID__SMART_DOWNLOAD_ENABLED_ASC',
  SeasonBySeasonIdSmartDownloadEnabledDesc = 'SEASON_BY_SEASON_ID__SMART_DOWNLOAD_ENABLED_DESC',
  SeasonBySeasonIdSmartDownloadPreferBahaAsc = 'SEASON_BY_SEASON_ID__SMART_DOWNLOAD_PREFER_BAHA_ASC',
  SeasonBySeasonIdSmartDownloadPreferBahaDesc = 'SEASON_BY_SEASON_ID__SMART_DOWNLOAD_PREFER_BAHA_DESC',
  SeasonBySeasonIdSmartDownloadSubtitleAsc = 'SEASON_BY_SEASON_ID__SMART_DOWNLOAD_SUBTITLE_ASC',
  SeasonBySeasonIdSmartDownloadSubtitleDesc = 'SEASON_BY_SEASON_ID__SMART_DOWNLOAD_SUBTITLE_DESC',
  SeasonBySeasonIdSmartDownloadTimeoutMinutesAsc = 'SEASON_BY_SEASON_ID__SMART_DOWNLOAD_TIMEOUT_MINUTES_ASC',
  SeasonBySeasonIdSmartDownloadTimeoutMinutesDesc = 'SEASON_BY_SEASON_ID__SMART_DOWNLOAD_TIMEOUT_MINUTES_DESC',
  SeasonBySeasonIdSmartDownloadWindowHoursAsc = 'SEASON_BY_SEASON_ID__SMART_DOWNLOAD_WINDOW_HOURS_ASC',
  SeasonBySeasonIdSmartDownloadWindowHoursDesc = 'SEASON_BY_SEASON_ID__SMART_DOWNLOAD_WINDOW_HOURS_DESC',
  SeasonBySeasonIdTagsAsc = 'SEASON_BY_SEASON_ID__TAGS_ASC',
  SeasonBySeasonIdTagsDesc = 'SEASON_BY_SEASON_ID__TAGS_DESC',
  SeasonBySeasonIdTitleAsc = 'SEASON_BY_SEASON_ID__TITLE_ASC',
  SeasonBySeasonIdTitleDesc = 'SEASON_BY_SEASON_ID__TITLE_DESC',
  SeasonBySeasonIdTvdbIdAsc = 'SEASON_BY_SEASON_ID__TVDB_ID_ASC',
  SeasonBySeasonIdTvdbIdDesc = 'SEASON_BY_SEASON_ID__TVDB_ID_DESC',
  SeasonBySeasonIdTvdbSeasonAsc = 'SEASON_BY_SEASON_ID__TVDB_SEASON_ASC',
  SeasonBySeasonIdTvdbSeasonDesc = 'SEASON_BY_SEASON_ID__TVDB_SEASON_DESC',
  SeasonBySeasonIdWeekdayAsc = 'SEASON_BY_SEASON_ID__WEEKDAY_ASC',
  SeasonBySeasonIdWeekdayDesc = 'SEASON_BY_SEASON_ID__WEEKDAY_DESC',
  SeasonBySeasonIdYearAndSemesterAsc = 'SEASON_BY_SEASON_ID__YEAR_AND_SEMESTER_ASC',
  SeasonBySeasonIdYearAndSemesterCanonicalAsc = 'SEASON_BY_SEASON_ID__YEAR_AND_SEMESTER_CANONICAL_ASC',
  SeasonBySeasonIdYearAndSemesterCanonicalDesc = 'SEASON_BY_SEASON_ID__YEAR_AND_SEMESTER_CANONICAL_DESC',
  SeasonBySeasonIdYearAndSemesterDesc = 'SEASON_BY_SEASON_ID__YEAR_AND_SEMESTER_DESC',
  SeasonIdAsc = 'SEASON_ID_ASC',
  SeasonIdDesc = 'SEASON_ID_DESC'
}

export type Episode = Node & {
  __typename?: 'Episode';
  airTime?: Maybe<Scalars['Datetime']>;
  bangumiEpisodeId?: Maybe<Scalars['Int']>;
  bangumiSort?: Maybe<Scalars['BigFloat']>;
  createdAt: Scalars['Datetime'];
  currentVersionId?: Maybe<Scalars['Int']>;
  dandanplayEpisodeId?: Maybe<Scalars['String']>;
  description: Scalars['String'];
  episodeNumber?: Maybe<Scalars['BigFloat']>;
  episodeType: EpisodeType;
  id: Scalars['Int'];
  index?: Maybe<Scalars['Int']>;
  jellyfinEpisodeId?: Maybe<Scalars['String']>;
  lastMissingNotifyTime?: Maybe<Scalars['Datetime']>;
  /** A globally unique identifier. Can be used in various places throughout the system to identify this single value. */
  nodeId: Scalars['ID'];
  numbering?: Maybe<Scalars['JSON']>;
  rawAirTime?: Maybe<Scalars['Datetime']>;
  /** Reads a single `Season` that is related to this `Episode`. */
  seasonBySeasonId?: Maybe<Season>;
  seasonId: Scalars['Int'];
  /** Reads and enables pagination through a set of `Task`. */
  singleTasksByEpisodeId: TasksConnection;
  sourceData?: Maybe<Scalars['JSON']>;
  /** Reads and enables pagination through a set of `TaskEpisode`. */
  taskEpisodesByEpisodeId: TaskEpisodesConnection;
  /** Reads and enables pagination through a set of `Task`. */
  tasksByEpisodeId: TasksConnection;
  title: Scalars['String'];
};


export type EpisodeSingleTasksByEpisodeIdArgs = {
  after?: InputMaybe<Scalars['Cursor']>;
  before?: InputMaybe<Scalars['Cursor']>;
  condition?: InputMaybe<TaskCondition>;
  filter?: InputMaybe<TaskFilter>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<TasksOrderBy>>;
};


export type EpisodeTaskEpisodesByEpisodeIdArgs = {
  after?: InputMaybe<Scalars['Cursor']>;
  before?: InputMaybe<Scalars['Cursor']>;
  condition?: InputMaybe<TaskEpisodeCondition>;
  filter?: InputMaybe<TaskEpisodeFilter>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<TaskEpisodesOrderBy>>;
};


export type EpisodeTasksByEpisodeIdArgs = {
  after?: InputMaybe<Scalars['Cursor']>;
  before?: InputMaybe<Scalars['Cursor']>;
  condition?: InputMaybe<TaskCondition>;
  filter?: InputMaybe<TaskFilter>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<TasksOrderBy>>;
};

/** A condition to be used against `Episode` object types. All fields are tested for equality and combined with a logical ‘and.’ */
export type EpisodeCondition = {
  /** Checks for equality with the object’s `airTime` field. */
  airTime?: InputMaybe<Scalars['Datetime']>;
  /** Checks for equality with the object’s `bangumiEpisodeId` field. */
  bangumiEpisodeId?: InputMaybe<Scalars['Int']>;
  /** Checks for equality with the object’s `bangumiSort` field. */
  bangumiSort?: InputMaybe<Scalars['BigFloat']>;
  /** Checks for equality with the object’s `createdAt` field. */
  createdAt?: InputMaybe<Scalars['Datetime']>;
  /** Checks for equality with the object’s `currentVersionId` field. */
  currentVersionId?: InputMaybe<Scalars['Int']>;
  /** Checks for equality with the object’s `dandanplayEpisodeId` field. */
  dandanplayEpisodeId?: InputMaybe<Scalars['String']>;
  /** Checks for equality with the object’s `description` field. */
  description?: InputMaybe<Scalars['String']>;
  /** Checks for equality with the object’s `episodeNumber` field. */
  episodeNumber?: InputMaybe<Scalars['BigFloat']>;
  /** Checks for equality with the object’s `episodeType` field. */
  episodeType?: InputMaybe<EpisodeType>;
  /** Checks for equality with the object’s `id` field. */
  id?: InputMaybe<Scalars['Int']>;
  /** Checks for equality with the object’s `index` field. */
  index?: InputMaybe<Scalars['Int']>;
  /** Checks for equality with the object’s `jellyfinEpisodeId` field. */
  jellyfinEpisodeId?: InputMaybe<Scalars['String']>;
  /** Checks for equality with the object’s `lastMissingNotifyTime` field. */
  lastMissingNotifyTime?: InputMaybe<Scalars['Datetime']>;
  /** Checks for equality with the object’s `rawAirTime` field. */
  rawAirTime?: InputMaybe<Scalars['Datetime']>;
  /** Checks for equality with the object’s `seasonId` field. */
  seasonId?: InputMaybe<Scalars['Int']>;
  /** Checks for equality with the object’s `sourceData` field. */
  sourceData?: InputMaybe<Scalars['JSON']>;
  /** Checks for equality with the object’s `title` field. */
  title?: InputMaybe<Scalars['String']>;
};

/** A filter to be used against `Episode` object types. All fields are combined with a logical ‘and.’ */
export type EpisodeFilter = {
  /** Filter by the object’s `airTime` field. */
  airTime?: InputMaybe<DatetimeFilter>;
  /** Checks for all expressions in this list. */
  and?: InputMaybe<Array<EpisodeFilter>>;
  /** Filter by the object’s `bangumiEpisodeId` field. */
  bangumiEpisodeId?: InputMaybe<IntFilter>;
  /** Filter by the object’s `bangumiSort` field. */
  bangumiSort?: InputMaybe<BigFloatFilter>;
  /** Filter by the object’s `createdAt` field. */
  createdAt?: InputMaybe<DatetimeFilter>;
  /** Filter by the object’s `currentVersionId` field. */
  currentVersionId?: InputMaybe<IntFilter>;
  /** Filter by the object’s `dandanplayEpisodeId` field. */
  dandanplayEpisodeId?: InputMaybe<StringFilter>;
  /** Filter by the object’s `description` field. */
  description?: InputMaybe<StringFilter>;
  /** Filter by the object’s `episodeNumber` field. */
  episodeNumber?: InputMaybe<BigFloatFilter>;
  /** Filter by the object’s `episodeType` field. */
  episodeType?: InputMaybe<EpisodeTypeFilter>;
  /** Filter by the object’s `id` field. */
  id?: InputMaybe<IntFilter>;
  /** Filter by the object’s `index` field. */
  index?: InputMaybe<IntFilter>;
  /** Filter by the object’s `jellyfinEpisodeId` field. */
  jellyfinEpisodeId?: InputMaybe<StringFilter>;
  /** Filter by the object’s `lastMissingNotifyTime` field. */
  lastMissingNotifyTime?: InputMaybe<DatetimeFilter>;
  /** Negates the expression. */
  not?: InputMaybe<EpisodeFilter>;
  /** Filter by the object’s `numbering` field. */
  numbering?: InputMaybe<JsonFilter>;
  /** Checks for any expressions in this list. */
  or?: InputMaybe<Array<EpisodeFilter>>;
  /** Filter by the object’s `rawAirTime` field. */
  rawAirTime?: InputMaybe<DatetimeFilter>;
  /** Filter by the object’s `seasonBySeasonId` relation. */
  seasonBySeasonId?: InputMaybe<SeasonFilter>;
  /** Filter by the object’s `seasonId` field. */
  seasonId?: InputMaybe<IntFilter>;
  /** Filter by the object’s `singleTasksByEpisodeId` relation. */
  singleTasksByEpisodeId?: InputMaybe<EpisodeToManyTaskFilter>;
  /** Some related `singleTasksByEpisodeId` exist. */
  singleTasksByEpisodeIdExist?: InputMaybe<Scalars['Boolean']>;
  /** Filter by the object’s `sourceData` field. */
  sourceData?: InputMaybe<JsonFilter>;
  /** Filter by the object’s `taskEpisodesByEpisodeId` relation. */
  taskEpisodesByEpisodeId?: InputMaybe<EpisodeToManyTaskEpisodeFilter>;
  /** Some related `taskEpisodesByEpisodeId` exist. */
  taskEpisodesByEpisodeIdExist?: InputMaybe<Scalars['Boolean']>;
  /** Filter by the object’s `title` field. */
  title?: InputMaybe<StringFilter>;
};

/** Represents an update to a `Episode`. Fields that are set will be updated. */
export type EpisodePatch = {
  airTime?: InputMaybe<Scalars['Datetime']>;
  bangumiEpisodeId?: InputMaybe<Scalars['Int']>;
  bangumiSort?: InputMaybe<Scalars['BigFloat']>;
  createdAt?: InputMaybe<Scalars['Datetime']>;
  dandanplayEpisodeId?: InputMaybe<Scalars['String']>;
  description?: InputMaybe<Scalars['String']>;
  episodeNumber?: InputMaybe<Scalars['BigFloat']>;
  episodeType?: InputMaybe<EpisodeType>;
  id?: InputMaybe<Scalars['Int']>;
  index?: InputMaybe<Scalars['Int']>;
  jellyfinEpisodeId?: InputMaybe<Scalars['String']>;
  lastMissingNotifyTime?: InputMaybe<Scalars['Datetime']>;
  rawAirTime?: InputMaybe<Scalars['Datetime']>;
  seasonId?: InputMaybe<Scalars['Int']>;
  sourceData?: InputMaybe<Scalars['JSON']>;
  title?: InputMaybe<Scalars['String']>;
};

/** A filter to be used against many `TaskEpisode` object types. All fields are combined with a logical ‘and.’ */
export type EpisodeToManyTaskEpisodeFilter = {
  /** Every related `TaskEpisode` matches the filter criteria. All fields are combined with a logical ‘and.’ */
  every?: InputMaybe<TaskEpisodeFilter>;
  /** No related `TaskEpisode` matches the filter criteria. All fields are combined with a logical ‘and.’ */
  none?: InputMaybe<TaskEpisodeFilter>;
  /** Some related `TaskEpisode` matches the filter criteria. All fields are combined with a logical ‘and.’ */
  some?: InputMaybe<TaskEpisodeFilter>;
};

/** A filter to be used against many `Task` object types. All fields are combined with a logical ‘and.’ */
export type EpisodeToManyTaskFilter = {
  /** Every related `Task` matches the filter criteria. All fields are combined with a logical ‘and.’ */
  every?: InputMaybe<TaskFilter>;
  /** No related `Task` matches the filter criteria. All fields are combined with a logical ‘and.’ */
  none?: InputMaybe<TaskFilter>;
  /** Some related `Task` matches the filter criteria. All fields are combined with a logical ‘and.’ */
  some?: InputMaybe<TaskFilter>;
};

export enum EpisodeType {
  Episode = 'EPISODE',
  Oad = 'OAD',
  Ova = 'OVA',
  Sp = 'SP'
}

/** A filter to be used against EpisodeType fields. All fields are combined with a logical ‘and.’ */
export type EpisodeTypeFilter = {
  /** Not equal to the specified value, treating null like an ordinary value. */
  distinctFrom?: InputMaybe<EpisodeType>;
  /** Equal to the specified value. */
  equalTo?: InputMaybe<EpisodeType>;
  /** Greater than the specified value. */
  greaterThan?: InputMaybe<EpisodeType>;
  /** Greater than or equal to the specified value. */
  greaterThanOrEqualTo?: InputMaybe<EpisodeType>;
  /** Included in the specified list. */
  in?: InputMaybe<Array<EpisodeType>>;
  /** Is null (if `true` is specified) or is not null (if `false` is specified). */
  isNull?: InputMaybe<Scalars['Boolean']>;
  /** Less than the specified value. */
  lessThan?: InputMaybe<EpisodeType>;
  /** Less than or equal to the specified value. */
  lessThanOrEqualTo?: InputMaybe<EpisodeType>;
  /** Equal to the specified value, treating null like an ordinary value. */
  notDistinctFrom?: InputMaybe<EpisodeType>;
  /** Not equal to the specified value. */
  notEqualTo?: InputMaybe<EpisodeType>;
  /** Not included in the specified list. */
  notIn?: InputMaybe<Array<EpisodeType>>;
};

/** A connection to a list of `Episode` values. */
export type EpisodesConnection = {
  __typename?: 'EpisodesConnection';
  /** A list of edges which contains the `Episode` and cursor to aid in pagination. */
  edges: Array<EpisodesEdge>;
  /** A list of `Episode` objects. */
  nodes: Array<Maybe<Episode>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** The count of *all* `Episode` you could get from the connection. */
  totalCount: Scalars['Int'];
};

/** A `Episode` edge in the connection. */
export type EpisodesEdge = {
  __typename?: 'EpisodesEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']>;
  /** The `Episode` at the end of the edge. */
  node?: Maybe<Episode>;
};

/** Methods to use when ordering `Episode`. */
export enum EpisodesOrderBy {
  AirTimeAsc = 'AIR_TIME_ASC',
  AirTimeDesc = 'AIR_TIME_DESC',
  BangumiEpisodeIdAsc = 'BANGUMI_EPISODE_ID_ASC',
  BangumiEpisodeIdDesc = 'BANGUMI_EPISODE_ID_DESC',
  BangumiSortAsc = 'BANGUMI_SORT_ASC',
  BangumiSortDesc = 'BANGUMI_SORT_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
  CurrentVersionIdAsc = 'CURRENT_VERSION_ID_ASC',
  CurrentVersionIdDesc = 'CURRENT_VERSION_ID_DESC',
  DandanplayEpisodeIdAsc = 'DANDANPLAY_EPISODE_ID_ASC',
  DandanplayEpisodeIdDesc = 'DANDANPLAY_EPISODE_ID_DESC',
  DescriptionAsc = 'DESCRIPTION_ASC',
  DescriptionDesc = 'DESCRIPTION_DESC',
  EpisodeNumberAsc = 'EPISODE_NUMBER_ASC',
  EpisodeNumberDesc = 'EPISODE_NUMBER_DESC',
  EpisodeTypeAsc = 'EPISODE_TYPE_ASC',
  EpisodeTypeDesc = 'EPISODE_TYPE_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  IndexAsc = 'INDEX_ASC',
  IndexDesc = 'INDEX_DESC',
  JellyfinEpisodeIdAsc = 'JELLYFIN_EPISODE_ID_ASC',
  JellyfinEpisodeIdDesc = 'JELLYFIN_EPISODE_ID_DESC',
  LastMissingNotifyTimeAsc = 'LAST_MISSING_NOTIFY_TIME_ASC',
  LastMissingNotifyTimeDesc = 'LAST_MISSING_NOTIFY_TIME_DESC',
  Natural = 'NATURAL',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  RawAirTimeAsc = 'RAW_AIR_TIME_ASC',
  RawAirTimeDesc = 'RAW_AIR_TIME_DESC',
  SeasonBySeasonIdAirTimeAsc = 'SEASON_BY_SEASON_ID__AIR_TIME_ASC',
  SeasonBySeasonIdAirTimeDesc = 'SEASON_BY_SEASON_ID__AIR_TIME_DESC',
  SeasonBySeasonIdAliasesAsc = 'SEASON_BY_SEASON_ID__ALIASES_ASC',
  SeasonBySeasonIdAliasesDesc = 'SEASON_BY_SEASON_ID__ALIASES_DESC',
  SeasonBySeasonIdBangumiIdAsc = 'SEASON_BY_SEASON_ID__BANGUMI_ID_ASC',
  SeasonBySeasonIdBangumiIdDesc = 'SEASON_BY_SEASON_ID__BANGUMI_ID_DESC',
  SeasonBySeasonIdBannerImageIdAsc = 'SEASON_BY_SEASON_ID__BANNER_IMAGE_ID_ASC',
  SeasonBySeasonIdBannerImageIdDesc = 'SEASON_BY_SEASON_ID__BANNER_IMAGE_ID_DESC',
  SeasonBySeasonIdBilibiliMainlandIdAsc = 'SEASON_BY_SEASON_ID__BILIBILI_MAINLAND_ID_ASC',
  SeasonBySeasonIdBilibiliMainlandIdDesc = 'SEASON_BY_SEASON_ID__BILIBILI_MAINLAND_ID_DESC',
  SeasonBySeasonIdBilibiliThmIdAsc = 'SEASON_BY_SEASON_ID__BILIBILI_THM_ID_ASC',
  SeasonBySeasonIdBilibiliThmIdDesc = 'SEASON_BY_SEASON_ID__BILIBILI_THM_ID_DESC',
  SeasonBySeasonIdCreatedAtAsc = 'SEASON_BY_SEASON_ID__CREATED_AT_ASC',
  SeasonBySeasonIdCreatedAtDesc = 'SEASON_BY_SEASON_ID__CREATED_AT_DESC',
  SeasonBySeasonIdDandanplayAnimeIdAsc = 'SEASON_BY_SEASON_ID__DANDANPLAY_ANIME_ID_ASC',
  SeasonBySeasonIdDandanplayAnimeIdDesc = 'SEASON_BY_SEASON_ID__DANDANPLAY_ANIME_ID_DESC',
  SeasonBySeasonIdDeclaredEpisodeCountAsc = 'SEASON_BY_SEASON_ID__DECLARED_EPISODE_COUNT_ASC',
  SeasonBySeasonIdDeclaredEpisodeCountDesc = 'SEASON_BY_SEASON_ID__DECLARED_EPISODE_COUNT_DESC',
  SeasonBySeasonIdDescriptionAsc = 'SEASON_BY_SEASON_ID__DESCRIPTION_ASC',
  SeasonBySeasonIdDescriptionDesc = 'SEASON_BY_SEASON_ID__DESCRIPTION_DESC',
  SeasonBySeasonIdDirectoryAsc = 'SEASON_BY_SEASON_ID__DIRECTORY_ASC',
  SeasonBySeasonIdDirectoryDesc = 'SEASON_BY_SEASON_ID__DIRECTORY_DESC',
  SeasonBySeasonIdDownloadOffsetHoursAsc = 'SEASON_BY_SEASON_ID__DOWNLOAD_OFFSET_HOURS_ASC',
  SeasonBySeasonIdDownloadOffsetHoursDesc = 'SEASON_BY_SEASON_ID__DOWNLOAD_OFFSET_HOURS_DESC',
  SeasonBySeasonIdEpisodesAutoSyncAsc = 'SEASON_BY_SEASON_ID__EPISODES_AUTO_SYNC_ASC',
  SeasonBySeasonIdEpisodesAutoSyncDesc = 'SEASON_BY_SEASON_ID__EPISODES_AUTO_SYNC_DESC',
  SeasonBySeasonIdEpisodesLastSyncAsc = 'SEASON_BY_SEASON_ID__EPISODES_LAST_SYNC_ASC',
  SeasonBySeasonIdEpisodesLastSyncDesc = 'SEASON_BY_SEASON_ID__EPISODES_LAST_SYNC_DESC',
  SeasonBySeasonIdEpisodesSourceAsc = 'SEASON_BY_SEASON_ID__EPISODES_SOURCE_ASC',
  SeasonBySeasonIdEpisodesSourceDesc = 'SEASON_BY_SEASON_ID__EPISODES_SOURCE_DESC',
  SeasonBySeasonIdFanartImageIdAsc = 'SEASON_BY_SEASON_ID__FANART_IMAGE_ID_ASC',
  SeasonBySeasonIdFanartImageIdDesc = 'SEASON_BY_SEASON_ID__FANART_IMAGE_ID_DESC',
  SeasonBySeasonIdIdAsc = 'SEASON_BY_SEASON_ID__ID_ASC',
  SeasonBySeasonIdIdDesc = 'SEASON_BY_SEASON_ID__ID_DESC',
  SeasonBySeasonIdInfoSourceAsc = 'SEASON_BY_SEASON_ID__INFO_SOURCE_ASC',
  SeasonBySeasonIdInfoSourceDesc = 'SEASON_BY_SEASON_ID__INFO_SOURCE_DESC',
  SeasonBySeasonIdIntegrationsLaniaSyncAsc = 'SEASON_BY_SEASON_ID__INTEGRATIONS_LANIA_SYNC_ASC',
  SeasonBySeasonIdIntegrationsLaniaSyncDesc = 'SEASON_BY_SEASON_ID__INTEGRATIONS_LANIA_SYNC_DESC',
  SeasonBySeasonIdIsMonitoringAsc = 'SEASON_BY_SEASON_ID__IS_MONITORING_ASC',
  SeasonBySeasonIdIsMonitoringDesc = 'SEASON_BY_SEASON_ID__IS_MONITORING_DESC',
  SeasonBySeasonIdJellyfinFolderIdAsc = 'SEASON_BY_SEASON_ID__JELLYFIN_FOLDER_ID_ASC',
  SeasonBySeasonIdJellyfinFolderIdDesc = 'SEASON_BY_SEASON_ID__JELLYFIN_FOLDER_ID_DESC',
  SeasonBySeasonIdJellyfinIdAsc = 'SEASON_BY_SEASON_ID__JELLYFIN_ID_ASC',
  SeasonBySeasonIdJellyfinIdDesc = 'SEASON_BY_SEASON_ID__JELLYFIN_ID_DESC',
  SeasonBySeasonIdLastWriteDirectoryAsc = 'SEASON_BY_SEASON_ID__LAST_WRITE_DIRECTORY_ASC',
  SeasonBySeasonIdLastWriteDirectoryDesc = 'SEASON_BY_SEASON_ID__LAST_WRITE_DIRECTORY_DESC',
  SeasonBySeasonIdLastWriteTitleAsc = 'SEASON_BY_SEASON_ID__LAST_WRITE_TITLE_ASC',
  SeasonBySeasonIdLastWriteTitleDesc = 'SEASON_BY_SEASON_ID__LAST_WRITE_TITLE_DESC',
  SeasonBySeasonIdLastWriteToDiskAsc = 'SEASON_BY_SEASON_ID__LAST_WRITE_TO_DISK_ASC',
  SeasonBySeasonIdLastWriteToDiskDesc = 'SEASON_BY_SEASON_ID__LAST_WRITE_TO_DISK_DESC',
  SeasonBySeasonIdMikanAnimeIdAsc = 'SEASON_BY_SEASON_ID__MIKAN_ANIME_ID_ASC',
  SeasonBySeasonIdMikanAnimeIdDesc = 'SEASON_BY_SEASON_ID__MIKAN_ANIME_ID_DESC',
  SeasonBySeasonIdNeedDownloadCcAsc = 'SEASON_BY_SEASON_ID__NEED_DOWNLOAD_CC_ASC',
  SeasonBySeasonIdNeedDownloadCcDesc = 'SEASON_BY_SEASON_ID__NEED_DOWNLOAD_CC_DESC',
  SeasonBySeasonIdNotifyMissingAsc = 'SEASON_BY_SEASON_ID__NOTIFY_MISSING_ASC',
  SeasonBySeasonIdNotifyMissingDesc = 'SEASON_BY_SEASON_ID__NOTIFY_MISSING_DESC',
  SeasonBySeasonIdNotifyPublishAsc = 'SEASON_BY_SEASON_ID__NOTIFY_PUBLISH_ASC',
  SeasonBySeasonIdNotifyPublishDesc = 'SEASON_BY_SEASON_ID__NOTIFY_PUBLISH_DESC',
  SeasonBySeasonIdPosterImageIdAsc = 'SEASON_BY_SEASON_ID__POSTER_IMAGE_ID_ASC',
  SeasonBySeasonIdPosterImageIdDesc = 'SEASON_BY_SEASON_ID__POSTER_IMAGE_ID_DESC',
  SeasonBySeasonIdPremiereDateAsc = 'SEASON_BY_SEASON_ID__PREMIERE_DATE_ASC',
  SeasonBySeasonIdPremiereDateDesc = 'SEASON_BY_SEASON_ID__PREMIERE_DATE_DESC',
  SeasonBySeasonIdSmartDownloadEnabledAsc = 'SEASON_BY_SEASON_ID__SMART_DOWNLOAD_ENABLED_ASC',
  SeasonBySeasonIdSmartDownloadEnabledDesc = 'SEASON_BY_SEASON_ID__SMART_DOWNLOAD_ENABLED_DESC',
  SeasonBySeasonIdSmartDownloadPreferBahaAsc = 'SEASON_BY_SEASON_ID__SMART_DOWNLOAD_PREFER_BAHA_ASC',
  SeasonBySeasonIdSmartDownloadPreferBahaDesc = 'SEASON_BY_SEASON_ID__SMART_DOWNLOAD_PREFER_BAHA_DESC',
  SeasonBySeasonIdSmartDownloadSubtitleAsc = 'SEASON_BY_SEASON_ID__SMART_DOWNLOAD_SUBTITLE_ASC',
  SeasonBySeasonIdSmartDownloadSubtitleDesc = 'SEASON_BY_SEASON_ID__SMART_DOWNLOAD_SUBTITLE_DESC',
  SeasonBySeasonIdSmartDownloadTimeoutMinutesAsc = 'SEASON_BY_SEASON_ID__SMART_DOWNLOAD_TIMEOUT_MINUTES_ASC',
  SeasonBySeasonIdSmartDownloadTimeoutMinutesDesc = 'SEASON_BY_SEASON_ID__SMART_DOWNLOAD_TIMEOUT_MINUTES_DESC',
  SeasonBySeasonIdSmartDownloadWindowHoursAsc = 'SEASON_BY_SEASON_ID__SMART_DOWNLOAD_WINDOW_HOURS_ASC',
  SeasonBySeasonIdSmartDownloadWindowHoursDesc = 'SEASON_BY_SEASON_ID__SMART_DOWNLOAD_WINDOW_HOURS_DESC',
  SeasonBySeasonIdTagsAsc = 'SEASON_BY_SEASON_ID__TAGS_ASC',
  SeasonBySeasonIdTagsDesc = 'SEASON_BY_SEASON_ID__TAGS_DESC',
  SeasonBySeasonIdTitleAsc = 'SEASON_BY_SEASON_ID__TITLE_ASC',
  SeasonBySeasonIdTitleDesc = 'SEASON_BY_SEASON_ID__TITLE_DESC',
  SeasonBySeasonIdTvdbIdAsc = 'SEASON_BY_SEASON_ID__TVDB_ID_ASC',
  SeasonBySeasonIdTvdbIdDesc = 'SEASON_BY_SEASON_ID__TVDB_ID_DESC',
  SeasonBySeasonIdTvdbSeasonAsc = 'SEASON_BY_SEASON_ID__TVDB_SEASON_ASC',
  SeasonBySeasonIdTvdbSeasonDesc = 'SEASON_BY_SEASON_ID__TVDB_SEASON_DESC',
  SeasonBySeasonIdWeekdayAsc = 'SEASON_BY_SEASON_ID__WEEKDAY_ASC',
  SeasonBySeasonIdWeekdayDesc = 'SEASON_BY_SEASON_ID__WEEKDAY_DESC',
  SeasonBySeasonIdYearAndSemesterAsc = 'SEASON_BY_SEASON_ID__YEAR_AND_SEMESTER_ASC',
  SeasonBySeasonIdYearAndSemesterCanonicalAsc = 'SEASON_BY_SEASON_ID__YEAR_AND_SEMESTER_CANONICAL_ASC',
  SeasonBySeasonIdYearAndSemesterCanonicalDesc = 'SEASON_BY_SEASON_ID__YEAR_AND_SEMESTER_CANONICAL_DESC',
  SeasonBySeasonIdYearAndSemesterDesc = 'SEASON_BY_SEASON_ID__YEAR_AND_SEMESTER_DESC',
  SeasonIdAsc = 'SEASON_ID_ASC',
  SeasonIdDesc = 'SEASON_ID_DESC',
  SourceDataAsc = 'SOURCE_DATA_ASC',
  SourceDataDesc = 'SOURCE_DATA_DESC',
  TasksByEpisodeIdCountAsc = 'TASKS_BY_EPISODE_ID__COUNT_ASC',
  TasksByEpisodeIdCountDesc = 'TASKS_BY_EPISODE_ID__COUNT_DESC',
  TasksByEpisodeIdMaxBatchEntriesAsc = 'TASKS_BY_EPISODE_ID__MAX_BATCH_ENTRIES_ASC',
  TasksByEpisodeIdMaxBatchEntriesDesc = 'TASKS_BY_EPISODE_ID__MAX_BATCH_ENTRIES_DESC',
  TasksByEpisodeIdMaxCancelledAtAsc = 'TASKS_BY_EPISODE_ID__MAX_CANCELLED_AT_ASC',
  TasksByEpisodeIdMaxCancelledAtDesc = 'TASKS_BY_EPISODE_ID__MAX_CANCELLED_AT_DESC',
  TasksByEpisodeIdMaxCreatedAtAsc = 'TASKS_BY_EPISODE_ID__MAX_CREATED_AT_ASC',
  TasksByEpisodeIdMaxCreatedAtDesc = 'TASKS_BY_EPISODE_ID__MAX_CREATED_AT_DESC',
  TasksByEpisodeIdMaxDownloadPathAsc = 'TASKS_BY_EPISODE_ID__MAX_DOWNLOAD_PATH_ASC',
  TasksByEpisodeIdMaxDownloadPathDesc = 'TASKS_BY_EPISODE_ID__MAX_DOWNLOAD_PATH_DESC',
  TasksByEpisodeIdMaxDownloadTimeoutMinutesAsc = 'TASKS_BY_EPISODE_ID__MAX_DOWNLOAD_TIMEOUT_MINUTES_ASC',
  TasksByEpisodeIdMaxDownloadTimeoutMinutesDesc = 'TASKS_BY_EPISODE_ID__MAX_DOWNLOAD_TIMEOUT_MINUTES_DESC',
  TasksByEpisodeIdMaxEpisodeIdAsc = 'TASKS_BY_EPISODE_ID__MAX_EPISODE_ID_ASC',
  TasksByEpisodeIdMaxEpisodeIdDesc = 'TASKS_BY_EPISODE_ID__MAX_EPISODE_ID_DESC',
  TasksByEpisodeIdMaxFailedAtAsc = 'TASKS_BY_EPISODE_ID__MAX_FAILED_AT_ASC',
  TasksByEpisodeIdMaxFailedAtDesc = 'TASKS_BY_EPISODE_ID__MAX_FAILED_AT_DESC',
  TasksByEpisodeIdMaxFailedReasonAsc = 'TASKS_BY_EPISODE_ID__MAX_FAILED_REASON_ASC',
  TasksByEpisodeIdMaxFailedReasonDesc = 'TASKS_BY_EPISODE_ID__MAX_FAILED_REASON_DESC',
  TasksByEpisodeIdMaxFilePathAsc = 'TASKS_BY_EPISODE_ID__MAX_FILE_PATH_ASC',
  TasksByEpisodeIdMaxFilePathDesc = 'TASKS_BY_EPISODE_ID__MAX_FILE_PATH_DESC',
  TasksByEpisodeIdMaxIdAsc = 'TASKS_BY_EPISODE_ID__MAX_ID_ASC',
  TasksByEpisodeIdMaxIdDesc = 'TASKS_BY_EPISODE_ID__MAX_ID_DESC',
  TasksByEpisodeIdMaxImportPathAsc = 'TASKS_BY_EPISODE_ID__MAX_IMPORT_PATH_ASC',
  TasksByEpisodeIdMaxImportPathDesc = 'TASKS_BY_EPISODE_ID__MAX_IMPORT_PATH_DESC',
  TasksByEpisodeIdMaxIsCancelledAsc = 'TASKS_BY_EPISODE_ID__MAX_IS_CANCELLED_ASC',
  TasksByEpisodeIdMaxIsCancelledDesc = 'TASKS_BY_EPISODE_ID__MAX_IS_CANCELLED_DESC',
  TasksByEpisodeIdMaxIsFailedAsc = 'TASKS_BY_EPISODE_ID__MAX_IS_FAILED_ASC',
  TasksByEpisodeIdMaxIsFailedDesc = 'TASKS_BY_EPISODE_ID__MAX_IS_FAILED_DESC',
  TasksByEpisodeIdMaxIsSmartDownloadAsc = 'TASKS_BY_EPISODE_ID__MAX_IS_SMART_DOWNLOAD_ASC',
  TasksByEpisodeIdMaxIsSmartDownloadDesc = 'TASKS_BY_EPISODE_ID__MAX_IS_SMART_DOWNLOAD_DESC',
  TasksByEpisodeIdMaxJellyfinEpisodeIdAsc = 'TASKS_BY_EPISODE_ID__MAX_JELLYFIN_EPISODE_ID_ASC',
  TasksByEpisodeIdMaxJellyfinEpisodeIdDesc = 'TASKS_BY_EPISODE_ID__MAX_JELLYFIN_EPISODE_ID_DESC',
  TasksByEpisodeIdMaxLegacyStageAsc = 'TASKS_BY_EPISODE_ID__MAX_LEGACY_STAGE_ASC',
  TasksByEpisodeIdMaxLegacyStageDesc = 'TASKS_BY_EPISODE_ID__MAX_LEGACY_STAGE_DESC',
  TasksByEpisodeIdMaxNfoPathAsc = 'TASKS_BY_EPISODE_ID__MAX_NFO_PATH_ASC',
  TasksByEpisodeIdMaxNfoPathDesc = 'TASKS_BY_EPISODE_ID__MAX_NFO_PATH_DESC',
  TasksByEpisodeIdMaxQbtLastSyncAsc = 'TASKS_BY_EPISODE_ID__MAX_QBT_LAST_SYNC_ASC',
  TasksByEpisodeIdMaxQbtLastSyncDesc = 'TASKS_BY_EPISODE_ID__MAX_QBT_LAST_SYNC_DESC',
  TasksByEpisodeIdMaxQbtTorrentHashAsc = 'TASKS_BY_EPISODE_ID__MAX_QBT_TORRENT_HASH_ASC',
  TasksByEpisodeIdMaxQbtTorrentHashDesc = 'TASKS_BY_EPISODE_ID__MAX_QBT_TORRENT_HASH_DESC',
  TasksByEpisodeIdMaxSmartDownloadDecisionAsc = 'TASKS_BY_EPISODE_ID__MAX_SMART_DOWNLOAD_DECISION_ASC',
  TasksByEpisodeIdMaxSmartDownloadDecisionDesc = 'TASKS_BY_EPISODE_ID__MAX_SMART_DOWNLOAD_DECISION_DESC',
  TasksByEpisodeIdMaxSmartDownloadTorrentHashAsc = 'TASKS_BY_EPISODE_ID__MAX_SMART_DOWNLOAD_TORRENT_HASH_ASC',
  TasksByEpisodeIdMaxSmartDownloadTorrentHashDesc = 'TASKS_BY_EPISODE_ID__MAX_SMART_DOWNLOAD_TORRENT_HASH_DESC',
  TasksByEpisodeIdMaxSourcePathAsc = 'TASKS_BY_EPISODE_ID__MAX_SOURCE_PATH_ASC',
  TasksByEpisodeIdMaxSourcePathDesc = 'TASKS_BY_EPISODE_ID__MAX_SOURCE_PATH_DESC',
  TasksByEpisodeIdMaxTorrentLinkAsc = 'TASKS_BY_EPISODE_ID__MAX_TORRENT_LINK_ASC',
  TasksByEpisodeIdMaxTorrentLinkDesc = 'TASKS_BY_EPISODE_ID__MAX_TORRENT_LINK_DESC',
  TasksByEpisodeIdMaxTorrentTitleAsc = 'TASKS_BY_EPISODE_ID__MAX_TORRENT_TITLE_ASC',
  TasksByEpisodeIdMaxTorrentTitleDesc = 'TASKS_BY_EPISODE_ID__MAX_TORRENT_TITLE_DESC',
  TasksByEpisodeIdMaxTypeAsc = 'TASKS_BY_EPISODE_ID__MAX_TYPE_ASC',
  TasksByEpisodeIdMaxTypeDesc = 'TASKS_BY_EPISODE_ID__MAX_TYPE_DESC',
  TasksByEpisodeIdMaxUpdatedAtAsc = 'TASKS_BY_EPISODE_ID__MAX_UPDATED_AT_ASC',
  TasksByEpisodeIdMaxUpdatedAtDesc = 'TASKS_BY_EPISODE_ID__MAX_UPDATED_AT_DESC',
  TasksByEpisodeIdMaxVersionAsc = 'TASKS_BY_EPISODE_ID__MAX_VERSION_ASC',
  TasksByEpisodeIdMaxVersionDesc = 'TASKS_BY_EPISODE_ID__MAX_VERSION_DESC',
  TasksByEpisodeIdMaxWorkflowAsc = 'TASKS_BY_EPISODE_ID__MAX_WORKFLOW_ASC',
  TasksByEpisodeIdMaxWorkflowDesc = 'TASKS_BY_EPISODE_ID__MAX_WORKFLOW_DESC',
  TasksByEpisodeIdMinBatchEntriesAsc = 'TASKS_BY_EPISODE_ID__MIN_BATCH_ENTRIES_ASC',
  TasksByEpisodeIdMinBatchEntriesDesc = 'TASKS_BY_EPISODE_ID__MIN_BATCH_ENTRIES_DESC',
  TasksByEpisodeIdMinCancelledAtAsc = 'TASKS_BY_EPISODE_ID__MIN_CANCELLED_AT_ASC',
  TasksByEpisodeIdMinCancelledAtDesc = 'TASKS_BY_EPISODE_ID__MIN_CANCELLED_AT_DESC',
  TasksByEpisodeIdMinCreatedAtAsc = 'TASKS_BY_EPISODE_ID__MIN_CREATED_AT_ASC',
  TasksByEpisodeIdMinCreatedAtDesc = 'TASKS_BY_EPISODE_ID__MIN_CREATED_AT_DESC',
  TasksByEpisodeIdMinDownloadPathAsc = 'TASKS_BY_EPISODE_ID__MIN_DOWNLOAD_PATH_ASC',
  TasksByEpisodeIdMinDownloadPathDesc = 'TASKS_BY_EPISODE_ID__MIN_DOWNLOAD_PATH_DESC',
  TasksByEpisodeIdMinDownloadTimeoutMinutesAsc = 'TASKS_BY_EPISODE_ID__MIN_DOWNLOAD_TIMEOUT_MINUTES_ASC',
  TasksByEpisodeIdMinDownloadTimeoutMinutesDesc = 'TASKS_BY_EPISODE_ID__MIN_DOWNLOAD_TIMEOUT_MINUTES_DESC',
  TasksByEpisodeIdMinEpisodeIdAsc = 'TASKS_BY_EPISODE_ID__MIN_EPISODE_ID_ASC',
  TasksByEpisodeIdMinEpisodeIdDesc = 'TASKS_BY_EPISODE_ID__MIN_EPISODE_ID_DESC',
  TasksByEpisodeIdMinFailedAtAsc = 'TASKS_BY_EPISODE_ID__MIN_FAILED_AT_ASC',
  TasksByEpisodeIdMinFailedAtDesc = 'TASKS_BY_EPISODE_ID__MIN_FAILED_AT_DESC',
  TasksByEpisodeIdMinFailedReasonAsc = 'TASKS_BY_EPISODE_ID__MIN_FAILED_REASON_ASC',
  TasksByEpisodeIdMinFailedReasonDesc = 'TASKS_BY_EPISODE_ID__MIN_FAILED_REASON_DESC',
  TasksByEpisodeIdMinFilePathAsc = 'TASKS_BY_EPISODE_ID__MIN_FILE_PATH_ASC',
  TasksByEpisodeIdMinFilePathDesc = 'TASKS_BY_EPISODE_ID__MIN_FILE_PATH_DESC',
  TasksByEpisodeIdMinIdAsc = 'TASKS_BY_EPISODE_ID__MIN_ID_ASC',
  TasksByEpisodeIdMinIdDesc = 'TASKS_BY_EPISODE_ID__MIN_ID_DESC',
  TasksByEpisodeIdMinImportPathAsc = 'TASKS_BY_EPISODE_ID__MIN_IMPORT_PATH_ASC',
  TasksByEpisodeIdMinImportPathDesc = 'TASKS_BY_EPISODE_ID__MIN_IMPORT_PATH_DESC',
  TasksByEpisodeIdMinIsCancelledAsc = 'TASKS_BY_EPISODE_ID__MIN_IS_CANCELLED_ASC',
  TasksByEpisodeIdMinIsCancelledDesc = 'TASKS_BY_EPISODE_ID__MIN_IS_CANCELLED_DESC',
  TasksByEpisodeIdMinIsFailedAsc = 'TASKS_BY_EPISODE_ID__MIN_IS_FAILED_ASC',
  TasksByEpisodeIdMinIsFailedDesc = 'TASKS_BY_EPISODE_ID__MIN_IS_FAILED_DESC',
  TasksByEpisodeIdMinIsSmartDownloadAsc = 'TASKS_BY_EPISODE_ID__MIN_IS_SMART_DOWNLOAD_ASC',
  TasksByEpisodeIdMinIsSmartDownloadDesc = 'TASKS_BY_EPISODE_ID__MIN_IS_SMART_DOWNLOAD_DESC',
  TasksByEpisodeIdMinJellyfinEpisodeIdAsc = 'TASKS_BY_EPISODE_ID__MIN_JELLYFIN_EPISODE_ID_ASC',
  TasksByEpisodeIdMinJellyfinEpisodeIdDesc = 'TASKS_BY_EPISODE_ID__MIN_JELLYFIN_EPISODE_ID_DESC',
  TasksByEpisodeIdMinLegacyStageAsc = 'TASKS_BY_EPISODE_ID__MIN_LEGACY_STAGE_ASC',
  TasksByEpisodeIdMinLegacyStageDesc = 'TASKS_BY_EPISODE_ID__MIN_LEGACY_STAGE_DESC',
  TasksByEpisodeIdMinNfoPathAsc = 'TASKS_BY_EPISODE_ID__MIN_NFO_PATH_ASC',
  TasksByEpisodeIdMinNfoPathDesc = 'TASKS_BY_EPISODE_ID__MIN_NFO_PATH_DESC',
  TasksByEpisodeIdMinQbtLastSyncAsc = 'TASKS_BY_EPISODE_ID__MIN_QBT_LAST_SYNC_ASC',
  TasksByEpisodeIdMinQbtLastSyncDesc = 'TASKS_BY_EPISODE_ID__MIN_QBT_LAST_SYNC_DESC',
  TasksByEpisodeIdMinQbtTorrentHashAsc = 'TASKS_BY_EPISODE_ID__MIN_QBT_TORRENT_HASH_ASC',
  TasksByEpisodeIdMinQbtTorrentHashDesc = 'TASKS_BY_EPISODE_ID__MIN_QBT_TORRENT_HASH_DESC',
  TasksByEpisodeIdMinSmartDownloadDecisionAsc = 'TASKS_BY_EPISODE_ID__MIN_SMART_DOWNLOAD_DECISION_ASC',
  TasksByEpisodeIdMinSmartDownloadDecisionDesc = 'TASKS_BY_EPISODE_ID__MIN_SMART_DOWNLOAD_DECISION_DESC',
  TasksByEpisodeIdMinSmartDownloadTorrentHashAsc = 'TASKS_BY_EPISODE_ID__MIN_SMART_DOWNLOAD_TORRENT_HASH_ASC',
  TasksByEpisodeIdMinSmartDownloadTorrentHashDesc = 'TASKS_BY_EPISODE_ID__MIN_SMART_DOWNLOAD_TORRENT_HASH_DESC',
  TasksByEpisodeIdMinSourcePathAsc = 'TASKS_BY_EPISODE_ID__MIN_SOURCE_PATH_ASC',
  TasksByEpisodeIdMinSourcePathDesc = 'TASKS_BY_EPISODE_ID__MIN_SOURCE_PATH_DESC',
  TasksByEpisodeIdMinTorrentLinkAsc = 'TASKS_BY_EPISODE_ID__MIN_TORRENT_LINK_ASC',
  TasksByEpisodeIdMinTorrentLinkDesc = 'TASKS_BY_EPISODE_ID__MIN_TORRENT_LINK_DESC',
  TasksByEpisodeIdMinTorrentTitleAsc = 'TASKS_BY_EPISODE_ID__MIN_TORRENT_TITLE_ASC',
  TasksByEpisodeIdMinTorrentTitleDesc = 'TASKS_BY_EPISODE_ID__MIN_TORRENT_TITLE_DESC',
  TasksByEpisodeIdMinTypeAsc = 'TASKS_BY_EPISODE_ID__MIN_TYPE_ASC',
  TasksByEpisodeIdMinTypeDesc = 'TASKS_BY_EPISODE_ID__MIN_TYPE_DESC',
  TasksByEpisodeIdMinUpdatedAtAsc = 'TASKS_BY_EPISODE_ID__MIN_UPDATED_AT_ASC',
  TasksByEpisodeIdMinUpdatedAtDesc = 'TASKS_BY_EPISODE_ID__MIN_UPDATED_AT_DESC',
  TasksByEpisodeIdMinVersionAsc = 'TASKS_BY_EPISODE_ID__MIN_VERSION_ASC',
  TasksByEpisodeIdMinVersionDesc = 'TASKS_BY_EPISODE_ID__MIN_VERSION_DESC',
  TasksByEpisodeIdMinWorkflowAsc = 'TASKS_BY_EPISODE_ID__MIN_WORKFLOW_ASC',
  TasksByEpisodeIdMinWorkflowDesc = 'TASKS_BY_EPISODE_ID__MIN_WORKFLOW_DESC',
  TaskEpisodesByEpisodeIdCountAsc = 'TASK_EPISODES_BY_EPISODE_ID__COUNT_ASC',
  TaskEpisodesByEpisodeIdCountDesc = 'TASK_EPISODES_BY_EPISODE_ID__COUNT_DESC',
  TaskEpisodesByEpisodeIdMaxEpisodeIdAsc = 'TASK_EPISODES_BY_EPISODE_ID__MAX_EPISODE_ID_ASC',
  TaskEpisodesByEpisodeIdMaxEpisodeIdDesc = 'TASK_EPISODES_BY_EPISODE_ID__MAX_EPISODE_ID_DESC',
  TaskEpisodesByEpisodeIdMaxTaskIdAsc = 'TASK_EPISODES_BY_EPISODE_ID__MAX_TASK_ID_ASC',
  TaskEpisodesByEpisodeIdMaxTaskIdDesc = 'TASK_EPISODES_BY_EPISODE_ID__MAX_TASK_ID_DESC',
  TaskEpisodesByEpisodeIdMinEpisodeIdAsc = 'TASK_EPISODES_BY_EPISODE_ID__MIN_EPISODE_ID_ASC',
  TaskEpisodesByEpisodeIdMinEpisodeIdDesc = 'TASK_EPISODES_BY_EPISODE_ID__MIN_EPISODE_ID_DESC',
  TaskEpisodesByEpisodeIdMinTaskIdAsc = 'TASK_EPISODES_BY_EPISODE_ID__MIN_TASK_ID_ASC',
  TaskEpisodesByEpisodeIdMinTaskIdDesc = 'TASK_EPISODES_BY_EPISODE_ID__MIN_TASK_ID_DESC',
  TitleAsc = 'TITLE_ASC',
  TitleDesc = 'TITLE_DESC'
}

export type FeaturesConfig = {
  __typename?: 'FeaturesConfig';
  lania: Scalars['Boolean'];
};

export type FetchPartialSeasonRequest = {
  characters?: InputMaybe<Scalars['Boolean']>;
  episodes?: InputMaybe<Scalars['Boolean']>;
  images?: InputMaybe<Scalars['Boolean']>;
  info?: InputMaybe<Scalars['Boolean']>;
};

export type FileEntry = {
  __typename?: 'FileEntry';
  lastModified: Scalars['DateTime'];
  name: Scalars['String'];
  path: Scalars['String'];
  size?: Maybe<Scalars['BigInt']>;
  type: FileEntryType;
};

export enum FileEntryType {
  Directory = 'DIRECTORY',
  File = 'FILE'
}

export type Image = Node & {
  __typename?: 'Image';
  cosPath: Scalars['String'];
  createdAt: Scalars['Datetime'];
  downloadPath?: Maybe<Scalars['String']>;
  hash: Scalars['String'];
  id: Scalars['Int'];
  /** A globally unique identifier. Can be used in various places throughout the system to identify this single value. */
  nodeId: Scalars['ID'];
  /** Reads and enables pagination through a set of `Season`. */
  seasonsByBannerImageId: SeasonsConnection;
  /** Reads and enables pagination through a set of `Season`. */
  seasonsByFanartImageId: SeasonsConnection;
  /** Reads and enables pagination through a set of `Season`. */
  seasonsByPosterImageId: SeasonsConnection;
  sourceUrl: Scalars['String'];
};


export type ImageDownloadPathArgs = {
  thumbnail?: InputMaybe<Scalars['Boolean']>;
};


export type ImageSeasonsByBannerImageIdArgs = {
  after?: InputMaybe<Scalars['Cursor']>;
  before?: InputMaybe<Scalars['Cursor']>;
  condition?: InputMaybe<SeasonCondition>;
  filter?: InputMaybe<SeasonFilter>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<SeasonsOrderBy>>;
};


export type ImageSeasonsByFanartImageIdArgs = {
  after?: InputMaybe<Scalars['Cursor']>;
  before?: InputMaybe<Scalars['Cursor']>;
  condition?: InputMaybe<SeasonCondition>;
  filter?: InputMaybe<SeasonFilter>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<SeasonsOrderBy>>;
};


export type ImageSeasonsByPosterImageIdArgs = {
  after?: InputMaybe<Scalars['Cursor']>;
  before?: InputMaybe<Scalars['Cursor']>;
  condition?: InputMaybe<SeasonCondition>;
  filter?: InputMaybe<SeasonFilter>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<SeasonsOrderBy>>;
};

/** A condition to be used against `Image` object types. All fields are tested for equality and combined with a logical ‘and.’ */
export type ImageCondition = {
  /** Checks for equality with the object’s `cosPath` field. */
  cosPath?: InputMaybe<Scalars['String']>;
  /** Checks for equality with the object’s `createdAt` field. */
  createdAt?: InputMaybe<Scalars['Datetime']>;
  /** Checks for equality with the object’s `hash` field. */
  hash?: InputMaybe<Scalars['String']>;
  /** Checks for equality with the object’s `id` field. */
  id?: InputMaybe<Scalars['Int']>;
  /** Checks for equality with the object’s `sourceUrl` field. */
  sourceUrl?: InputMaybe<Scalars['String']>;
};

/** A filter to be used against `Image` object types. All fields are combined with a logical ‘and.’ */
export type ImageFilter = {
  /** Checks for all expressions in this list. */
  and?: InputMaybe<Array<ImageFilter>>;
  /** Filter by the object’s `cosPath` field. */
  cosPath?: InputMaybe<StringFilter>;
  /** Filter by the object’s `createdAt` field. */
  createdAt?: InputMaybe<DatetimeFilter>;
  /** Filter by the object’s `hash` field. */
  hash?: InputMaybe<StringFilter>;
  /** Filter by the object’s `id` field. */
  id?: InputMaybe<IntFilter>;
  /** Negates the expression. */
  not?: InputMaybe<ImageFilter>;
  /** Checks for any expressions in this list. */
  or?: InputMaybe<Array<ImageFilter>>;
  /** Filter by the object’s `seasonsByBannerImageId` relation. */
  seasonsByBannerImageId?: InputMaybe<ImageToManySeasonFilter>;
  /** Some related `seasonsByBannerImageId` exist. */
  seasonsByBannerImageIdExist?: InputMaybe<Scalars['Boolean']>;
  /** Filter by the object’s `seasonsByFanartImageId` relation. */
  seasonsByFanartImageId?: InputMaybe<ImageToManySeasonFilter>;
  /** Some related `seasonsByFanartImageId` exist. */
  seasonsByFanartImageIdExist?: InputMaybe<Scalars['Boolean']>;
  /** Filter by the object’s `seasonsByPosterImageId` relation. */
  seasonsByPosterImageId?: InputMaybe<ImageToManySeasonFilter>;
  /** Some related `seasonsByPosterImageId` exist. */
  seasonsByPosterImageIdExist?: InputMaybe<Scalars['Boolean']>;
  /** Filter by the object’s `sourceUrl` field. */
  sourceUrl?: InputMaybe<StringFilter>;
};

/** An input for mutations affecting `Image` */
export type ImageInput = {
  cosPath: Scalars['String'];
  createdAt?: InputMaybe<Scalars['Datetime']>;
  hash: Scalars['String'];
  id?: InputMaybe<Scalars['Int']>;
  sourceUrl: Scalars['String'];
};

/** Represents an update to a `Image`. Fields that are set will be updated. */
export type ImagePatch = {
  cosPath?: InputMaybe<Scalars['String']>;
  createdAt?: InputMaybe<Scalars['Datetime']>;
  hash?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['Int']>;
  sourceUrl?: InputMaybe<Scalars['String']>;
};

/** A filter to be used against many `Season` object types. All fields are combined with a logical ‘and.’ */
export type ImageToManySeasonFilter = {
  /** Every related `Season` matches the filter criteria. All fields are combined with a logical ‘and.’ */
  every?: InputMaybe<SeasonFilter>;
  /** No related `Season` matches the filter criteria. All fields are combined with a logical ‘and.’ */
  none?: InputMaybe<SeasonFilter>;
  /** Some related `Season` matches the filter criteria. All fields are combined with a logical ‘and.’ */
  some?: InputMaybe<SeasonFilter>;
};

/** A connection to a list of `Image` values. */
export type ImagesConnection = {
  __typename?: 'ImagesConnection';
  /** A list of edges which contains the `Image` and cursor to aid in pagination. */
  edges: Array<ImagesEdge>;
  /** A list of `Image` objects. */
  nodes: Array<Maybe<Image>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** The count of *all* `Image` you could get from the connection. */
  totalCount: Scalars['Int'];
};

/** A `Image` edge in the connection. */
export type ImagesEdge = {
  __typename?: 'ImagesEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']>;
  /** The `Image` at the end of the edge. */
  node?: Maybe<Image>;
};

/** Methods to use when ordering `Image`. */
export enum ImagesOrderBy {
  CosPathAsc = 'COS_PATH_ASC',
  CosPathDesc = 'COS_PATH_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
  HashAsc = 'HASH_ASC',
  HashDesc = 'HASH_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  Natural = 'NATURAL',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  SeasonsByBannerImageIdCountAsc = 'SEASONS_BY_BANNER_IMAGE_ID__COUNT_ASC',
  SeasonsByBannerImageIdCountDesc = 'SEASONS_BY_BANNER_IMAGE_ID__COUNT_DESC',
  SeasonsByBannerImageIdMaxAirTimeAsc = 'SEASONS_BY_BANNER_IMAGE_ID__MAX_AIR_TIME_ASC',
  SeasonsByBannerImageIdMaxAirTimeDesc = 'SEASONS_BY_BANNER_IMAGE_ID__MAX_AIR_TIME_DESC',
  SeasonsByBannerImageIdMaxAliasesAsc = 'SEASONS_BY_BANNER_IMAGE_ID__MAX_ALIASES_ASC',
  SeasonsByBannerImageIdMaxAliasesDesc = 'SEASONS_BY_BANNER_IMAGE_ID__MAX_ALIASES_DESC',
  SeasonsByBannerImageIdMaxBangumiIdAsc = 'SEASONS_BY_BANNER_IMAGE_ID__MAX_BANGUMI_ID_ASC',
  SeasonsByBannerImageIdMaxBangumiIdDesc = 'SEASONS_BY_BANNER_IMAGE_ID__MAX_BANGUMI_ID_DESC',
  SeasonsByBannerImageIdMaxBannerImageIdAsc = 'SEASONS_BY_BANNER_IMAGE_ID__MAX_BANNER_IMAGE_ID_ASC',
  SeasonsByBannerImageIdMaxBannerImageIdDesc = 'SEASONS_BY_BANNER_IMAGE_ID__MAX_BANNER_IMAGE_ID_DESC',
  SeasonsByBannerImageIdMaxBilibiliMainlandIdAsc = 'SEASONS_BY_BANNER_IMAGE_ID__MAX_BILIBILI_MAINLAND_ID_ASC',
  SeasonsByBannerImageIdMaxBilibiliMainlandIdDesc = 'SEASONS_BY_BANNER_IMAGE_ID__MAX_BILIBILI_MAINLAND_ID_DESC',
  SeasonsByBannerImageIdMaxBilibiliThmIdAsc = 'SEASONS_BY_BANNER_IMAGE_ID__MAX_BILIBILI_THM_ID_ASC',
  SeasonsByBannerImageIdMaxBilibiliThmIdDesc = 'SEASONS_BY_BANNER_IMAGE_ID__MAX_BILIBILI_THM_ID_DESC',
  SeasonsByBannerImageIdMaxCreatedAtAsc = 'SEASONS_BY_BANNER_IMAGE_ID__MAX_CREATED_AT_ASC',
  SeasonsByBannerImageIdMaxCreatedAtDesc = 'SEASONS_BY_BANNER_IMAGE_ID__MAX_CREATED_AT_DESC',
  SeasonsByBannerImageIdMaxDandanplayAnimeIdAsc = 'SEASONS_BY_BANNER_IMAGE_ID__MAX_DANDANPLAY_ANIME_ID_ASC',
  SeasonsByBannerImageIdMaxDandanplayAnimeIdDesc = 'SEASONS_BY_BANNER_IMAGE_ID__MAX_DANDANPLAY_ANIME_ID_DESC',
  SeasonsByBannerImageIdMaxDeclaredEpisodeCountAsc = 'SEASONS_BY_BANNER_IMAGE_ID__MAX_DECLARED_EPISODE_COUNT_ASC',
  SeasonsByBannerImageIdMaxDeclaredEpisodeCountDesc = 'SEASONS_BY_BANNER_IMAGE_ID__MAX_DECLARED_EPISODE_COUNT_DESC',
  SeasonsByBannerImageIdMaxDescriptionAsc = 'SEASONS_BY_BANNER_IMAGE_ID__MAX_DESCRIPTION_ASC',
  SeasonsByBannerImageIdMaxDescriptionDesc = 'SEASONS_BY_BANNER_IMAGE_ID__MAX_DESCRIPTION_DESC',
  SeasonsByBannerImageIdMaxDirectoryAsc = 'SEASONS_BY_BANNER_IMAGE_ID__MAX_DIRECTORY_ASC',
  SeasonsByBannerImageIdMaxDirectoryDesc = 'SEASONS_BY_BANNER_IMAGE_ID__MAX_DIRECTORY_DESC',
  SeasonsByBannerImageIdMaxDownloadOffsetHoursAsc = 'SEASONS_BY_BANNER_IMAGE_ID__MAX_DOWNLOAD_OFFSET_HOURS_ASC',
  SeasonsByBannerImageIdMaxDownloadOffsetHoursDesc = 'SEASONS_BY_BANNER_IMAGE_ID__MAX_DOWNLOAD_OFFSET_HOURS_DESC',
  SeasonsByBannerImageIdMaxEpisodesAutoSyncAsc = 'SEASONS_BY_BANNER_IMAGE_ID__MAX_EPISODES_AUTO_SYNC_ASC',
  SeasonsByBannerImageIdMaxEpisodesAutoSyncDesc = 'SEASONS_BY_BANNER_IMAGE_ID__MAX_EPISODES_AUTO_SYNC_DESC',
  SeasonsByBannerImageIdMaxEpisodesLastSyncAsc = 'SEASONS_BY_BANNER_IMAGE_ID__MAX_EPISODES_LAST_SYNC_ASC',
  SeasonsByBannerImageIdMaxEpisodesLastSyncDesc = 'SEASONS_BY_BANNER_IMAGE_ID__MAX_EPISODES_LAST_SYNC_DESC',
  SeasonsByBannerImageIdMaxEpisodesSourceAsc = 'SEASONS_BY_BANNER_IMAGE_ID__MAX_EPISODES_SOURCE_ASC',
  SeasonsByBannerImageIdMaxEpisodesSourceDesc = 'SEASONS_BY_BANNER_IMAGE_ID__MAX_EPISODES_SOURCE_DESC',
  SeasonsByBannerImageIdMaxFanartImageIdAsc = 'SEASONS_BY_BANNER_IMAGE_ID__MAX_FANART_IMAGE_ID_ASC',
  SeasonsByBannerImageIdMaxFanartImageIdDesc = 'SEASONS_BY_BANNER_IMAGE_ID__MAX_FANART_IMAGE_ID_DESC',
  SeasonsByBannerImageIdMaxIdAsc = 'SEASONS_BY_BANNER_IMAGE_ID__MAX_ID_ASC',
  SeasonsByBannerImageIdMaxIdDesc = 'SEASONS_BY_BANNER_IMAGE_ID__MAX_ID_DESC',
  SeasonsByBannerImageIdMaxInfoSourceAsc = 'SEASONS_BY_BANNER_IMAGE_ID__MAX_INFO_SOURCE_ASC',
  SeasonsByBannerImageIdMaxInfoSourceDesc = 'SEASONS_BY_BANNER_IMAGE_ID__MAX_INFO_SOURCE_DESC',
  SeasonsByBannerImageIdMaxIntegrationsLaniaSyncAsc = 'SEASONS_BY_BANNER_IMAGE_ID__MAX_INTEGRATIONS_LANIA_SYNC_ASC',
  SeasonsByBannerImageIdMaxIntegrationsLaniaSyncDesc = 'SEASONS_BY_BANNER_IMAGE_ID__MAX_INTEGRATIONS_LANIA_SYNC_DESC',
  SeasonsByBannerImageIdMaxIsMonitoringAsc = 'SEASONS_BY_BANNER_IMAGE_ID__MAX_IS_MONITORING_ASC',
  SeasonsByBannerImageIdMaxIsMonitoringDesc = 'SEASONS_BY_BANNER_IMAGE_ID__MAX_IS_MONITORING_DESC',
  SeasonsByBannerImageIdMaxJellyfinFolderIdAsc = 'SEASONS_BY_BANNER_IMAGE_ID__MAX_JELLYFIN_FOLDER_ID_ASC',
  SeasonsByBannerImageIdMaxJellyfinFolderIdDesc = 'SEASONS_BY_BANNER_IMAGE_ID__MAX_JELLYFIN_FOLDER_ID_DESC',
  SeasonsByBannerImageIdMaxJellyfinIdAsc = 'SEASONS_BY_BANNER_IMAGE_ID__MAX_JELLYFIN_ID_ASC',
  SeasonsByBannerImageIdMaxJellyfinIdDesc = 'SEASONS_BY_BANNER_IMAGE_ID__MAX_JELLYFIN_ID_DESC',
  SeasonsByBannerImageIdMaxLastWriteDirectoryAsc = 'SEASONS_BY_BANNER_IMAGE_ID__MAX_LAST_WRITE_DIRECTORY_ASC',
  SeasonsByBannerImageIdMaxLastWriteDirectoryDesc = 'SEASONS_BY_BANNER_IMAGE_ID__MAX_LAST_WRITE_DIRECTORY_DESC',
  SeasonsByBannerImageIdMaxLastWriteTitleAsc = 'SEASONS_BY_BANNER_IMAGE_ID__MAX_LAST_WRITE_TITLE_ASC',
  SeasonsByBannerImageIdMaxLastWriteTitleDesc = 'SEASONS_BY_BANNER_IMAGE_ID__MAX_LAST_WRITE_TITLE_DESC',
  SeasonsByBannerImageIdMaxLastWriteToDiskAsc = 'SEASONS_BY_BANNER_IMAGE_ID__MAX_LAST_WRITE_TO_DISK_ASC',
  SeasonsByBannerImageIdMaxLastWriteToDiskDesc = 'SEASONS_BY_BANNER_IMAGE_ID__MAX_LAST_WRITE_TO_DISK_DESC',
  SeasonsByBannerImageIdMaxMikanAnimeIdAsc = 'SEASONS_BY_BANNER_IMAGE_ID__MAX_MIKAN_ANIME_ID_ASC',
  SeasonsByBannerImageIdMaxMikanAnimeIdDesc = 'SEASONS_BY_BANNER_IMAGE_ID__MAX_MIKAN_ANIME_ID_DESC',
  SeasonsByBannerImageIdMaxNeedDownloadCcAsc = 'SEASONS_BY_BANNER_IMAGE_ID__MAX_NEED_DOWNLOAD_CC_ASC',
  SeasonsByBannerImageIdMaxNeedDownloadCcDesc = 'SEASONS_BY_BANNER_IMAGE_ID__MAX_NEED_DOWNLOAD_CC_DESC',
  SeasonsByBannerImageIdMaxNotifyMissingAsc = 'SEASONS_BY_BANNER_IMAGE_ID__MAX_NOTIFY_MISSING_ASC',
  SeasonsByBannerImageIdMaxNotifyMissingDesc = 'SEASONS_BY_BANNER_IMAGE_ID__MAX_NOTIFY_MISSING_DESC',
  SeasonsByBannerImageIdMaxNotifyPublishAsc = 'SEASONS_BY_BANNER_IMAGE_ID__MAX_NOTIFY_PUBLISH_ASC',
  SeasonsByBannerImageIdMaxNotifyPublishDesc = 'SEASONS_BY_BANNER_IMAGE_ID__MAX_NOTIFY_PUBLISH_DESC',
  SeasonsByBannerImageIdMaxPosterImageIdAsc = 'SEASONS_BY_BANNER_IMAGE_ID__MAX_POSTER_IMAGE_ID_ASC',
  SeasonsByBannerImageIdMaxPosterImageIdDesc = 'SEASONS_BY_BANNER_IMAGE_ID__MAX_POSTER_IMAGE_ID_DESC',
  SeasonsByBannerImageIdMaxPremiereDateAsc = 'SEASONS_BY_BANNER_IMAGE_ID__MAX_PREMIERE_DATE_ASC',
  SeasonsByBannerImageIdMaxPremiereDateDesc = 'SEASONS_BY_BANNER_IMAGE_ID__MAX_PREMIERE_DATE_DESC',
  SeasonsByBannerImageIdMaxSmartDownloadEnabledAsc = 'SEASONS_BY_BANNER_IMAGE_ID__MAX_SMART_DOWNLOAD_ENABLED_ASC',
  SeasonsByBannerImageIdMaxSmartDownloadEnabledDesc = 'SEASONS_BY_BANNER_IMAGE_ID__MAX_SMART_DOWNLOAD_ENABLED_DESC',
  SeasonsByBannerImageIdMaxSmartDownloadPreferBahaAsc = 'SEASONS_BY_BANNER_IMAGE_ID__MAX_SMART_DOWNLOAD_PREFER_BAHA_ASC',
  SeasonsByBannerImageIdMaxSmartDownloadPreferBahaDesc = 'SEASONS_BY_BANNER_IMAGE_ID__MAX_SMART_DOWNLOAD_PREFER_BAHA_DESC',
  SeasonsByBannerImageIdMaxSmartDownloadSubtitleAsc = 'SEASONS_BY_BANNER_IMAGE_ID__MAX_SMART_DOWNLOAD_SUBTITLE_ASC',
  SeasonsByBannerImageIdMaxSmartDownloadSubtitleDesc = 'SEASONS_BY_BANNER_IMAGE_ID__MAX_SMART_DOWNLOAD_SUBTITLE_DESC',
  SeasonsByBannerImageIdMaxSmartDownloadTimeoutMinutesAsc = 'SEASONS_BY_BANNER_IMAGE_ID__MAX_SMART_DOWNLOAD_TIMEOUT_MINUTES_ASC',
  SeasonsByBannerImageIdMaxSmartDownloadTimeoutMinutesDesc = 'SEASONS_BY_BANNER_IMAGE_ID__MAX_SMART_DOWNLOAD_TIMEOUT_MINUTES_DESC',
  SeasonsByBannerImageIdMaxSmartDownloadWindowHoursAsc = 'SEASONS_BY_BANNER_IMAGE_ID__MAX_SMART_DOWNLOAD_WINDOW_HOURS_ASC',
  SeasonsByBannerImageIdMaxSmartDownloadWindowHoursDesc = 'SEASONS_BY_BANNER_IMAGE_ID__MAX_SMART_DOWNLOAD_WINDOW_HOURS_DESC',
  SeasonsByBannerImageIdMaxTagsAsc = 'SEASONS_BY_BANNER_IMAGE_ID__MAX_TAGS_ASC',
  SeasonsByBannerImageIdMaxTagsDesc = 'SEASONS_BY_BANNER_IMAGE_ID__MAX_TAGS_DESC',
  SeasonsByBannerImageIdMaxTitleAsc = 'SEASONS_BY_BANNER_IMAGE_ID__MAX_TITLE_ASC',
  SeasonsByBannerImageIdMaxTitleDesc = 'SEASONS_BY_BANNER_IMAGE_ID__MAX_TITLE_DESC',
  SeasonsByBannerImageIdMaxTvdbIdAsc = 'SEASONS_BY_BANNER_IMAGE_ID__MAX_TVDB_ID_ASC',
  SeasonsByBannerImageIdMaxTvdbIdDesc = 'SEASONS_BY_BANNER_IMAGE_ID__MAX_TVDB_ID_DESC',
  SeasonsByBannerImageIdMaxTvdbSeasonAsc = 'SEASONS_BY_BANNER_IMAGE_ID__MAX_TVDB_SEASON_ASC',
  SeasonsByBannerImageIdMaxTvdbSeasonDesc = 'SEASONS_BY_BANNER_IMAGE_ID__MAX_TVDB_SEASON_DESC',
  SeasonsByBannerImageIdMaxWeekdayAsc = 'SEASONS_BY_BANNER_IMAGE_ID__MAX_WEEKDAY_ASC',
  SeasonsByBannerImageIdMaxWeekdayDesc = 'SEASONS_BY_BANNER_IMAGE_ID__MAX_WEEKDAY_DESC',
  SeasonsByBannerImageIdMaxYearAndSemesterAsc = 'SEASONS_BY_BANNER_IMAGE_ID__MAX_YEAR_AND_SEMESTER_ASC',
  SeasonsByBannerImageIdMaxYearAndSemesterCanonicalAsc = 'SEASONS_BY_BANNER_IMAGE_ID__MAX_YEAR_AND_SEMESTER_CANONICAL_ASC',
  SeasonsByBannerImageIdMaxYearAndSemesterCanonicalDesc = 'SEASONS_BY_BANNER_IMAGE_ID__MAX_YEAR_AND_SEMESTER_CANONICAL_DESC',
  SeasonsByBannerImageIdMaxYearAndSemesterDesc = 'SEASONS_BY_BANNER_IMAGE_ID__MAX_YEAR_AND_SEMESTER_DESC',
  SeasonsByBannerImageIdMinAirTimeAsc = 'SEASONS_BY_BANNER_IMAGE_ID__MIN_AIR_TIME_ASC',
  SeasonsByBannerImageIdMinAirTimeDesc = 'SEASONS_BY_BANNER_IMAGE_ID__MIN_AIR_TIME_DESC',
  SeasonsByBannerImageIdMinAliasesAsc = 'SEASONS_BY_BANNER_IMAGE_ID__MIN_ALIASES_ASC',
  SeasonsByBannerImageIdMinAliasesDesc = 'SEASONS_BY_BANNER_IMAGE_ID__MIN_ALIASES_DESC',
  SeasonsByBannerImageIdMinBangumiIdAsc = 'SEASONS_BY_BANNER_IMAGE_ID__MIN_BANGUMI_ID_ASC',
  SeasonsByBannerImageIdMinBangumiIdDesc = 'SEASONS_BY_BANNER_IMAGE_ID__MIN_BANGUMI_ID_DESC',
  SeasonsByBannerImageIdMinBannerImageIdAsc = 'SEASONS_BY_BANNER_IMAGE_ID__MIN_BANNER_IMAGE_ID_ASC',
  SeasonsByBannerImageIdMinBannerImageIdDesc = 'SEASONS_BY_BANNER_IMAGE_ID__MIN_BANNER_IMAGE_ID_DESC',
  SeasonsByBannerImageIdMinBilibiliMainlandIdAsc = 'SEASONS_BY_BANNER_IMAGE_ID__MIN_BILIBILI_MAINLAND_ID_ASC',
  SeasonsByBannerImageIdMinBilibiliMainlandIdDesc = 'SEASONS_BY_BANNER_IMAGE_ID__MIN_BILIBILI_MAINLAND_ID_DESC',
  SeasonsByBannerImageIdMinBilibiliThmIdAsc = 'SEASONS_BY_BANNER_IMAGE_ID__MIN_BILIBILI_THM_ID_ASC',
  SeasonsByBannerImageIdMinBilibiliThmIdDesc = 'SEASONS_BY_BANNER_IMAGE_ID__MIN_BILIBILI_THM_ID_DESC',
  SeasonsByBannerImageIdMinCreatedAtAsc = 'SEASONS_BY_BANNER_IMAGE_ID__MIN_CREATED_AT_ASC',
  SeasonsByBannerImageIdMinCreatedAtDesc = 'SEASONS_BY_BANNER_IMAGE_ID__MIN_CREATED_AT_DESC',
  SeasonsByBannerImageIdMinDandanplayAnimeIdAsc = 'SEASONS_BY_BANNER_IMAGE_ID__MIN_DANDANPLAY_ANIME_ID_ASC',
  SeasonsByBannerImageIdMinDandanplayAnimeIdDesc = 'SEASONS_BY_BANNER_IMAGE_ID__MIN_DANDANPLAY_ANIME_ID_DESC',
  SeasonsByBannerImageIdMinDeclaredEpisodeCountAsc = 'SEASONS_BY_BANNER_IMAGE_ID__MIN_DECLARED_EPISODE_COUNT_ASC',
  SeasonsByBannerImageIdMinDeclaredEpisodeCountDesc = 'SEASONS_BY_BANNER_IMAGE_ID__MIN_DECLARED_EPISODE_COUNT_DESC',
  SeasonsByBannerImageIdMinDescriptionAsc = 'SEASONS_BY_BANNER_IMAGE_ID__MIN_DESCRIPTION_ASC',
  SeasonsByBannerImageIdMinDescriptionDesc = 'SEASONS_BY_BANNER_IMAGE_ID__MIN_DESCRIPTION_DESC',
  SeasonsByBannerImageIdMinDirectoryAsc = 'SEASONS_BY_BANNER_IMAGE_ID__MIN_DIRECTORY_ASC',
  SeasonsByBannerImageIdMinDirectoryDesc = 'SEASONS_BY_BANNER_IMAGE_ID__MIN_DIRECTORY_DESC',
  SeasonsByBannerImageIdMinDownloadOffsetHoursAsc = 'SEASONS_BY_BANNER_IMAGE_ID__MIN_DOWNLOAD_OFFSET_HOURS_ASC',
  SeasonsByBannerImageIdMinDownloadOffsetHoursDesc = 'SEASONS_BY_BANNER_IMAGE_ID__MIN_DOWNLOAD_OFFSET_HOURS_DESC',
  SeasonsByBannerImageIdMinEpisodesAutoSyncAsc = 'SEASONS_BY_BANNER_IMAGE_ID__MIN_EPISODES_AUTO_SYNC_ASC',
  SeasonsByBannerImageIdMinEpisodesAutoSyncDesc = 'SEASONS_BY_BANNER_IMAGE_ID__MIN_EPISODES_AUTO_SYNC_DESC',
  SeasonsByBannerImageIdMinEpisodesLastSyncAsc = 'SEASONS_BY_BANNER_IMAGE_ID__MIN_EPISODES_LAST_SYNC_ASC',
  SeasonsByBannerImageIdMinEpisodesLastSyncDesc = 'SEASONS_BY_BANNER_IMAGE_ID__MIN_EPISODES_LAST_SYNC_DESC',
  SeasonsByBannerImageIdMinEpisodesSourceAsc = 'SEASONS_BY_BANNER_IMAGE_ID__MIN_EPISODES_SOURCE_ASC',
  SeasonsByBannerImageIdMinEpisodesSourceDesc = 'SEASONS_BY_BANNER_IMAGE_ID__MIN_EPISODES_SOURCE_DESC',
  SeasonsByBannerImageIdMinFanartImageIdAsc = 'SEASONS_BY_BANNER_IMAGE_ID__MIN_FANART_IMAGE_ID_ASC',
  SeasonsByBannerImageIdMinFanartImageIdDesc = 'SEASONS_BY_BANNER_IMAGE_ID__MIN_FANART_IMAGE_ID_DESC',
  SeasonsByBannerImageIdMinIdAsc = 'SEASONS_BY_BANNER_IMAGE_ID__MIN_ID_ASC',
  SeasonsByBannerImageIdMinIdDesc = 'SEASONS_BY_BANNER_IMAGE_ID__MIN_ID_DESC',
  SeasonsByBannerImageIdMinInfoSourceAsc = 'SEASONS_BY_BANNER_IMAGE_ID__MIN_INFO_SOURCE_ASC',
  SeasonsByBannerImageIdMinInfoSourceDesc = 'SEASONS_BY_BANNER_IMAGE_ID__MIN_INFO_SOURCE_DESC',
  SeasonsByBannerImageIdMinIntegrationsLaniaSyncAsc = 'SEASONS_BY_BANNER_IMAGE_ID__MIN_INTEGRATIONS_LANIA_SYNC_ASC',
  SeasonsByBannerImageIdMinIntegrationsLaniaSyncDesc = 'SEASONS_BY_BANNER_IMAGE_ID__MIN_INTEGRATIONS_LANIA_SYNC_DESC',
  SeasonsByBannerImageIdMinIsMonitoringAsc = 'SEASONS_BY_BANNER_IMAGE_ID__MIN_IS_MONITORING_ASC',
  SeasonsByBannerImageIdMinIsMonitoringDesc = 'SEASONS_BY_BANNER_IMAGE_ID__MIN_IS_MONITORING_DESC',
  SeasonsByBannerImageIdMinJellyfinFolderIdAsc = 'SEASONS_BY_BANNER_IMAGE_ID__MIN_JELLYFIN_FOLDER_ID_ASC',
  SeasonsByBannerImageIdMinJellyfinFolderIdDesc = 'SEASONS_BY_BANNER_IMAGE_ID__MIN_JELLYFIN_FOLDER_ID_DESC',
  SeasonsByBannerImageIdMinJellyfinIdAsc = 'SEASONS_BY_BANNER_IMAGE_ID__MIN_JELLYFIN_ID_ASC',
  SeasonsByBannerImageIdMinJellyfinIdDesc = 'SEASONS_BY_BANNER_IMAGE_ID__MIN_JELLYFIN_ID_DESC',
  SeasonsByBannerImageIdMinLastWriteDirectoryAsc = 'SEASONS_BY_BANNER_IMAGE_ID__MIN_LAST_WRITE_DIRECTORY_ASC',
  SeasonsByBannerImageIdMinLastWriteDirectoryDesc = 'SEASONS_BY_BANNER_IMAGE_ID__MIN_LAST_WRITE_DIRECTORY_DESC',
  SeasonsByBannerImageIdMinLastWriteTitleAsc = 'SEASONS_BY_BANNER_IMAGE_ID__MIN_LAST_WRITE_TITLE_ASC',
  SeasonsByBannerImageIdMinLastWriteTitleDesc = 'SEASONS_BY_BANNER_IMAGE_ID__MIN_LAST_WRITE_TITLE_DESC',
  SeasonsByBannerImageIdMinLastWriteToDiskAsc = 'SEASONS_BY_BANNER_IMAGE_ID__MIN_LAST_WRITE_TO_DISK_ASC',
  SeasonsByBannerImageIdMinLastWriteToDiskDesc = 'SEASONS_BY_BANNER_IMAGE_ID__MIN_LAST_WRITE_TO_DISK_DESC',
  SeasonsByBannerImageIdMinMikanAnimeIdAsc = 'SEASONS_BY_BANNER_IMAGE_ID__MIN_MIKAN_ANIME_ID_ASC',
  SeasonsByBannerImageIdMinMikanAnimeIdDesc = 'SEASONS_BY_BANNER_IMAGE_ID__MIN_MIKAN_ANIME_ID_DESC',
  SeasonsByBannerImageIdMinNeedDownloadCcAsc = 'SEASONS_BY_BANNER_IMAGE_ID__MIN_NEED_DOWNLOAD_CC_ASC',
  SeasonsByBannerImageIdMinNeedDownloadCcDesc = 'SEASONS_BY_BANNER_IMAGE_ID__MIN_NEED_DOWNLOAD_CC_DESC',
  SeasonsByBannerImageIdMinNotifyMissingAsc = 'SEASONS_BY_BANNER_IMAGE_ID__MIN_NOTIFY_MISSING_ASC',
  SeasonsByBannerImageIdMinNotifyMissingDesc = 'SEASONS_BY_BANNER_IMAGE_ID__MIN_NOTIFY_MISSING_DESC',
  SeasonsByBannerImageIdMinNotifyPublishAsc = 'SEASONS_BY_BANNER_IMAGE_ID__MIN_NOTIFY_PUBLISH_ASC',
  SeasonsByBannerImageIdMinNotifyPublishDesc = 'SEASONS_BY_BANNER_IMAGE_ID__MIN_NOTIFY_PUBLISH_DESC',
  SeasonsByBannerImageIdMinPosterImageIdAsc = 'SEASONS_BY_BANNER_IMAGE_ID__MIN_POSTER_IMAGE_ID_ASC',
  SeasonsByBannerImageIdMinPosterImageIdDesc = 'SEASONS_BY_BANNER_IMAGE_ID__MIN_POSTER_IMAGE_ID_DESC',
  SeasonsByBannerImageIdMinPremiereDateAsc = 'SEASONS_BY_BANNER_IMAGE_ID__MIN_PREMIERE_DATE_ASC',
  SeasonsByBannerImageIdMinPremiereDateDesc = 'SEASONS_BY_BANNER_IMAGE_ID__MIN_PREMIERE_DATE_DESC',
  SeasonsByBannerImageIdMinSmartDownloadEnabledAsc = 'SEASONS_BY_BANNER_IMAGE_ID__MIN_SMART_DOWNLOAD_ENABLED_ASC',
  SeasonsByBannerImageIdMinSmartDownloadEnabledDesc = 'SEASONS_BY_BANNER_IMAGE_ID__MIN_SMART_DOWNLOAD_ENABLED_DESC',
  SeasonsByBannerImageIdMinSmartDownloadPreferBahaAsc = 'SEASONS_BY_BANNER_IMAGE_ID__MIN_SMART_DOWNLOAD_PREFER_BAHA_ASC',
  SeasonsByBannerImageIdMinSmartDownloadPreferBahaDesc = 'SEASONS_BY_BANNER_IMAGE_ID__MIN_SMART_DOWNLOAD_PREFER_BAHA_DESC',
  SeasonsByBannerImageIdMinSmartDownloadSubtitleAsc = 'SEASONS_BY_BANNER_IMAGE_ID__MIN_SMART_DOWNLOAD_SUBTITLE_ASC',
  SeasonsByBannerImageIdMinSmartDownloadSubtitleDesc = 'SEASONS_BY_BANNER_IMAGE_ID__MIN_SMART_DOWNLOAD_SUBTITLE_DESC',
  SeasonsByBannerImageIdMinSmartDownloadTimeoutMinutesAsc = 'SEASONS_BY_BANNER_IMAGE_ID__MIN_SMART_DOWNLOAD_TIMEOUT_MINUTES_ASC',
  SeasonsByBannerImageIdMinSmartDownloadTimeoutMinutesDesc = 'SEASONS_BY_BANNER_IMAGE_ID__MIN_SMART_DOWNLOAD_TIMEOUT_MINUTES_DESC',
  SeasonsByBannerImageIdMinSmartDownloadWindowHoursAsc = 'SEASONS_BY_BANNER_IMAGE_ID__MIN_SMART_DOWNLOAD_WINDOW_HOURS_ASC',
  SeasonsByBannerImageIdMinSmartDownloadWindowHoursDesc = 'SEASONS_BY_BANNER_IMAGE_ID__MIN_SMART_DOWNLOAD_WINDOW_HOURS_DESC',
  SeasonsByBannerImageIdMinTagsAsc = 'SEASONS_BY_BANNER_IMAGE_ID__MIN_TAGS_ASC',
  SeasonsByBannerImageIdMinTagsDesc = 'SEASONS_BY_BANNER_IMAGE_ID__MIN_TAGS_DESC',
  SeasonsByBannerImageIdMinTitleAsc = 'SEASONS_BY_BANNER_IMAGE_ID__MIN_TITLE_ASC',
  SeasonsByBannerImageIdMinTitleDesc = 'SEASONS_BY_BANNER_IMAGE_ID__MIN_TITLE_DESC',
  SeasonsByBannerImageIdMinTvdbIdAsc = 'SEASONS_BY_BANNER_IMAGE_ID__MIN_TVDB_ID_ASC',
  SeasonsByBannerImageIdMinTvdbIdDesc = 'SEASONS_BY_BANNER_IMAGE_ID__MIN_TVDB_ID_DESC',
  SeasonsByBannerImageIdMinTvdbSeasonAsc = 'SEASONS_BY_BANNER_IMAGE_ID__MIN_TVDB_SEASON_ASC',
  SeasonsByBannerImageIdMinTvdbSeasonDesc = 'SEASONS_BY_BANNER_IMAGE_ID__MIN_TVDB_SEASON_DESC',
  SeasonsByBannerImageIdMinWeekdayAsc = 'SEASONS_BY_BANNER_IMAGE_ID__MIN_WEEKDAY_ASC',
  SeasonsByBannerImageIdMinWeekdayDesc = 'SEASONS_BY_BANNER_IMAGE_ID__MIN_WEEKDAY_DESC',
  SeasonsByBannerImageIdMinYearAndSemesterAsc = 'SEASONS_BY_BANNER_IMAGE_ID__MIN_YEAR_AND_SEMESTER_ASC',
  SeasonsByBannerImageIdMinYearAndSemesterCanonicalAsc = 'SEASONS_BY_BANNER_IMAGE_ID__MIN_YEAR_AND_SEMESTER_CANONICAL_ASC',
  SeasonsByBannerImageIdMinYearAndSemesterCanonicalDesc = 'SEASONS_BY_BANNER_IMAGE_ID__MIN_YEAR_AND_SEMESTER_CANONICAL_DESC',
  SeasonsByBannerImageIdMinYearAndSemesterDesc = 'SEASONS_BY_BANNER_IMAGE_ID__MIN_YEAR_AND_SEMESTER_DESC',
  SeasonsByFanartImageIdCountAsc = 'SEASONS_BY_FANART_IMAGE_ID__COUNT_ASC',
  SeasonsByFanartImageIdCountDesc = 'SEASONS_BY_FANART_IMAGE_ID__COUNT_DESC',
  SeasonsByFanartImageIdMaxAirTimeAsc = 'SEASONS_BY_FANART_IMAGE_ID__MAX_AIR_TIME_ASC',
  SeasonsByFanartImageIdMaxAirTimeDesc = 'SEASONS_BY_FANART_IMAGE_ID__MAX_AIR_TIME_DESC',
  SeasonsByFanartImageIdMaxAliasesAsc = 'SEASONS_BY_FANART_IMAGE_ID__MAX_ALIASES_ASC',
  SeasonsByFanartImageIdMaxAliasesDesc = 'SEASONS_BY_FANART_IMAGE_ID__MAX_ALIASES_DESC',
  SeasonsByFanartImageIdMaxBangumiIdAsc = 'SEASONS_BY_FANART_IMAGE_ID__MAX_BANGUMI_ID_ASC',
  SeasonsByFanartImageIdMaxBangumiIdDesc = 'SEASONS_BY_FANART_IMAGE_ID__MAX_BANGUMI_ID_DESC',
  SeasonsByFanartImageIdMaxBannerImageIdAsc = 'SEASONS_BY_FANART_IMAGE_ID__MAX_BANNER_IMAGE_ID_ASC',
  SeasonsByFanartImageIdMaxBannerImageIdDesc = 'SEASONS_BY_FANART_IMAGE_ID__MAX_BANNER_IMAGE_ID_DESC',
  SeasonsByFanartImageIdMaxBilibiliMainlandIdAsc = 'SEASONS_BY_FANART_IMAGE_ID__MAX_BILIBILI_MAINLAND_ID_ASC',
  SeasonsByFanartImageIdMaxBilibiliMainlandIdDesc = 'SEASONS_BY_FANART_IMAGE_ID__MAX_BILIBILI_MAINLAND_ID_DESC',
  SeasonsByFanartImageIdMaxBilibiliThmIdAsc = 'SEASONS_BY_FANART_IMAGE_ID__MAX_BILIBILI_THM_ID_ASC',
  SeasonsByFanartImageIdMaxBilibiliThmIdDesc = 'SEASONS_BY_FANART_IMAGE_ID__MAX_BILIBILI_THM_ID_DESC',
  SeasonsByFanartImageIdMaxCreatedAtAsc = 'SEASONS_BY_FANART_IMAGE_ID__MAX_CREATED_AT_ASC',
  SeasonsByFanartImageIdMaxCreatedAtDesc = 'SEASONS_BY_FANART_IMAGE_ID__MAX_CREATED_AT_DESC',
  SeasonsByFanartImageIdMaxDandanplayAnimeIdAsc = 'SEASONS_BY_FANART_IMAGE_ID__MAX_DANDANPLAY_ANIME_ID_ASC',
  SeasonsByFanartImageIdMaxDandanplayAnimeIdDesc = 'SEASONS_BY_FANART_IMAGE_ID__MAX_DANDANPLAY_ANIME_ID_DESC',
  SeasonsByFanartImageIdMaxDeclaredEpisodeCountAsc = 'SEASONS_BY_FANART_IMAGE_ID__MAX_DECLARED_EPISODE_COUNT_ASC',
  SeasonsByFanartImageIdMaxDeclaredEpisodeCountDesc = 'SEASONS_BY_FANART_IMAGE_ID__MAX_DECLARED_EPISODE_COUNT_DESC',
  SeasonsByFanartImageIdMaxDescriptionAsc = 'SEASONS_BY_FANART_IMAGE_ID__MAX_DESCRIPTION_ASC',
  SeasonsByFanartImageIdMaxDescriptionDesc = 'SEASONS_BY_FANART_IMAGE_ID__MAX_DESCRIPTION_DESC',
  SeasonsByFanartImageIdMaxDirectoryAsc = 'SEASONS_BY_FANART_IMAGE_ID__MAX_DIRECTORY_ASC',
  SeasonsByFanartImageIdMaxDirectoryDesc = 'SEASONS_BY_FANART_IMAGE_ID__MAX_DIRECTORY_DESC',
  SeasonsByFanartImageIdMaxDownloadOffsetHoursAsc = 'SEASONS_BY_FANART_IMAGE_ID__MAX_DOWNLOAD_OFFSET_HOURS_ASC',
  SeasonsByFanartImageIdMaxDownloadOffsetHoursDesc = 'SEASONS_BY_FANART_IMAGE_ID__MAX_DOWNLOAD_OFFSET_HOURS_DESC',
  SeasonsByFanartImageIdMaxEpisodesAutoSyncAsc = 'SEASONS_BY_FANART_IMAGE_ID__MAX_EPISODES_AUTO_SYNC_ASC',
  SeasonsByFanartImageIdMaxEpisodesAutoSyncDesc = 'SEASONS_BY_FANART_IMAGE_ID__MAX_EPISODES_AUTO_SYNC_DESC',
  SeasonsByFanartImageIdMaxEpisodesLastSyncAsc = 'SEASONS_BY_FANART_IMAGE_ID__MAX_EPISODES_LAST_SYNC_ASC',
  SeasonsByFanartImageIdMaxEpisodesLastSyncDesc = 'SEASONS_BY_FANART_IMAGE_ID__MAX_EPISODES_LAST_SYNC_DESC',
  SeasonsByFanartImageIdMaxEpisodesSourceAsc = 'SEASONS_BY_FANART_IMAGE_ID__MAX_EPISODES_SOURCE_ASC',
  SeasonsByFanartImageIdMaxEpisodesSourceDesc = 'SEASONS_BY_FANART_IMAGE_ID__MAX_EPISODES_SOURCE_DESC',
  SeasonsByFanartImageIdMaxFanartImageIdAsc = 'SEASONS_BY_FANART_IMAGE_ID__MAX_FANART_IMAGE_ID_ASC',
  SeasonsByFanartImageIdMaxFanartImageIdDesc = 'SEASONS_BY_FANART_IMAGE_ID__MAX_FANART_IMAGE_ID_DESC',
  SeasonsByFanartImageIdMaxIdAsc = 'SEASONS_BY_FANART_IMAGE_ID__MAX_ID_ASC',
  SeasonsByFanartImageIdMaxIdDesc = 'SEASONS_BY_FANART_IMAGE_ID__MAX_ID_DESC',
  SeasonsByFanartImageIdMaxInfoSourceAsc = 'SEASONS_BY_FANART_IMAGE_ID__MAX_INFO_SOURCE_ASC',
  SeasonsByFanartImageIdMaxInfoSourceDesc = 'SEASONS_BY_FANART_IMAGE_ID__MAX_INFO_SOURCE_DESC',
  SeasonsByFanartImageIdMaxIntegrationsLaniaSyncAsc = 'SEASONS_BY_FANART_IMAGE_ID__MAX_INTEGRATIONS_LANIA_SYNC_ASC',
  SeasonsByFanartImageIdMaxIntegrationsLaniaSyncDesc = 'SEASONS_BY_FANART_IMAGE_ID__MAX_INTEGRATIONS_LANIA_SYNC_DESC',
  SeasonsByFanartImageIdMaxIsMonitoringAsc = 'SEASONS_BY_FANART_IMAGE_ID__MAX_IS_MONITORING_ASC',
  SeasonsByFanartImageIdMaxIsMonitoringDesc = 'SEASONS_BY_FANART_IMAGE_ID__MAX_IS_MONITORING_DESC',
  SeasonsByFanartImageIdMaxJellyfinFolderIdAsc = 'SEASONS_BY_FANART_IMAGE_ID__MAX_JELLYFIN_FOLDER_ID_ASC',
  SeasonsByFanartImageIdMaxJellyfinFolderIdDesc = 'SEASONS_BY_FANART_IMAGE_ID__MAX_JELLYFIN_FOLDER_ID_DESC',
  SeasonsByFanartImageIdMaxJellyfinIdAsc = 'SEASONS_BY_FANART_IMAGE_ID__MAX_JELLYFIN_ID_ASC',
  SeasonsByFanartImageIdMaxJellyfinIdDesc = 'SEASONS_BY_FANART_IMAGE_ID__MAX_JELLYFIN_ID_DESC',
  SeasonsByFanartImageIdMaxLastWriteDirectoryAsc = 'SEASONS_BY_FANART_IMAGE_ID__MAX_LAST_WRITE_DIRECTORY_ASC',
  SeasonsByFanartImageIdMaxLastWriteDirectoryDesc = 'SEASONS_BY_FANART_IMAGE_ID__MAX_LAST_WRITE_DIRECTORY_DESC',
  SeasonsByFanartImageIdMaxLastWriteTitleAsc = 'SEASONS_BY_FANART_IMAGE_ID__MAX_LAST_WRITE_TITLE_ASC',
  SeasonsByFanartImageIdMaxLastWriteTitleDesc = 'SEASONS_BY_FANART_IMAGE_ID__MAX_LAST_WRITE_TITLE_DESC',
  SeasonsByFanartImageIdMaxLastWriteToDiskAsc = 'SEASONS_BY_FANART_IMAGE_ID__MAX_LAST_WRITE_TO_DISK_ASC',
  SeasonsByFanartImageIdMaxLastWriteToDiskDesc = 'SEASONS_BY_FANART_IMAGE_ID__MAX_LAST_WRITE_TO_DISK_DESC',
  SeasonsByFanartImageIdMaxMikanAnimeIdAsc = 'SEASONS_BY_FANART_IMAGE_ID__MAX_MIKAN_ANIME_ID_ASC',
  SeasonsByFanartImageIdMaxMikanAnimeIdDesc = 'SEASONS_BY_FANART_IMAGE_ID__MAX_MIKAN_ANIME_ID_DESC',
  SeasonsByFanartImageIdMaxNeedDownloadCcAsc = 'SEASONS_BY_FANART_IMAGE_ID__MAX_NEED_DOWNLOAD_CC_ASC',
  SeasonsByFanartImageIdMaxNeedDownloadCcDesc = 'SEASONS_BY_FANART_IMAGE_ID__MAX_NEED_DOWNLOAD_CC_DESC',
  SeasonsByFanartImageIdMaxNotifyMissingAsc = 'SEASONS_BY_FANART_IMAGE_ID__MAX_NOTIFY_MISSING_ASC',
  SeasonsByFanartImageIdMaxNotifyMissingDesc = 'SEASONS_BY_FANART_IMAGE_ID__MAX_NOTIFY_MISSING_DESC',
  SeasonsByFanartImageIdMaxNotifyPublishAsc = 'SEASONS_BY_FANART_IMAGE_ID__MAX_NOTIFY_PUBLISH_ASC',
  SeasonsByFanartImageIdMaxNotifyPublishDesc = 'SEASONS_BY_FANART_IMAGE_ID__MAX_NOTIFY_PUBLISH_DESC',
  SeasonsByFanartImageIdMaxPosterImageIdAsc = 'SEASONS_BY_FANART_IMAGE_ID__MAX_POSTER_IMAGE_ID_ASC',
  SeasonsByFanartImageIdMaxPosterImageIdDesc = 'SEASONS_BY_FANART_IMAGE_ID__MAX_POSTER_IMAGE_ID_DESC',
  SeasonsByFanartImageIdMaxPremiereDateAsc = 'SEASONS_BY_FANART_IMAGE_ID__MAX_PREMIERE_DATE_ASC',
  SeasonsByFanartImageIdMaxPremiereDateDesc = 'SEASONS_BY_FANART_IMAGE_ID__MAX_PREMIERE_DATE_DESC',
  SeasonsByFanartImageIdMaxSmartDownloadEnabledAsc = 'SEASONS_BY_FANART_IMAGE_ID__MAX_SMART_DOWNLOAD_ENABLED_ASC',
  SeasonsByFanartImageIdMaxSmartDownloadEnabledDesc = 'SEASONS_BY_FANART_IMAGE_ID__MAX_SMART_DOWNLOAD_ENABLED_DESC',
  SeasonsByFanartImageIdMaxSmartDownloadPreferBahaAsc = 'SEASONS_BY_FANART_IMAGE_ID__MAX_SMART_DOWNLOAD_PREFER_BAHA_ASC',
  SeasonsByFanartImageIdMaxSmartDownloadPreferBahaDesc = 'SEASONS_BY_FANART_IMAGE_ID__MAX_SMART_DOWNLOAD_PREFER_BAHA_DESC',
  SeasonsByFanartImageIdMaxSmartDownloadSubtitleAsc = 'SEASONS_BY_FANART_IMAGE_ID__MAX_SMART_DOWNLOAD_SUBTITLE_ASC',
  SeasonsByFanartImageIdMaxSmartDownloadSubtitleDesc = 'SEASONS_BY_FANART_IMAGE_ID__MAX_SMART_DOWNLOAD_SUBTITLE_DESC',
  SeasonsByFanartImageIdMaxSmartDownloadTimeoutMinutesAsc = 'SEASONS_BY_FANART_IMAGE_ID__MAX_SMART_DOWNLOAD_TIMEOUT_MINUTES_ASC',
  SeasonsByFanartImageIdMaxSmartDownloadTimeoutMinutesDesc = 'SEASONS_BY_FANART_IMAGE_ID__MAX_SMART_DOWNLOAD_TIMEOUT_MINUTES_DESC',
  SeasonsByFanartImageIdMaxSmartDownloadWindowHoursAsc = 'SEASONS_BY_FANART_IMAGE_ID__MAX_SMART_DOWNLOAD_WINDOW_HOURS_ASC',
  SeasonsByFanartImageIdMaxSmartDownloadWindowHoursDesc = 'SEASONS_BY_FANART_IMAGE_ID__MAX_SMART_DOWNLOAD_WINDOW_HOURS_DESC',
  SeasonsByFanartImageIdMaxTagsAsc = 'SEASONS_BY_FANART_IMAGE_ID__MAX_TAGS_ASC',
  SeasonsByFanartImageIdMaxTagsDesc = 'SEASONS_BY_FANART_IMAGE_ID__MAX_TAGS_DESC',
  SeasonsByFanartImageIdMaxTitleAsc = 'SEASONS_BY_FANART_IMAGE_ID__MAX_TITLE_ASC',
  SeasonsByFanartImageIdMaxTitleDesc = 'SEASONS_BY_FANART_IMAGE_ID__MAX_TITLE_DESC',
  SeasonsByFanartImageIdMaxTvdbIdAsc = 'SEASONS_BY_FANART_IMAGE_ID__MAX_TVDB_ID_ASC',
  SeasonsByFanartImageIdMaxTvdbIdDesc = 'SEASONS_BY_FANART_IMAGE_ID__MAX_TVDB_ID_DESC',
  SeasonsByFanartImageIdMaxTvdbSeasonAsc = 'SEASONS_BY_FANART_IMAGE_ID__MAX_TVDB_SEASON_ASC',
  SeasonsByFanartImageIdMaxTvdbSeasonDesc = 'SEASONS_BY_FANART_IMAGE_ID__MAX_TVDB_SEASON_DESC',
  SeasonsByFanartImageIdMaxWeekdayAsc = 'SEASONS_BY_FANART_IMAGE_ID__MAX_WEEKDAY_ASC',
  SeasonsByFanartImageIdMaxWeekdayDesc = 'SEASONS_BY_FANART_IMAGE_ID__MAX_WEEKDAY_DESC',
  SeasonsByFanartImageIdMaxYearAndSemesterAsc = 'SEASONS_BY_FANART_IMAGE_ID__MAX_YEAR_AND_SEMESTER_ASC',
  SeasonsByFanartImageIdMaxYearAndSemesterCanonicalAsc = 'SEASONS_BY_FANART_IMAGE_ID__MAX_YEAR_AND_SEMESTER_CANONICAL_ASC',
  SeasonsByFanartImageIdMaxYearAndSemesterCanonicalDesc = 'SEASONS_BY_FANART_IMAGE_ID__MAX_YEAR_AND_SEMESTER_CANONICAL_DESC',
  SeasonsByFanartImageIdMaxYearAndSemesterDesc = 'SEASONS_BY_FANART_IMAGE_ID__MAX_YEAR_AND_SEMESTER_DESC',
  SeasonsByFanartImageIdMinAirTimeAsc = 'SEASONS_BY_FANART_IMAGE_ID__MIN_AIR_TIME_ASC',
  SeasonsByFanartImageIdMinAirTimeDesc = 'SEASONS_BY_FANART_IMAGE_ID__MIN_AIR_TIME_DESC',
  SeasonsByFanartImageIdMinAliasesAsc = 'SEASONS_BY_FANART_IMAGE_ID__MIN_ALIASES_ASC',
  SeasonsByFanartImageIdMinAliasesDesc = 'SEASONS_BY_FANART_IMAGE_ID__MIN_ALIASES_DESC',
  SeasonsByFanartImageIdMinBangumiIdAsc = 'SEASONS_BY_FANART_IMAGE_ID__MIN_BANGUMI_ID_ASC',
  SeasonsByFanartImageIdMinBangumiIdDesc = 'SEASONS_BY_FANART_IMAGE_ID__MIN_BANGUMI_ID_DESC',
  SeasonsByFanartImageIdMinBannerImageIdAsc = 'SEASONS_BY_FANART_IMAGE_ID__MIN_BANNER_IMAGE_ID_ASC',
  SeasonsByFanartImageIdMinBannerImageIdDesc = 'SEASONS_BY_FANART_IMAGE_ID__MIN_BANNER_IMAGE_ID_DESC',
  SeasonsByFanartImageIdMinBilibiliMainlandIdAsc = 'SEASONS_BY_FANART_IMAGE_ID__MIN_BILIBILI_MAINLAND_ID_ASC',
  SeasonsByFanartImageIdMinBilibiliMainlandIdDesc = 'SEASONS_BY_FANART_IMAGE_ID__MIN_BILIBILI_MAINLAND_ID_DESC',
  SeasonsByFanartImageIdMinBilibiliThmIdAsc = 'SEASONS_BY_FANART_IMAGE_ID__MIN_BILIBILI_THM_ID_ASC',
  SeasonsByFanartImageIdMinBilibiliThmIdDesc = 'SEASONS_BY_FANART_IMAGE_ID__MIN_BILIBILI_THM_ID_DESC',
  SeasonsByFanartImageIdMinCreatedAtAsc = 'SEASONS_BY_FANART_IMAGE_ID__MIN_CREATED_AT_ASC',
  SeasonsByFanartImageIdMinCreatedAtDesc = 'SEASONS_BY_FANART_IMAGE_ID__MIN_CREATED_AT_DESC',
  SeasonsByFanartImageIdMinDandanplayAnimeIdAsc = 'SEASONS_BY_FANART_IMAGE_ID__MIN_DANDANPLAY_ANIME_ID_ASC',
  SeasonsByFanartImageIdMinDandanplayAnimeIdDesc = 'SEASONS_BY_FANART_IMAGE_ID__MIN_DANDANPLAY_ANIME_ID_DESC',
  SeasonsByFanartImageIdMinDeclaredEpisodeCountAsc = 'SEASONS_BY_FANART_IMAGE_ID__MIN_DECLARED_EPISODE_COUNT_ASC',
  SeasonsByFanartImageIdMinDeclaredEpisodeCountDesc = 'SEASONS_BY_FANART_IMAGE_ID__MIN_DECLARED_EPISODE_COUNT_DESC',
  SeasonsByFanartImageIdMinDescriptionAsc = 'SEASONS_BY_FANART_IMAGE_ID__MIN_DESCRIPTION_ASC',
  SeasonsByFanartImageIdMinDescriptionDesc = 'SEASONS_BY_FANART_IMAGE_ID__MIN_DESCRIPTION_DESC',
  SeasonsByFanartImageIdMinDirectoryAsc = 'SEASONS_BY_FANART_IMAGE_ID__MIN_DIRECTORY_ASC',
  SeasonsByFanartImageIdMinDirectoryDesc = 'SEASONS_BY_FANART_IMAGE_ID__MIN_DIRECTORY_DESC',
  SeasonsByFanartImageIdMinDownloadOffsetHoursAsc = 'SEASONS_BY_FANART_IMAGE_ID__MIN_DOWNLOAD_OFFSET_HOURS_ASC',
  SeasonsByFanartImageIdMinDownloadOffsetHoursDesc = 'SEASONS_BY_FANART_IMAGE_ID__MIN_DOWNLOAD_OFFSET_HOURS_DESC',
  SeasonsByFanartImageIdMinEpisodesAutoSyncAsc = 'SEASONS_BY_FANART_IMAGE_ID__MIN_EPISODES_AUTO_SYNC_ASC',
  SeasonsByFanartImageIdMinEpisodesAutoSyncDesc = 'SEASONS_BY_FANART_IMAGE_ID__MIN_EPISODES_AUTO_SYNC_DESC',
  SeasonsByFanartImageIdMinEpisodesLastSyncAsc = 'SEASONS_BY_FANART_IMAGE_ID__MIN_EPISODES_LAST_SYNC_ASC',
  SeasonsByFanartImageIdMinEpisodesLastSyncDesc = 'SEASONS_BY_FANART_IMAGE_ID__MIN_EPISODES_LAST_SYNC_DESC',
  SeasonsByFanartImageIdMinEpisodesSourceAsc = 'SEASONS_BY_FANART_IMAGE_ID__MIN_EPISODES_SOURCE_ASC',
  SeasonsByFanartImageIdMinEpisodesSourceDesc = 'SEASONS_BY_FANART_IMAGE_ID__MIN_EPISODES_SOURCE_DESC',
  SeasonsByFanartImageIdMinFanartImageIdAsc = 'SEASONS_BY_FANART_IMAGE_ID__MIN_FANART_IMAGE_ID_ASC',
  SeasonsByFanartImageIdMinFanartImageIdDesc = 'SEASONS_BY_FANART_IMAGE_ID__MIN_FANART_IMAGE_ID_DESC',
  SeasonsByFanartImageIdMinIdAsc = 'SEASONS_BY_FANART_IMAGE_ID__MIN_ID_ASC',
  SeasonsByFanartImageIdMinIdDesc = 'SEASONS_BY_FANART_IMAGE_ID__MIN_ID_DESC',
  SeasonsByFanartImageIdMinInfoSourceAsc = 'SEASONS_BY_FANART_IMAGE_ID__MIN_INFO_SOURCE_ASC',
  SeasonsByFanartImageIdMinInfoSourceDesc = 'SEASONS_BY_FANART_IMAGE_ID__MIN_INFO_SOURCE_DESC',
  SeasonsByFanartImageIdMinIntegrationsLaniaSyncAsc = 'SEASONS_BY_FANART_IMAGE_ID__MIN_INTEGRATIONS_LANIA_SYNC_ASC',
  SeasonsByFanartImageIdMinIntegrationsLaniaSyncDesc = 'SEASONS_BY_FANART_IMAGE_ID__MIN_INTEGRATIONS_LANIA_SYNC_DESC',
  SeasonsByFanartImageIdMinIsMonitoringAsc = 'SEASONS_BY_FANART_IMAGE_ID__MIN_IS_MONITORING_ASC',
  SeasonsByFanartImageIdMinIsMonitoringDesc = 'SEASONS_BY_FANART_IMAGE_ID__MIN_IS_MONITORING_DESC',
  SeasonsByFanartImageIdMinJellyfinFolderIdAsc = 'SEASONS_BY_FANART_IMAGE_ID__MIN_JELLYFIN_FOLDER_ID_ASC',
  SeasonsByFanartImageIdMinJellyfinFolderIdDesc = 'SEASONS_BY_FANART_IMAGE_ID__MIN_JELLYFIN_FOLDER_ID_DESC',
  SeasonsByFanartImageIdMinJellyfinIdAsc = 'SEASONS_BY_FANART_IMAGE_ID__MIN_JELLYFIN_ID_ASC',
  SeasonsByFanartImageIdMinJellyfinIdDesc = 'SEASONS_BY_FANART_IMAGE_ID__MIN_JELLYFIN_ID_DESC',
  SeasonsByFanartImageIdMinLastWriteDirectoryAsc = 'SEASONS_BY_FANART_IMAGE_ID__MIN_LAST_WRITE_DIRECTORY_ASC',
  SeasonsByFanartImageIdMinLastWriteDirectoryDesc = 'SEASONS_BY_FANART_IMAGE_ID__MIN_LAST_WRITE_DIRECTORY_DESC',
  SeasonsByFanartImageIdMinLastWriteTitleAsc = 'SEASONS_BY_FANART_IMAGE_ID__MIN_LAST_WRITE_TITLE_ASC',
  SeasonsByFanartImageIdMinLastWriteTitleDesc = 'SEASONS_BY_FANART_IMAGE_ID__MIN_LAST_WRITE_TITLE_DESC',
  SeasonsByFanartImageIdMinLastWriteToDiskAsc = 'SEASONS_BY_FANART_IMAGE_ID__MIN_LAST_WRITE_TO_DISK_ASC',
  SeasonsByFanartImageIdMinLastWriteToDiskDesc = 'SEASONS_BY_FANART_IMAGE_ID__MIN_LAST_WRITE_TO_DISK_DESC',
  SeasonsByFanartImageIdMinMikanAnimeIdAsc = 'SEASONS_BY_FANART_IMAGE_ID__MIN_MIKAN_ANIME_ID_ASC',
  SeasonsByFanartImageIdMinMikanAnimeIdDesc = 'SEASONS_BY_FANART_IMAGE_ID__MIN_MIKAN_ANIME_ID_DESC',
  SeasonsByFanartImageIdMinNeedDownloadCcAsc = 'SEASONS_BY_FANART_IMAGE_ID__MIN_NEED_DOWNLOAD_CC_ASC',
  SeasonsByFanartImageIdMinNeedDownloadCcDesc = 'SEASONS_BY_FANART_IMAGE_ID__MIN_NEED_DOWNLOAD_CC_DESC',
  SeasonsByFanartImageIdMinNotifyMissingAsc = 'SEASONS_BY_FANART_IMAGE_ID__MIN_NOTIFY_MISSING_ASC',
  SeasonsByFanartImageIdMinNotifyMissingDesc = 'SEASONS_BY_FANART_IMAGE_ID__MIN_NOTIFY_MISSING_DESC',
  SeasonsByFanartImageIdMinNotifyPublishAsc = 'SEASONS_BY_FANART_IMAGE_ID__MIN_NOTIFY_PUBLISH_ASC',
  SeasonsByFanartImageIdMinNotifyPublishDesc = 'SEASONS_BY_FANART_IMAGE_ID__MIN_NOTIFY_PUBLISH_DESC',
  SeasonsByFanartImageIdMinPosterImageIdAsc = 'SEASONS_BY_FANART_IMAGE_ID__MIN_POSTER_IMAGE_ID_ASC',
  SeasonsByFanartImageIdMinPosterImageIdDesc = 'SEASONS_BY_FANART_IMAGE_ID__MIN_POSTER_IMAGE_ID_DESC',
  SeasonsByFanartImageIdMinPremiereDateAsc = 'SEASONS_BY_FANART_IMAGE_ID__MIN_PREMIERE_DATE_ASC',
  SeasonsByFanartImageIdMinPremiereDateDesc = 'SEASONS_BY_FANART_IMAGE_ID__MIN_PREMIERE_DATE_DESC',
  SeasonsByFanartImageIdMinSmartDownloadEnabledAsc = 'SEASONS_BY_FANART_IMAGE_ID__MIN_SMART_DOWNLOAD_ENABLED_ASC',
  SeasonsByFanartImageIdMinSmartDownloadEnabledDesc = 'SEASONS_BY_FANART_IMAGE_ID__MIN_SMART_DOWNLOAD_ENABLED_DESC',
  SeasonsByFanartImageIdMinSmartDownloadPreferBahaAsc = 'SEASONS_BY_FANART_IMAGE_ID__MIN_SMART_DOWNLOAD_PREFER_BAHA_ASC',
  SeasonsByFanartImageIdMinSmartDownloadPreferBahaDesc = 'SEASONS_BY_FANART_IMAGE_ID__MIN_SMART_DOWNLOAD_PREFER_BAHA_DESC',
  SeasonsByFanartImageIdMinSmartDownloadSubtitleAsc = 'SEASONS_BY_FANART_IMAGE_ID__MIN_SMART_DOWNLOAD_SUBTITLE_ASC',
  SeasonsByFanartImageIdMinSmartDownloadSubtitleDesc = 'SEASONS_BY_FANART_IMAGE_ID__MIN_SMART_DOWNLOAD_SUBTITLE_DESC',
  SeasonsByFanartImageIdMinSmartDownloadTimeoutMinutesAsc = 'SEASONS_BY_FANART_IMAGE_ID__MIN_SMART_DOWNLOAD_TIMEOUT_MINUTES_ASC',
  SeasonsByFanartImageIdMinSmartDownloadTimeoutMinutesDesc = 'SEASONS_BY_FANART_IMAGE_ID__MIN_SMART_DOWNLOAD_TIMEOUT_MINUTES_DESC',
  SeasonsByFanartImageIdMinSmartDownloadWindowHoursAsc = 'SEASONS_BY_FANART_IMAGE_ID__MIN_SMART_DOWNLOAD_WINDOW_HOURS_ASC',
  SeasonsByFanartImageIdMinSmartDownloadWindowHoursDesc = 'SEASONS_BY_FANART_IMAGE_ID__MIN_SMART_DOWNLOAD_WINDOW_HOURS_DESC',
  SeasonsByFanartImageIdMinTagsAsc = 'SEASONS_BY_FANART_IMAGE_ID__MIN_TAGS_ASC',
  SeasonsByFanartImageIdMinTagsDesc = 'SEASONS_BY_FANART_IMAGE_ID__MIN_TAGS_DESC',
  SeasonsByFanartImageIdMinTitleAsc = 'SEASONS_BY_FANART_IMAGE_ID__MIN_TITLE_ASC',
  SeasonsByFanartImageIdMinTitleDesc = 'SEASONS_BY_FANART_IMAGE_ID__MIN_TITLE_DESC',
  SeasonsByFanartImageIdMinTvdbIdAsc = 'SEASONS_BY_FANART_IMAGE_ID__MIN_TVDB_ID_ASC',
  SeasonsByFanartImageIdMinTvdbIdDesc = 'SEASONS_BY_FANART_IMAGE_ID__MIN_TVDB_ID_DESC',
  SeasonsByFanartImageIdMinTvdbSeasonAsc = 'SEASONS_BY_FANART_IMAGE_ID__MIN_TVDB_SEASON_ASC',
  SeasonsByFanartImageIdMinTvdbSeasonDesc = 'SEASONS_BY_FANART_IMAGE_ID__MIN_TVDB_SEASON_DESC',
  SeasonsByFanartImageIdMinWeekdayAsc = 'SEASONS_BY_FANART_IMAGE_ID__MIN_WEEKDAY_ASC',
  SeasonsByFanartImageIdMinWeekdayDesc = 'SEASONS_BY_FANART_IMAGE_ID__MIN_WEEKDAY_DESC',
  SeasonsByFanartImageIdMinYearAndSemesterAsc = 'SEASONS_BY_FANART_IMAGE_ID__MIN_YEAR_AND_SEMESTER_ASC',
  SeasonsByFanartImageIdMinYearAndSemesterCanonicalAsc = 'SEASONS_BY_FANART_IMAGE_ID__MIN_YEAR_AND_SEMESTER_CANONICAL_ASC',
  SeasonsByFanartImageIdMinYearAndSemesterCanonicalDesc = 'SEASONS_BY_FANART_IMAGE_ID__MIN_YEAR_AND_SEMESTER_CANONICAL_DESC',
  SeasonsByFanartImageIdMinYearAndSemesterDesc = 'SEASONS_BY_FANART_IMAGE_ID__MIN_YEAR_AND_SEMESTER_DESC',
  SeasonsByPosterImageIdCountAsc = 'SEASONS_BY_POSTER_IMAGE_ID__COUNT_ASC',
  SeasonsByPosterImageIdCountDesc = 'SEASONS_BY_POSTER_IMAGE_ID__COUNT_DESC',
  SeasonsByPosterImageIdMaxAirTimeAsc = 'SEASONS_BY_POSTER_IMAGE_ID__MAX_AIR_TIME_ASC',
  SeasonsByPosterImageIdMaxAirTimeDesc = 'SEASONS_BY_POSTER_IMAGE_ID__MAX_AIR_TIME_DESC',
  SeasonsByPosterImageIdMaxAliasesAsc = 'SEASONS_BY_POSTER_IMAGE_ID__MAX_ALIASES_ASC',
  SeasonsByPosterImageIdMaxAliasesDesc = 'SEASONS_BY_POSTER_IMAGE_ID__MAX_ALIASES_DESC',
  SeasonsByPosterImageIdMaxBangumiIdAsc = 'SEASONS_BY_POSTER_IMAGE_ID__MAX_BANGUMI_ID_ASC',
  SeasonsByPosterImageIdMaxBangumiIdDesc = 'SEASONS_BY_POSTER_IMAGE_ID__MAX_BANGUMI_ID_DESC',
  SeasonsByPosterImageIdMaxBannerImageIdAsc = 'SEASONS_BY_POSTER_IMAGE_ID__MAX_BANNER_IMAGE_ID_ASC',
  SeasonsByPosterImageIdMaxBannerImageIdDesc = 'SEASONS_BY_POSTER_IMAGE_ID__MAX_BANNER_IMAGE_ID_DESC',
  SeasonsByPosterImageIdMaxBilibiliMainlandIdAsc = 'SEASONS_BY_POSTER_IMAGE_ID__MAX_BILIBILI_MAINLAND_ID_ASC',
  SeasonsByPosterImageIdMaxBilibiliMainlandIdDesc = 'SEASONS_BY_POSTER_IMAGE_ID__MAX_BILIBILI_MAINLAND_ID_DESC',
  SeasonsByPosterImageIdMaxBilibiliThmIdAsc = 'SEASONS_BY_POSTER_IMAGE_ID__MAX_BILIBILI_THM_ID_ASC',
  SeasonsByPosterImageIdMaxBilibiliThmIdDesc = 'SEASONS_BY_POSTER_IMAGE_ID__MAX_BILIBILI_THM_ID_DESC',
  SeasonsByPosterImageIdMaxCreatedAtAsc = 'SEASONS_BY_POSTER_IMAGE_ID__MAX_CREATED_AT_ASC',
  SeasonsByPosterImageIdMaxCreatedAtDesc = 'SEASONS_BY_POSTER_IMAGE_ID__MAX_CREATED_AT_DESC',
  SeasonsByPosterImageIdMaxDandanplayAnimeIdAsc = 'SEASONS_BY_POSTER_IMAGE_ID__MAX_DANDANPLAY_ANIME_ID_ASC',
  SeasonsByPosterImageIdMaxDandanplayAnimeIdDesc = 'SEASONS_BY_POSTER_IMAGE_ID__MAX_DANDANPLAY_ANIME_ID_DESC',
  SeasonsByPosterImageIdMaxDeclaredEpisodeCountAsc = 'SEASONS_BY_POSTER_IMAGE_ID__MAX_DECLARED_EPISODE_COUNT_ASC',
  SeasonsByPosterImageIdMaxDeclaredEpisodeCountDesc = 'SEASONS_BY_POSTER_IMAGE_ID__MAX_DECLARED_EPISODE_COUNT_DESC',
  SeasonsByPosterImageIdMaxDescriptionAsc = 'SEASONS_BY_POSTER_IMAGE_ID__MAX_DESCRIPTION_ASC',
  SeasonsByPosterImageIdMaxDescriptionDesc = 'SEASONS_BY_POSTER_IMAGE_ID__MAX_DESCRIPTION_DESC',
  SeasonsByPosterImageIdMaxDirectoryAsc = 'SEASONS_BY_POSTER_IMAGE_ID__MAX_DIRECTORY_ASC',
  SeasonsByPosterImageIdMaxDirectoryDesc = 'SEASONS_BY_POSTER_IMAGE_ID__MAX_DIRECTORY_DESC',
  SeasonsByPosterImageIdMaxDownloadOffsetHoursAsc = 'SEASONS_BY_POSTER_IMAGE_ID__MAX_DOWNLOAD_OFFSET_HOURS_ASC',
  SeasonsByPosterImageIdMaxDownloadOffsetHoursDesc = 'SEASONS_BY_POSTER_IMAGE_ID__MAX_DOWNLOAD_OFFSET_HOURS_DESC',
  SeasonsByPosterImageIdMaxEpisodesAutoSyncAsc = 'SEASONS_BY_POSTER_IMAGE_ID__MAX_EPISODES_AUTO_SYNC_ASC',
  SeasonsByPosterImageIdMaxEpisodesAutoSyncDesc = 'SEASONS_BY_POSTER_IMAGE_ID__MAX_EPISODES_AUTO_SYNC_DESC',
  SeasonsByPosterImageIdMaxEpisodesLastSyncAsc = 'SEASONS_BY_POSTER_IMAGE_ID__MAX_EPISODES_LAST_SYNC_ASC',
  SeasonsByPosterImageIdMaxEpisodesLastSyncDesc = 'SEASONS_BY_POSTER_IMAGE_ID__MAX_EPISODES_LAST_SYNC_DESC',
  SeasonsByPosterImageIdMaxEpisodesSourceAsc = 'SEASONS_BY_POSTER_IMAGE_ID__MAX_EPISODES_SOURCE_ASC',
  SeasonsByPosterImageIdMaxEpisodesSourceDesc = 'SEASONS_BY_POSTER_IMAGE_ID__MAX_EPISODES_SOURCE_DESC',
  SeasonsByPosterImageIdMaxFanartImageIdAsc = 'SEASONS_BY_POSTER_IMAGE_ID__MAX_FANART_IMAGE_ID_ASC',
  SeasonsByPosterImageIdMaxFanartImageIdDesc = 'SEASONS_BY_POSTER_IMAGE_ID__MAX_FANART_IMAGE_ID_DESC',
  SeasonsByPosterImageIdMaxIdAsc = 'SEASONS_BY_POSTER_IMAGE_ID__MAX_ID_ASC',
  SeasonsByPosterImageIdMaxIdDesc = 'SEASONS_BY_POSTER_IMAGE_ID__MAX_ID_DESC',
  SeasonsByPosterImageIdMaxInfoSourceAsc = 'SEASONS_BY_POSTER_IMAGE_ID__MAX_INFO_SOURCE_ASC',
  SeasonsByPosterImageIdMaxInfoSourceDesc = 'SEASONS_BY_POSTER_IMAGE_ID__MAX_INFO_SOURCE_DESC',
  SeasonsByPosterImageIdMaxIntegrationsLaniaSyncAsc = 'SEASONS_BY_POSTER_IMAGE_ID__MAX_INTEGRATIONS_LANIA_SYNC_ASC',
  SeasonsByPosterImageIdMaxIntegrationsLaniaSyncDesc = 'SEASONS_BY_POSTER_IMAGE_ID__MAX_INTEGRATIONS_LANIA_SYNC_DESC',
  SeasonsByPosterImageIdMaxIsMonitoringAsc = 'SEASONS_BY_POSTER_IMAGE_ID__MAX_IS_MONITORING_ASC',
  SeasonsByPosterImageIdMaxIsMonitoringDesc = 'SEASONS_BY_POSTER_IMAGE_ID__MAX_IS_MONITORING_DESC',
  SeasonsByPosterImageIdMaxJellyfinFolderIdAsc = 'SEASONS_BY_POSTER_IMAGE_ID__MAX_JELLYFIN_FOLDER_ID_ASC',
  SeasonsByPosterImageIdMaxJellyfinFolderIdDesc = 'SEASONS_BY_POSTER_IMAGE_ID__MAX_JELLYFIN_FOLDER_ID_DESC',
  SeasonsByPosterImageIdMaxJellyfinIdAsc = 'SEASONS_BY_POSTER_IMAGE_ID__MAX_JELLYFIN_ID_ASC',
  SeasonsByPosterImageIdMaxJellyfinIdDesc = 'SEASONS_BY_POSTER_IMAGE_ID__MAX_JELLYFIN_ID_DESC',
  SeasonsByPosterImageIdMaxLastWriteDirectoryAsc = 'SEASONS_BY_POSTER_IMAGE_ID__MAX_LAST_WRITE_DIRECTORY_ASC',
  SeasonsByPosterImageIdMaxLastWriteDirectoryDesc = 'SEASONS_BY_POSTER_IMAGE_ID__MAX_LAST_WRITE_DIRECTORY_DESC',
  SeasonsByPosterImageIdMaxLastWriteTitleAsc = 'SEASONS_BY_POSTER_IMAGE_ID__MAX_LAST_WRITE_TITLE_ASC',
  SeasonsByPosterImageIdMaxLastWriteTitleDesc = 'SEASONS_BY_POSTER_IMAGE_ID__MAX_LAST_WRITE_TITLE_DESC',
  SeasonsByPosterImageIdMaxLastWriteToDiskAsc = 'SEASONS_BY_POSTER_IMAGE_ID__MAX_LAST_WRITE_TO_DISK_ASC',
  SeasonsByPosterImageIdMaxLastWriteToDiskDesc = 'SEASONS_BY_POSTER_IMAGE_ID__MAX_LAST_WRITE_TO_DISK_DESC',
  SeasonsByPosterImageIdMaxMikanAnimeIdAsc = 'SEASONS_BY_POSTER_IMAGE_ID__MAX_MIKAN_ANIME_ID_ASC',
  SeasonsByPosterImageIdMaxMikanAnimeIdDesc = 'SEASONS_BY_POSTER_IMAGE_ID__MAX_MIKAN_ANIME_ID_DESC',
  SeasonsByPosterImageIdMaxNeedDownloadCcAsc = 'SEASONS_BY_POSTER_IMAGE_ID__MAX_NEED_DOWNLOAD_CC_ASC',
  SeasonsByPosterImageIdMaxNeedDownloadCcDesc = 'SEASONS_BY_POSTER_IMAGE_ID__MAX_NEED_DOWNLOAD_CC_DESC',
  SeasonsByPosterImageIdMaxNotifyMissingAsc = 'SEASONS_BY_POSTER_IMAGE_ID__MAX_NOTIFY_MISSING_ASC',
  SeasonsByPosterImageIdMaxNotifyMissingDesc = 'SEASONS_BY_POSTER_IMAGE_ID__MAX_NOTIFY_MISSING_DESC',
  SeasonsByPosterImageIdMaxNotifyPublishAsc = 'SEASONS_BY_POSTER_IMAGE_ID__MAX_NOTIFY_PUBLISH_ASC',
  SeasonsByPosterImageIdMaxNotifyPublishDesc = 'SEASONS_BY_POSTER_IMAGE_ID__MAX_NOTIFY_PUBLISH_DESC',
  SeasonsByPosterImageIdMaxPosterImageIdAsc = 'SEASONS_BY_POSTER_IMAGE_ID__MAX_POSTER_IMAGE_ID_ASC',
  SeasonsByPosterImageIdMaxPosterImageIdDesc = 'SEASONS_BY_POSTER_IMAGE_ID__MAX_POSTER_IMAGE_ID_DESC',
  SeasonsByPosterImageIdMaxPremiereDateAsc = 'SEASONS_BY_POSTER_IMAGE_ID__MAX_PREMIERE_DATE_ASC',
  SeasonsByPosterImageIdMaxPremiereDateDesc = 'SEASONS_BY_POSTER_IMAGE_ID__MAX_PREMIERE_DATE_DESC',
  SeasonsByPosterImageIdMaxSmartDownloadEnabledAsc = 'SEASONS_BY_POSTER_IMAGE_ID__MAX_SMART_DOWNLOAD_ENABLED_ASC',
  SeasonsByPosterImageIdMaxSmartDownloadEnabledDesc = 'SEASONS_BY_POSTER_IMAGE_ID__MAX_SMART_DOWNLOAD_ENABLED_DESC',
  SeasonsByPosterImageIdMaxSmartDownloadPreferBahaAsc = 'SEASONS_BY_POSTER_IMAGE_ID__MAX_SMART_DOWNLOAD_PREFER_BAHA_ASC',
  SeasonsByPosterImageIdMaxSmartDownloadPreferBahaDesc = 'SEASONS_BY_POSTER_IMAGE_ID__MAX_SMART_DOWNLOAD_PREFER_BAHA_DESC',
  SeasonsByPosterImageIdMaxSmartDownloadSubtitleAsc = 'SEASONS_BY_POSTER_IMAGE_ID__MAX_SMART_DOWNLOAD_SUBTITLE_ASC',
  SeasonsByPosterImageIdMaxSmartDownloadSubtitleDesc = 'SEASONS_BY_POSTER_IMAGE_ID__MAX_SMART_DOWNLOAD_SUBTITLE_DESC',
  SeasonsByPosterImageIdMaxSmartDownloadTimeoutMinutesAsc = 'SEASONS_BY_POSTER_IMAGE_ID__MAX_SMART_DOWNLOAD_TIMEOUT_MINUTES_ASC',
  SeasonsByPosterImageIdMaxSmartDownloadTimeoutMinutesDesc = 'SEASONS_BY_POSTER_IMAGE_ID__MAX_SMART_DOWNLOAD_TIMEOUT_MINUTES_DESC',
  SeasonsByPosterImageIdMaxSmartDownloadWindowHoursAsc = 'SEASONS_BY_POSTER_IMAGE_ID__MAX_SMART_DOWNLOAD_WINDOW_HOURS_ASC',
  SeasonsByPosterImageIdMaxSmartDownloadWindowHoursDesc = 'SEASONS_BY_POSTER_IMAGE_ID__MAX_SMART_DOWNLOAD_WINDOW_HOURS_DESC',
  SeasonsByPosterImageIdMaxTagsAsc = 'SEASONS_BY_POSTER_IMAGE_ID__MAX_TAGS_ASC',
  SeasonsByPosterImageIdMaxTagsDesc = 'SEASONS_BY_POSTER_IMAGE_ID__MAX_TAGS_DESC',
  SeasonsByPosterImageIdMaxTitleAsc = 'SEASONS_BY_POSTER_IMAGE_ID__MAX_TITLE_ASC',
  SeasonsByPosterImageIdMaxTitleDesc = 'SEASONS_BY_POSTER_IMAGE_ID__MAX_TITLE_DESC',
  SeasonsByPosterImageIdMaxTvdbIdAsc = 'SEASONS_BY_POSTER_IMAGE_ID__MAX_TVDB_ID_ASC',
  SeasonsByPosterImageIdMaxTvdbIdDesc = 'SEASONS_BY_POSTER_IMAGE_ID__MAX_TVDB_ID_DESC',
  SeasonsByPosterImageIdMaxTvdbSeasonAsc = 'SEASONS_BY_POSTER_IMAGE_ID__MAX_TVDB_SEASON_ASC',
  SeasonsByPosterImageIdMaxTvdbSeasonDesc = 'SEASONS_BY_POSTER_IMAGE_ID__MAX_TVDB_SEASON_DESC',
  SeasonsByPosterImageIdMaxWeekdayAsc = 'SEASONS_BY_POSTER_IMAGE_ID__MAX_WEEKDAY_ASC',
  SeasonsByPosterImageIdMaxWeekdayDesc = 'SEASONS_BY_POSTER_IMAGE_ID__MAX_WEEKDAY_DESC',
  SeasonsByPosterImageIdMaxYearAndSemesterAsc = 'SEASONS_BY_POSTER_IMAGE_ID__MAX_YEAR_AND_SEMESTER_ASC',
  SeasonsByPosterImageIdMaxYearAndSemesterCanonicalAsc = 'SEASONS_BY_POSTER_IMAGE_ID__MAX_YEAR_AND_SEMESTER_CANONICAL_ASC',
  SeasonsByPosterImageIdMaxYearAndSemesterCanonicalDesc = 'SEASONS_BY_POSTER_IMAGE_ID__MAX_YEAR_AND_SEMESTER_CANONICAL_DESC',
  SeasonsByPosterImageIdMaxYearAndSemesterDesc = 'SEASONS_BY_POSTER_IMAGE_ID__MAX_YEAR_AND_SEMESTER_DESC',
  SeasonsByPosterImageIdMinAirTimeAsc = 'SEASONS_BY_POSTER_IMAGE_ID__MIN_AIR_TIME_ASC',
  SeasonsByPosterImageIdMinAirTimeDesc = 'SEASONS_BY_POSTER_IMAGE_ID__MIN_AIR_TIME_DESC',
  SeasonsByPosterImageIdMinAliasesAsc = 'SEASONS_BY_POSTER_IMAGE_ID__MIN_ALIASES_ASC',
  SeasonsByPosterImageIdMinAliasesDesc = 'SEASONS_BY_POSTER_IMAGE_ID__MIN_ALIASES_DESC',
  SeasonsByPosterImageIdMinBangumiIdAsc = 'SEASONS_BY_POSTER_IMAGE_ID__MIN_BANGUMI_ID_ASC',
  SeasonsByPosterImageIdMinBangumiIdDesc = 'SEASONS_BY_POSTER_IMAGE_ID__MIN_BANGUMI_ID_DESC',
  SeasonsByPosterImageIdMinBannerImageIdAsc = 'SEASONS_BY_POSTER_IMAGE_ID__MIN_BANNER_IMAGE_ID_ASC',
  SeasonsByPosterImageIdMinBannerImageIdDesc = 'SEASONS_BY_POSTER_IMAGE_ID__MIN_BANNER_IMAGE_ID_DESC',
  SeasonsByPosterImageIdMinBilibiliMainlandIdAsc = 'SEASONS_BY_POSTER_IMAGE_ID__MIN_BILIBILI_MAINLAND_ID_ASC',
  SeasonsByPosterImageIdMinBilibiliMainlandIdDesc = 'SEASONS_BY_POSTER_IMAGE_ID__MIN_BILIBILI_MAINLAND_ID_DESC',
  SeasonsByPosterImageIdMinBilibiliThmIdAsc = 'SEASONS_BY_POSTER_IMAGE_ID__MIN_BILIBILI_THM_ID_ASC',
  SeasonsByPosterImageIdMinBilibiliThmIdDesc = 'SEASONS_BY_POSTER_IMAGE_ID__MIN_BILIBILI_THM_ID_DESC',
  SeasonsByPosterImageIdMinCreatedAtAsc = 'SEASONS_BY_POSTER_IMAGE_ID__MIN_CREATED_AT_ASC',
  SeasonsByPosterImageIdMinCreatedAtDesc = 'SEASONS_BY_POSTER_IMAGE_ID__MIN_CREATED_AT_DESC',
  SeasonsByPosterImageIdMinDandanplayAnimeIdAsc = 'SEASONS_BY_POSTER_IMAGE_ID__MIN_DANDANPLAY_ANIME_ID_ASC',
  SeasonsByPosterImageIdMinDandanplayAnimeIdDesc = 'SEASONS_BY_POSTER_IMAGE_ID__MIN_DANDANPLAY_ANIME_ID_DESC',
  SeasonsByPosterImageIdMinDeclaredEpisodeCountAsc = 'SEASONS_BY_POSTER_IMAGE_ID__MIN_DECLARED_EPISODE_COUNT_ASC',
  SeasonsByPosterImageIdMinDeclaredEpisodeCountDesc = 'SEASONS_BY_POSTER_IMAGE_ID__MIN_DECLARED_EPISODE_COUNT_DESC',
  SeasonsByPosterImageIdMinDescriptionAsc = 'SEASONS_BY_POSTER_IMAGE_ID__MIN_DESCRIPTION_ASC',
  SeasonsByPosterImageIdMinDescriptionDesc = 'SEASONS_BY_POSTER_IMAGE_ID__MIN_DESCRIPTION_DESC',
  SeasonsByPosterImageIdMinDirectoryAsc = 'SEASONS_BY_POSTER_IMAGE_ID__MIN_DIRECTORY_ASC',
  SeasonsByPosterImageIdMinDirectoryDesc = 'SEASONS_BY_POSTER_IMAGE_ID__MIN_DIRECTORY_DESC',
  SeasonsByPosterImageIdMinDownloadOffsetHoursAsc = 'SEASONS_BY_POSTER_IMAGE_ID__MIN_DOWNLOAD_OFFSET_HOURS_ASC',
  SeasonsByPosterImageIdMinDownloadOffsetHoursDesc = 'SEASONS_BY_POSTER_IMAGE_ID__MIN_DOWNLOAD_OFFSET_HOURS_DESC',
  SeasonsByPosterImageIdMinEpisodesAutoSyncAsc = 'SEASONS_BY_POSTER_IMAGE_ID__MIN_EPISODES_AUTO_SYNC_ASC',
  SeasonsByPosterImageIdMinEpisodesAutoSyncDesc = 'SEASONS_BY_POSTER_IMAGE_ID__MIN_EPISODES_AUTO_SYNC_DESC',
  SeasonsByPosterImageIdMinEpisodesLastSyncAsc = 'SEASONS_BY_POSTER_IMAGE_ID__MIN_EPISODES_LAST_SYNC_ASC',
  SeasonsByPosterImageIdMinEpisodesLastSyncDesc = 'SEASONS_BY_POSTER_IMAGE_ID__MIN_EPISODES_LAST_SYNC_DESC',
  SeasonsByPosterImageIdMinEpisodesSourceAsc = 'SEASONS_BY_POSTER_IMAGE_ID__MIN_EPISODES_SOURCE_ASC',
  SeasonsByPosterImageIdMinEpisodesSourceDesc = 'SEASONS_BY_POSTER_IMAGE_ID__MIN_EPISODES_SOURCE_DESC',
  SeasonsByPosterImageIdMinFanartImageIdAsc = 'SEASONS_BY_POSTER_IMAGE_ID__MIN_FANART_IMAGE_ID_ASC',
  SeasonsByPosterImageIdMinFanartImageIdDesc = 'SEASONS_BY_POSTER_IMAGE_ID__MIN_FANART_IMAGE_ID_DESC',
  SeasonsByPosterImageIdMinIdAsc = 'SEASONS_BY_POSTER_IMAGE_ID__MIN_ID_ASC',
  SeasonsByPosterImageIdMinIdDesc = 'SEASONS_BY_POSTER_IMAGE_ID__MIN_ID_DESC',
  SeasonsByPosterImageIdMinInfoSourceAsc = 'SEASONS_BY_POSTER_IMAGE_ID__MIN_INFO_SOURCE_ASC',
  SeasonsByPosterImageIdMinInfoSourceDesc = 'SEASONS_BY_POSTER_IMAGE_ID__MIN_INFO_SOURCE_DESC',
  SeasonsByPosterImageIdMinIntegrationsLaniaSyncAsc = 'SEASONS_BY_POSTER_IMAGE_ID__MIN_INTEGRATIONS_LANIA_SYNC_ASC',
  SeasonsByPosterImageIdMinIntegrationsLaniaSyncDesc = 'SEASONS_BY_POSTER_IMAGE_ID__MIN_INTEGRATIONS_LANIA_SYNC_DESC',
  SeasonsByPosterImageIdMinIsMonitoringAsc = 'SEASONS_BY_POSTER_IMAGE_ID__MIN_IS_MONITORING_ASC',
  SeasonsByPosterImageIdMinIsMonitoringDesc = 'SEASONS_BY_POSTER_IMAGE_ID__MIN_IS_MONITORING_DESC',
  SeasonsByPosterImageIdMinJellyfinFolderIdAsc = 'SEASONS_BY_POSTER_IMAGE_ID__MIN_JELLYFIN_FOLDER_ID_ASC',
  SeasonsByPosterImageIdMinJellyfinFolderIdDesc = 'SEASONS_BY_POSTER_IMAGE_ID__MIN_JELLYFIN_FOLDER_ID_DESC',
  SeasonsByPosterImageIdMinJellyfinIdAsc = 'SEASONS_BY_POSTER_IMAGE_ID__MIN_JELLYFIN_ID_ASC',
  SeasonsByPosterImageIdMinJellyfinIdDesc = 'SEASONS_BY_POSTER_IMAGE_ID__MIN_JELLYFIN_ID_DESC',
  SeasonsByPosterImageIdMinLastWriteDirectoryAsc = 'SEASONS_BY_POSTER_IMAGE_ID__MIN_LAST_WRITE_DIRECTORY_ASC',
  SeasonsByPosterImageIdMinLastWriteDirectoryDesc = 'SEASONS_BY_POSTER_IMAGE_ID__MIN_LAST_WRITE_DIRECTORY_DESC',
  SeasonsByPosterImageIdMinLastWriteTitleAsc = 'SEASONS_BY_POSTER_IMAGE_ID__MIN_LAST_WRITE_TITLE_ASC',
  SeasonsByPosterImageIdMinLastWriteTitleDesc = 'SEASONS_BY_POSTER_IMAGE_ID__MIN_LAST_WRITE_TITLE_DESC',
  SeasonsByPosterImageIdMinLastWriteToDiskAsc = 'SEASONS_BY_POSTER_IMAGE_ID__MIN_LAST_WRITE_TO_DISK_ASC',
  SeasonsByPosterImageIdMinLastWriteToDiskDesc = 'SEASONS_BY_POSTER_IMAGE_ID__MIN_LAST_WRITE_TO_DISK_DESC',
  SeasonsByPosterImageIdMinMikanAnimeIdAsc = 'SEASONS_BY_POSTER_IMAGE_ID__MIN_MIKAN_ANIME_ID_ASC',
  SeasonsByPosterImageIdMinMikanAnimeIdDesc = 'SEASONS_BY_POSTER_IMAGE_ID__MIN_MIKAN_ANIME_ID_DESC',
  SeasonsByPosterImageIdMinNeedDownloadCcAsc = 'SEASONS_BY_POSTER_IMAGE_ID__MIN_NEED_DOWNLOAD_CC_ASC',
  SeasonsByPosterImageIdMinNeedDownloadCcDesc = 'SEASONS_BY_POSTER_IMAGE_ID__MIN_NEED_DOWNLOAD_CC_DESC',
  SeasonsByPosterImageIdMinNotifyMissingAsc = 'SEASONS_BY_POSTER_IMAGE_ID__MIN_NOTIFY_MISSING_ASC',
  SeasonsByPosterImageIdMinNotifyMissingDesc = 'SEASONS_BY_POSTER_IMAGE_ID__MIN_NOTIFY_MISSING_DESC',
  SeasonsByPosterImageIdMinNotifyPublishAsc = 'SEASONS_BY_POSTER_IMAGE_ID__MIN_NOTIFY_PUBLISH_ASC',
  SeasonsByPosterImageIdMinNotifyPublishDesc = 'SEASONS_BY_POSTER_IMAGE_ID__MIN_NOTIFY_PUBLISH_DESC',
  SeasonsByPosterImageIdMinPosterImageIdAsc = 'SEASONS_BY_POSTER_IMAGE_ID__MIN_POSTER_IMAGE_ID_ASC',
  SeasonsByPosterImageIdMinPosterImageIdDesc = 'SEASONS_BY_POSTER_IMAGE_ID__MIN_POSTER_IMAGE_ID_DESC',
  SeasonsByPosterImageIdMinPremiereDateAsc = 'SEASONS_BY_POSTER_IMAGE_ID__MIN_PREMIERE_DATE_ASC',
  SeasonsByPosterImageIdMinPremiereDateDesc = 'SEASONS_BY_POSTER_IMAGE_ID__MIN_PREMIERE_DATE_DESC',
  SeasonsByPosterImageIdMinSmartDownloadEnabledAsc = 'SEASONS_BY_POSTER_IMAGE_ID__MIN_SMART_DOWNLOAD_ENABLED_ASC',
  SeasonsByPosterImageIdMinSmartDownloadEnabledDesc = 'SEASONS_BY_POSTER_IMAGE_ID__MIN_SMART_DOWNLOAD_ENABLED_DESC',
  SeasonsByPosterImageIdMinSmartDownloadPreferBahaAsc = 'SEASONS_BY_POSTER_IMAGE_ID__MIN_SMART_DOWNLOAD_PREFER_BAHA_ASC',
  SeasonsByPosterImageIdMinSmartDownloadPreferBahaDesc = 'SEASONS_BY_POSTER_IMAGE_ID__MIN_SMART_DOWNLOAD_PREFER_BAHA_DESC',
  SeasonsByPosterImageIdMinSmartDownloadSubtitleAsc = 'SEASONS_BY_POSTER_IMAGE_ID__MIN_SMART_DOWNLOAD_SUBTITLE_ASC',
  SeasonsByPosterImageIdMinSmartDownloadSubtitleDesc = 'SEASONS_BY_POSTER_IMAGE_ID__MIN_SMART_DOWNLOAD_SUBTITLE_DESC',
  SeasonsByPosterImageIdMinSmartDownloadTimeoutMinutesAsc = 'SEASONS_BY_POSTER_IMAGE_ID__MIN_SMART_DOWNLOAD_TIMEOUT_MINUTES_ASC',
  SeasonsByPosterImageIdMinSmartDownloadTimeoutMinutesDesc = 'SEASONS_BY_POSTER_IMAGE_ID__MIN_SMART_DOWNLOAD_TIMEOUT_MINUTES_DESC',
  SeasonsByPosterImageIdMinSmartDownloadWindowHoursAsc = 'SEASONS_BY_POSTER_IMAGE_ID__MIN_SMART_DOWNLOAD_WINDOW_HOURS_ASC',
  SeasonsByPosterImageIdMinSmartDownloadWindowHoursDesc = 'SEASONS_BY_POSTER_IMAGE_ID__MIN_SMART_DOWNLOAD_WINDOW_HOURS_DESC',
  SeasonsByPosterImageIdMinTagsAsc = 'SEASONS_BY_POSTER_IMAGE_ID__MIN_TAGS_ASC',
  SeasonsByPosterImageIdMinTagsDesc = 'SEASONS_BY_POSTER_IMAGE_ID__MIN_TAGS_DESC',
  SeasonsByPosterImageIdMinTitleAsc = 'SEASONS_BY_POSTER_IMAGE_ID__MIN_TITLE_ASC',
  SeasonsByPosterImageIdMinTitleDesc = 'SEASONS_BY_POSTER_IMAGE_ID__MIN_TITLE_DESC',
  SeasonsByPosterImageIdMinTvdbIdAsc = 'SEASONS_BY_POSTER_IMAGE_ID__MIN_TVDB_ID_ASC',
  SeasonsByPosterImageIdMinTvdbIdDesc = 'SEASONS_BY_POSTER_IMAGE_ID__MIN_TVDB_ID_DESC',
  SeasonsByPosterImageIdMinTvdbSeasonAsc = 'SEASONS_BY_POSTER_IMAGE_ID__MIN_TVDB_SEASON_ASC',
  SeasonsByPosterImageIdMinTvdbSeasonDesc = 'SEASONS_BY_POSTER_IMAGE_ID__MIN_TVDB_SEASON_DESC',
  SeasonsByPosterImageIdMinWeekdayAsc = 'SEASONS_BY_POSTER_IMAGE_ID__MIN_WEEKDAY_ASC',
  SeasonsByPosterImageIdMinWeekdayDesc = 'SEASONS_BY_POSTER_IMAGE_ID__MIN_WEEKDAY_DESC',
  SeasonsByPosterImageIdMinYearAndSemesterAsc = 'SEASONS_BY_POSTER_IMAGE_ID__MIN_YEAR_AND_SEMESTER_ASC',
  SeasonsByPosterImageIdMinYearAndSemesterCanonicalAsc = 'SEASONS_BY_POSTER_IMAGE_ID__MIN_YEAR_AND_SEMESTER_CANONICAL_ASC',
  SeasonsByPosterImageIdMinYearAndSemesterCanonicalDesc = 'SEASONS_BY_POSTER_IMAGE_ID__MIN_YEAR_AND_SEMESTER_CANONICAL_DESC',
  SeasonsByPosterImageIdMinYearAndSemesterDesc = 'SEASONS_BY_POSTER_IMAGE_ID__MIN_YEAR_AND_SEMESTER_DESC',
  SourceUrlAsc = 'SOURCE_URL_ASC',
  SourceUrlDesc = 'SOURCE_URL_DESC'
}

export type ImportMultipleEntry = {
  episodeId: Scalars['Int'];
  importPath: Scalars['String'];
};

/** A filter to be used against Int fields. All fields are combined with a logical ‘and.’ */
export type IntFilter = {
  /** Not equal to the specified value, treating null like an ordinary value. */
  distinctFrom?: InputMaybe<Scalars['Int']>;
  /** Equal to the specified value. */
  equalTo?: InputMaybe<Scalars['Int']>;
  /** Greater than the specified value. */
  greaterThan?: InputMaybe<Scalars['Int']>;
  /** Greater than or equal to the specified value. */
  greaterThanOrEqualTo?: InputMaybe<Scalars['Int']>;
  /** Included in the specified list. */
  in?: InputMaybe<Array<Scalars['Int']>>;
  /** Is null (if `true` is specified) or is not null (if `false` is specified). */
  isNull?: InputMaybe<Scalars['Boolean']>;
  /** Less than the specified value. */
  lessThan?: InputMaybe<Scalars['Int']>;
  /** Less than or equal to the specified value. */
  lessThanOrEqualTo?: InputMaybe<Scalars['Int']>;
  /** Equal to the specified value, treating null like an ordinary value. */
  notDistinctFrom?: InputMaybe<Scalars['Int']>;
  /** Not equal to the specified value. */
  notEqualTo?: InputMaybe<Scalars['Int']>;
  /** Not included in the specified list. */
  notIn?: InputMaybe<Array<Scalars['Int']>>;
};

/** A filter to be used against JSON fields. All fields are combined with a logical ‘and.’ */
export type JsonFilter = {
  /** Contained by the specified JSON. */
  containedBy?: InputMaybe<Scalars['JSON']>;
  /** Contains the specified JSON. */
  contains?: InputMaybe<Scalars['JSON']>;
  /** Contains all of the specified keys. */
  containsAllKeys?: InputMaybe<Array<Scalars['String']>>;
  /** Contains any of the specified keys. */
  containsAnyKeys?: InputMaybe<Array<Scalars['String']>>;
  /** Contains the specified key. */
  containsKey?: InputMaybe<Scalars['String']>;
  /** Not equal to the specified value, treating null like an ordinary value. */
  distinctFrom?: InputMaybe<Scalars['JSON']>;
  /** Equal to the specified value. */
  equalTo?: InputMaybe<Scalars['JSON']>;
  /** Greater than the specified value. */
  greaterThan?: InputMaybe<Scalars['JSON']>;
  /** Greater than or equal to the specified value. */
  greaterThanOrEqualTo?: InputMaybe<Scalars['JSON']>;
  /** Included in the specified list. */
  in?: InputMaybe<Array<Scalars['JSON']>>;
  /** Is null (if `true` is specified) or is not null (if `false` is specified). */
  isNull?: InputMaybe<Scalars['Boolean']>;
  /** Less than the specified value. */
  lessThan?: InputMaybe<Scalars['JSON']>;
  /** Less than or equal to the specified value. */
  lessThanOrEqualTo?: InputMaybe<Scalars['JSON']>;
  /** Equal to the specified value, treating null like an ordinary value. */
  notDistinctFrom?: InputMaybe<Scalars['JSON']>;
  /** Not equal to the specified value. */
  notEqualTo?: InputMaybe<Scalars['JSON']>;
  /** Not included in the specified list. */
  notIn?: InputMaybe<Array<Scalars['JSON']>>;
};

export type JellyfinConfig = {
  __typename?: 'JellyfinConfig';
  publicHost: Scalars['String'];
};

export type JellyfinFolder = Node & {
  __typename?: 'JellyfinFolder';
  id: Scalars['Int'];
  isDefault: Scalars['Boolean'];
  isHidden: Scalars['Boolean'];
  jellyfinId: Scalars['String'];
  location: Scalars['String'];
  mappedLocation?: Maybe<Scalars['String']>;
  name: Scalars['String'];
  /** A globally unique identifier. Can be used in various places throughout the system to identify this single value. */
  nodeId: Scalars['ID'];
  /** Reads and enables pagination through a set of `Season`. */
  seasonsByJellyfinFolderId: SeasonsConnection;
};


export type JellyfinFolderSeasonsByJellyfinFolderIdArgs = {
  after?: InputMaybe<Scalars['Cursor']>;
  before?: InputMaybe<Scalars['Cursor']>;
  condition?: InputMaybe<SeasonCondition>;
  filter?: InputMaybe<SeasonFilter>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<SeasonsOrderBy>>;
};

/**
 * A condition to be used against `JellyfinFolder` object types. All fields are
 * tested for equality and combined with a logical ‘and.’
 */
export type JellyfinFolderCondition = {
  /** Checks for equality with the object’s `id` field. */
  id?: InputMaybe<Scalars['Int']>;
  /** Checks for equality with the object’s `isDefault` field. */
  isDefault?: InputMaybe<Scalars['Boolean']>;
  /** Checks for equality with the object’s `isHidden` field. */
  isHidden?: InputMaybe<Scalars['Boolean']>;
  /** Checks for equality with the object’s `jellyfinId` field. */
  jellyfinId?: InputMaybe<Scalars['String']>;
  /** Checks for equality with the object’s `location` field. */
  location?: InputMaybe<Scalars['String']>;
  /** Checks for equality with the object’s `name` field. */
  name?: InputMaybe<Scalars['String']>;
};

/** A filter to be used against `JellyfinFolder` object types. All fields are combined with a logical ‘and.’ */
export type JellyfinFolderFilter = {
  /** Checks for all expressions in this list. */
  and?: InputMaybe<Array<JellyfinFolderFilter>>;
  /** Filter by the object’s `id` field. */
  id?: InputMaybe<IntFilter>;
  /** Filter by the object’s `isDefault` field. */
  isDefault?: InputMaybe<BooleanFilter>;
  /** Filter by the object’s `isHidden` field. */
  isHidden?: InputMaybe<BooleanFilter>;
  /** Filter by the object’s `jellyfinId` field. */
  jellyfinId?: InputMaybe<StringFilter>;
  /** Filter by the object’s `location` field. */
  location?: InputMaybe<StringFilter>;
  /** Filter by the object’s `name` field. */
  name?: InputMaybe<StringFilter>;
  /** Negates the expression. */
  not?: InputMaybe<JellyfinFolderFilter>;
  /** Checks for any expressions in this list. */
  or?: InputMaybe<Array<JellyfinFolderFilter>>;
  /** Filter by the object’s `seasonsByJellyfinFolderId` relation. */
  seasonsByJellyfinFolderId?: InputMaybe<JellyfinFolderToManySeasonFilter>;
  /** Some related `seasonsByJellyfinFolderId` exist. */
  seasonsByJellyfinFolderIdExist?: InputMaybe<Scalars['Boolean']>;
};

/** Represents an update to a `JellyfinFolder`. Fields that are set will be updated. */
export type JellyfinFolderPatch = {
  id?: InputMaybe<Scalars['Int']>;
  isDefault?: InputMaybe<Scalars['Boolean']>;
  isHidden?: InputMaybe<Scalars['Boolean']>;
  jellyfinId?: InputMaybe<Scalars['String']>;
  location?: InputMaybe<Scalars['String']>;
  name?: InputMaybe<Scalars['String']>;
};

/** A filter to be used against many `Season` object types. All fields are combined with a logical ‘and.’ */
export type JellyfinFolderToManySeasonFilter = {
  /** Every related `Season` matches the filter criteria. All fields are combined with a logical ‘and.’ */
  every?: InputMaybe<SeasonFilter>;
  /** No related `Season` matches the filter criteria. All fields are combined with a logical ‘and.’ */
  none?: InputMaybe<SeasonFilter>;
  /** Some related `Season` matches the filter criteria. All fields are combined with a logical ‘and.’ */
  some?: InputMaybe<SeasonFilter>;
};

/** A connection to a list of `JellyfinFolder` values. */
export type JellyfinFoldersConnection = {
  __typename?: 'JellyfinFoldersConnection';
  /** A list of edges which contains the `JellyfinFolder` and cursor to aid in pagination. */
  edges: Array<JellyfinFoldersEdge>;
  /** A list of `JellyfinFolder` objects. */
  nodes: Array<Maybe<JellyfinFolder>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** The count of *all* `JellyfinFolder` you could get from the connection. */
  totalCount: Scalars['Int'];
};

/** A `JellyfinFolder` edge in the connection. */
export type JellyfinFoldersEdge = {
  __typename?: 'JellyfinFoldersEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']>;
  /** The `JellyfinFolder` at the end of the edge. */
  node?: Maybe<JellyfinFolder>;
};

/** Methods to use when ordering `JellyfinFolder`. */
export enum JellyfinFoldersOrderBy {
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  IsDefaultAsc = 'IS_DEFAULT_ASC',
  IsDefaultDesc = 'IS_DEFAULT_DESC',
  IsHiddenAsc = 'IS_HIDDEN_ASC',
  IsHiddenDesc = 'IS_HIDDEN_DESC',
  JellyfinIdAsc = 'JELLYFIN_ID_ASC',
  JellyfinIdDesc = 'JELLYFIN_ID_DESC',
  LocationAsc = 'LOCATION_ASC',
  LocationDesc = 'LOCATION_DESC',
  NameAsc = 'NAME_ASC',
  NameDesc = 'NAME_DESC',
  Natural = 'NATURAL',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  SeasonsByJellyfinFolderIdCountAsc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__COUNT_ASC',
  SeasonsByJellyfinFolderIdCountDesc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__COUNT_DESC',
  SeasonsByJellyfinFolderIdMaxAirTimeAsc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MAX_AIR_TIME_ASC',
  SeasonsByJellyfinFolderIdMaxAirTimeDesc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MAX_AIR_TIME_DESC',
  SeasonsByJellyfinFolderIdMaxAliasesAsc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MAX_ALIASES_ASC',
  SeasonsByJellyfinFolderIdMaxAliasesDesc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MAX_ALIASES_DESC',
  SeasonsByJellyfinFolderIdMaxBangumiIdAsc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MAX_BANGUMI_ID_ASC',
  SeasonsByJellyfinFolderIdMaxBangumiIdDesc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MAX_BANGUMI_ID_DESC',
  SeasonsByJellyfinFolderIdMaxBannerImageIdAsc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MAX_BANNER_IMAGE_ID_ASC',
  SeasonsByJellyfinFolderIdMaxBannerImageIdDesc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MAX_BANNER_IMAGE_ID_DESC',
  SeasonsByJellyfinFolderIdMaxBilibiliMainlandIdAsc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MAX_BILIBILI_MAINLAND_ID_ASC',
  SeasonsByJellyfinFolderIdMaxBilibiliMainlandIdDesc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MAX_BILIBILI_MAINLAND_ID_DESC',
  SeasonsByJellyfinFolderIdMaxBilibiliThmIdAsc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MAX_BILIBILI_THM_ID_ASC',
  SeasonsByJellyfinFolderIdMaxBilibiliThmIdDesc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MAX_BILIBILI_THM_ID_DESC',
  SeasonsByJellyfinFolderIdMaxCreatedAtAsc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MAX_CREATED_AT_ASC',
  SeasonsByJellyfinFolderIdMaxCreatedAtDesc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MAX_CREATED_AT_DESC',
  SeasonsByJellyfinFolderIdMaxDandanplayAnimeIdAsc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MAX_DANDANPLAY_ANIME_ID_ASC',
  SeasonsByJellyfinFolderIdMaxDandanplayAnimeIdDesc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MAX_DANDANPLAY_ANIME_ID_DESC',
  SeasonsByJellyfinFolderIdMaxDeclaredEpisodeCountAsc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MAX_DECLARED_EPISODE_COUNT_ASC',
  SeasonsByJellyfinFolderIdMaxDeclaredEpisodeCountDesc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MAX_DECLARED_EPISODE_COUNT_DESC',
  SeasonsByJellyfinFolderIdMaxDescriptionAsc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MAX_DESCRIPTION_ASC',
  SeasonsByJellyfinFolderIdMaxDescriptionDesc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MAX_DESCRIPTION_DESC',
  SeasonsByJellyfinFolderIdMaxDirectoryAsc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MAX_DIRECTORY_ASC',
  SeasonsByJellyfinFolderIdMaxDirectoryDesc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MAX_DIRECTORY_DESC',
  SeasonsByJellyfinFolderIdMaxDownloadOffsetHoursAsc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MAX_DOWNLOAD_OFFSET_HOURS_ASC',
  SeasonsByJellyfinFolderIdMaxDownloadOffsetHoursDesc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MAX_DOWNLOAD_OFFSET_HOURS_DESC',
  SeasonsByJellyfinFolderIdMaxEpisodesAutoSyncAsc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MAX_EPISODES_AUTO_SYNC_ASC',
  SeasonsByJellyfinFolderIdMaxEpisodesAutoSyncDesc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MAX_EPISODES_AUTO_SYNC_DESC',
  SeasonsByJellyfinFolderIdMaxEpisodesLastSyncAsc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MAX_EPISODES_LAST_SYNC_ASC',
  SeasonsByJellyfinFolderIdMaxEpisodesLastSyncDesc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MAX_EPISODES_LAST_SYNC_DESC',
  SeasonsByJellyfinFolderIdMaxEpisodesSourceAsc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MAX_EPISODES_SOURCE_ASC',
  SeasonsByJellyfinFolderIdMaxEpisodesSourceDesc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MAX_EPISODES_SOURCE_DESC',
  SeasonsByJellyfinFolderIdMaxFanartImageIdAsc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MAX_FANART_IMAGE_ID_ASC',
  SeasonsByJellyfinFolderIdMaxFanartImageIdDesc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MAX_FANART_IMAGE_ID_DESC',
  SeasonsByJellyfinFolderIdMaxIdAsc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MAX_ID_ASC',
  SeasonsByJellyfinFolderIdMaxIdDesc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MAX_ID_DESC',
  SeasonsByJellyfinFolderIdMaxInfoSourceAsc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MAX_INFO_SOURCE_ASC',
  SeasonsByJellyfinFolderIdMaxInfoSourceDesc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MAX_INFO_SOURCE_DESC',
  SeasonsByJellyfinFolderIdMaxIntegrationsLaniaSyncAsc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MAX_INTEGRATIONS_LANIA_SYNC_ASC',
  SeasonsByJellyfinFolderIdMaxIntegrationsLaniaSyncDesc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MAX_INTEGRATIONS_LANIA_SYNC_DESC',
  SeasonsByJellyfinFolderIdMaxIsMonitoringAsc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MAX_IS_MONITORING_ASC',
  SeasonsByJellyfinFolderIdMaxIsMonitoringDesc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MAX_IS_MONITORING_DESC',
  SeasonsByJellyfinFolderIdMaxJellyfinFolderIdAsc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MAX_JELLYFIN_FOLDER_ID_ASC',
  SeasonsByJellyfinFolderIdMaxJellyfinFolderIdDesc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MAX_JELLYFIN_FOLDER_ID_DESC',
  SeasonsByJellyfinFolderIdMaxJellyfinIdAsc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MAX_JELLYFIN_ID_ASC',
  SeasonsByJellyfinFolderIdMaxJellyfinIdDesc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MAX_JELLYFIN_ID_DESC',
  SeasonsByJellyfinFolderIdMaxLastWriteDirectoryAsc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MAX_LAST_WRITE_DIRECTORY_ASC',
  SeasonsByJellyfinFolderIdMaxLastWriteDirectoryDesc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MAX_LAST_WRITE_DIRECTORY_DESC',
  SeasonsByJellyfinFolderIdMaxLastWriteTitleAsc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MAX_LAST_WRITE_TITLE_ASC',
  SeasonsByJellyfinFolderIdMaxLastWriteTitleDesc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MAX_LAST_WRITE_TITLE_DESC',
  SeasonsByJellyfinFolderIdMaxLastWriteToDiskAsc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MAX_LAST_WRITE_TO_DISK_ASC',
  SeasonsByJellyfinFolderIdMaxLastWriteToDiskDesc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MAX_LAST_WRITE_TO_DISK_DESC',
  SeasonsByJellyfinFolderIdMaxMikanAnimeIdAsc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MAX_MIKAN_ANIME_ID_ASC',
  SeasonsByJellyfinFolderIdMaxMikanAnimeIdDesc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MAX_MIKAN_ANIME_ID_DESC',
  SeasonsByJellyfinFolderIdMaxNeedDownloadCcAsc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MAX_NEED_DOWNLOAD_CC_ASC',
  SeasonsByJellyfinFolderIdMaxNeedDownloadCcDesc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MAX_NEED_DOWNLOAD_CC_DESC',
  SeasonsByJellyfinFolderIdMaxNotifyMissingAsc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MAX_NOTIFY_MISSING_ASC',
  SeasonsByJellyfinFolderIdMaxNotifyMissingDesc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MAX_NOTIFY_MISSING_DESC',
  SeasonsByJellyfinFolderIdMaxNotifyPublishAsc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MAX_NOTIFY_PUBLISH_ASC',
  SeasonsByJellyfinFolderIdMaxNotifyPublishDesc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MAX_NOTIFY_PUBLISH_DESC',
  SeasonsByJellyfinFolderIdMaxPosterImageIdAsc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MAX_POSTER_IMAGE_ID_ASC',
  SeasonsByJellyfinFolderIdMaxPosterImageIdDesc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MAX_POSTER_IMAGE_ID_DESC',
  SeasonsByJellyfinFolderIdMaxPremiereDateAsc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MAX_PREMIERE_DATE_ASC',
  SeasonsByJellyfinFolderIdMaxPremiereDateDesc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MAX_PREMIERE_DATE_DESC',
  SeasonsByJellyfinFolderIdMaxSmartDownloadEnabledAsc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MAX_SMART_DOWNLOAD_ENABLED_ASC',
  SeasonsByJellyfinFolderIdMaxSmartDownloadEnabledDesc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MAX_SMART_DOWNLOAD_ENABLED_DESC',
  SeasonsByJellyfinFolderIdMaxSmartDownloadPreferBahaAsc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MAX_SMART_DOWNLOAD_PREFER_BAHA_ASC',
  SeasonsByJellyfinFolderIdMaxSmartDownloadPreferBahaDesc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MAX_SMART_DOWNLOAD_PREFER_BAHA_DESC',
  SeasonsByJellyfinFolderIdMaxSmartDownloadSubtitleAsc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MAX_SMART_DOWNLOAD_SUBTITLE_ASC',
  SeasonsByJellyfinFolderIdMaxSmartDownloadSubtitleDesc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MAX_SMART_DOWNLOAD_SUBTITLE_DESC',
  SeasonsByJellyfinFolderIdMaxSmartDownloadTimeoutMinutesAsc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MAX_SMART_DOWNLOAD_TIMEOUT_MINUTES_ASC',
  SeasonsByJellyfinFolderIdMaxSmartDownloadTimeoutMinutesDesc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MAX_SMART_DOWNLOAD_TIMEOUT_MINUTES_DESC',
  SeasonsByJellyfinFolderIdMaxSmartDownloadWindowHoursAsc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MAX_SMART_DOWNLOAD_WINDOW_HOURS_ASC',
  SeasonsByJellyfinFolderIdMaxSmartDownloadWindowHoursDesc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MAX_SMART_DOWNLOAD_WINDOW_HOURS_DESC',
  SeasonsByJellyfinFolderIdMaxTagsAsc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MAX_TAGS_ASC',
  SeasonsByJellyfinFolderIdMaxTagsDesc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MAX_TAGS_DESC',
  SeasonsByJellyfinFolderIdMaxTitleAsc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MAX_TITLE_ASC',
  SeasonsByJellyfinFolderIdMaxTitleDesc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MAX_TITLE_DESC',
  SeasonsByJellyfinFolderIdMaxTvdbIdAsc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MAX_TVDB_ID_ASC',
  SeasonsByJellyfinFolderIdMaxTvdbIdDesc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MAX_TVDB_ID_DESC',
  SeasonsByJellyfinFolderIdMaxTvdbSeasonAsc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MAX_TVDB_SEASON_ASC',
  SeasonsByJellyfinFolderIdMaxTvdbSeasonDesc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MAX_TVDB_SEASON_DESC',
  SeasonsByJellyfinFolderIdMaxWeekdayAsc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MAX_WEEKDAY_ASC',
  SeasonsByJellyfinFolderIdMaxWeekdayDesc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MAX_WEEKDAY_DESC',
  SeasonsByJellyfinFolderIdMaxYearAndSemesterAsc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MAX_YEAR_AND_SEMESTER_ASC',
  SeasonsByJellyfinFolderIdMaxYearAndSemesterCanonicalAsc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MAX_YEAR_AND_SEMESTER_CANONICAL_ASC',
  SeasonsByJellyfinFolderIdMaxYearAndSemesterCanonicalDesc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MAX_YEAR_AND_SEMESTER_CANONICAL_DESC',
  SeasonsByJellyfinFolderIdMaxYearAndSemesterDesc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MAX_YEAR_AND_SEMESTER_DESC',
  SeasonsByJellyfinFolderIdMinAirTimeAsc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MIN_AIR_TIME_ASC',
  SeasonsByJellyfinFolderIdMinAirTimeDesc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MIN_AIR_TIME_DESC',
  SeasonsByJellyfinFolderIdMinAliasesAsc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MIN_ALIASES_ASC',
  SeasonsByJellyfinFolderIdMinAliasesDesc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MIN_ALIASES_DESC',
  SeasonsByJellyfinFolderIdMinBangumiIdAsc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MIN_BANGUMI_ID_ASC',
  SeasonsByJellyfinFolderIdMinBangumiIdDesc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MIN_BANGUMI_ID_DESC',
  SeasonsByJellyfinFolderIdMinBannerImageIdAsc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MIN_BANNER_IMAGE_ID_ASC',
  SeasonsByJellyfinFolderIdMinBannerImageIdDesc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MIN_BANNER_IMAGE_ID_DESC',
  SeasonsByJellyfinFolderIdMinBilibiliMainlandIdAsc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MIN_BILIBILI_MAINLAND_ID_ASC',
  SeasonsByJellyfinFolderIdMinBilibiliMainlandIdDesc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MIN_BILIBILI_MAINLAND_ID_DESC',
  SeasonsByJellyfinFolderIdMinBilibiliThmIdAsc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MIN_BILIBILI_THM_ID_ASC',
  SeasonsByJellyfinFolderIdMinBilibiliThmIdDesc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MIN_BILIBILI_THM_ID_DESC',
  SeasonsByJellyfinFolderIdMinCreatedAtAsc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MIN_CREATED_AT_ASC',
  SeasonsByJellyfinFolderIdMinCreatedAtDesc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MIN_CREATED_AT_DESC',
  SeasonsByJellyfinFolderIdMinDandanplayAnimeIdAsc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MIN_DANDANPLAY_ANIME_ID_ASC',
  SeasonsByJellyfinFolderIdMinDandanplayAnimeIdDesc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MIN_DANDANPLAY_ANIME_ID_DESC',
  SeasonsByJellyfinFolderIdMinDeclaredEpisodeCountAsc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MIN_DECLARED_EPISODE_COUNT_ASC',
  SeasonsByJellyfinFolderIdMinDeclaredEpisodeCountDesc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MIN_DECLARED_EPISODE_COUNT_DESC',
  SeasonsByJellyfinFolderIdMinDescriptionAsc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MIN_DESCRIPTION_ASC',
  SeasonsByJellyfinFolderIdMinDescriptionDesc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MIN_DESCRIPTION_DESC',
  SeasonsByJellyfinFolderIdMinDirectoryAsc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MIN_DIRECTORY_ASC',
  SeasonsByJellyfinFolderIdMinDirectoryDesc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MIN_DIRECTORY_DESC',
  SeasonsByJellyfinFolderIdMinDownloadOffsetHoursAsc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MIN_DOWNLOAD_OFFSET_HOURS_ASC',
  SeasonsByJellyfinFolderIdMinDownloadOffsetHoursDesc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MIN_DOWNLOAD_OFFSET_HOURS_DESC',
  SeasonsByJellyfinFolderIdMinEpisodesAutoSyncAsc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MIN_EPISODES_AUTO_SYNC_ASC',
  SeasonsByJellyfinFolderIdMinEpisodesAutoSyncDesc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MIN_EPISODES_AUTO_SYNC_DESC',
  SeasonsByJellyfinFolderIdMinEpisodesLastSyncAsc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MIN_EPISODES_LAST_SYNC_ASC',
  SeasonsByJellyfinFolderIdMinEpisodesLastSyncDesc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MIN_EPISODES_LAST_SYNC_DESC',
  SeasonsByJellyfinFolderIdMinEpisodesSourceAsc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MIN_EPISODES_SOURCE_ASC',
  SeasonsByJellyfinFolderIdMinEpisodesSourceDesc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MIN_EPISODES_SOURCE_DESC',
  SeasonsByJellyfinFolderIdMinFanartImageIdAsc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MIN_FANART_IMAGE_ID_ASC',
  SeasonsByJellyfinFolderIdMinFanartImageIdDesc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MIN_FANART_IMAGE_ID_DESC',
  SeasonsByJellyfinFolderIdMinIdAsc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MIN_ID_ASC',
  SeasonsByJellyfinFolderIdMinIdDesc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MIN_ID_DESC',
  SeasonsByJellyfinFolderIdMinInfoSourceAsc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MIN_INFO_SOURCE_ASC',
  SeasonsByJellyfinFolderIdMinInfoSourceDesc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MIN_INFO_SOURCE_DESC',
  SeasonsByJellyfinFolderIdMinIntegrationsLaniaSyncAsc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MIN_INTEGRATIONS_LANIA_SYNC_ASC',
  SeasonsByJellyfinFolderIdMinIntegrationsLaniaSyncDesc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MIN_INTEGRATIONS_LANIA_SYNC_DESC',
  SeasonsByJellyfinFolderIdMinIsMonitoringAsc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MIN_IS_MONITORING_ASC',
  SeasonsByJellyfinFolderIdMinIsMonitoringDesc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MIN_IS_MONITORING_DESC',
  SeasonsByJellyfinFolderIdMinJellyfinFolderIdAsc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MIN_JELLYFIN_FOLDER_ID_ASC',
  SeasonsByJellyfinFolderIdMinJellyfinFolderIdDesc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MIN_JELLYFIN_FOLDER_ID_DESC',
  SeasonsByJellyfinFolderIdMinJellyfinIdAsc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MIN_JELLYFIN_ID_ASC',
  SeasonsByJellyfinFolderIdMinJellyfinIdDesc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MIN_JELLYFIN_ID_DESC',
  SeasonsByJellyfinFolderIdMinLastWriteDirectoryAsc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MIN_LAST_WRITE_DIRECTORY_ASC',
  SeasonsByJellyfinFolderIdMinLastWriteDirectoryDesc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MIN_LAST_WRITE_DIRECTORY_DESC',
  SeasonsByJellyfinFolderIdMinLastWriteTitleAsc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MIN_LAST_WRITE_TITLE_ASC',
  SeasonsByJellyfinFolderIdMinLastWriteTitleDesc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MIN_LAST_WRITE_TITLE_DESC',
  SeasonsByJellyfinFolderIdMinLastWriteToDiskAsc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MIN_LAST_WRITE_TO_DISK_ASC',
  SeasonsByJellyfinFolderIdMinLastWriteToDiskDesc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MIN_LAST_WRITE_TO_DISK_DESC',
  SeasonsByJellyfinFolderIdMinMikanAnimeIdAsc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MIN_MIKAN_ANIME_ID_ASC',
  SeasonsByJellyfinFolderIdMinMikanAnimeIdDesc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MIN_MIKAN_ANIME_ID_DESC',
  SeasonsByJellyfinFolderIdMinNeedDownloadCcAsc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MIN_NEED_DOWNLOAD_CC_ASC',
  SeasonsByJellyfinFolderIdMinNeedDownloadCcDesc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MIN_NEED_DOWNLOAD_CC_DESC',
  SeasonsByJellyfinFolderIdMinNotifyMissingAsc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MIN_NOTIFY_MISSING_ASC',
  SeasonsByJellyfinFolderIdMinNotifyMissingDesc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MIN_NOTIFY_MISSING_DESC',
  SeasonsByJellyfinFolderIdMinNotifyPublishAsc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MIN_NOTIFY_PUBLISH_ASC',
  SeasonsByJellyfinFolderIdMinNotifyPublishDesc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MIN_NOTIFY_PUBLISH_DESC',
  SeasonsByJellyfinFolderIdMinPosterImageIdAsc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MIN_POSTER_IMAGE_ID_ASC',
  SeasonsByJellyfinFolderIdMinPosterImageIdDesc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MIN_POSTER_IMAGE_ID_DESC',
  SeasonsByJellyfinFolderIdMinPremiereDateAsc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MIN_PREMIERE_DATE_ASC',
  SeasonsByJellyfinFolderIdMinPremiereDateDesc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MIN_PREMIERE_DATE_DESC',
  SeasonsByJellyfinFolderIdMinSmartDownloadEnabledAsc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MIN_SMART_DOWNLOAD_ENABLED_ASC',
  SeasonsByJellyfinFolderIdMinSmartDownloadEnabledDesc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MIN_SMART_DOWNLOAD_ENABLED_DESC',
  SeasonsByJellyfinFolderIdMinSmartDownloadPreferBahaAsc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MIN_SMART_DOWNLOAD_PREFER_BAHA_ASC',
  SeasonsByJellyfinFolderIdMinSmartDownloadPreferBahaDesc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MIN_SMART_DOWNLOAD_PREFER_BAHA_DESC',
  SeasonsByJellyfinFolderIdMinSmartDownloadSubtitleAsc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MIN_SMART_DOWNLOAD_SUBTITLE_ASC',
  SeasonsByJellyfinFolderIdMinSmartDownloadSubtitleDesc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MIN_SMART_DOWNLOAD_SUBTITLE_DESC',
  SeasonsByJellyfinFolderIdMinSmartDownloadTimeoutMinutesAsc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MIN_SMART_DOWNLOAD_TIMEOUT_MINUTES_ASC',
  SeasonsByJellyfinFolderIdMinSmartDownloadTimeoutMinutesDesc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MIN_SMART_DOWNLOAD_TIMEOUT_MINUTES_DESC',
  SeasonsByJellyfinFolderIdMinSmartDownloadWindowHoursAsc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MIN_SMART_DOWNLOAD_WINDOW_HOURS_ASC',
  SeasonsByJellyfinFolderIdMinSmartDownloadWindowHoursDesc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MIN_SMART_DOWNLOAD_WINDOW_HOURS_DESC',
  SeasonsByJellyfinFolderIdMinTagsAsc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MIN_TAGS_ASC',
  SeasonsByJellyfinFolderIdMinTagsDesc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MIN_TAGS_DESC',
  SeasonsByJellyfinFolderIdMinTitleAsc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MIN_TITLE_ASC',
  SeasonsByJellyfinFolderIdMinTitleDesc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MIN_TITLE_DESC',
  SeasonsByJellyfinFolderIdMinTvdbIdAsc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MIN_TVDB_ID_ASC',
  SeasonsByJellyfinFolderIdMinTvdbIdDesc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MIN_TVDB_ID_DESC',
  SeasonsByJellyfinFolderIdMinTvdbSeasonAsc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MIN_TVDB_SEASON_ASC',
  SeasonsByJellyfinFolderIdMinTvdbSeasonDesc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MIN_TVDB_SEASON_DESC',
  SeasonsByJellyfinFolderIdMinWeekdayAsc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MIN_WEEKDAY_ASC',
  SeasonsByJellyfinFolderIdMinWeekdayDesc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MIN_WEEKDAY_DESC',
  SeasonsByJellyfinFolderIdMinYearAndSemesterAsc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MIN_YEAR_AND_SEMESTER_ASC',
  SeasonsByJellyfinFolderIdMinYearAndSemesterCanonicalAsc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MIN_YEAR_AND_SEMESTER_CANONICAL_ASC',
  SeasonsByJellyfinFolderIdMinYearAndSemesterCanonicalDesc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MIN_YEAR_AND_SEMESTER_CANONICAL_DESC',
  SeasonsByJellyfinFolderIdMinYearAndSemesterDesc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MIN_YEAR_AND_SEMESTER_DESC'
}

export type LaniaConfig = {
  __typename?: 'LaniaConfig';
  publicHost: Scalars['String'];
};

export enum LegacyTaskStage {
  Available = 'AVAILABLE',
  Downloading = 'DOWNLOADING',
  DownloadCompleted = 'DOWNLOAD_COMPLETED',
  DownloadSubmitting = 'DOWNLOAD_SUBMITTING',
  Importing = 'IMPORTING',
  PlayerWaiting = 'PLAYER_WAITING',
  Renaming = 'RENAMING',
  Unavailable = 'UNAVAILABLE',
  WritingMetadata = 'WRITING_METADATA'
}

/** A filter to be used against LegacyTaskStage fields. All fields are combined with a logical ‘and.’ */
export type LegacyTaskStageFilter = {
  /** Not equal to the specified value, treating null like an ordinary value. */
  distinctFrom?: InputMaybe<LegacyTaskStage>;
  /** Equal to the specified value. */
  equalTo?: InputMaybe<LegacyTaskStage>;
  /** Greater than the specified value. */
  greaterThan?: InputMaybe<LegacyTaskStage>;
  /** Greater than or equal to the specified value. */
  greaterThanOrEqualTo?: InputMaybe<LegacyTaskStage>;
  /** Included in the specified list. */
  in?: InputMaybe<Array<LegacyTaskStage>>;
  /** Is null (if `true` is specified) or is not null (if `false` is specified). */
  isNull?: InputMaybe<Scalars['Boolean']>;
  /** Less than the specified value. */
  lessThan?: InputMaybe<LegacyTaskStage>;
  /** Less than or equal to the specified value. */
  lessThanOrEqualTo?: InputMaybe<LegacyTaskStage>;
  /** Equal to the specified value, treating null like an ordinary value. */
  notDistinctFrom?: InputMaybe<LegacyTaskStage>;
  /** Not equal to the specified value. */
  notEqualTo?: InputMaybe<LegacyTaskStage>;
  /** Not included in the specified list. */
  notIn?: InputMaybe<Array<LegacyTaskStage>>;
};

export type MediaRegistrationProgress = {
  __typename?: 'MediaRegistrationProgress';
  completed: Scalars['Int'];
  reason?: Maybe<Scalars['String']>;
  state: Scalars['String'];
  total: Scalars['Int'];
};

export enum MetadataSource {
  BgmCn = 'BGM_CN',
  Inherit = 'INHERIT',
  Manual = 'MANUAL',
  Skyhook = 'SKYHOOK'
}

/** A filter to be used against MetadataSource fields. All fields are combined with a logical ‘and.’ */
export type MetadataSourceFilter = {
  /** Not equal to the specified value, treating null like an ordinary value. */
  distinctFrom?: InputMaybe<MetadataSource>;
  /** Equal to the specified value. */
  equalTo?: InputMaybe<MetadataSource>;
  /** Greater than the specified value. */
  greaterThan?: InputMaybe<MetadataSource>;
  /** Greater than or equal to the specified value. */
  greaterThanOrEqualTo?: InputMaybe<MetadataSource>;
  /** Included in the specified list. */
  in?: InputMaybe<Array<MetadataSource>>;
  /** Is null (if `true` is specified) or is not null (if `false` is specified). */
  isNull?: InputMaybe<Scalars['Boolean']>;
  /** Less than the specified value. */
  lessThan?: InputMaybe<MetadataSource>;
  /** Less than or equal to the specified value. */
  lessThanOrEqualTo?: InputMaybe<MetadataSource>;
  /** Equal to the specified value, treating null like an ordinary value. */
  notDistinctFrom?: InputMaybe<MetadataSource>;
  /** Not equal to the specified value. */
  notEqualTo?: InputMaybe<MetadataSource>;
  /** Not included in the specified list. */
  notIn?: InputMaybe<Array<MetadataSource>>;
};

export type Mutation = {
  __typename?: 'Mutation';
  cancelTask: Scalars['ID'];
  cancelTorrentSeasonMatch: Scalars['Boolean'];
  /** Creates a single `Image`. */
  createImage?: Maybe<CreateImagePayload>;
  /** Creates a single `Season`. */
  createSeason?: Maybe<CreateSeasonPayload>;
  /** Deletes a single `Image` using its globally unique id. */
  deleteImage?: Maybe<DeleteImagePayload>;
  /** Deletes a single `Image` using a unique key. */
  deleteImageById?: Maybe<DeleteImagePayload>;
  /** Deletes a single `Image` using a unique key. */
  deleteImageBySourceUrl?: Maybe<DeleteImagePayload>;
  deleteSeasonById: Scalars['ID'];
  /** Deletes a single `Torrent` using its globally unique id. */
  deleteTorrent?: Maybe<DeleteTorrentPayload>;
  /** Deletes a single `Torrent` using a unique key. */
  deleteTorrentByHash?: Maybe<DeleteTorrentPayload>;
  /** Deletes a single `Torrent` using a unique key. */
  deleteTorrentById?: Maybe<DeleteTorrentPayload>;
  downloadBilibiliCC: Scalars['ID'];
  downloadTorrentForEpisode: Scalars['Int'];
  downloadTorrentForSeason: Scalars['Int'];
  enqueueDownloadJobs: Scalars['Int'];
  /** 批量加入季度识别队列，返回实际入队数量；默认仅处理未识别种子 */
  enqueueTorrentSeasonMatches: Scalars['Int'];
  importMultiple: Scalars['Int'];
  importSingle: Scalars['Int'];
  larkSendTestMessage: Scalars['ID'];
  mockEpisodePublish: Scalars['ID'];
  notifyMissingEpisodes: Scalars['Int'];
  parseTorrentTitleForAll: Scalars['ID'];
  previewTorrent: TorrentPreview;
  refreshAllLegacyTaskStage: Scalars['Int'];
  refreshAllPlayerWaitingStatus: Scalars['Int'];
  /** 按数据库种子 ID 刷新 Nyaa 字幕元数据（1–100 条），返回新入队数量。已在队列中的记录不重复入队；后台按分钟处理，限流期间继续等待。 */
  refreshNyaaMetadata: Scalars['Int'];
  retryTask: Scalars['ID'];
  saveSeason: Scalars['ID'];
  /** 检查种子保留规则并入队，返回候选数量；配置关闭时不执行 */
  scanTorrentRetention: Scalars['Int'];
  setJellyfinFolderDefault: Scalars['ID'];
  syncAllSeasonsEpisodeData: Scalars['Int'];
  syncEpisodeData: Scalars['ID'];
  syncJellyfinFolders: Scalars['ID'];
  syncJellyfinSeriesId: Scalars['Boolean'];
  syncMetadata: Scalars['ID'];
  /** Returns newly added torrent count */
  syncMikan: Scalars['Int'];
  syncNyaa: Scalars['Int'];
  syncTorrentHistory: Scalars['String'];
  /** Updates a single `Episode` using its globally unique id and a patch. */
  updateEpisode?: Maybe<UpdateEpisodePayload>;
  /** Updates a single `Episode` using a unique key and a patch. */
  updateEpisodeById?: Maybe<UpdateEpisodePayload>;
  /** Updates a single `Episode` using a unique key and a patch. */
  updateEpisodeBySeasonIdAndBangumiEpisodeId?: Maybe<UpdateEpisodePayload>;
  /** Updates a single `Episode` using a unique key and a patch. */
  updateEpisodeBySeasonIdAndEpisodeTypeAndEpisodeNumber?: Maybe<UpdateEpisodePayload>;
  /** Updates a single `Episode` using a unique key and a patch. */
  updateEpisodeBySeasonIdAndIndex?: Maybe<UpdateEpisodePayload>;
  /** Updates a single `Image` using its globally unique id and a patch. */
  updateImage?: Maybe<UpdateImagePayload>;
  /** Updates a single `Image` using a unique key and a patch. */
  updateImageById?: Maybe<UpdateImagePayload>;
  /** Updates a single `Image` using a unique key and a patch. */
  updateImageBySourceUrl?: Maybe<UpdateImagePayload>;
  /** Updates a single `JellyfinFolder` using its globally unique id and a patch. */
  updateJellyfinFolder?: Maybe<UpdateJellyfinFolderPayload>;
  /** Updates a single `JellyfinFolder` using a unique key and a patch. */
  updateJellyfinFolderById?: Maybe<UpdateJellyfinFolderPayload>;
  /** Updates a single `JellyfinFolder` using a unique key and a patch. */
  updateJellyfinFolderByJellyfinId?: Maybe<UpdateJellyfinFolderPayload>;
  /** Updates a single `Season` using its globally unique id and a patch. */
  updateSeason?: Maybe<UpdateSeasonPayload>;
  /** Updates a single `Season` using a unique key and a patch. */
  updateSeasonById?: Maybe<UpdateSeasonPayload>;
  /** Updates a single `Season` using a unique key and a patch. */
  updateSeasonByTitle?: Maybe<UpdateSeasonPayload>;
  writeMetadata: Scalars['ID'];
};


export type MutationCancelTaskArgs = {
  taskId: Scalars['Int'];
};


export type MutationCancelTorrentSeasonMatchArgs = {
  torrentId: Scalars['Int'];
};


export type MutationCreateImageArgs = {
  input: CreateImageInput;
};


export type MutationCreateSeasonArgs = {
  input: CreateSeasonInput;
};


export type MutationDeleteImageArgs = {
  input: DeleteImageInput;
};


export type MutationDeleteImageByIdArgs = {
  input: DeleteImageByIdInput;
};


export type MutationDeleteImageBySourceUrlArgs = {
  input: DeleteImageBySourceUrlInput;
};


export type MutationDeleteSeasonByIdArgs = {
  id: Scalars['Int'];
};


export type MutationDeleteTorrentArgs = {
  input: DeleteTorrentInput;
};


export type MutationDeleteTorrentByHashArgs = {
  input: DeleteTorrentByHashInput;
};


export type MutationDeleteTorrentByIdArgs = {
  input: DeleteTorrentByIdInput;
};


export type MutationDownloadBilibiliCcArgs = {
  episodeId: Scalars['Int'];
};


export type MutationDownloadTorrentForEpisodeArgs = {
  episodeId: Scalars['Int'];
  torrentLink: Scalars['String'];
};


export type MutationDownloadTorrentForSeasonArgs = {
  entries: Array<BatchDownloadEntry>;
  previewToken: Scalars['String'];
  seasonId: Scalars['Int'];
};


export type MutationEnqueueTorrentSeasonMatchesArgs = {
  rematch?: InputMaybe<Scalars['Boolean']>;
  torrentIds: Array<Scalars['Int']>;
};


export type MutationImportMultipleArgs = {
  entries: Array<ImportMultipleEntry>;
};


export type MutationImportSingleArgs = {
  episodeId: Scalars['Int'];
  importPath: Scalars['String'];
};


export type MutationMockEpisodePublishArgs = {
  episodeId: Scalars['Int'];
};


export type MutationPreviewTorrentArgs = {
  torrentId: Scalars['Int'];
};


export type MutationRefreshNyaaMetadataArgs = {
  ids: Array<Scalars['Int']>;
};


export type MutationRetryTaskArgs = {
  taskId: Scalars['Int'];
};


export type MutationSaveSeasonArgs = {
  id: Scalars['Int'];
  patch: SaveSeasonPatch;
};


export type MutationSetJellyfinFolderDefaultArgs = {
  id: Scalars['Int'];
};


export type MutationSyncEpisodeDataArgs = {
  seasonId: Scalars['Int'];
};


export type MutationSyncJellyfinSeriesIdArgs = {
  seasonId: Scalars['Int'];
};


export type MutationSyncMetadataArgs = {
  seasonId: Scalars['Int'];
};


export type MutationUpdateEpisodeArgs = {
  input: UpdateEpisodeInput;
};


export type MutationUpdateEpisodeByIdArgs = {
  input: UpdateEpisodeByIdInput;
};


export type MutationUpdateEpisodeBySeasonIdAndBangumiEpisodeIdArgs = {
  input: UpdateEpisodeBySeasonIdAndBangumiEpisodeIdInput;
};


export type MutationUpdateEpisodeBySeasonIdAndEpisodeTypeAndEpisodeNumberArgs = {
  input: UpdateEpisodeBySeasonIdAndEpisodeTypeAndEpisodeNumberInput;
};


export type MutationUpdateEpisodeBySeasonIdAndIndexArgs = {
  input: UpdateEpisodeBySeasonIdAndIndexInput;
};


export type MutationUpdateImageArgs = {
  input: UpdateImageInput;
};


export type MutationUpdateImageByIdArgs = {
  input: UpdateImageByIdInput;
};


export type MutationUpdateImageBySourceUrlArgs = {
  input: UpdateImageBySourceUrlInput;
};


export type MutationUpdateJellyfinFolderArgs = {
  input: UpdateJellyfinFolderInput;
};


export type MutationUpdateJellyfinFolderByIdArgs = {
  input: UpdateJellyfinFolderByIdInput;
};


export type MutationUpdateJellyfinFolderByJellyfinIdArgs = {
  input: UpdateJellyfinFolderByJellyfinIdInput;
};


export type MutationUpdateSeasonArgs = {
  input: UpdateSeasonInput;
};


export type MutationUpdateSeasonByIdArgs = {
  input: UpdateSeasonByIdInput;
};


export type MutationUpdateSeasonByTitleArgs = {
  input: UpdateSeasonByTitleInput;
};


export type MutationWriteMetadataArgs = {
  seasonId: Scalars['Int'];
};

/** An object with a globally unique `ID`. */
export type Node = {
  /** A globally unique identifier. Can be used in various places throughout the system to identify this single value. */
  nodeId: Scalars['ID'];
};

/** Information about pagination in a connection. */
export type PageInfo = {
  __typename?: 'PageInfo';
  /** When paginating forwards, the cursor to continue. */
  endCursor?: Maybe<Scalars['Cursor']>;
  /** When paginating forwards, are there more items? */
  hasNextPage: Scalars['Boolean'];
  /** When paginating backwards, are there more items? */
  hasPreviousPage: Scalars['Boolean'];
  /** When paginating backwards, the cursor to continue. */
  startCursor?: Maybe<Scalars['Cursor']>;
};

export type PartialSeason = {
  __typename?: 'PartialSeason';
  characters?: Maybe<Array<SeasonCharacter>>;
  episodes?: Maybe<Array<SeasonEpisode>>;
  images?: Maybe<SeasonImages>;
  info?: Maybe<SeasonInfo>;
};

export type PublicMatchingConfig = {
  __typename?: 'PublicMatchingConfig';
  backend: Scalars['String'];
  enabled: Scalars['Boolean'];
  mode?: Maybe<Scalars['String']>;
};

export type Query = {
  __typename?: 'Query';
  /** Reads and enables pagination through a set of `DownloadSource`. */
  allDownloadSources?: Maybe<DownloadSourcesConnection>;
  /** Reads and enables pagination through a set of `Episode`. */
  allEpisodes?: Maybe<EpisodesConnection>;
  /** Reads and enables pagination through a set of `Image`. */
  allImages?: Maybe<ImagesConnection>;
  /** Reads and enables pagination through a set of `JellyfinFolder`. */
  allJellyfinFolders?: Maybe<JellyfinFoldersConnection>;
  /** Reads and enables pagination through a set of `Season`. */
  allSeasons?: Maybe<SeasonsConnection>;
  /** Reads and enables pagination through a set of `TaskEpisode`. */
  allTaskEpisodes?: Maybe<TaskEpisodesConnection>;
  /** Reads and enables pagination through a set of `Task`. */
  allTasks?: Maybe<TasksConnection>;
  /** Reads and enables pagination through a set of `Torrent`. */
  allTorrents?: Maybe<TorrentsConnection>;
  config: AdminConfig;
  /** Reads a single `DownloadSource` using its globally unique `ID`. */
  downloadSource?: Maybe<DownloadSource>;
  downloadSourceById?: Maybe<DownloadSource>;
  downloadSourceBySeasonIdAndPattern?: Maybe<DownloadSource>;
  environment: Scalars['ID'];
  /** Reads a single `Episode` using its globally unique `ID`. */
  episode?: Maybe<Episode>;
  episodeById?: Maybe<Episode>;
  episodeBySeasonIdAndBangumiEpisodeId?: Maybe<Episode>;
  episodeBySeasonIdAndEpisodeTypeAndEpisodeNumber?: Maybe<Episode>;
  episodeBySeasonIdAndIndex?: Maybe<Episode>;
  fetchBangumiSeason: PartialSeason;
  fetchSkyhookSeason: PartialSeason;
  getAvailableSemesters: Array<Scalars['String']>;
  getDownloadProgress: Array<DownloadProgress>;
  getTaskStates: Array<TaskState>;
  /** Reads a single `Image` using its globally unique `ID`. */
  image?: Maybe<Image>;
  imageById?: Maybe<Image>;
  imageBySourceUrl?: Maybe<Image>;
  /** Reads a single `JellyfinFolder` using its globally unique `ID`. */
  jellyfinFolder?: Maybe<JellyfinFolder>;
  jellyfinFolderById?: Maybe<JellyfinFolder>;
  jellyfinFolderByJellyfinId?: Maybe<JellyfinFolder>;
  listFiles: Array<FileEntry>;
  mediaRegistrationProgress: MediaRegistrationProgress;
  searchBangumi: Array<SearchBangumiSeason>;
  /** Reads a single `Season` using its globally unique `ID`. */
  season?: Maybe<Season>;
  seasonById?: Maybe<Season>;
  seasonByTitle?: Maybe<Season>;
  /** Reads a single `Task` using its globally unique `ID`. */
  task?: Maybe<Task>;
  taskById?: Maybe<Task>;
  /** Reads a single `TaskEpisode` using its globally unique `ID`. */
  taskEpisode?: Maybe<TaskEpisode>;
  taskEpisodeByTaskIdAndEpisodeId?: Maybe<TaskEpisode>;
  /** Reads a single `Torrent` using its globally unique `ID`. */
  torrent?: Maybe<Torrent>;
  torrentByHash?: Maybe<Torrent>;
  torrentById?: Maybe<Torrent>;
  torrentHistorySyncState: TorrentHistorySyncState;
};


export type QueryAllDownloadSourcesArgs = {
  after?: InputMaybe<Scalars['Cursor']>;
  before?: InputMaybe<Scalars['Cursor']>;
  condition?: InputMaybe<DownloadSourceCondition>;
  filter?: InputMaybe<DownloadSourceFilter>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<DownloadSourcesOrderBy>>;
};


export type QueryAllEpisodesArgs = {
  after?: InputMaybe<Scalars['Cursor']>;
  before?: InputMaybe<Scalars['Cursor']>;
  condition?: InputMaybe<EpisodeCondition>;
  filter?: InputMaybe<EpisodeFilter>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<EpisodesOrderBy>>;
};


export type QueryAllImagesArgs = {
  after?: InputMaybe<Scalars['Cursor']>;
  before?: InputMaybe<Scalars['Cursor']>;
  condition?: InputMaybe<ImageCondition>;
  filter?: InputMaybe<ImageFilter>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<ImagesOrderBy>>;
};


export type QueryAllJellyfinFoldersArgs = {
  after?: InputMaybe<Scalars['Cursor']>;
  before?: InputMaybe<Scalars['Cursor']>;
  condition?: InputMaybe<JellyfinFolderCondition>;
  filter?: InputMaybe<JellyfinFolderFilter>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<JellyfinFoldersOrderBy>>;
};


export type QueryAllSeasonsArgs = {
  after?: InputMaybe<Scalars['Cursor']>;
  before?: InputMaybe<Scalars['Cursor']>;
  condition?: InputMaybe<SeasonCondition>;
  filter?: InputMaybe<SeasonFilter>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<SeasonsOrderBy>>;
};


export type QueryAllTaskEpisodesArgs = {
  after?: InputMaybe<Scalars['Cursor']>;
  before?: InputMaybe<Scalars['Cursor']>;
  condition?: InputMaybe<TaskEpisodeCondition>;
  filter?: InputMaybe<TaskEpisodeFilter>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<TaskEpisodesOrderBy>>;
};


export type QueryAllTasksArgs = {
  after?: InputMaybe<Scalars['Cursor']>;
  before?: InputMaybe<Scalars['Cursor']>;
  condition?: InputMaybe<TaskCondition>;
  filter?: InputMaybe<TaskFilter>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<TasksOrderBy>>;
};


export type QueryAllTorrentsArgs = {
  after?: InputMaybe<Scalars['Cursor']>;
  before?: InputMaybe<Scalars['Cursor']>;
  condition?: InputMaybe<TorrentCondition>;
  filter?: InputMaybe<TorrentFilter>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<TorrentsOrderBy>>;
};


export type QueryDownloadSourceArgs = {
  nodeId: Scalars['ID'];
};


export type QueryDownloadSourceByIdArgs = {
  id: Scalars['Int'];
};


export type QueryDownloadSourceBySeasonIdAndPatternArgs = {
  pattern: Scalars['String'];
  seasonId: Scalars['Int'];
};


export type QueryEpisodeArgs = {
  nodeId: Scalars['ID'];
};


export type QueryEpisodeByIdArgs = {
  id: Scalars['Int'];
};


export type QueryEpisodeBySeasonIdAndBangumiEpisodeIdArgs = {
  bangumiEpisodeId: Scalars['Int'];
  seasonId: Scalars['Int'];
};


export type QueryEpisodeBySeasonIdAndEpisodeTypeAndEpisodeNumberArgs = {
  episodeNumber: Scalars['BigFloat'];
  episodeType: EpisodeType;
  seasonId: Scalars['Int'];
};


export type QueryEpisodeBySeasonIdAndIndexArgs = {
  index: Scalars['Int'];
  seasonId: Scalars['Int'];
};


export type QueryFetchBangumiSeasonArgs = {
  bangumiId: Scalars['Int'];
  request: FetchPartialSeasonRequest;
};


export type QueryFetchSkyhookSeasonArgs = {
  request: FetchPartialSeasonRequest;
  seasonId: Scalars['Int'];
  tvdbId: Scalars['Int'];
};


export type QueryGetDownloadProgressArgs = {
  taskIds: Array<Scalars['Int']>;
};


export type QueryGetTaskStatesArgs = {
  taskIds: Array<Scalars['Int']>;
};


export type QueryImageArgs = {
  nodeId: Scalars['ID'];
};


export type QueryImageByIdArgs = {
  id: Scalars['Int'];
};


export type QueryImageBySourceUrlArgs = {
  sourceUrl: Scalars['String'];
};


export type QueryJellyfinFolderArgs = {
  nodeId: Scalars['ID'];
};


export type QueryJellyfinFolderByIdArgs = {
  id: Scalars['Int'];
};


export type QueryJellyfinFolderByJellyfinIdArgs = {
  jellyfinId: Scalars['String'];
};


export type QueryListFilesArgs = {
  path: Scalars['String'];
};


export type QuerySearchBangumiArgs = {
  keywords: Scalars['String'];
  offset?: InputMaybe<Scalars['Int']>;
  useNewBangumiSearchApi?: InputMaybe<Scalars['Boolean']>;
};


export type QuerySeasonArgs = {
  nodeId: Scalars['ID'];
};


export type QuerySeasonByIdArgs = {
  id: Scalars['Int'];
};


export type QuerySeasonByTitleArgs = {
  title: Scalars['String'];
};


export type QueryTaskArgs = {
  nodeId: Scalars['ID'];
};


export type QueryTaskByIdArgs = {
  id: Scalars['Int'];
};


export type QueryTaskEpisodeArgs = {
  nodeId: Scalars['ID'];
};


export type QueryTaskEpisodeByTaskIdAndEpisodeIdArgs = {
  episodeId: Scalars['Int'];
  taskId: Scalars['Int'];
};


export type QueryTorrentArgs = {
  nodeId: Scalars['ID'];
};


export type QueryTorrentByHashArgs = {
  hash: Scalars['String'];
};


export type QueryTorrentByIdArgs = {
  id: Scalars['Int'];
};


export type QueryTorrentHistorySyncStateArgs = {
  id: Scalars['String'];
};

export type SaveSeasonPatch = {
  airTime?: InputMaybe<Scalars['String']>;
  bangumiId?: InputMaybe<Scalars['String']>;
  bannerImageId?: InputMaybe<Scalars['Int']>;
  bilibiliMainlandId?: InputMaybe<Scalars['String']>;
  bilibiliThmId?: InputMaybe<Scalars['String']>;
  description?: InputMaybe<Scalars['String']>;
  downloadOffsetHours?: InputMaybe<Scalars['Int']>;
  episodesAutoSync?: InputMaybe<Scalars['Boolean']>;
  episodesSource?: InputMaybe<MetadataSource>;
  fanartImageId?: InputMaybe<Scalars['Int']>;
  infoSource?: InputMaybe<MetadataSource>;
  isMonitoring?: InputMaybe<Scalars['Boolean']>;
  laniaSync?: InputMaybe<Scalars['Boolean']>;
  needDownloadCc?: InputMaybe<Scalars['Boolean']>;
  notifyMissing?: InputMaybe<Scalars['Boolean']>;
  notifyPublish?: InputMaybe<Scalars['Boolean']>;
  posterImageId?: InputMaybe<Scalars['Int']>;
  smartDownloadEnabled?: InputMaybe<Scalars['Boolean']>;
  smartDownloadPreferBaha?: InputMaybe<Scalars['Boolean']>;
  smartDownloadSubtitle?: InputMaybe<Scalars['String']>;
  smartDownloadTimeoutMinutes?: InputMaybe<Scalars['Int']>;
  smartDownloadWindowHours?: InputMaybe<Scalars['Int']>;
  sources: Array<DownloadSourcesInput>;
  tags?: InputMaybe<Array<Scalars['String']>>;
  title?: InputMaybe<Scalars['String']>;
  tvdbId?: InputMaybe<Scalars['String']>;
  tvdbSeason?: InputMaybe<Scalars['Int']>;
  weekday?: InputMaybe<Scalars['Int']>;
  yearAndSemester?: InputMaybe<Scalars['String']>;
};

export type SearchBangumiSeason = {
  __typename?: 'SearchBangumiSeason';
  added: Scalars['Boolean'];
  airDate?: Maybe<Scalars['String']>;
  id: Scalars['String'];
  image?: Maybe<Scalars['String']>;
  name: Scalars['String'];
  tags: Array<Scalars['String']>;
};

export type Season = Node & {
  __typename?: 'Season';
  /** hh:mm air time, or null if unknown, hour can be up to 48, timezone always GMT+8 */
  airTime: Scalars['String'];
  aliases: Array<Maybe<Scalars['String']>>;
  bangumiId: Scalars['String'];
  bannerImageId?: Maybe<Scalars['Int']>;
  bilibiliMainlandId: Scalars['String'];
  bilibiliThmId: Scalars['String'];
  createdAt: Scalars['Datetime'];
  dandanplayAnimeId?: Maybe<Scalars['String']>;
  declaredEpisodeCount?: Maybe<Scalars['Int']>;
  description: Scalars['String'];
  /** 季度标题清洗后的目录名 */
  directory?: Maybe<Scalars['String']>;
  downloadOffsetHours: Scalars['Int'];
  /** Reads and enables pagination through a set of `DownloadSource`. */
  downloadSourcesBySeasonId: DownloadSourcesConnection;
  episodesAutoSync: Scalars['Boolean'];
  /** Reads and enables pagination through a set of `Episode`. */
  episodesBySeasonId: EpisodesConnection;
  episodesLastSync?: Maybe<Scalars['Datetime']>;
  /** here 'MANUAL' stands for 'NO CHANGES', in which case all sync will be disabled for this */
  episodesSource: MetadataSource;
  fanartImageId?: Maybe<Scalars['Int']>;
  id: Scalars['Int'];
  /** Reads a single `Image` that is related to this `Season`. */
  imageByBannerImageId?: Maybe<Image>;
  /** Reads a single `Image` that is related to this `Season`. */
  imageByFanartImageId?: Maybe<Image>;
  /** Reads a single `Image` that is related to this `Season`. */
  imageByPosterImageId?: Maybe<Image>;
  /**
   * source for:
   * - description
   * - tag
   * - genre
   * - rating
   * - starring
   * - cast
   */
  infoSource: MetadataSource;
  integrationsLaniaSync: Scalars['Boolean'];
  isMonitoring: Scalars['Boolean'];
  /** Reads a single `JellyfinFolder` that is related to this `Season`. */
  jellyfinFolderByJellyfinFolderId?: Maybe<JellyfinFolder>;
  jellyfinFolderId: Scalars['Int'];
  jellyfinId: Scalars['String'];
  /** 上次实际落盘的目录名 */
  lastWriteDirectory?: Maybe<Scalars['String']>;
  lastWriteTitle?: Maybe<Scalars['String']>;
  lastWriteToDisk?: Maybe<Scalars['Datetime']>;
  latestMainEpisode?: Maybe<Episode>;
  /** Reads and enables pagination through a set of `Episode`. */
  mainEpisodes: EpisodesConnection;
  mikanAnimeId: Scalars['String'];
  needDownloadCc: Scalars['Boolean'];
  /** A globally unique identifier. Can be used in various places throughout the system to identify this single value. */
  nodeId: Scalars['ID'];
  notifyMissing: Scalars['Boolean'];
  notifyPublish: Scalars['Boolean'];
  posterImageId?: Maybe<Scalars['Int']>;
  premiereDate?: Maybe<Scalars['String']>;
  smartDownloadEnabled: Scalars['Boolean'];
  smartDownloadPreferBaha: Scalars['Boolean'];
  smartDownloadSubtitle: Scalars['String'];
  smartDownloadTimeoutMinutes?: Maybe<Scalars['Int']>;
  smartDownloadWindowHours: Scalars['Int'];
  tags: Array<Maybe<Scalars['String']>>;
  title: Scalars['String'];
  /** Reads and enables pagination through a set of `Torrent`. */
  torrentsByMatchedSeasonId: TorrentsConnection;
  tvdbId: Scalars['String'];
  /** null if unknown */
  tvdbSeason?: Maybe<Scalars['Int']>;
  /** 0 for monday, 6 for sunday, null if unknown, past 24:00 time counts as last day (like Monday 25:00) */
  weekday?: Maybe<Scalars['Int']>;
  /** like '202201' ~ '202204', or null if unknown */
  yearAndSemester: Scalars['String'];
  yearAndSemesterCanonical: Scalars['Int'];
};


export type SeasonDownloadSourcesBySeasonIdArgs = {
  after?: InputMaybe<Scalars['Cursor']>;
  before?: InputMaybe<Scalars['Cursor']>;
  condition?: InputMaybe<DownloadSourceCondition>;
  filter?: InputMaybe<DownloadSourceFilter>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<DownloadSourcesOrderBy>>;
};


export type SeasonEpisodesBySeasonIdArgs = {
  after?: InputMaybe<Scalars['Cursor']>;
  before?: InputMaybe<Scalars['Cursor']>;
  condition?: InputMaybe<EpisodeCondition>;
  filter?: InputMaybe<EpisodeFilter>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<EpisodesOrderBy>>;
};


export type SeasonLatestMainEpisodeArgs = {
  atTime?: InputMaybe<Scalars['Datetime']>;
};


export type SeasonMainEpisodesArgs = {
  after?: InputMaybe<Scalars['Cursor']>;
  before?: InputMaybe<Scalars['Cursor']>;
  filter?: InputMaybe<EpisodeFilter>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
};


export type SeasonTorrentsByMatchedSeasonIdArgs = {
  after?: InputMaybe<Scalars['Cursor']>;
  before?: InputMaybe<Scalars['Cursor']>;
  condition?: InputMaybe<TorrentCondition>;
  filter?: InputMaybe<TorrentFilter>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<TorrentsOrderBy>>;
};

export type SeasonCharacter = {
  __typename?: 'SeasonCharacter';
  actor: Scalars['String'];
  actorImageURL?: Maybe<Scalars['String']>;
  character: Scalars['String'];
  characterImageURL?: Maybe<Scalars['String']>;
};

/** A condition to be used against `Season` object types. All fields are tested for equality and combined with a logical ‘and.’ */
export type SeasonCondition = {
  /** Checks for equality with the object’s `airTime` field. */
  airTime?: InputMaybe<Scalars['String']>;
  /** Checks for equality with the object’s `aliases` field. */
  aliases?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Checks for equality with the object’s `bangumiId` field. */
  bangumiId?: InputMaybe<Scalars['String']>;
  /** Checks for equality with the object’s `bannerImageId` field. */
  bannerImageId?: InputMaybe<Scalars['Int']>;
  /** Checks for equality with the object’s `bilibiliMainlandId` field. */
  bilibiliMainlandId?: InputMaybe<Scalars['String']>;
  /** Checks for equality with the object’s `bilibiliThmId` field. */
  bilibiliThmId?: InputMaybe<Scalars['String']>;
  /** Checks for equality with the object’s `createdAt` field. */
  createdAt?: InputMaybe<Scalars['Datetime']>;
  /** Checks for equality with the object’s `dandanplayAnimeId` field. */
  dandanplayAnimeId?: InputMaybe<Scalars['String']>;
  /** Checks for equality with the object’s `declaredEpisodeCount` field. */
  declaredEpisodeCount?: InputMaybe<Scalars['Int']>;
  /** Checks for equality with the object’s `description` field. */
  description?: InputMaybe<Scalars['String']>;
  /** Checks for equality with the object’s `directory` field. */
  directory?: InputMaybe<Scalars['String']>;
  /** Checks for equality with the object’s `downloadOffsetHours` field. */
  downloadOffsetHours?: InputMaybe<Scalars['Int']>;
  /** Checks for equality with the object’s `episodesAutoSync` field. */
  episodesAutoSync?: InputMaybe<Scalars['Boolean']>;
  /** Checks for equality with the object’s `episodesLastSync` field. */
  episodesLastSync?: InputMaybe<Scalars['Datetime']>;
  /** Checks for equality with the object’s `episodesSource` field. */
  episodesSource?: InputMaybe<MetadataSource>;
  /** Checks for equality with the object’s `fanartImageId` field. */
  fanartImageId?: InputMaybe<Scalars['Int']>;
  /** Checks for equality with the object’s `id` field. */
  id?: InputMaybe<Scalars['Int']>;
  /** Checks for equality with the object’s `infoSource` field. */
  infoSource?: InputMaybe<MetadataSource>;
  /** Checks for equality with the object’s `integrationsLaniaSync` field. */
  integrationsLaniaSync?: InputMaybe<Scalars['Boolean']>;
  /** Checks for equality with the object’s `isMonitoring` field. */
  isMonitoring?: InputMaybe<Scalars['Boolean']>;
  /** Checks for equality with the object’s `jellyfinFolderId` field. */
  jellyfinFolderId?: InputMaybe<Scalars['Int']>;
  /** Checks for equality with the object’s `jellyfinId` field. */
  jellyfinId?: InputMaybe<Scalars['String']>;
  /** Checks for equality with the object’s `lastWriteDirectory` field. */
  lastWriteDirectory?: InputMaybe<Scalars['String']>;
  /** Checks for equality with the object’s `lastWriteTitle` field. */
  lastWriteTitle?: InputMaybe<Scalars['String']>;
  /** Checks for equality with the object’s `lastWriteToDisk` field. */
  lastWriteToDisk?: InputMaybe<Scalars['Datetime']>;
  /** Checks for equality with the object’s `mikanAnimeId` field. */
  mikanAnimeId?: InputMaybe<Scalars['String']>;
  /** Checks for equality with the object’s `needDownloadCc` field. */
  needDownloadCc?: InputMaybe<Scalars['Boolean']>;
  /** Checks for equality with the object’s `notifyMissing` field. */
  notifyMissing?: InputMaybe<Scalars['Boolean']>;
  /** Checks for equality with the object’s `notifyPublish` field. */
  notifyPublish?: InputMaybe<Scalars['Boolean']>;
  /** Checks for equality with the object’s `posterImageId` field. */
  posterImageId?: InputMaybe<Scalars['Int']>;
  /** Checks for equality with the object’s `premiereDate` field. */
  premiereDate?: InputMaybe<Scalars['String']>;
  /** Checks for equality with the object’s `smartDownloadEnabled` field. */
  smartDownloadEnabled?: InputMaybe<Scalars['Boolean']>;
  /** Checks for equality with the object’s `smartDownloadPreferBaha` field. */
  smartDownloadPreferBaha?: InputMaybe<Scalars['Boolean']>;
  /** Checks for equality with the object’s `smartDownloadSubtitle` field. */
  smartDownloadSubtitle?: InputMaybe<Scalars['String']>;
  /** Checks for equality with the object’s `smartDownloadTimeoutMinutes` field. */
  smartDownloadTimeoutMinutes?: InputMaybe<Scalars['Int']>;
  /** Checks for equality with the object’s `smartDownloadWindowHours` field. */
  smartDownloadWindowHours?: InputMaybe<Scalars['Int']>;
  /** Checks for equality with the object’s `tags` field. */
  tags?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Checks for equality with the object’s `title` field. */
  title?: InputMaybe<Scalars['String']>;
  /** Checks for equality with the object’s `tvdbId` field. */
  tvdbId?: InputMaybe<Scalars['String']>;
  /** Checks for equality with the object’s `tvdbSeason` field. */
  tvdbSeason?: InputMaybe<Scalars['Int']>;
  /** Checks for equality with the object’s `weekday` field. */
  weekday?: InputMaybe<Scalars['Int']>;
  /** Checks for equality with the object’s `yearAndSemester` field. */
  yearAndSemester?: InputMaybe<Scalars['String']>;
  /** Checks for equality with the object’s `yearAndSemesterCanonical` field. */
  yearAndSemesterCanonical?: InputMaybe<Scalars['Int']>;
};

export type SeasonEpisode = {
  __typename?: 'SeasonEpisode';
  airDate?: Maybe<Scalars['String']>;
  bangumiEpisodeId?: Maybe<Scalars['Int']>;
  bangumiSort?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  episodeNumber?: Maybe<Scalars['String']>;
  episodeType?: Maybe<Scalars['String']>;
  index?: Maybe<Scalars['Int']>;
  title: Scalars['String'];
};

/** A filter to be used against `Season` object types. All fields are combined with a logical ‘and.’ */
export type SeasonFilter = {
  /** Filter by the object’s `airTime` field. */
  airTime?: InputMaybe<StringFilter>;
  /** Filter by the object’s `aliases` field. */
  aliases?: InputMaybe<StringListFilter>;
  /** Checks for all expressions in this list. */
  and?: InputMaybe<Array<SeasonFilter>>;
  /** Filter by the object’s `bangumiId` field. */
  bangumiId?: InputMaybe<StringFilter>;
  /** Filter by the object’s `bannerImageId` field. */
  bannerImageId?: InputMaybe<IntFilter>;
  /** Filter by the object’s `bilibiliMainlandId` field. */
  bilibiliMainlandId?: InputMaybe<StringFilter>;
  /** Filter by the object’s `bilibiliThmId` field. */
  bilibiliThmId?: InputMaybe<StringFilter>;
  /** Filter by the object’s `createdAt` field. */
  createdAt?: InputMaybe<DatetimeFilter>;
  /** Filter by the object’s `dandanplayAnimeId` field. */
  dandanplayAnimeId?: InputMaybe<StringFilter>;
  /** Filter by the object’s `declaredEpisodeCount` field. */
  declaredEpisodeCount?: InputMaybe<IntFilter>;
  /** Filter by the object’s `description` field. */
  description?: InputMaybe<StringFilter>;
  /** Filter by the object’s `directory` field. */
  directory?: InputMaybe<StringFilter>;
  /** Filter by the object’s `downloadOffsetHours` field. */
  downloadOffsetHours?: InputMaybe<IntFilter>;
  /** Filter by the object’s `downloadSourcesBySeasonId` relation. */
  downloadSourcesBySeasonId?: InputMaybe<SeasonToManyDownloadSourceFilter>;
  /** Some related `downloadSourcesBySeasonId` exist. */
  downloadSourcesBySeasonIdExist?: InputMaybe<Scalars['Boolean']>;
  /** Filter by the object’s `episodesAutoSync` field. */
  episodesAutoSync?: InputMaybe<BooleanFilter>;
  /** Filter by the object’s `episodesBySeasonId` relation. */
  episodesBySeasonId?: InputMaybe<SeasonToManyEpisodeFilter>;
  /** Some related `episodesBySeasonId` exist. */
  episodesBySeasonIdExist?: InputMaybe<Scalars['Boolean']>;
  /** Filter by the object’s `episodesLastSync` field. */
  episodesLastSync?: InputMaybe<DatetimeFilter>;
  /** Filter by the object’s `episodesSource` field. */
  episodesSource?: InputMaybe<MetadataSourceFilter>;
  /** Filter by the object’s `fanartImageId` field. */
  fanartImageId?: InputMaybe<IntFilter>;
  /** Filter by the object’s `id` field. */
  id?: InputMaybe<IntFilter>;
  /** Filter by the object’s `imageByBannerImageId` relation. */
  imageByBannerImageId?: InputMaybe<ImageFilter>;
  /** A related `imageByBannerImageId` exists. */
  imageByBannerImageIdExists?: InputMaybe<Scalars['Boolean']>;
  /** Filter by the object’s `imageByFanartImageId` relation. */
  imageByFanartImageId?: InputMaybe<ImageFilter>;
  /** A related `imageByFanartImageId` exists. */
  imageByFanartImageIdExists?: InputMaybe<Scalars['Boolean']>;
  /** Filter by the object’s `imageByPosterImageId` relation. */
  imageByPosterImageId?: InputMaybe<ImageFilter>;
  /** A related `imageByPosterImageId` exists. */
  imageByPosterImageIdExists?: InputMaybe<Scalars['Boolean']>;
  /** Filter by the object’s `infoSource` field. */
  infoSource?: InputMaybe<MetadataSourceFilter>;
  /** Filter by the object’s `integrationsLaniaSync` field. */
  integrationsLaniaSync?: InputMaybe<BooleanFilter>;
  /** Filter by the object’s `isMonitoring` field. */
  isMonitoring?: InputMaybe<BooleanFilter>;
  /** Filter by the object’s `jellyfinFolderByJellyfinFolderId` relation. */
  jellyfinFolderByJellyfinFolderId?: InputMaybe<JellyfinFolderFilter>;
  /** Filter by the object’s `jellyfinFolderId` field. */
  jellyfinFolderId?: InputMaybe<IntFilter>;
  /** Filter by the object’s `jellyfinId` field. */
  jellyfinId?: InputMaybe<StringFilter>;
  /** Filter by the object’s `lastWriteDirectory` field. */
  lastWriteDirectory?: InputMaybe<StringFilter>;
  /** Filter by the object’s `lastWriteTitle` field. */
  lastWriteTitle?: InputMaybe<StringFilter>;
  /** Filter by the object’s `lastWriteToDisk` field. */
  lastWriteToDisk?: InputMaybe<DatetimeFilter>;
  /** Filter by the object’s `mikanAnimeId` field. */
  mikanAnimeId?: InputMaybe<StringFilter>;
  /** Filter by the object’s `needDownloadCc` field. */
  needDownloadCc?: InputMaybe<BooleanFilter>;
  /** Negates the expression. */
  not?: InputMaybe<SeasonFilter>;
  /** Filter by the object’s `notifyMissing` field. */
  notifyMissing?: InputMaybe<BooleanFilter>;
  /** Filter by the object’s `notifyPublish` field. */
  notifyPublish?: InputMaybe<BooleanFilter>;
  /** Checks for any expressions in this list. */
  or?: InputMaybe<Array<SeasonFilter>>;
  /** Filter by the object’s `posterImageId` field. */
  posterImageId?: InputMaybe<IntFilter>;
  /** Filter by the object’s `premiereDate` field. */
  premiereDate?: InputMaybe<StringFilter>;
  /** Filter by the object’s `smartDownloadEnabled` field. */
  smartDownloadEnabled?: InputMaybe<BooleanFilter>;
  /** Filter by the object’s `smartDownloadPreferBaha` field. */
  smartDownloadPreferBaha?: InputMaybe<BooleanFilter>;
  /** Filter by the object’s `smartDownloadSubtitle` field. */
  smartDownloadSubtitle?: InputMaybe<StringFilter>;
  /** Filter by the object’s `smartDownloadTimeoutMinutes` field. */
  smartDownloadTimeoutMinutes?: InputMaybe<IntFilter>;
  /** Filter by the object’s `smartDownloadWindowHours` field. */
  smartDownloadWindowHours?: InputMaybe<IntFilter>;
  /** Filter by the object’s `tags` field. */
  tags?: InputMaybe<StringListFilter>;
  /** Filter by the object’s `title` field. */
  title?: InputMaybe<StringFilter>;
  /** Filter by the object’s `torrentsByMatchedSeasonId` relation. */
  torrentsByMatchedSeasonId?: InputMaybe<SeasonToManyTorrentFilter>;
  /** Some related `torrentsByMatchedSeasonId` exist. */
  torrentsByMatchedSeasonIdExist?: InputMaybe<Scalars['Boolean']>;
  /** Filter by the object’s `tvdbId` field. */
  tvdbId?: InputMaybe<StringFilter>;
  /** Filter by the object’s `tvdbSeason` field. */
  tvdbSeason?: InputMaybe<IntFilter>;
  /** Filter by the object’s `weekday` field. */
  weekday?: InputMaybe<IntFilter>;
  /** Filter by the object’s `yearAndSemester` field. */
  yearAndSemester?: InputMaybe<StringFilter>;
  /** Filter by the object’s `yearAndSemesterCanonical` field. */
  yearAndSemesterCanonical?: InputMaybe<IntFilter>;
};

export type SeasonImages = {
  __typename?: 'SeasonImages';
  bannerURL?: Maybe<Scalars['String']>;
  fanartURL?: Maybe<Scalars['String']>;
  posterURL?: Maybe<Scalars['String']>;
};

export type SeasonInfo = {
  __typename?: 'SeasonInfo';
  aliases: Array<Scalars['String']>;
  declaredEpisodeCount?: Maybe<Scalars['Int']>;
  description?: Maybe<Scalars['String']>;
  genres: Array<Scalars['String']>;
  premiereDate?: Maybe<Scalars['String']>;
  semester?: Maybe<Scalars['Int']>;
  tags: Array<Scalars['String']>;
  time?: Maybe<Scalars['String']>;
  weekday?: Maybe<Scalars['Int']>;
  year?: Maybe<Scalars['Int']>;
};

/** An input for mutations affecting `Season` */
export type SeasonInput = {
  /** hh:mm air time, or null if unknown, hour can be up to 48, timezone always GMT+8 */
  airTime?: InputMaybe<Scalars['String']>;
  aliases?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  bangumiId?: InputMaybe<Scalars['String']>;
  bannerImageId?: InputMaybe<Scalars['Int']>;
  bilibiliMainlandId?: InputMaybe<Scalars['String']>;
  bilibiliThmId?: InputMaybe<Scalars['String']>;
  createdAt?: InputMaybe<Scalars['Datetime']>;
  dandanplayAnimeId?: InputMaybe<Scalars['String']>;
  declaredEpisodeCount?: InputMaybe<Scalars['Int']>;
  description?: InputMaybe<Scalars['String']>;
  downloadOffsetHours?: InputMaybe<Scalars['Int']>;
  episodesAutoSync?: InputMaybe<Scalars['Boolean']>;
  episodesLastSync?: InputMaybe<Scalars['Datetime']>;
  /** here 'MANUAL' stands for 'NO CHANGES', in which case all sync will be disabled for this */
  episodesSource?: InputMaybe<MetadataSource>;
  fanartImageId?: InputMaybe<Scalars['Int']>;
  id?: InputMaybe<Scalars['Int']>;
  /**
   * source for:
   * - description
   * - tag
   * - genre
   * - rating
   * - starring
   * - cast
   */
  infoSource?: InputMaybe<MetadataSource>;
  integrationsLaniaSync?: InputMaybe<Scalars['Boolean']>;
  isMonitoring?: InputMaybe<Scalars['Boolean']>;
  jellyfinFolderId: Scalars['Int'];
  jellyfinId?: InputMaybe<Scalars['String']>;
  lastWriteTitle?: InputMaybe<Scalars['String']>;
  lastWriteToDisk?: InputMaybe<Scalars['Datetime']>;
  mikanAnimeId?: InputMaybe<Scalars['String']>;
  needDownloadCc?: InputMaybe<Scalars['Boolean']>;
  notifyMissing?: InputMaybe<Scalars['Boolean']>;
  notifyPublish?: InputMaybe<Scalars['Boolean']>;
  posterImageId?: InputMaybe<Scalars['Int']>;
  premiereDate?: InputMaybe<Scalars['String']>;
  smartDownloadEnabled?: InputMaybe<Scalars['Boolean']>;
  smartDownloadPreferBaha?: InputMaybe<Scalars['Boolean']>;
  smartDownloadSubtitle?: InputMaybe<Scalars['String']>;
  smartDownloadTimeoutMinutes?: InputMaybe<Scalars['Int']>;
  smartDownloadWindowHours?: InputMaybe<Scalars['Int']>;
  tags: Array<InputMaybe<Scalars['String']>>;
  title?: InputMaybe<Scalars['String']>;
  tvdbId?: InputMaybe<Scalars['String']>;
  /** null if unknown */
  tvdbSeason?: InputMaybe<Scalars['Int']>;
  /** 0 for monday, 6 for sunday, null if unknown, past 24:00 time counts as last day (like Monday 25:00) */
  weekday?: InputMaybe<Scalars['Int']>;
  /** like '202201' ~ '202204', or null if unknown */
  yearAndSemester?: InputMaybe<Scalars['String']>;
  yearAndSemesterCanonical?: InputMaybe<Scalars['Int']>;
};

/** Represents an update to a `Season`. Fields that are set will be updated. */
export type SeasonPatch = {
  /** hh:mm air time, or null if unknown, hour can be up to 48, timezone always GMT+8 */
  airTime?: InputMaybe<Scalars['String']>;
  aliases?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  bangumiId?: InputMaybe<Scalars['String']>;
  bannerImageId?: InputMaybe<Scalars['Int']>;
  bilibiliMainlandId?: InputMaybe<Scalars['String']>;
  bilibiliThmId?: InputMaybe<Scalars['String']>;
  createdAt?: InputMaybe<Scalars['Datetime']>;
  dandanplayAnimeId?: InputMaybe<Scalars['String']>;
  declaredEpisodeCount?: InputMaybe<Scalars['Int']>;
  description?: InputMaybe<Scalars['String']>;
  downloadOffsetHours?: InputMaybe<Scalars['Int']>;
  episodesAutoSync?: InputMaybe<Scalars['Boolean']>;
  episodesLastSync?: InputMaybe<Scalars['Datetime']>;
  /** here 'MANUAL' stands for 'NO CHANGES', in which case all sync will be disabled for this */
  episodesSource?: InputMaybe<MetadataSource>;
  fanartImageId?: InputMaybe<Scalars['Int']>;
  id?: InputMaybe<Scalars['Int']>;
  /**
   * source for:
   * - description
   * - tag
   * - genre
   * - rating
   * - starring
   * - cast
   */
  infoSource?: InputMaybe<MetadataSource>;
  integrationsLaniaSync?: InputMaybe<Scalars['Boolean']>;
  isMonitoring?: InputMaybe<Scalars['Boolean']>;
  jellyfinFolderId?: InputMaybe<Scalars['Int']>;
  jellyfinId?: InputMaybe<Scalars['String']>;
  lastWriteTitle?: InputMaybe<Scalars['String']>;
  lastWriteToDisk?: InputMaybe<Scalars['Datetime']>;
  mikanAnimeId?: InputMaybe<Scalars['String']>;
  needDownloadCc?: InputMaybe<Scalars['Boolean']>;
  notifyMissing?: InputMaybe<Scalars['Boolean']>;
  notifyPublish?: InputMaybe<Scalars['Boolean']>;
  posterImageId?: InputMaybe<Scalars['Int']>;
  premiereDate?: InputMaybe<Scalars['String']>;
  smartDownloadEnabled?: InputMaybe<Scalars['Boolean']>;
  smartDownloadPreferBaha?: InputMaybe<Scalars['Boolean']>;
  smartDownloadSubtitle?: InputMaybe<Scalars['String']>;
  smartDownloadTimeoutMinutes?: InputMaybe<Scalars['Int']>;
  smartDownloadWindowHours?: InputMaybe<Scalars['Int']>;
  tags?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  title?: InputMaybe<Scalars['String']>;
  tvdbId?: InputMaybe<Scalars['String']>;
  /** null if unknown */
  tvdbSeason?: InputMaybe<Scalars['Int']>;
  /** 0 for monday, 6 for sunday, null if unknown, past 24:00 time counts as last day (like Monday 25:00) */
  weekday?: InputMaybe<Scalars['Int']>;
  /** like '202201' ~ '202204', or null if unknown */
  yearAndSemester?: InputMaybe<Scalars['String']>;
  yearAndSemesterCanonical?: InputMaybe<Scalars['Int']>;
};

/** A filter to be used against many `DownloadSource` object types. All fields are combined with a logical ‘and.’ */
export type SeasonToManyDownloadSourceFilter = {
  /** Every related `DownloadSource` matches the filter criteria. All fields are combined with a logical ‘and.’ */
  every?: InputMaybe<DownloadSourceFilter>;
  /** No related `DownloadSource` matches the filter criteria. All fields are combined with a logical ‘and.’ */
  none?: InputMaybe<DownloadSourceFilter>;
  /** Some related `DownloadSource` matches the filter criteria. All fields are combined with a logical ‘and.’ */
  some?: InputMaybe<DownloadSourceFilter>;
};

/** A filter to be used against many `Episode` object types. All fields are combined with a logical ‘and.’ */
export type SeasonToManyEpisodeFilter = {
  /** Every related `Episode` matches the filter criteria. All fields are combined with a logical ‘and.’ */
  every?: InputMaybe<EpisodeFilter>;
  /** No related `Episode` matches the filter criteria. All fields are combined with a logical ‘and.’ */
  none?: InputMaybe<EpisodeFilter>;
  /** Some related `Episode` matches the filter criteria. All fields are combined with a logical ‘and.’ */
  some?: InputMaybe<EpisodeFilter>;
};

/** A filter to be used against many `Torrent` object types. All fields are combined with a logical ‘and.’ */
export type SeasonToManyTorrentFilter = {
  /** Every related `Torrent` matches the filter criteria. All fields are combined with a logical ‘and.’ */
  every?: InputMaybe<TorrentFilter>;
  /** No related `Torrent` matches the filter criteria. All fields are combined with a logical ‘and.’ */
  none?: InputMaybe<TorrentFilter>;
  /** Some related `Torrent` matches the filter criteria. All fields are combined with a logical ‘and.’ */
  some?: InputMaybe<TorrentFilter>;
};

/** A connection to a list of `Season` values. */
export type SeasonsConnection = {
  __typename?: 'SeasonsConnection';
  /** A list of edges which contains the `Season` and cursor to aid in pagination. */
  edges: Array<SeasonsEdge>;
  /** A list of `Season` objects. */
  nodes: Array<Maybe<Season>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** The count of *all* `Season` you could get from the connection. */
  totalCount: Scalars['Int'];
};

/** A `Season` edge in the connection. */
export type SeasonsEdge = {
  __typename?: 'SeasonsEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']>;
  /** The `Season` at the end of the edge. */
  node?: Maybe<Season>;
};

/** Methods to use when ordering `Season`. */
export enum SeasonsOrderBy {
  AirTimeAsc = 'AIR_TIME_ASC',
  AirTimeDesc = 'AIR_TIME_DESC',
  AliasesAsc = 'ALIASES_ASC',
  AliasesDesc = 'ALIASES_DESC',
  BangumiIdAsc = 'BANGUMI_ID_ASC',
  BangumiIdDesc = 'BANGUMI_ID_DESC',
  BannerImageIdAsc = 'BANNER_IMAGE_ID_ASC',
  BannerImageIdDesc = 'BANNER_IMAGE_ID_DESC',
  BilibiliMainlandIdAsc = 'BILIBILI_MAINLAND_ID_ASC',
  BilibiliMainlandIdDesc = 'BILIBILI_MAINLAND_ID_DESC',
  BilibiliThmIdAsc = 'BILIBILI_THM_ID_ASC',
  BilibiliThmIdDesc = 'BILIBILI_THM_ID_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
  DandanplayAnimeIdAsc = 'DANDANPLAY_ANIME_ID_ASC',
  DandanplayAnimeIdDesc = 'DANDANPLAY_ANIME_ID_DESC',
  DeclaredEpisodeCountAsc = 'DECLARED_EPISODE_COUNT_ASC',
  DeclaredEpisodeCountDesc = 'DECLARED_EPISODE_COUNT_DESC',
  DescriptionAsc = 'DESCRIPTION_ASC',
  DescriptionDesc = 'DESCRIPTION_DESC',
  DirectoryAsc = 'DIRECTORY_ASC',
  DirectoryDesc = 'DIRECTORY_DESC',
  DownloadOffsetHoursAsc = 'DOWNLOAD_OFFSET_HOURS_ASC',
  DownloadOffsetHoursDesc = 'DOWNLOAD_OFFSET_HOURS_DESC',
  DownloadSourcesBySeasonIdCountAsc = 'DOWNLOAD_SOURCES_BY_SEASON_ID__COUNT_ASC',
  DownloadSourcesBySeasonIdCountDesc = 'DOWNLOAD_SOURCES_BY_SEASON_ID__COUNT_DESC',
  DownloadSourcesBySeasonIdMaxCreatedAtAsc = 'DOWNLOAD_SOURCES_BY_SEASON_ID__MAX_CREATED_AT_ASC',
  DownloadSourcesBySeasonIdMaxCreatedAtDesc = 'DOWNLOAD_SOURCES_BY_SEASON_ID__MAX_CREATED_AT_DESC',
  DownloadSourcesBySeasonIdMaxGroupIdAsc = 'DOWNLOAD_SOURCES_BY_SEASON_ID__MAX_GROUP_ID_ASC',
  DownloadSourcesBySeasonIdMaxGroupIdDesc = 'DOWNLOAD_SOURCES_BY_SEASON_ID__MAX_GROUP_ID_DESC',
  DownloadSourcesBySeasonIdMaxIdAsc = 'DOWNLOAD_SOURCES_BY_SEASON_ID__MAX_ID_ASC',
  DownloadSourcesBySeasonIdMaxIdDesc = 'DOWNLOAD_SOURCES_BY_SEASON_ID__MAX_ID_DESC',
  DownloadSourcesBySeasonIdMaxIsDisabledAsc = 'DOWNLOAD_SOURCES_BY_SEASON_ID__MAX_IS_DISABLED_ASC',
  DownloadSourcesBySeasonIdMaxIsDisabledDesc = 'DOWNLOAD_SOURCES_BY_SEASON_ID__MAX_IS_DISABLED_DESC',
  DownloadSourcesBySeasonIdMaxOffsetAsc = 'DOWNLOAD_SOURCES_BY_SEASON_ID__MAX_OFFSET_ASC',
  DownloadSourcesBySeasonIdMaxOffsetDesc = 'DOWNLOAD_SOURCES_BY_SEASON_ID__MAX_OFFSET_DESC',
  DownloadSourcesBySeasonIdMaxPatternAsc = 'DOWNLOAD_SOURCES_BY_SEASON_ID__MAX_PATTERN_ASC',
  DownloadSourcesBySeasonIdMaxPatternDesc = 'DOWNLOAD_SOURCES_BY_SEASON_ID__MAX_PATTERN_DESC',
  DownloadSourcesBySeasonIdMaxSeasonIdAsc = 'DOWNLOAD_SOURCES_BY_SEASON_ID__MAX_SEASON_ID_ASC',
  DownloadSourcesBySeasonIdMaxSeasonIdDesc = 'DOWNLOAD_SOURCES_BY_SEASON_ID__MAX_SEASON_ID_DESC',
  DownloadSourcesBySeasonIdMinCreatedAtAsc = 'DOWNLOAD_SOURCES_BY_SEASON_ID__MIN_CREATED_AT_ASC',
  DownloadSourcesBySeasonIdMinCreatedAtDesc = 'DOWNLOAD_SOURCES_BY_SEASON_ID__MIN_CREATED_AT_DESC',
  DownloadSourcesBySeasonIdMinGroupIdAsc = 'DOWNLOAD_SOURCES_BY_SEASON_ID__MIN_GROUP_ID_ASC',
  DownloadSourcesBySeasonIdMinGroupIdDesc = 'DOWNLOAD_SOURCES_BY_SEASON_ID__MIN_GROUP_ID_DESC',
  DownloadSourcesBySeasonIdMinIdAsc = 'DOWNLOAD_SOURCES_BY_SEASON_ID__MIN_ID_ASC',
  DownloadSourcesBySeasonIdMinIdDesc = 'DOWNLOAD_SOURCES_BY_SEASON_ID__MIN_ID_DESC',
  DownloadSourcesBySeasonIdMinIsDisabledAsc = 'DOWNLOAD_SOURCES_BY_SEASON_ID__MIN_IS_DISABLED_ASC',
  DownloadSourcesBySeasonIdMinIsDisabledDesc = 'DOWNLOAD_SOURCES_BY_SEASON_ID__MIN_IS_DISABLED_DESC',
  DownloadSourcesBySeasonIdMinOffsetAsc = 'DOWNLOAD_SOURCES_BY_SEASON_ID__MIN_OFFSET_ASC',
  DownloadSourcesBySeasonIdMinOffsetDesc = 'DOWNLOAD_SOURCES_BY_SEASON_ID__MIN_OFFSET_DESC',
  DownloadSourcesBySeasonIdMinPatternAsc = 'DOWNLOAD_SOURCES_BY_SEASON_ID__MIN_PATTERN_ASC',
  DownloadSourcesBySeasonIdMinPatternDesc = 'DOWNLOAD_SOURCES_BY_SEASON_ID__MIN_PATTERN_DESC',
  DownloadSourcesBySeasonIdMinSeasonIdAsc = 'DOWNLOAD_SOURCES_BY_SEASON_ID__MIN_SEASON_ID_ASC',
  DownloadSourcesBySeasonIdMinSeasonIdDesc = 'DOWNLOAD_SOURCES_BY_SEASON_ID__MIN_SEASON_ID_DESC',
  EpisodesAutoSyncAsc = 'EPISODES_AUTO_SYNC_ASC',
  EpisodesAutoSyncDesc = 'EPISODES_AUTO_SYNC_DESC',
  EpisodesBySeasonIdCountAsc = 'EPISODES_BY_SEASON_ID__COUNT_ASC',
  EpisodesBySeasonIdCountDesc = 'EPISODES_BY_SEASON_ID__COUNT_DESC',
  EpisodesBySeasonIdMaxAirTimeAsc = 'EPISODES_BY_SEASON_ID__MAX_AIR_TIME_ASC',
  EpisodesBySeasonIdMaxAirTimeDesc = 'EPISODES_BY_SEASON_ID__MAX_AIR_TIME_DESC',
  EpisodesBySeasonIdMaxBangumiEpisodeIdAsc = 'EPISODES_BY_SEASON_ID__MAX_BANGUMI_EPISODE_ID_ASC',
  EpisodesBySeasonIdMaxBangumiEpisodeIdDesc = 'EPISODES_BY_SEASON_ID__MAX_BANGUMI_EPISODE_ID_DESC',
  EpisodesBySeasonIdMaxBangumiSortAsc = 'EPISODES_BY_SEASON_ID__MAX_BANGUMI_SORT_ASC',
  EpisodesBySeasonIdMaxBangumiSortDesc = 'EPISODES_BY_SEASON_ID__MAX_BANGUMI_SORT_DESC',
  EpisodesBySeasonIdMaxCreatedAtAsc = 'EPISODES_BY_SEASON_ID__MAX_CREATED_AT_ASC',
  EpisodesBySeasonIdMaxCreatedAtDesc = 'EPISODES_BY_SEASON_ID__MAX_CREATED_AT_DESC',
  EpisodesBySeasonIdMaxCurrentVersionIdAsc = 'EPISODES_BY_SEASON_ID__MAX_CURRENT_VERSION_ID_ASC',
  EpisodesBySeasonIdMaxCurrentVersionIdDesc = 'EPISODES_BY_SEASON_ID__MAX_CURRENT_VERSION_ID_DESC',
  EpisodesBySeasonIdMaxDandanplayEpisodeIdAsc = 'EPISODES_BY_SEASON_ID__MAX_DANDANPLAY_EPISODE_ID_ASC',
  EpisodesBySeasonIdMaxDandanplayEpisodeIdDesc = 'EPISODES_BY_SEASON_ID__MAX_DANDANPLAY_EPISODE_ID_DESC',
  EpisodesBySeasonIdMaxDescriptionAsc = 'EPISODES_BY_SEASON_ID__MAX_DESCRIPTION_ASC',
  EpisodesBySeasonIdMaxDescriptionDesc = 'EPISODES_BY_SEASON_ID__MAX_DESCRIPTION_DESC',
  EpisodesBySeasonIdMaxEpisodeNumberAsc = 'EPISODES_BY_SEASON_ID__MAX_EPISODE_NUMBER_ASC',
  EpisodesBySeasonIdMaxEpisodeNumberDesc = 'EPISODES_BY_SEASON_ID__MAX_EPISODE_NUMBER_DESC',
  EpisodesBySeasonIdMaxEpisodeTypeAsc = 'EPISODES_BY_SEASON_ID__MAX_EPISODE_TYPE_ASC',
  EpisodesBySeasonIdMaxEpisodeTypeDesc = 'EPISODES_BY_SEASON_ID__MAX_EPISODE_TYPE_DESC',
  EpisodesBySeasonIdMaxIdAsc = 'EPISODES_BY_SEASON_ID__MAX_ID_ASC',
  EpisodesBySeasonIdMaxIdDesc = 'EPISODES_BY_SEASON_ID__MAX_ID_DESC',
  EpisodesBySeasonIdMaxIndexAsc = 'EPISODES_BY_SEASON_ID__MAX_INDEX_ASC',
  EpisodesBySeasonIdMaxIndexDesc = 'EPISODES_BY_SEASON_ID__MAX_INDEX_DESC',
  EpisodesBySeasonIdMaxJellyfinEpisodeIdAsc = 'EPISODES_BY_SEASON_ID__MAX_JELLYFIN_EPISODE_ID_ASC',
  EpisodesBySeasonIdMaxJellyfinEpisodeIdDesc = 'EPISODES_BY_SEASON_ID__MAX_JELLYFIN_EPISODE_ID_DESC',
  EpisodesBySeasonIdMaxLastMissingNotifyTimeAsc = 'EPISODES_BY_SEASON_ID__MAX_LAST_MISSING_NOTIFY_TIME_ASC',
  EpisodesBySeasonIdMaxLastMissingNotifyTimeDesc = 'EPISODES_BY_SEASON_ID__MAX_LAST_MISSING_NOTIFY_TIME_DESC',
  EpisodesBySeasonIdMaxRawAirTimeAsc = 'EPISODES_BY_SEASON_ID__MAX_RAW_AIR_TIME_ASC',
  EpisodesBySeasonIdMaxRawAirTimeDesc = 'EPISODES_BY_SEASON_ID__MAX_RAW_AIR_TIME_DESC',
  EpisodesBySeasonIdMaxSeasonIdAsc = 'EPISODES_BY_SEASON_ID__MAX_SEASON_ID_ASC',
  EpisodesBySeasonIdMaxSeasonIdDesc = 'EPISODES_BY_SEASON_ID__MAX_SEASON_ID_DESC',
  EpisodesBySeasonIdMaxSourceDataAsc = 'EPISODES_BY_SEASON_ID__MAX_SOURCE_DATA_ASC',
  EpisodesBySeasonIdMaxSourceDataDesc = 'EPISODES_BY_SEASON_ID__MAX_SOURCE_DATA_DESC',
  EpisodesBySeasonIdMaxTitleAsc = 'EPISODES_BY_SEASON_ID__MAX_TITLE_ASC',
  EpisodesBySeasonIdMaxTitleDesc = 'EPISODES_BY_SEASON_ID__MAX_TITLE_DESC',
  EpisodesBySeasonIdMinAirTimeAsc = 'EPISODES_BY_SEASON_ID__MIN_AIR_TIME_ASC',
  EpisodesBySeasonIdMinAirTimeDesc = 'EPISODES_BY_SEASON_ID__MIN_AIR_TIME_DESC',
  EpisodesBySeasonIdMinBangumiEpisodeIdAsc = 'EPISODES_BY_SEASON_ID__MIN_BANGUMI_EPISODE_ID_ASC',
  EpisodesBySeasonIdMinBangumiEpisodeIdDesc = 'EPISODES_BY_SEASON_ID__MIN_BANGUMI_EPISODE_ID_DESC',
  EpisodesBySeasonIdMinBangumiSortAsc = 'EPISODES_BY_SEASON_ID__MIN_BANGUMI_SORT_ASC',
  EpisodesBySeasonIdMinBangumiSortDesc = 'EPISODES_BY_SEASON_ID__MIN_BANGUMI_SORT_DESC',
  EpisodesBySeasonIdMinCreatedAtAsc = 'EPISODES_BY_SEASON_ID__MIN_CREATED_AT_ASC',
  EpisodesBySeasonIdMinCreatedAtDesc = 'EPISODES_BY_SEASON_ID__MIN_CREATED_AT_DESC',
  EpisodesBySeasonIdMinCurrentVersionIdAsc = 'EPISODES_BY_SEASON_ID__MIN_CURRENT_VERSION_ID_ASC',
  EpisodesBySeasonIdMinCurrentVersionIdDesc = 'EPISODES_BY_SEASON_ID__MIN_CURRENT_VERSION_ID_DESC',
  EpisodesBySeasonIdMinDandanplayEpisodeIdAsc = 'EPISODES_BY_SEASON_ID__MIN_DANDANPLAY_EPISODE_ID_ASC',
  EpisodesBySeasonIdMinDandanplayEpisodeIdDesc = 'EPISODES_BY_SEASON_ID__MIN_DANDANPLAY_EPISODE_ID_DESC',
  EpisodesBySeasonIdMinDescriptionAsc = 'EPISODES_BY_SEASON_ID__MIN_DESCRIPTION_ASC',
  EpisodesBySeasonIdMinDescriptionDesc = 'EPISODES_BY_SEASON_ID__MIN_DESCRIPTION_DESC',
  EpisodesBySeasonIdMinEpisodeNumberAsc = 'EPISODES_BY_SEASON_ID__MIN_EPISODE_NUMBER_ASC',
  EpisodesBySeasonIdMinEpisodeNumberDesc = 'EPISODES_BY_SEASON_ID__MIN_EPISODE_NUMBER_DESC',
  EpisodesBySeasonIdMinEpisodeTypeAsc = 'EPISODES_BY_SEASON_ID__MIN_EPISODE_TYPE_ASC',
  EpisodesBySeasonIdMinEpisodeTypeDesc = 'EPISODES_BY_SEASON_ID__MIN_EPISODE_TYPE_DESC',
  EpisodesBySeasonIdMinIdAsc = 'EPISODES_BY_SEASON_ID__MIN_ID_ASC',
  EpisodesBySeasonIdMinIdDesc = 'EPISODES_BY_SEASON_ID__MIN_ID_DESC',
  EpisodesBySeasonIdMinIndexAsc = 'EPISODES_BY_SEASON_ID__MIN_INDEX_ASC',
  EpisodesBySeasonIdMinIndexDesc = 'EPISODES_BY_SEASON_ID__MIN_INDEX_DESC',
  EpisodesBySeasonIdMinJellyfinEpisodeIdAsc = 'EPISODES_BY_SEASON_ID__MIN_JELLYFIN_EPISODE_ID_ASC',
  EpisodesBySeasonIdMinJellyfinEpisodeIdDesc = 'EPISODES_BY_SEASON_ID__MIN_JELLYFIN_EPISODE_ID_DESC',
  EpisodesBySeasonIdMinLastMissingNotifyTimeAsc = 'EPISODES_BY_SEASON_ID__MIN_LAST_MISSING_NOTIFY_TIME_ASC',
  EpisodesBySeasonIdMinLastMissingNotifyTimeDesc = 'EPISODES_BY_SEASON_ID__MIN_LAST_MISSING_NOTIFY_TIME_DESC',
  EpisodesBySeasonIdMinRawAirTimeAsc = 'EPISODES_BY_SEASON_ID__MIN_RAW_AIR_TIME_ASC',
  EpisodesBySeasonIdMinRawAirTimeDesc = 'EPISODES_BY_SEASON_ID__MIN_RAW_AIR_TIME_DESC',
  EpisodesBySeasonIdMinSeasonIdAsc = 'EPISODES_BY_SEASON_ID__MIN_SEASON_ID_ASC',
  EpisodesBySeasonIdMinSeasonIdDesc = 'EPISODES_BY_SEASON_ID__MIN_SEASON_ID_DESC',
  EpisodesBySeasonIdMinSourceDataAsc = 'EPISODES_BY_SEASON_ID__MIN_SOURCE_DATA_ASC',
  EpisodesBySeasonIdMinSourceDataDesc = 'EPISODES_BY_SEASON_ID__MIN_SOURCE_DATA_DESC',
  EpisodesBySeasonIdMinTitleAsc = 'EPISODES_BY_SEASON_ID__MIN_TITLE_ASC',
  EpisodesBySeasonIdMinTitleDesc = 'EPISODES_BY_SEASON_ID__MIN_TITLE_DESC',
  EpisodesLastSyncAsc = 'EPISODES_LAST_SYNC_ASC',
  EpisodesLastSyncDesc = 'EPISODES_LAST_SYNC_DESC',
  EpisodesSourceAsc = 'EPISODES_SOURCE_ASC',
  EpisodesSourceDesc = 'EPISODES_SOURCE_DESC',
  FanartImageIdAsc = 'FANART_IMAGE_ID_ASC',
  FanartImageIdDesc = 'FANART_IMAGE_ID_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  ImageByBannerImageIdCosPathAsc = 'IMAGE_BY_BANNER_IMAGE_ID__COS_PATH_ASC',
  ImageByBannerImageIdCosPathDesc = 'IMAGE_BY_BANNER_IMAGE_ID__COS_PATH_DESC',
  ImageByBannerImageIdCreatedAtAsc = 'IMAGE_BY_BANNER_IMAGE_ID__CREATED_AT_ASC',
  ImageByBannerImageIdCreatedAtDesc = 'IMAGE_BY_BANNER_IMAGE_ID__CREATED_AT_DESC',
  ImageByBannerImageIdHashAsc = 'IMAGE_BY_BANNER_IMAGE_ID__HASH_ASC',
  ImageByBannerImageIdHashDesc = 'IMAGE_BY_BANNER_IMAGE_ID__HASH_DESC',
  ImageByBannerImageIdIdAsc = 'IMAGE_BY_BANNER_IMAGE_ID__ID_ASC',
  ImageByBannerImageIdIdDesc = 'IMAGE_BY_BANNER_IMAGE_ID__ID_DESC',
  ImageByBannerImageIdSourceUrlAsc = 'IMAGE_BY_BANNER_IMAGE_ID__SOURCE_URL_ASC',
  ImageByBannerImageIdSourceUrlDesc = 'IMAGE_BY_BANNER_IMAGE_ID__SOURCE_URL_DESC',
  ImageByFanartImageIdCosPathAsc = 'IMAGE_BY_FANART_IMAGE_ID__COS_PATH_ASC',
  ImageByFanartImageIdCosPathDesc = 'IMAGE_BY_FANART_IMAGE_ID__COS_PATH_DESC',
  ImageByFanartImageIdCreatedAtAsc = 'IMAGE_BY_FANART_IMAGE_ID__CREATED_AT_ASC',
  ImageByFanartImageIdCreatedAtDesc = 'IMAGE_BY_FANART_IMAGE_ID__CREATED_AT_DESC',
  ImageByFanartImageIdHashAsc = 'IMAGE_BY_FANART_IMAGE_ID__HASH_ASC',
  ImageByFanartImageIdHashDesc = 'IMAGE_BY_FANART_IMAGE_ID__HASH_DESC',
  ImageByFanartImageIdIdAsc = 'IMAGE_BY_FANART_IMAGE_ID__ID_ASC',
  ImageByFanartImageIdIdDesc = 'IMAGE_BY_FANART_IMAGE_ID__ID_DESC',
  ImageByFanartImageIdSourceUrlAsc = 'IMAGE_BY_FANART_IMAGE_ID__SOURCE_URL_ASC',
  ImageByFanartImageIdSourceUrlDesc = 'IMAGE_BY_FANART_IMAGE_ID__SOURCE_URL_DESC',
  ImageByPosterImageIdCosPathAsc = 'IMAGE_BY_POSTER_IMAGE_ID__COS_PATH_ASC',
  ImageByPosterImageIdCosPathDesc = 'IMAGE_BY_POSTER_IMAGE_ID__COS_PATH_DESC',
  ImageByPosterImageIdCreatedAtAsc = 'IMAGE_BY_POSTER_IMAGE_ID__CREATED_AT_ASC',
  ImageByPosterImageIdCreatedAtDesc = 'IMAGE_BY_POSTER_IMAGE_ID__CREATED_AT_DESC',
  ImageByPosterImageIdHashAsc = 'IMAGE_BY_POSTER_IMAGE_ID__HASH_ASC',
  ImageByPosterImageIdHashDesc = 'IMAGE_BY_POSTER_IMAGE_ID__HASH_DESC',
  ImageByPosterImageIdIdAsc = 'IMAGE_BY_POSTER_IMAGE_ID__ID_ASC',
  ImageByPosterImageIdIdDesc = 'IMAGE_BY_POSTER_IMAGE_ID__ID_DESC',
  ImageByPosterImageIdSourceUrlAsc = 'IMAGE_BY_POSTER_IMAGE_ID__SOURCE_URL_ASC',
  ImageByPosterImageIdSourceUrlDesc = 'IMAGE_BY_POSTER_IMAGE_ID__SOURCE_URL_DESC',
  InfoSourceAsc = 'INFO_SOURCE_ASC',
  InfoSourceDesc = 'INFO_SOURCE_DESC',
  IntegrationsLaniaSyncAsc = 'INTEGRATIONS_LANIA_SYNC_ASC',
  IntegrationsLaniaSyncDesc = 'INTEGRATIONS_LANIA_SYNC_DESC',
  IsMonitoringAsc = 'IS_MONITORING_ASC',
  IsMonitoringDesc = 'IS_MONITORING_DESC',
  JellyfinFolderByJellyfinFolderIdIdAsc = 'JELLYFIN_FOLDER_BY_JELLYFIN_FOLDER_ID__ID_ASC',
  JellyfinFolderByJellyfinFolderIdIdDesc = 'JELLYFIN_FOLDER_BY_JELLYFIN_FOLDER_ID__ID_DESC',
  JellyfinFolderByJellyfinFolderIdIsDefaultAsc = 'JELLYFIN_FOLDER_BY_JELLYFIN_FOLDER_ID__IS_DEFAULT_ASC',
  JellyfinFolderByJellyfinFolderIdIsDefaultDesc = 'JELLYFIN_FOLDER_BY_JELLYFIN_FOLDER_ID__IS_DEFAULT_DESC',
  JellyfinFolderByJellyfinFolderIdIsHiddenAsc = 'JELLYFIN_FOLDER_BY_JELLYFIN_FOLDER_ID__IS_HIDDEN_ASC',
  JellyfinFolderByJellyfinFolderIdIsHiddenDesc = 'JELLYFIN_FOLDER_BY_JELLYFIN_FOLDER_ID__IS_HIDDEN_DESC',
  JellyfinFolderByJellyfinFolderIdJellyfinIdAsc = 'JELLYFIN_FOLDER_BY_JELLYFIN_FOLDER_ID__JELLYFIN_ID_ASC',
  JellyfinFolderByJellyfinFolderIdJellyfinIdDesc = 'JELLYFIN_FOLDER_BY_JELLYFIN_FOLDER_ID__JELLYFIN_ID_DESC',
  JellyfinFolderByJellyfinFolderIdLocationAsc = 'JELLYFIN_FOLDER_BY_JELLYFIN_FOLDER_ID__LOCATION_ASC',
  JellyfinFolderByJellyfinFolderIdLocationDesc = 'JELLYFIN_FOLDER_BY_JELLYFIN_FOLDER_ID__LOCATION_DESC',
  JellyfinFolderByJellyfinFolderIdNameAsc = 'JELLYFIN_FOLDER_BY_JELLYFIN_FOLDER_ID__NAME_ASC',
  JellyfinFolderByJellyfinFolderIdNameDesc = 'JELLYFIN_FOLDER_BY_JELLYFIN_FOLDER_ID__NAME_DESC',
  JellyfinFolderIdAsc = 'JELLYFIN_FOLDER_ID_ASC',
  JellyfinFolderIdDesc = 'JELLYFIN_FOLDER_ID_DESC',
  JellyfinIdAsc = 'JELLYFIN_ID_ASC',
  JellyfinIdDesc = 'JELLYFIN_ID_DESC',
  LastWriteDirectoryAsc = 'LAST_WRITE_DIRECTORY_ASC',
  LastWriteDirectoryDesc = 'LAST_WRITE_DIRECTORY_DESC',
  LastWriteTitleAsc = 'LAST_WRITE_TITLE_ASC',
  LastWriteTitleDesc = 'LAST_WRITE_TITLE_DESC',
  LastWriteToDiskAsc = 'LAST_WRITE_TO_DISK_ASC',
  LastWriteToDiskDesc = 'LAST_WRITE_TO_DISK_DESC',
  MikanAnimeIdAsc = 'MIKAN_ANIME_ID_ASC',
  MikanAnimeIdDesc = 'MIKAN_ANIME_ID_DESC',
  Natural = 'NATURAL',
  NeedDownloadCcAsc = 'NEED_DOWNLOAD_CC_ASC',
  NeedDownloadCcDesc = 'NEED_DOWNLOAD_CC_DESC',
  NotifyMissingAsc = 'NOTIFY_MISSING_ASC',
  NotifyMissingDesc = 'NOTIFY_MISSING_DESC',
  NotifyPublishAsc = 'NOTIFY_PUBLISH_ASC',
  NotifyPublishDesc = 'NOTIFY_PUBLISH_DESC',
  PosterImageIdAsc = 'POSTER_IMAGE_ID_ASC',
  PosterImageIdDesc = 'POSTER_IMAGE_ID_DESC',
  PremiereDateAsc = 'PREMIERE_DATE_ASC',
  PremiereDateDesc = 'PREMIERE_DATE_DESC',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  SmartDownloadEnabledAsc = 'SMART_DOWNLOAD_ENABLED_ASC',
  SmartDownloadEnabledDesc = 'SMART_DOWNLOAD_ENABLED_DESC',
  SmartDownloadPreferBahaAsc = 'SMART_DOWNLOAD_PREFER_BAHA_ASC',
  SmartDownloadPreferBahaDesc = 'SMART_DOWNLOAD_PREFER_BAHA_DESC',
  SmartDownloadSubtitleAsc = 'SMART_DOWNLOAD_SUBTITLE_ASC',
  SmartDownloadSubtitleDesc = 'SMART_DOWNLOAD_SUBTITLE_DESC',
  SmartDownloadTimeoutMinutesAsc = 'SMART_DOWNLOAD_TIMEOUT_MINUTES_ASC',
  SmartDownloadTimeoutMinutesDesc = 'SMART_DOWNLOAD_TIMEOUT_MINUTES_DESC',
  SmartDownloadWindowHoursAsc = 'SMART_DOWNLOAD_WINDOW_HOURS_ASC',
  SmartDownloadWindowHoursDesc = 'SMART_DOWNLOAD_WINDOW_HOURS_DESC',
  TagsAsc = 'TAGS_ASC',
  TagsDesc = 'TAGS_DESC',
  TitleAsc = 'TITLE_ASC',
  TitleDesc = 'TITLE_DESC',
  TorrentsByMatchedSeasonIdCountAsc = 'TORRENTS_BY_MATCHED_SEASON_ID__COUNT_ASC',
  TorrentsByMatchedSeasonIdCountDesc = 'TORRENTS_BY_MATCHED_SEASON_ID__COUNT_DESC',
  TorrentsByMatchedSeasonIdMaxChannelAsc = 'TORRENTS_BY_MATCHED_SEASON_ID__MAX_CHANNEL_ASC',
  TorrentsByMatchedSeasonIdMaxChannelDesc = 'TORRENTS_BY_MATCHED_SEASON_ID__MAX_CHANNEL_DESC',
  TorrentsByMatchedSeasonIdMaxCreatedAtAsc = 'TORRENTS_BY_MATCHED_SEASON_ID__MAX_CREATED_AT_ASC',
  TorrentsByMatchedSeasonIdMaxCreatedAtDesc = 'TORRENTS_BY_MATCHED_SEASON_ID__MAX_CREATED_AT_DESC',
  TorrentsByMatchedSeasonIdMaxDisplayIdAsc = 'TORRENTS_BY_MATCHED_SEASON_ID__MAX_DISPLAY_ID_ASC',
  TorrentsByMatchedSeasonIdMaxDisplayIdDesc = 'TORRENTS_BY_MATCHED_SEASON_ID__MAX_DISPLAY_ID_DESC',
  TorrentsByMatchedSeasonIdMaxEpisodeIndexAsc = 'TORRENTS_BY_MATCHED_SEASON_ID__MAX_EPISODE_INDEX_ASC',
  TorrentsByMatchedSeasonIdMaxEpisodeIndexDesc = 'TORRENTS_BY_MATCHED_SEASON_ID__MAX_EPISODE_INDEX_DESC',
  TorrentsByMatchedSeasonIdMaxEpisodeNumberAsc = 'TORRENTS_BY_MATCHED_SEASON_ID__MAX_EPISODE_NUMBER_ASC',
  TorrentsByMatchedSeasonIdMaxEpisodeNumberDesc = 'TORRENTS_BY_MATCHED_SEASON_ID__MAX_EPISODE_NUMBER_DESC',
  TorrentsByMatchedSeasonIdMaxEpisodeNumberFromAsc = 'TORRENTS_BY_MATCHED_SEASON_ID__MAX_EPISODE_NUMBER_FROM_ASC',
  TorrentsByMatchedSeasonIdMaxEpisodeNumberFromDesc = 'TORRENTS_BY_MATCHED_SEASON_ID__MAX_EPISODE_NUMBER_FROM_DESC',
  TorrentsByMatchedSeasonIdMaxEpisodeNumberToAsc = 'TORRENTS_BY_MATCHED_SEASON_ID__MAX_EPISODE_NUMBER_TO_ASC',
  TorrentsByMatchedSeasonIdMaxEpisodeNumberToDesc = 'TORRENTS_BY_MATCHED_SEASON_ID__MAX_EPISODE_NUMBER_TO_DESC',
  TorrentsByMatchedSeasonIdMaxEpisodeTypeAsc = 'TORRENTS_BY_MATCHED_SEASON_ID__MAX_EPISODE_TYPE_ASC',
  TorrentsByMatchedSeasonIdMaxEpisodeTypeDesc = 'TORRENTS_BY_MATCHED_SEASON_ID__MAX_EPISODE_TYPE_DESC',
  TorrentsByMatchedSeasonIdMaxFormatAudioEncodingAsc = 'TORRENTS_BY_MATCHED_SEASON_ID__MAX_FORMAT_AUDIO_ENCODING_ASC',
  TorrentsByMatchedSeasonIdMaxFormatAudioEncodingDesc = 'TORRENTS_BY_MATCHED_SEASON_ID__MAX_FORMAT_AUDIO_ENCODING_DESC',
  TorrentsByMatchedSeasonIdMaxFormatColorDepthAsc = 'TORRENTS_BY_MATCHED_SEASON_ID__MAX_FORMAT_COLOR_DEPTH_ASC',
  TorrentsByMatchedSeasonIdMaxFormatColorDepthDesc = 'TORRENTS_BY_MATCHED_SEASON_ID__MAX_FORMAT_COLOR_DEPTH_DESC',
  TorrentsByMatchedSeasonIdMaxFormatContainerAsc = 'TORRENTS_BY_MATCHED_SEASON_ID__MAX_FORMAT_CONTAINER_ASC',
  TorrentsByMatchedSeasonIdMaxFormatContainerDesc = 'TORRENTS_BY_MATCHED_SEASON_ID__MAX_FORMAT_CONTAINER_DESC',
  TorrentsByMatchedSeasonIdMaxFormatResolutionAsc = 'TORRENTS_BY_MATCHED_SEASON_ID__MAX_FORMAT_RESOLUTION_ASC',
  TorrentsByMatchedSeasonIdMaxFormatResolutionDesc = 'TORRENTS_BY_MATCHED_SEASON_ID__MAX_FORMAT_RESOLUTION_DESC',
  TorrentsByMatchedSeasonIdMaxFormatVideoEncodingAsc = 'TORRENTS_BY_MATCHED_SEASON_ID__MAX_FORMAT_VIDEO_ENCODING_ASC',
  TorrentsByMatchedSeasonIdMaxFormatVideoEncodingDesc = 'TORRENTS_BY_MATCHED_SEASON_ID__MAX_FORMAT_VIDEO_ENCODING_DESC',
  TorrentsByMatchedSeasonIdMaxHashAsc = 'TORRENTS_BY_MATCHED_SEASON_ID__MAX_HASH_ASC',
  TorrentsByMatchedSeasonIdMaxHashDesc = 'TORRENTS_BY_MATCHED_SEASON_ID__MAX_HASH_DESC',
  TorrentsByMatchedSeasonIdMaxIdAsc = 'TORRENTS_BY_MATCHED_SEASON_ID__MAX_ID_ASC',
  TorrentsByMatchedSeasonIdMaxIdDesc = 'TORRENTS_BY_MATCHED_SEASON_ID__MAX_ID_DESC',
  TorrentsByMatchedSeasonIdMaxIndexAsc = 'TORRENTS_BY_MATCHED_SEASON_ID__MAX_INDEX_ASC',
  TorrentsByMatchedSeasonIdMaxIndexDesc = 'TORRENTS_BY_MATCHED_SEASON_ID__MAX_INDEX_DESC',
  TorrentsByMatchedSeasonIdMaxIndexFromAsc = 'TORRENTS_BY_MATCHED_SEASON_ID__MAX_INDEX_FROM_ASC',
  TorrentsByMatchedSeasonIdMaxIndexFromDesc = 'TORRENTS_BY_MATCHED_SEASON_ID__MAX_INDEX_FROM_DESC',
  TorrentsByMatchedSeasonIdMaxIndexToAsc = 'TORRENTS_BY_MATCHED_SEASON_ID__MAX_INDEX_TO_ASC',
  TorrentsByMatchedSeasonIdMaxIndexToDesc = 'TORRENTS_BY_MATCHED_SEASON_ID__MAX_INDEX_TO_DESC',
  TorrentsByMatchedSeasonIdMaxMatchedAtAsc = 'TORRENTS_BY_MATCHED_SEASON_ID__MAX_MATCHED_AT_ASC',
  TorrentsByMatchedSeasonIdMaxMatchedAtDesc = 'TORRENTS_BY_MATCHED_SEASON_ID__MAX_MATCHED_AT_DESC',
  TorrentsByMatchedSeasonIdMaxMatchedSeasonIdAsc = 'TORRENTS_BY_MATCHED_SEASON_ID__MAX_MATCHED_SEASON_ID_ASC',
  TorrentsByMatchedSeasonIdMaxMatchedSeasonIdDesc = 'TORRENTS_BY_MATCHED_SEASON_ID__MAX_MATCHED_SEASON_ID_DESC',
  TorrentsByMatchedSeasonIdMaxMatchDetailsAsc = 'TORRENTS_BY_MATCHED_SEASON_ID__MAX_MATCH_DETAILS_ASC',
  TorrentsByMatchedSeasonIdMaxMatchDetailsDesc = 'TORRENTS_BY_MATCHED_SEASON_ID__MAX_MATCH_DETAILS_DESC',
  TorrentsByMatchedSeasonIdMaxMatchStatusAsc = 'TORRENTS_BY_MATCHED_SEASON_ID__MAX_MATCH_STATUS_ASC',
  TorrentsByMatchedSeasonIdMaxMatchStatusDesc = 'TORRENTS_BY_MATCHED_SEASON_ID__MAX_MATCH_STATUS_DESC',
  TorrentsByMatchedSeasonIdMaxMetadataAsc = 'TORRENTS_BY_MATCHED_SEASON_ID__MAX_METADATA_ASC',
  TorrentsByMatchedSeasonIdMaxMetadataDesc = 'TORRENTS_BY_MATCHED_SEASON_ID__MAX_METADATA_DESC',
  TorrentsByMatchedSeasonIdMaxMetadataErrorAsc = 'TORRENTS_BY_MATCHED_SEASON_ID__MAX_METADATA_ERROR_ASC',
  TorrentsByMatchedSeasonIdMaxMetadataErrorDesc = 'TORRENTS_BY_MATCHED_SEASON_ID__MAX_METADATA_ERROR_DESC',
  TorrentsByMatchedSeasonIdMaxMetadataFetchedAtAsc = 'TORRENTS_BY_MATCHED_SEASON_ID__MAX_METADATA_FETCHED_AT_ASC',
  TorrentsByMatchedSeasonIdMaxMetadataFetchedAtDesc = 'TORRENTS_BY_MATCHED_SEASON_ID__MAX_METADATA_FETCHED_AT_DESC',
  TorrentsByMatchedSeasonIdMaxMetadataStatusAsc = 'TORRENTS_BY_MATCHED_SEASON_ID__MAX_METADATA_STATUS_ASC',
  TorrentsByMatchedSeasonIdMaxMetadataStatusDesc = 'TORRENTS_BY_MATCHED_SEASON_ID__MAX_METADATA_STATUS_DESC',
  TorrentsByMatchedSeasonIdMaxOrganizationPartsAsc = 'TORRENTS_BY_MATCHED_SEASON_ID__MAX_ORGANIZATION_PARTS_ASC',
  TorrentsByMatchedSeasonIdMaxOrganizationPartsDesc = 'TORRENTS_BY_MATCHED_SEASON_ID__MAX_ORGANIZATION_PARTS_DESC',
  TorrentsByMatchedSeasonIdMaxOrganizationRawAsc = 'TORRENTS_BY_MATCHED_SEASON_ID__MAX_ORGANIZATION_RAW_ASC',
  TorrentsByMatchedSeasonIdMaxOrganizationRawDesc = 'TORRENTS_BY_MATCHED_SEASON_ID__MAX_ORGANIZATION_RAW_DESC',
  TorrentsByMatchedSeasonIdMaxParsedAtAsc = 'TORRENTS_BY_MATCHED_SEASON_ID__MAX_PARSED_AT_ASC',
  TorrentsByMatchedSeasonIdMaxParsedAtDesc = 'TORRENTS_BY_MATCHED_SEASON_ID__MAX_PARSED_AT_DESC',
  TorrentsByMatchedSeasonIdMaxParseResultAsc = 'TORRENTS_BY_MATCHED_SEASON_ID__MAX_PARSE_RESULT_ASC',
  TorrentsByMatchedSeasonIdMaxParseResultDesc = 'TORRENTS_BY_MATCHED_SEASON_ID__MAX_PARSE_RESULT_DESC',
  TorrentsByMatchedSeasonIdMaxParseVersionAsc = 'TORRENTS_BY_MATCHED_SEASON_ID__MAX_PARSE_VERSION_ASC',
  TorrentsByMatchedSeasonIdMaxParseVersionDesc = 'TORRENTS_BY_MATCHED_SEASON_ID__MAX_PARSE_VERSION_DESC',
  TorrentsByMatchedSeasonIdMaxPermalinkAsc = 'TORRENTS_BY_MATCHED_SEASON_ID__MAX_PERMALINK_ASC',
  TorrentsByMatchedSeasonIdMaxPermalinkDesc = 'TORRENTS_BY_MATCHED_SEASON_ID__MAX_PERMALINK_DESC',
  TorrentsByMatchedSeasonIdMaxPublishDateAsc = 'TORRENTS_BY_MATCHED_SEASON_ID__MAX_PUBLISH_DATE_ASC',
  TorrentsByMatchedSeasonIdMaxPublishDateDesc = 'TORRENTS_BY_MATCHED_SEASON_ID__MAX_PUBLISH_DATE_DESC',
  TorrentsByMatchedSeasonIdMaxSeasonTitleAliasesAsc = 'TORRENTS_BY_MATCHED_SEASON_ID__MAX_SEASON_TITLE_ALIASES_ASC',
  TorrentsByMatchedSeasonIdMaxSeasonTitleAliasesDesc = 'TORRENTS_BY_MATCHED_SEASON_ID__MAX_SEASON_TITLE_ALIASES_DESC',
  TorrentsByMatchedSeasonIdMaxSeasonTitleRawAsc = 'TORRENTS_BY_MATCHED_SEASON_ID__MAX_SEASON_TITLE_RAW_ASC',
  TorrentsByMatchedSeasonIdMaxSeasonTitleRawDesc = 'TORRENTS_BY_MATCHED_SEASON_ID__MAX_SEASON_TITLE_RAW_DESC',
  TorrentsByMatchedSeasonIdMaxSizeAsc = 'TORRENTS_BY_MATCHED_SEASON_ID__MAX_SIZE_ASC',
  TorrentsByMatchedSeasonIdMaxSizeDesc = 'TORRENTS_BY_MATCHED_SEASON_ID__MAX_SIZE_DESC',
  TorrentsByMatchedSeasonIdMaxSourcePlatformAsc = 'TORRENTS_BY_MATCHED_SEASON_ID__MAX_SOURCE_PLATFORM_ASC',
  TorrentsByMatchedSeasonIdMaxSourcePlatformDesc = 'TORRENTS_BY_MATCHED_SEASON_ID__MAX_SOURCE_PLATFORM_DESC',
  TorrentsByMatchedSeasonIdMaxSourceTypeAsc = 'TORRENTS_BY_MATCHED_SEASON_ID__MAX_SOURCE_TYPE_ASC',
  TorrentsByMatchedSeasonIdMaxSourceTypeDesc = 'TORRENTS_BY_MATCHED_SEASON_ID__MAX_SOURCE_TYPE_DESC',
  TorrentsByMatchedSeasonIdMaxSubtitleHasChsAsc = 'TORRENTS_BY_MATCHED_SEASON_ID__MAX_SUBTITLE_HAS_CHS_ASC',
  TorrentsByMatchedSeasonIdMaxSubtitleHasChsDesc = 'TORRENTS_BY_MATCHED_SEASON_ID__MAX_SUBTITLE_HAS_CHS_DESC',
  TorrentsByMatchedSeasonIdMaxSubtitleHasChtAsc = 'TORRENTS_BY_MATCHED_SEASON_ID__MAX_SUBTITLE_HAS_CHT_ASC',
  TorrentsByMatchedSeasonIdMaxSubtitleHasChtDesc = 'TORRENTS_BY_MATCHED_SEASON_ID__MAX_SUBTITLE_HAS_CHT_DESC',
  TorrentsByMatchedSeasonIdMaxSubtitleHasJpAsc = 'TORRENTS_BY_MATCHED_SEASON_ID__MAX_SUBTITLE_HAS_JP_ASC',
  TorrentsByMatchedSeasonIdMaxSubtitleHasJpDesc = 'TORRENTS_BY_MATCHED_SEASON_ID__MAX_SUBTITLE_HAS_JP_DESC',
  TorrentsByMatchedSeasonIdMaxSubtitleTypeAsc = 'TORRENTS_BY_MATCHED_SEASON_ID__MAX_SUBTITLE_TYPE_ASC',
  TorrentsByMatchedSeasonIdMaxSubtitleTypeDesc = 'TORRENTS_BY_MATCHED_SEASON_ID__MAX_SUBTITLE_TYPE_DESC',
  TorrentsByMatchedSeasonIdMaxTitleAsc = 'TORRENTS_BY_MATCHED_SEASON_ID__MAX_TITLE_ASC',
  TorrentsByMatchedSeasonIdMaxTitleDesc = 'TORRENTS_BY_MATCHED_SEASON_ID__MAX_TITLE_DESC',
  TorrentsByMatchedSeasonIdMaxTorrentLinkAsc = 'TORRENTS_BY_MATCHED_SEASON_ID__MAX_TORRENT_LINK_ASC',
  TorrentsByMatchedSeasonIdMaxTorrentLinkDesc = 'TORRENTS_BY_MATCHED_SEASON_ID__MAX_TORRENT_LINK_DESC',
  TorrentsByMatchedSeasonIdMinChannelAsc = 'TORRENTS_BY_MATCHED_SEASON_ID__MIN_CHANNEL_ASC',
  TorrentsByMatchedSeasonIdMinChannelDesc = 'TORRENTS_BY_MATCHED_SEASON_ID__MIN_CHANNEL_DESC',
  TorrentsByMatchedSeasonIdMinCreatedAtAsc = 'TORRENTS_BY_MATCHED_SEASON_ID__MIN_CREATED_AT_ASC',
  TorrentsByMatchedSeasonIdMinCreatedAtDesc = 'TORRENTS_BY_MATCHED_SEASON_ID__MIN_CREATED_AT_DESC',
  TorrentsByMatchedSeasonIdMinDisplayIdAsc = 'TORRENTS_BY_MATCHED_SEASON_ID__MIN_DISPLAY_ID_ASC',
  TorrentsByMatchedSeasonIdMinDisplayIdDesc = 'TORRENTS_BY_MATCHED_SEASON_ID__MIN_DISPLAY_ID_DESC',
  TorrentsByMatchedSeasonIdMinEpisodeIndexAsc = 'TORRENTS_BY_MATCHED_SEASON_ID__MIN_EPISODE_INDEX_ASC',
  TorrentsByMatchedSeasonIdMinEpisodeIndexDesc = 'TORRENTS_BY_MATCHED_SEASON_ID__MIN_EPISODE_INDEX_DESC',
  TorrentsByMatchedSeasonIdMinEpisodeNumberAsc = 'TORRENTS_BY_MATCHED_SEASON_ID__MIN_EPISODE_NUMBER_ASC',
  TorrentsByMatchedSeasonIdMinEpisodeNumberDesc = 'TORRENTS_BY_MATCHED_SEASON_ID__MIN_EPISODE_NUMBER_DESC',
  TorrentsByMatchedSeasonIdMinEpisodeNumberFromAsc = 'TORRENTS_BY_MATCHED_SEASON_ID__MIN_EPISODE_NUMBER_FROM_ASC',
  TorrentsByMatchedSeasonIdMinEpisodeNumberFromDesc = 'TORRENTS_BY_MATCHED_SEASON_ID__MIN_EPISODE_NUMBER_FROM_DESC',
  TorrentsByMatchedSeasonIdMinEpisodeNumberToAsc = 'TORRENTS_BY_MATCHED_SEASON_ID__MIN_EPISODE_NUMBER_TO_ASC',
  TorrentsByMatchedSeasonIdMinEpisodeNumberToDesc = 'TORRENTS_BY_MATCHED_SEASON_ID__MIN_EPISODE_NUMBER_TO_DESC',
  TorrentsByMatchedSeasonIdMinEpisodeTypeAsc = 'TORRENTS_BY_MATCHED_SEASON_ID__MIN_EPISODE_TYPE_ASC',
  TorrentsByMatchedSeasonIdMinEpisodeTypeDesc = 'TORRENTS_BY_MATCHED_SEASON_ID__MIN_EPISODE_TYPE_DESC',
  TorrentsByMatchedSeasonIdMinFormatAudioEncodingAsc = 'TORRENTS_BY_MATCHED_SEASON_ID__MIN_FORMAT_AUDIO_ENCODING_ASC',
  TorrentsByMatchedSeasonIdMinFormatAudioEncodingDesc = 'TORRENTS_BY_MATCHED_SEASON_ID__MIN_FORMAT_AUDIO_ENCODING_DESC',
  TorrentsByMatchedSeasonIdMinFormatColorDepthAsc = 'TORRENTS_BY_MATCHED_SEASON_ID__MIN_FORMAT_COLOR_DEPTH_ASC',
  TorrentsByMatchedSeasonIdMinFormatColorDepthDesc = 'TORRENTS_BY_MATCHED_SEASON_ID__MIN_FORMAT_COLOR_DEPTH_DESC',
  TorrentsByMatchedSeasonIdMinFormatContainerAsc = 'TORRENTS_BY_MATCHED_SEASON_ID__MIN_FORMAT_CONTAINER_ASC',
  TorrentsByMatchedSeasonIdMinFormatContainerDesc = 'TORRENTS_BY_MATCHED_SEASON_ID__MIN_FORMAT_CONTAINER_DESC',
  TorrentsByMatchedSeasonIdMinFormatResolutionAsc = 'TORRENTS_BY_MATCHED_SEASON_ID__MIN_FORMAT_RESOLUTION_ASC',
  TorrentsByMatchedSeasonIdMinFormatResolutionDesc = 'TORRENTS_BY_MATCHED_SEASON_ID__MIN_FORMAT_RESOLUTION_DESC',
  TorrentsByMatchedSeasonIdMinFormatVideoEncodingAsc = 'TORRENTS_BY_MATCHED_SEASON_ID__MIN_FORMAT_VIDEO_ENCODING_ASC',
  TorrentsByMatchedSeasonIdMinFormatVideoEncodingDesc = 'TORRENTS_BY_MATCHED_SEASON_ID__MIN_FORMAT_VIDEO_ENCODING_DESC',
  TorrentsByMatchedSeasonIdMinHashAsc = 'TORRENTS_BY_MATCHED_SEASON_ID__MIN_HASH_ASC',
  TorrentsByMatchedSeasonIdMinHashDesc = 'TORRENTS_BY_MATCHED_SEASON_ID__MIN_HASH_DESC',
  TorrentsByMatchedSeasonIdMinIdAsc = 'TORRENTS_BY_MATCHED_SEASON_ID__MIN_ID_ASC',
  TorrentsByMatchedSeasonIdMinIdDesc = 'TORRENTS_BY_MATCHED_SEASON_ID__MIN_ID_DESC',
  TorrentsByMatchedSeasonIdMinIndexAsc = 'TORRENTS_BY_MATCHED_SEASON_ID__MIN_INDEX_ASC',
  TorrentsByMatchedSeasonIdMinIndexDesc = 'TORRENTS_BY_MATCHED_SEASON_ID__MIN_INDEX_DESC',
  TorrentsByMatchedSeasonIdMinIndexFromAsc = 'TORRENTS_BY_MATCHED_SEASON_ID__MIN_INDEX_FROM_ASC',
  TorrentsByMatchedSeasonIdMinIndexFromDesc = 'TORRENTS_BY_MATCHED_SEASON_ID__MIN_INDEX_FROM_DESC',
  TorrentsByMatchedSeasonIdMinIndexToAsc = 'TORRENTS_BY_MATCHED_SEASON_ID__MIN_INDEX_TO_ASC',
  TorrentsByMatchedSeasonIdMinIndexToDesc = 'TORRENTS_BY_MATCHED_SEASON_ID__MIN_INDEX_TO_DESC',
  TorrentsByMatchedSeasonIdMinMatchedAtAsc = 'TORRENTS_BY_MATCHED_SEASON_ID__MIN_MATCHED_AT_ASC',
  TorrentsByMatchedSeasonIdMinMatchedAtDesc = 'TORRENTS_BY_MATCHED_SEASON_ID__MIN_MATCHED_AT_DESC',
  TorrentsByMatchedSeasonIdMinMatchedSeasonIdAsc = 'TORRENTS_BY_MATCHED_SEASON_ID__MIN_MATCHED_SEASON_ID_ASC',
  TorrentsByMatchedSeasonIdMinMatchedSeasonIdDesc = 'TORRENTS_BY_MATCHED_SEASON_ID__MIN_MATCHED_SEASON_ID_DESC',
  TorrentsByMatchedSeasonIdMinMatchDetailsAsc = 'TORRENTS_BY_MATCHED_SEASON_ID__MIN_MATCH_DETAILS_ASC',
  TorrentsByMatchedSeasonIdMinMatchDetailsDesc = 'TORRENTS_BY_MATCHED_SEASON_ID__MIN_MATCH_DETAILS_DESC',
  TorrentsByMatchedSeasonIdMinMatchStatusAsc = 'TORRENTS_BY_MATCHED_SEASON_ID__MIN_MATCH_STATUS_ASC',
  TorrentsByMatchedSeasonIdMinMatchStatusDesc = 'TORRENTS_BY_MATCHED_SEASON_ID__MIN_MATCH_STATUS_DESC',
  TorrentsByMatchedSeasonIdMinMetadataAsc = 'TORRENTS_BY_MATCHED_SEASON_ID__MIN_METADATA_ASC',
  TorrentsByMatchedSeasonIdMinMetadataDesc = 'TORRENTS_BY_MATCHED_SEASON_ID__MIN_METADATA_DESC',
  TorrentsByMatchedSeasonIdMinMetadataErrorAsc = 'TORRENTS_BY_MATCHED_SEASON_ID__MIN_METADATA_ERROR_ASC',
  TorrentsByMatchedSeasonIdMinMetadataErrorDesc = 'TORRENTS_BY_MATCHED_SEASON_ID__MIN_METADATA_ERROR_DESC',
  TorrentsByMatchedSeasonIdMinMetadataFetchedAtAsc = 'TORRENTS_BY_MATCHED_SEASON_ID__MIN_METADATA_FETCHED_AT_ASC',
  TorrentsByMatchedSeasonIdMinMetadataFetchedAtDesc = 'TORRENTS_BY_MATCHED_SEASON_ID__MIN_METADATA_FETCHED_AT_DESC',
  TorrentsByMatchedSeasonIdMinMetadataStatusAsc = 'TORRENTS_BY_MATCHED_SEASON_ID__MIN_METADATA_STATUS_ASC',
  TorrentsByMatchedSeasonIdMinMetadataStatusDesc = 'TORRENTS_BY_MATCHED_SEASON_ID__MIN_METADATA_STATUS_DESC',
  TorrentsByMatchedSeasonIdMinOrganizationPartsAsc = 'TORRENTS_BY_MATCHED_SEASON_ID__MIN_ORGANIZATION_PARTS_ASC',
  TorrentsByMatchedSeasonIdMinOrganizationPartsDesc = 'TORRENTS_BY_MATCHED_SEASON_ID__MIN_ORGANIZATION_PARTS_DESC',
  TorrentsByMatchedSeasonIdMinOrganizationRawAsc = 'TORRENTS_BY_MATCHED_SEASON_ID__MIN_ORGANIZATION_RAW_ASC',
  TorrentsByMatchedSeasonIdMinOrganizationRawDesc = 'TORRENTS_BY_MATCHED_SEASON_ID__MIN_ORGANIZATION_RAW_DESC',
  TorrentsByMatchedSeasonIdMinParsedAtAsc = 'TORRENTS_BY_MATCHED_SEASON_ID__MIN_PARSED_AT_ASC',
  TorrentsByMatchedSeasonIdMinParsedAtDesc = 'TORRENTS_BY_MATCHED_SEASON_ID__MIN_PARSED_AT_DESC',
  TorrentsByMatchedSeasonIdMinParseResultAsc = 'TORRENTS_BY_MATCHED_SEASON_ID__MIN_PARSE_RESULT_ASC',
  TorrentsByMatchedSeasonIdMinParseResultDesc = 'TORRENTS_BY_MATCHED_SEASON_ID__MIN_PARSE_RESULT_DESC',
  TorrentsByMatchedSeasonIdMinParseVersionAsc = 'TORRENTS_BY_MATCHED_SEASON_ID__MIN_PARSE_VERSION_ASC',
  TorrentsByMatchedSeasonIdMinParseVersionDesc = 'TORRENTS_BY_MATCHED_SEASON_ID__MIN_PARSE_VERSION_DESC',
  TorrentsByMatchedSeasonIdMinPermalinkAsc = 'TORRENTS_BY_MATCHED_SEASON_ID__MIN_PERMALINK_ASC',
  TorrentsByMatchedSeasonIdMinPermalinkDesc = 'TORRENTS_BY_MATCHED_SEASON_ID__MIN_PERMALINK_DESC',
  TorrentsByMatchedSeasonIdMinPublishDateAsc = 'TORRENTS_BY_MATCHED_SEASON_ID__MIN_PUBLISH_DATE_ASC',
  TorrentsByMatchedSeasonIdMinPublishDateDesc = 'TORRENTS_BY_MATCHED_SEASON_ID__MIN_PUBLISH_DATE_DESC',
  TorrentsByMatchedSeasonIdMinSeasonTitleAliasesAsc = 'TORRENTS_BY_MATCHED_SEASON_ID__MIN_SEASON_TITLE_ALIASES_ASC',
  TorrentsByMatchedSeasonIdMinSeasonTitleAliasesDesc = 'TORRENTS_BY_MATCHED_SEASON_ID__MIN_SEASON_TITLE_ALIASES_DESC',
  TorrentsByMatchedSeasonIdMinSeasonTitleRawAsc = 'TORRENTS_BY_MATCHED_SEASON_ID__MIN_SEASON_TITLE_RAW_ASC',
  TorrentsByMatchedSeasonIdMinSeasonTitleRawDesc = 'TORRENTS_BY_MATCHED_SEASON_ID__MIN_SEASON_TITLE_RAW_DESC',
  TorrentsByMatchedSeasonIdMinSizeAsc = 'TORRENTS_BY_MATCHED_SEASON_ID__MIN_SIZE_ASC',
  TorrentsByMatchedSeasonIdMinSizeDesc = 'TORRENTS_BY_MATCHED_SEASON_ID__MIN_SIZE_DESC',
  TorrentsByMatchedSeasonIdMinSourcePlatformAsc = 'TORRENTS_BY_MATCHED_SEASON_ID__MIN_SOURCE_PLATFORM_ASC',
  TorrentsByMatchedSeasonIdMinSourcePlatformDesc = 'TORRENTS_BY_MATCHED_SEASON_ID__MIN_SOURCE_PLATFORM_DESC',
  TorrentsByMatchedSeasonIdMinSourceTypeAsc = 'TORRENTS_BY_MATCHED_SEASON_ID__MIN_SOURCE_TYPE_ASC',
  TorrentsByMatchedSeasonIdMinSourceTypeDesc = 'TORRENTS_BY_MATCHED_SEASON_ID__MIN_SOURCE_TYPE_DESC',
  TorrentsByMatchedSeasonIdMinSubtitleHasChsAsc = 'TORRENTS_BY_MATCHED_SEASON_ID__MIN_SUBTITLE_HAS_CHS_ASC',
  TorrentsByMatchedSeasonIdMinSubtitleHasChsDesc = 'TORRENTS_BY_MATCHED_SEASON_ID__MIN_SUBTITLE_HAS_CHS_DESC',
  TorrentsByMatchedSeasonIdMinSubtitleHasChtAsc = 'TORRENTS_BY_MATCHED_SEASON_ID__MIN_SUBTITLE_HAS_CHT_ASC',
  TorrentsByMatchedSeasonIdMinSubtitleHasChtDesc = 'TORRENTS_BY_MATCHED_SEASON_ID__MIN_SUBTITLE_HAS_CHT_DESC',
  TorrentsByMatchedSeasonIdMinSubtitleHasJpAsc = 'TORRENTS_BY_MATCHED_SEASON_ID__MIN_SUBTITLE_HAS_JP_ASC',
  TorrentsByMatchedSeasonIdMinSubtitleHasJpDesc = 'TORRENTS_BY_MATCHED_SEASON_ID__MIN_SUBTITLE_HAS_JP_DESC',
  TorrentsByMatchedSeasonIdMinSubtitleTypeAsc = 'TORRENTS_BY_MATCHED_SEASON_ID__MIN_SUBTITLE_TYPE_ASC',
  TorrentsByMatchedSeasonIdMinSubtitleTypeDesc = 'TORRENTS_BY_MATCHED_SEASON_ID__MIN_SUBTITLE_TYPE_DESC',
  TorrentsByMatchedSeasonIdMinTitleAsc = 'TORRENTS_BY_MATCHED_SEASON_ID__MIN_TITLE_ASC',
  TorrentsByMatchedSeasonIdMinTitleDesc = 'TORRENTS_BY_MATCHED_SEASON_ID__MIN_TITLE_DESC',
  TorrentsByMatchedSeasonIdMinTorrentLinkAsc = 'TORRENTS_BY_MATCHED_SEASON_ID__MIN_TORRENT_LINK_ASC',
  TorrentsByMatchedSeasonIdMinTorrentLinkDesc = 'TORRENTS_BY_MATCHED_SEASON_ID__MIN_TORRENT_LINK_DESC',
  TvdbIdAsc = 'TVDB_ID_ASC',
  TvdbIdDesc = 'TVDB_ID_DESC',
  TvdbSeasonAsc = 'TVDB_SEASON_ASC',
  TvdbSeasonDesc = 'TVDB_SEASON_DESC',
  WeekdayAsc = 'WEEKDAY_ASC',
  WeekdayDesc = 'WEEKDAY_DESC',
  YearAndSemesterAsc = 'YEAR_AND_SEMESTER_ASC',
  YearAndSemesterCanonicalAsc = 'YEAR_AND_SEMESTER_CANONICAL_ASC',
  YearAndSemesterCanonicalDesc = 'YEAR_AND_SEMESTER_CANONICAL_DESC',
  YearAndSemesterDesc = 'YEAR_AND_SEMESTER_DESC'
}

/** A filter to be used against String fields. All fields are combined with a logical ‘and.’ */
export type StringFilter = {
  /** Not equal to the specified value, treating null like an ordinary value. */
  distinctFrom?: InputMaybe<Scalars['String']>;
  /** Not equal to the specified value, treating null like an ordinary value (case-insensitive). */
  distinctFromInsensitive?: InputMaybe<Scalars['String']>;
  /** Ends with the specified string (case-sensitive). */
  endsWith?: InputMaybe<Scalars['String']>;
  /** Ends with the specified string (case-insensitive). */
  endsWithInsensitive?: InputMaybe<Scalars['String']>;
  /** Equal to the specified value. */
  equalTo?: InputMaybe<Scalars['String']>;
  /** Equal to the specified value (case-insensitive). */
  equalToInsensitive?: InputMaybe<Scalars['String']>;
  /** Greater than the specified value. */
  greaterThan?: InputMaybe<Scalars['String']>;
  /** Greater than the specified value (case-insensitive). */
  greaterThanInsensitive?: InputMaybe<Scalars['String']>;
  /** Greater than or equal to the specified value. */
  greaterThanOrEqualTo?: InputMaybe<Scalars['String']>;
  /** Greater than or equal to the specified value (case-insensitive). */
  greaterThanOrEqualToInsensitive?: InputMaybe<Scalars['String']>;
  /** Included in the specified list. */
  in?: InputMaybe<Array<Scalars['String']>>;
  /** Included in the specified list (case-insensitive). */
  inInsensitive?: InputMaybe<Array<Scalars['String']>>;
  /** Contains the specified string (case-sensitive). */
  includes?: InputMaybe<Scalars['String']>;
  /** Contains the specified string (case-insensitive). */
  includesInsensitive?: InputMaybe<Scalars['String']>;
  /** Is null (if `true` is specified) or is not null (if `false` is specified). */
  isNull?: InputMaybe<Scalars['Boolean']>;
  /** Less than the specified value. */
  lessThan?: InputMaybe<Scalars['String']>;
  /** Less than the specified value (case-insensitive). */
  lessThanInsensitive?: InputMaybe<Scalars['String']>;
  /** Less than or equal to the specified value. */
  lessThanOrEqualTo?: InputMaybe<Scalars['String']>;
  /** Less than or equal to the specified value (case-insensitive). */
  lessThanOrEqualToInsensitive?: InputMaybe<Scalars['String']>;
  /** Matches the specified pattern (case-sensitive). An underscore (_) matches any single character; a percent sign (%) matches any sequence of zero or more characters. */
  like?: InputMaybe<Scalars['String']>;
  /** Matches the specified pattern (case-insensitive). An underscore (_) matches any single character; a percent sign (%) matches any sequence of zero or more characters. */
  likeInsensitive?: InputMaybe<Scalars['String']>;
  /** Equal to the specified value, treating null like an ordinary value. */
  notDistinctFrom?: InputMaybe<Scalars['String']>;
  /** Equal to the specified value, treating null like an ordinary value (case-insensitive). */
  notDistinctFromInsensitive?: InputMaybe<Scalars['String']>;
  /** Does not end with the specified string (case-sensitive). */
  notEndsWith?: InputMaybe<Scalars['String']>;
  /** Does not end with the specified string (case-insensitive). */
  notEndsWithInsensitive?: InputMaybe<Scalars['String']>;
  /** Not equal to the specified value. */
  notEqualTo?: InputMaybe<Scalars['String']>;
  /** Not equal to the specified value (case-insensitive). */
  notEqualToInsensitive?: InputMaybe<Scalars['String']>;
  /** Not included in the specified list. */
  notIn?: InputMaybe<Array<Scalars['String']>>;
  /** Not included in the specified list (case-insensitive). */
  notInInsensitive?: InputMaybe<Array<Scalars['String']>>;
  /** Does not contain the specified string (case-sensitive). */
  notIncludes?: InputMaybe<Scalars['String']>;
  /** Does not contain the specified string (case-insensitive). */
  notIncludesInsensitive?: InputMaybe<Scalars['String']>;
  /** Does not match the specified pattern (case-sensitive). An underscore (_) matches any single character; a percent sign (%) matches any sequence of zero or more characters. */
  notLike?: InputMaybe<Scalars['String']>;
  /** Does not match the specified pattern (case-insensitive). An underscore (_) matches any single character; a percent sign (%) matches any sequence of zero or more characters. */
  notLikeInsensitive?: InputMaybe<Scalars['String']>;
  /** Does not start with the specified string (case-sensitive). */
  notStartsWith?: InputMaybe<Scalars['String']>;
  /** Does not start with the specified string (case-insensitive). */
  notStartsWithInsensitive?: InputMaybe<Scalars['String']>;
  /** Starts with the specified string (case-sensitive). */
  startsWith?: InputMaybe<Scalars['String']>;
  /** Starts with the specified string (case-insensitive). */
  startsWithInsensitive?: InputMaybe<Scalars['String']>;
};

/** A filter to be used against String List fields. All fields are combined with a logical ‘and.’ */
export type StringListFilter = {
  /** Any array item is equal to the specified value. */
  anyEqualTo?: InputMaybe<Scalars['String']>;
  /** Any array item is greater than the specified value. */
  anyGreaterThan?: InputMaybe<Scalars['String']>;
  /** Any array item is greater than or equal to the specified value. */
  anyGreaterThanOrEqualTo?: InputMaybe<Scalars['String']>;
  /** Any array item is less than the specified value. */
  anyLessThan?: InputMaybe<Scalars['String']>;
  /** Any array item is less than or equal to the specified value. */
  anyLessThanOrEqualTo?: InputMaybe<Scalars['String']>;
  /** Any array item is not equal to the specified value. */
  anyNotEqualTo?: InputMaybe<Scalars['String']>;
  /** Contained by the specified list of values. */
  containedBy?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Contains the specified list of values. */
  contains?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Not equal to the specified value, treating null like an ordinary value. */
  distinctFrom?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Equal to the specified value. */
  equalTo?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Greater than the specified value. */
  greaterThan?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Greater than or equal to the specified value. */
  greaterThanOrEqualTo?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Is null (if `true` is specified) or is not null (if `false` is specified). */
  isNull?: InputMaybe<Scalars['Boolean']>;
  /** Less than the specified value. */
  lessThan?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Less than or equal to the specified value. */
  lessThanOrEqualTo?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Equal to the specified value, treating null like an ordinary value. */
  notDistinctFrom?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Not equal to the specified value. */
  notEqualTo?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Overlaps the specified list of values. */
  overlaps?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
};

export type Task = Node & {
  __typename?: 'Task';
  batchEntries?: Maybe<Scalars['JSON']>;
  cancelledAt?: Maybe<Scalars['Datetime']>;
  createdAt: Scalars['Datetime'];
  /**
   * Only available after torrent finished downloading.
   * This is the save_path from qbt, which might be a directory.
   * If job is started after this step, this field will also be null.
   */
  downloadPath?: Maybe<Scalars['String']>;
  downloadTimeoutMinutes?: Maybe<Scalars['Int']>;
  /** Reads a single `Episode` that is related to this `Task`. */
  episodeByEpisodeId?: Maybe<Episode>;
  episodeId?: Maybe<Scalars['Int']>;
  failedAt?: Maybe<Scalars['Datetime']>;
  failedReason: Scalars['String'];
  /**
   * Available after file is imported (hard-linked) (and torrent is deleted from qbt).
   * The value is path to the video file, with the extension.
   */
  filePath?: Maybe<Scalars['String']>;
  id: Scalars['Int'];
  importPath?: Maybe<Scalars['String']>;
  isCancelled: Scalars['Boolean'];
  isFailed: Scalars['Boolean'];
  isSmartDownload: Scalars['Boolean'];
  jellyfinEpisodeId?: Maybe<Scalars['String']>;
  legacyStage: LegacyTaskStage;
  nfoPath?: Maybe<Scalars['String']>;
  /** A globally unique identifier. Can be used in various places throughout the system to identify this single value. */
  nodeId: Scalars['ID'];
  qbtLastSync?: Maybe<Scalars['Datetime']>;
  /**
   * Available as soon as torrent has been submitted to qbt.
   * This hash is used to query qbt, and might differ from torrents.hash
   * If job is started after this step, this field will be null.
   */
  qbtTorrentHash?: Maybe<Scalars['String']>;
  smartDownloadDecision?: Maybe<Scalars['JSON']>;
  smartDownloadTorrentHash?: Maybe<Scalars['String']>;
  sourcePath?: Maybe<Scalars['String']>;
  statusSummary?: Maybe<Scalars['TaskSummary']>;
  /** Reads and enables pagination through a set of `TaskEpisode`. */
  taskEpisodesByTaskId: TaskEpisodesConnection;
  torrentLink?: Maybe<Scalars['String']>;
  torrentTitle?: Maybe<Scalars['String']>;
  type: TaskType;
  updatedAt: Scalars['Datetime'];
  version: Scalars['Int'];
  workflow?: Maybe<Scalars['JSON']>;
};


export type TaskTaskEpisodesByTaskIdArgs = {
  after?: InputMaybe<Scalars['Cursor']>;
  before?: InputMaybe<Scalars['Cursor']>;
  condition?: InputMaybe<TaskEpisodeCondition>;
  filter?: InputMaybe<TaskEpisodeFilter>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<TaskEpisodesOrderBy>>;
};

/** A condition to be used against `Task` object types. All fields are tested for equality and combined with a logical ‘and.’ */
export type TaskCondition = {
  /** Checks for equality with the object’s `batchEntries` field. */
  batchEntries?: InputMaybe<Scalars['JSON']>;
  /** Checks for equality with the object’s `cancelledAt` field. */
  cancelledAt?: InputMaybe<Scalars['Datetime']>;
  /** Checks for equality with the object’s `createdAt` field. */
  createdAt?: InputMaybe<Scalars['Datetime']>;
  /** Checks for equality with the object’s `downloadPath` field. */
  downloadPath?: InputMaybe<Scalars['String']>;
  /** Checks for equality with the object’s `downloadTimeoutMinutes` field. */
  downloadTimeoutMinutes?: InputMaybe<Scalars['Int']>;
  /** Checks for equality with the object’s `episodeId` field. */
  episodeId?: InputMaybe<Scalars['Int']>;
  /** Checks for equality with the object’s `failedAt` field. */
  failedAt?: InputMaybe<Scalars['Datetime']>;
  /** Checks for equality with the object’s `failedReason` field. */
  failedReason?: InputMaybe<Scalars['String']>;
  /** Checks for equality with the object’s `filePath` field. */
  filePath?: InputMaybe<Scalars['String']>;
  /** Checks for equality with the object’s `id` field. */
  id?: InputMaybe<Scalars['Int']>;
  /** Checks for equality with the object’s `importPath` field. */
  importPath?: InputMaybe<Scalars['String']>;
  /** Checks for equality with the object’s `isCancelled` field. */
  isCancelled?: InputMaybe<Scalars['Boolean']>;
  /** Checks for equality with the object’s `isFailed` field. */
  isFailed?: InputMaybe<Scalars['Boolean']>;
  /** Checks for equality with the object’s `isSmartDownload` field. */
  isSmartDownload?: InputMaybe<Scalars['Boolean']>;
  /** Checks for equality with the object’s `jellyfinEpisodeId` field. */
  jellyfinEpisodeId?: InputMaybe<Scalars['String']>;
  /** Checks for equality with the object’s `legacyStage` field. */
  legacyStage?: InputMaybe<LegacyTaskStage>;
  /** Checks for equality with the object’s `nfoPath` field. */
  nfoPath?: InputMaybe<Scalars['String']>;
  /** Checks for equality with the object’s `qbtLastSync` field. */
  qbtLastSync?: InputMaybe<Scalars['Datetime']>;
  /** Checks for equality with the object’s `qbtTorrentHash` field. */
  qbtTorrentHash?: InputMaybe<Scalars['String']>;
  /** Checks for equality with the object’s `smartDownloadDecision` field. */
  smartDownloadDecision?: InputMaybe<Scalars['JSON']>;
  /** Checks for equality with the object’s `smartDownloadTorrentHash` field. */
  smartDownloadTorrentHash?: InputMaybe<Scalars['String']>;
  /** Checks for equality with the object’s `sourcePath` field. */
  sourcePath?: InputMaybe<Scalars['String']>;
  /** Checks for equality with the object’s `torrentLink` field. */
  torrentLink?: InputMaybe<Scalars['String']>;
  /** Checks for equality with the object’s `torrentTitle` field. */
  torrentTitle?: InputMaybe<Scalars['String']>;
  /** Checks for equality with the object’s `type` field. */
  type?: InputMaybe<TaskType>;
  /** Checks for equality with the object’s `updatedAt` field. */
  updatedAt?: InputMaybe<Scalars['Datetime']>;
  /** Checks for equality with the object’s `version` field. */
  version?: InputMaybe<Scalars['Int']>;
  /** Checks for equality with the object’s `workflow` field. */
  workflow?: InputMaybe<Scalars['JSON']>;
};

export type TaskEpisode = Node & {
  __typename?: 'TaskEpisode';
  /** Reads a single `Episode` that is related to this `TaskEpisode`. */
  episodeByEpisodeId?: Maybe<Episode>;
  episodeId: Scalars['Int'];
  /** A globally unique identifier. Can be used in various places throughout the system to identify this single value. */
  nodeId: Scalars['ID'];
  /** Reads a single `Task` that is related to this `TaskEpisode`. */
  taskByTaskId?: Maybe<Task>;
  taskId: Scalars['Int'];
};

/**
 * A condition to be used against `TaskEpisode` object types. All fields are tested
 * for equality and combined with a logical ‘and.’
 */
export type TaskEpisodeCondition = {
  /** Checks for equality with the object’s `episodeId` field. */
  episodeId?: InputMaybe<Scalars['Int']>;
  /** Checks for equality with the object’s `taskId` field. */
  taskId?: InputMaybe<Scalars['Int']>;
};

/** A filter to be used against `TaskEpisode` object types. All fields are combined with a logical ‘and.’ */
export type TaskEpisodeFilter = {
  /** Checks for all expressions in this list. */
  and?: InputMaybe<Array<TaskEpisodeFilter>>;
  /** Filter by the object’s `episodeByEpisodeId` relation. */
  episodeByEpisodeId?: InputMaybe<EpisodeFilter>;
  /** Filter by the object’s `episodeId` field. */
  episodeId?: InputMaybe<IntFilter>;
  /** Negates the expression. */
  not?: InputMaybe<TaskEpisodeFilter>;
  /** Checks for any expressions in this list. */
  or?: InputMaybe<Array<TaskEpisodeFilter>>;
  /** Filter by the object’s `taskByTaskId` relation. */
  taskByTaskId?: InputMaybe<TaskFilter>;
  /** Filter by the object’s `taskId` field. */
  taskId?: InputMaybe<IntFilter>;
};

/** A connection to a list of `TaskEpisode` values. */
export type TaskEpisodesConnection = {
  __typename?: 'TaskEpisodesConnection';
  /** A list of edges which contains the `TaskEpisode` and cursor to aid in pagination. */
  edges: Array<TaskEpisodesEdge>;
  /** A list of `TaskEpisode` objects. */
  nodes: Array<Maybe<TaskEpisode>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** The count of *all* `TaskEpisode` you could get from the connection. */
  totalCount: Scalars['Int'];
};

/** A `TaskEpisode` edge in the connection. */
export type TaskEpisodesEdge = {
  __typename?: 'TaskEpisodesEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']>;
  /** The `TaskEpisode` at the end of the edge. */
  node?: Maybe<TaskEpisode>;
};

/** Methods to use when ordering `TaskEpisode`. */
export enum TaskEpisodesOrderBy {
  EpisodeByEpisodeIdAirTimeAsc = 'EPISODE_BY_EPISODE_ID__AIR_TIME_ASC',
  EpisodeByEpisodeIdAirTimeDesc = 'EPISODE_BY_EPISODE_ID__AIR_TIME_DESC',
  EpisodeByEpisodeIdBangumiEpisodeIdAsc = 'EPISODE_BY_EPISODE_ID__BANGUMI_EPISODE_ID_ASC',
  EpisodeByEpisodeIdBangumiEpisodeIdDesc = 'EPISODE_BY_EPISODE_ID__BANGUMI_EPISODE_ID_DESC',
  EpisodeByEpisodeIdBangumiSortAsc = 'EPISODE_BY_EPISODE_ID__BANGUMI_SORT_ASC',
  EpisodeByEpisodeIdBangumiSortDesc = 'EPISODE_BY_EPISODE_ID__BANGUMI_SORT_DESC',
  EpisodeByEpisodeIdCreatedAtAsc = 'EPISODE_BY_EPISODE_ID__CREATED_AT_ASC',
  EpisodeByEpisodeIdCreatedAtDesc = 'EPISODE_BY_EPISODE_ID__CREATED_AT_DESC',
  EpisodeByEpisodeIdCurrentVersionIdAsc = 'EPISODE_BY_EPISODE_ID__CURRENT_VERSION_ID_ASC',
  EpisodeByEpisodeIdCurrentVersionIdDesc = 'EPISODE_BY_EPISODE_ID__CURRENT_VERSION_ID_DESC',
  EpisodeByEpisodeIdDandanplayEpisodeIdAsc = 'EPISODE_BY_EPISODE_ID__DANDANPLAY_EPISODE_ID_ASC',
  EpisodeByEpisodeIdDandanplayEpisodeIdDesc = 'EPISODE_BY_EPISODE_ID__DANDANPLAY_EPISODE_ID_DESC',
  EpisodeByEpisodeIdDescriptionAsc = 'EPISODE_BY_EPISODE_ID__DESCRIPTION_ASC',
  EpisodeByEpisodeIdDescriptionDesc = 'EPISODE_BY_EPISODE_ID__DESCRIPTION_DESC',
  EpisodeByEpisodeIdEpisodeNumberAsc = 'EPISODE_BY_EPISODE_ID__EPISODE_NUMBER_ASC',
  EpisodeByEpisodeIdEpisodeNumberDesc = 'EPISODE_BY_EPISODE_ID__EPISODE_NUMBER_DESC',
  EpisodeByEpisodeIdEpisodeTypeAsc = 'EPISODE_BY_EPISODE_ID__EPISODE_TYPE_ASC',
  EpisodeByEpisodeIdEpisodeTypeDesc = 'EPISODE_BY_EPISODE_ID__EPISODE_TYPE_DESC',
  EpisodeByEpisodeIdIdAsc = 'EPISODE_BY_EPISODE_ID__ID_ASC',
  EpisodeByEpisodeIdIdDesc = 'EPISODE_BY_EPISODE_ID__ID_DESC',
  EpisodeByEpisodeIdIndexAsc = 'EPISODE_BY_EPISODE_ID__INDEX_ASC',
  EpisodeByEpisodeIdIndexDesc = 'EPISODE_BY_EPISODE_ID__INDEX_DESC',
  EpisodeByEpisodeIdJellyfinEpisodeIdAsc = 'EPISODE_BY_EPISODE_ID__JELLYFIN_EPISODE_ID_ASC',
  EpisodeByEpisodeIdJellyfinEpisodeIdDesc = 'EPISODE_BY_EPISODE_ID__JELLYFIN_EPISODE_ID_DESC',
  EpisodeByEpisodeIdLastMissingNotifyTimeAsc = 'EPISODE_BY_EPISODE_ID__LAST_MISSING_NOTIFY_TIME_ASC',
  EpisodeByEpisodeIdLastMissingNotifyTimeDesc = 'EPISODE_BY_EPISODE_ID__LAST_MISSING_NOTIFY_TIME_DESC',
  EpisodeByEpisodeIdRawAirTimeAsc = 'EPISODE_BY_EPISODE_ID__RAW_AIR_TIME_ASC',
  EpisodeByEpisodeIdRawAirTimeDesc = 'EPISODE_BY_EPISODE_ID__RAW_AIR_TIME_DESC',
  EpisodeByEpisodeIdSeasonIdAsc = 'EPISODE_BY_EPISODE_ID__SEASON_ID_ASC',
  EpisodeByEpisodeIdSeasonIdDesc = 'EPISODE_BY_EPISODE_ID__SEASON_ID_DESC',
  EpisodeByEpisodeIdSourceDataAsc = 'EPISODE_BY_EPISODE_ID__SOURCE_DATA_ASC',
  EpisodeByEpisodeIdSourceDataDesc = 'EPISODE_BY_EPISODE_ID__SOURCE_DATA_DESC',
  EpisodeByEpisodeIdTitleAsc = 'EPISODE_BY_EPISODE_ID__TITLE_ASC',
  EpisodeByEpisodeIdTitleDesc = 'EPISODE_BY_EPISODE_ID__TITLE_DESC',
  EpisodeIdAsc = 'EPISODE_ID_ASC',
  EpisodeIdDesc = 'EPISODE_ID_DESC',
  Natural = 'NATURAL',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  TaskByTaskIdBatchEntriesAsc = 'TASK_BY_TASK_ID__BATCH_ENTRIES_ASC',
  TaskByTaskIdBatchEntriesDesc = 'TASK_BY_TASK_ID__BATCH_ENTRIES_DESC',
  TaskByTaskIdCancelledAtAsc = 'TASK_BY_TASK_ID__CANCELLED_AT_ASC',
  TaskByTaskIdCancelledAtDesc = 'TASK_BY_TASK_ID__CANCELLED_AT_DESC',
  TaskByTaskIdCreatedAtAsc = 'TASK_BY_TASK_ID__CREATED_AT_ASC',
  TaskByTaskIdCreatedAtDesc = 'TASK_BY_TASK_ID__CREATED_AT_DESC',
  TaskByTaskIdDownloadPathAsc = 'TASK_BY_TASK_ID__DOWNLOAD_PATH_ASC',
  TaskByTaskIdDownloadPathDesc = 'TASK_BY_TASK_ID__DOWNLOAD_PATH_DESC',
  TaskByTaskIdDownloadTimeoutMinutesAsc = 'TASK_BY_TASK_ID__DOWNLOAD_TIMEOUT_MINUTES_ASC',
  TaskByTaskIdDownloadTimeoutMinutesDesc = 'TASK_BY_TASK_ID__DOWNLOAD_TIMEOUT_MINUTES_DESC',
  TaskByTaskIdEpisodeIdAsc = 'TASK_BY_TASK_ID__EPISODE_ID_ASC',
  TaskByTaskIdEpisodeIdDesc = 'TASK_BY_TASK_ID__EPISODE_ID_DESC',
  TaskByTaskIdFailedAtAsc = 'TASK_BY_TASK_ID__FAILED_AT_ASC',
  TaskByTaskIdFailedAtDesc = 'TASK_BY_TASK_ID__FAILED_AT_DESC',
  TaskByTaskIdFailedReasonAsc = 'TASK_BY_TASK_ID__FAILED_REASON_ASC',
  TaskByTaskIdFailedReasonDesc = 'TASK_BY_TASK_ID__FAILED_REASON_DESC',
  TaskByTaskIdFilePathAsc = 'TASK_BY_TASK_ID__FILE_PATH_ASC',
  TaskByTaskIdFilePathDesc = 'TASK_BY_TASK_ID__FILE_PATH_DESC',
  TaskByTaskIdIdAsc = 'TASK_BY_TASK_ID__ID_ASC',
  TaskByTaskIdIdDesc = 'TASK_BY_TASK_ID__ID_DESC',
  TaskByTaskIdImportPathAsc = 'TASK_BY_TASK_ID__IMPORT_PATH_ASC',
  TaskByTaskIdImportPathDesc = 'TASK_BY_TASK_ID__IMPORT_PATH_DESC',
  TaskByTaskIdIsCancelledAsc = 'TASK_BY_TASK_ID__IS_CANCELLED_ASC',
  TaskByTaskIdIsCancelledDesc = 'TASK_BY_TASK_ID__IS_CANCELLED_DESC',
  TaskByTaskIdIsFailedAsc = 'TASK_BY_TASK_ID__IS_FAILED_ASC',
  TaskByTaskIdIsFailedDesc = 'TASK_BY_TASK_ID__IS_FAILED_DESC',
  TaskByTaskIdIsSmartDownloadAsc = 'TASK_BY_TASK_ID__IS_SMART_DOWNLOAD_ASC',
  TaskByTaskIdIsSmartDownloadDesc = 'TASK_BY_TASK_ID__IS_SMART_DOWNLOAD_DESC',
  TaskByTaskIdJellyfinEpisodeIdAsc = 'TASK_BY_TASK_ID__JELLYFIN_EPISODE_ID_ASC',
  TaskByTaskIdJellyfinEpisodeIdDesc = 'TASK_BY_TASK_ID__JELLYFIN_EPISODE_ID_DESC',
  TaskByTaskIdLegacyStageAsc = 'TASK_BY_TASK_ID__LEGACY_STAGE_ASC',
  TaskByTaskIdLegacyStageDesc = 'TASK_BY_TASK_ID__LEGACY_STAGE_DESC',
  TaskByTaskIdNfoPathAsc = 'TASK_BY_TASK_ID__NFO_PATH_ASC',
  TaskByTaskIdNfoPathDesc = 'TASK_BY_TASK_ID__NFO_PATH_DESC',
  TaskByTaskIdQbtLastSyncAsc = 'TASK_BY_TASK_ID__QBT_LAST_SYNC_ASC',
  TaskByTaskIdQbtLastSyncDesc = 'TASK_BY_TASK_ID__QBT_LAST_SYNC_DESC',
  TaskByTaskIdQbtTorrentHashAsc = 'TASK_BY_TASK_ID__QBT_TORRENT_HASH_ASC',
  TaskByTaskIdQbtTorrentHashDesc = 'TASK_BY_TASK_ID__QBT_TORRENT_HASH_DESC',
  TaskByTaskIdSmartDownloadDecisionAsc = 'TASK_BY_TASK_ID__SMART_DOWNLOAD_DECISION_ASC',
  TaskByTaskIdSmartDownloadDecisionDesc = 'TASK_BY_TASK_ID__SMART_DOWNLOAD_DECISION_DESC',
  TaskByTaskIdSmartDownloadTorrentHashAsc = 'TASK_BY_TASK_ID__SMART_DOWNLOAD_TORRENT_HASH_ASC',
  TaskByTaskIdSmartDownloadTorrentHashDesc = 'TASK_BY_TASK_ID__SMART_DOWNLOAD_TORRENT_HASH_DESC',
  TaskByTaskIdSourcePathAsc = 'TASK_BY_TASK_ID__SOURCE_PATH_ASC',
  TaskByTaskIdSourcePathDesc = 'TASK_BY_TASK_ID__SOURCE_PATH_DESC',
  TaskByTaskIdTorrentLinkAsc = 'TASK_BY_TASK_ID__TORRENT_LINK_ASC',
  TaskByTaskIdTorrentLinkDesc = 'TASK_BY_TASK_ID__TORRENT_LINK_DESC',
  TaskByTaskIdTorrentTitleAsc = 'TASK_BY_TASK_ID__TORRENT_TITLE_ASC',
  TaskByTaskIdTorrentTitleDesc = 'TASK_BY_TASK_ID__TORRENT_TITLE_DESC',
  TaskByTaskIdTypeAsc = 'TASK_BY_TASK_ID__TYPE_ASC',
  TaskByTaskIdTypeDesc = 'TASK_BY_TASK_ID__TYPE_DESC',
  TaskByTaskIdUpdatedAtAsc = 'TASK_BY_TASK_ID__UPDATED_AT_ASC',
  TaskByTaskIdUpdatedAtDesc = 'TASK_BY_TASK_ID__UPDATED_AT_DESC',
  TaskByTaskIdVersionAsc = 'TASK_BY_TASK_ID__VERSION_ASC',
  TaskByTaskIdVersionDesc = 'TASK_BY_TASK_ID__VERSION_DESC',
  TaskByTaskIdWorkflowAsc = 'TASK_BY_TASK_ID__WORKFLOW_ASC',
  TaskByTaskIdWorkflowDesc = 'TASK_BY_TASK_ID__WORKFLOW_DESC',
  TaskIdAsc = 'TASK_ID_ASC',
  TaskIdDesc = 'TASK_ID_DESC'
}

/** A filter to be used against `Task` object types. All fields are combined with a logical ‘and.’ */
export type TaskFilter = {
  /** Checks for all expressions in this list. */
  and?: InputMaybe<Array<TaskFilter>>;
  /** Filter by the object’s `batchEntries` field. */
  batchEntries?: InputMaybe<JsonFilter>;
  /** Filter by the object’s `cancelledAt` field. */
  cancelledAt?: InputMaybe<DatetimeFilter>;
  /** Filter by the object’s `createdAt` field. */
  createdAt?: InputMaybe<DatetimeFilter>;
  /** Filter by the object’s `downloadPath` field. */
  downloadPath?: InputMaybe<StringFilter>;
  /** Filter by the object’s `downloadTimeoutMinutes` field. */
  downloadTimeoutMinutes?: InputMaybe<IntFilter>;
  /** Filter by the object’s `episodeByEpisodeId` relation. */
  episodeByEpisodeId?: InputMaybe<EpisodeFilter>;
  /** A related `episodeByEpisodeId` exists. */
  episodeByEpisodeIdExists?: InputMaybe<Scalars['Boolean']>;
  /** Filter by the object’s `episodeId` field. */
  episodeId?: InputMaybe<IntFilter>;
  /** Filter by the object’s `failedAt` field. */
  failedAt?: InputMaybe<DatetimeFilter>;
  /** Filter by the object’s `failedReason` field. */
  failedReason?: InputMaybe<StringFilter>;
  /** Filter by the object’s `filePath` field. */
  filePath?: InputMaybe<StringFilter>;
  /** Filter by the object’s `id` field. */
  id?: InputMaybe<IntFilter>;
  /** Filter by the object’s `importPath` field. */
  importPath?: InputMaybe<StringFilter>;
  /** Filter by the object’s `isCancelled` field. */
  isCancelled?: InputMaybe<BooleanFilter>;
  /** Filter by the object’s `isFailed` field. */
  isFailed?: InputMaybe<BooleanFilter>;
  /** Filter by the object’s `isSmartDownload` field. */
  isSmartDownload?: InputMaybe<BooleanFilter>;
  /** Filter by the object’s `jellyfinEpisodeId` field. */
  jellyfinEpisodeId?: InputMaybe<StringFilter>;
  /** Filter by the object’s `legacyStage` field. */
  legacyStage?: InputMaybe<LegacyTaskStageFilter>;
  /** Filter by the object’s `nfoPath` field. */
  nfoPath?: InputMaybe<StringFilter>;
  /** Negates the expression. */
  not?: InputMaybe<TaskFilter>;
  /** Checks for any expressions in this list. */
  or?: InputMaybe<Array<TaskFilter>>;
  /** Filter by the object’s `qbtLastSync` field. */
  qbtLastSync?: InputMaybe<DatetimeFilter>;
  /** Filter by the object’s `qbtTorrentHash` field. */
  qbtTorrentHash?: InputMaybe<StringFilter>;
  /** Filter by the object’s `smartDownloadDecision` field. */
  smartDownloadDecision?: InputMaybe<JsonFilter>;
  /** Filter by the object’s `smartDownloadTorrentHash` field. */
  smartDownloadTorrentHash?: InputMaybe<StringFilter>;
  /** Filter by the object’s `sourcePath` field. */
  sourcePath?: InputMaybe<StringFilter>;
  /** Filter by the object’s `taskEpisodesByTaskId` relation. */
  taskEpisodesByTaskId?: InputMaybe<TaskToManyTaskEpisodeFilter>;
  /** Some related `taskEpisodesByTaskId` exist. */
  taskEpisodesByTaskIdExist?: InputMaybe<Scalars['Boolean']>;
  /** Filter by the object’s `torrentLink` field. */
  torrentLink?: InputMaybe<StringFilter>;
  /** Filter by the object’s `torrentTitle` field. */
  torrentTitle?: InputMaybe<StringFilter>;
  /** Filter by the object’s `type` field. */
  type?: InputMaybe<TaskTypeFilter>;
  /** Filter by the object’s `updatedAt` field. */
  updatedAt?: InputMaybe<DatetimeFilter>;
  /** Filter by the object’s `version` field. */
  version?: InputMaybe<IntFilter>;
  /** Filter by the object’s `workflow` field. */
  workflow?: InputMaybe<JsonFilter>;
};

export type TaskState = {
  __typename?: 'TaskState';
  batchEntries?: Maybe<Array<BatchImportEntryState>>;
  canCancel: Scalars['Boolean'];
  canRetry: Scalars['Boolean'];
  downloadPath?: Maybe<Scalars['String']>;
  failedReason: Scalars['String'];
  filePath?: Maybe<Scalars['String']>;
  id: Scalars['Int'];
  importPath?: Maybe<Scalars['String']>;
  isCancelled: Scalars['Boolean'];
  isFailed: Scalars['Boolean'];
  jellyfinEpisodeId?: Maybe<Scalars['String']>;
  legacyStage: LegacyTaskStage;
  nfoPath?: Maybe<Scalars['String']>;
  qbtTorrentHash?: Maybe<Scalars['String']>;
  torrentTitle?: Maybe<Scalars['String']>;
  type: TaskType;
  version: Scalars['Int'];
  workflow?: Maybe<Scalars['Workflow']>;
};

/** A filter to be used against many `TaskEpisode` object types. All fields are combined with a logical ‘and.’ */
export type TaskToManyTaskEpisodeFilter = {
  /** Every related `TaskEpisode` matches the filter criteria. All fields are combined with a logical ‘and.’ */
  every?: InputMaybe<TaskEpisodeFilter>;
  /** No related `TaskEpisode` matches the filter criteria. All fields are combined with a logical ‘and.’ */
  none?: InputMaybe<TaskEpisodeFilter>;
  /** Some related `TaskEpisode` matches the filter criteria. All fields are combined with a logical ‘and.’ */
  some?: InputMaybe<TaskEpisodeFilter>;
};

export enum TaskType {
  BatchDownload = 'BATCH_DOWNLOAD',
  BatchImport = 'BATCH_IMPORT',
  Download = 'DOWNLOAD',
  Import = 'IMPORT'
}

/** A filter to be used against TaskType fields. All fields are combined with a logical ‘and.’ */
export type TaskTypeFilter = {
  /** Not equal to the specified value, treating null like an ordinary value. */
  distinctFrom?: InputMaybe<TaskType>;
  /** Equal to the specified value. */
  equalTo?: InputMaybe<TaskType>;
  /** Greater than the specified value. */
  greaterThan?: InputMaybe<TaskType>;
  /** Greater than or equal to the specified value. */
  greaterThanOrEqualTo?: InputMaybe<TaskType>;
  /** Included in the specified list. */
  in?: InputMaybe<Array<TaskType>>;
  /** Is null (if `true` is specified) or is not null (if `false` is specified). */
  isNull?: InputMaybe<Scalars['Boolean']>;
  /** Less than the specified value. */
  lessThan?: InputMaybe<TaskType>;
  /** Less than or equal to the specified value. */
  lessThanOrEqualTo?: InputMaybe<TaskType>;
  /** Equal to the specified value, treating null like an ordinary value. */
  notDistinctFrom?: InputMaybe<TaskType>;
  /** Not equal to the specified value. */
  notEqualTo?: InputMaybe<TaskType>;
  /** Not included in the specified list. */
  notIn?: InputMaybe<Array<TaskType>>;
};

/** A connection to a list of `Task` values. */
export type TasksConnection = {
  __typename?: 'TasksConnection';
  /** A list of edges which contains the `Task` and cursor to aid in pagination. */
  edges: Array<TasksEdge>;
  /** A list of `Task` objects. */
  nodes: Array<Maybe<Task>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** The count of *all* `Task` you could get from the connection. */
  totalCount: Scalars['Int'];
};

/** A `Task` edge in the connection. */
export type TasksEdge = {
  __typename?: 'TasksEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']>;
  /** The `Task` at the end of the edge. */
  node?: Maybe<Task>;
};

/** Methods to use when ordering `Task`. */
export enum TasksOrderBy {
  BatchEntriesAsc = 'BATCH_ENTRIES_ASC',
  BatchEntriesDesc = 'BATCH_ENTRIES_DESC',
  CancelledAtAsc = 'CANCELLED_AT_ASC',
  CancelledAtDesc = 'CANCELLED_AT_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
  DownloadPathAsc = 'DOWNLOAD_PATH_ASC',
  DownloadPathDesc = 'DOWNLOAD_PATH_DESC',
  DownloadTimeoutMinutesAsc = 'DOWNLOAD_TIMEOUT_MINUTES_ASC',
  DownloadTimeoutMinutesDesc = 'DOWNLOAD_TIMEOUT_MINUTES_DESC',
  EpisodeByEpisodeIdAirTimeAsc = 'EPISODE_BY_EPISODE_ID__AIR_TIME_ASC',
  EpisodeByEpisodeIdAirTimeDesc = 'EPISODE_BY_EPISODE_ID__AIR_TIME_DESC',
  EpisodeByEpisodeIdBangumiEpisodeIdAsc = 'EPISODE_BY_EPISODE_ID__BANGUMI_EPISODE_ID_ASC',
  EpisodeByEpisodeIdBangumiEpisodeIdDesc = 'EPISODE_BY_EPISODE_ID__BANGUMI_EPISODE_ID_DESC',
  EpisodeByEpisodeIdBangumiSortAsc = 'EPISODE_BY_EPISODE_ID__BANGUMI_SORT_ASC',
  EpisodeByEpisodeIdBangumiSortDesc = 'EPISODE_BY_EPISODE_ID__BANGUMI_SORT_DESC',
  EpisodeByEpisodeIdCreatedAtAsc = 'EPISODE_BY_EPISODE_ID__CREATED_AT_ASC',
  EpisodeByEpisodeIdCreatedAtDesc = 'EPISODE_BY_EPISODE_ID__CREATED_AT_DESC',
  EpisodeByEpisodeIdCurrentVersionIdAsc = 'EPISODE_BY_EPISODE_ID__CURRENT_VERSION_ID_ASC',
  EpisodeByEpisodeIdCurrentVersionIdDesc = 'EPISODE_BY_EPISODE_ID__CURRENT_VERSION_ID_DESC',
  EpisodeByEpisodeIdDandanplayEpisodeIdAsc = 'EPISODE_BY_EPISODE_ID__DANDANPLAY_EPISODE_ID_ASC',
  EpisodeByEpisodeIdDandanplayEpisodeIdDesc = 'EPISODE_BY_EPISODE_ID__DANDANPLAY_EPISODE_ID_DESC',
  EpisodeByEpisodeIdDescriptionAsc = 'EPISODE_BY_EPISODE_ID__DESCRIPTION_ASC',
  EpisodeByEpisodeIdDescriptionDesc = 'EPISODE_BY_EPISODE_ID__DESCRIPTION_DESC',
  EpisodeByEpisodeIdEpisodeNumberAsc = 'EPISODE_BY_EPISODE_ID__EPISODE_NUMBER_ASC',
  EpisodeByEpisodeIdEpisodeNumberDesc = 'EPISODE_BY_EPISODE_ID__EPISODE_NUMBER_DESC',
  EpisodeByEpisodeIdEpisodeTypeAsc = 'EPISODE_BY_EPISODE_ID__EPISODE_TYPE_ASC',
  EpisodeByEpisodeIdEpisodeTypeDesc = 'EPISODE_BY_EPISODE_ID__EPISODE_TYPE_DESC',
  EpisodeByEpisodeIdIdAsc = 'EPISODE_BY_EPISODE_ID__ID_ASC',
  EpisodeByEpisodeIdIdDesc = 'EPISODE_BY_EPISODE_ID__ID_DESC',
  EpisodeByEpisodeIdIndexAsc = 'EPISODE_BY_EPISODE_ID__INDEX_ASC',
  EpisodeByEpisodeIdIndexDesc = 'EPISODE_BY_EPISODE_ID__INDEX_DESC',
  EpisodeByEpisodeIdJellyfinEpisodeIdAsc = 'EPISODE_BY_EPISODE_ID__JELLYFIN_EPISODE_ID_ASC',
  EpisodeByEpisodeIdJellyfinEpisodeIdDesc = 'EPISODE_BY_EPISODE_ID__JELLYFIN_EPISODE_ID_DESC',
  EpisodeByEpisodeIdLastMissingNotifyTimeAsc = 'EPISODE_BY_EPISODE_ID__LAST_MISSING_NOTIFY_TIME_ASC',
  EpisodeByEpisodeIdLastMissingNotifyTimeDesc = 'EPISODE_BY_EPISODE_ID__LAST_MISSING_NOTIFY_TIME_DESC',
  EpisodeByEpisodeIdRawAirTimeAsc = 'EPISODE_BY_EPISODE_ID__RAW_AIR_TIME_ASC',
  EpisodeByEpisodeIdRawAirTimeDesc = 'EPISODE_BY_EPISODE_ID__RAW_AIR_TIME_DESC',
  EpisodeByEpisodeIdSeasonIdAsc = 'EPISODE_BY_EPISODE_ID__SEASON_ID_ASC',
  EpisodeByEpisodeIdSeasonIdDesc = 'EPISODE_BY_EPISODE_ID__SEASON_ID_DESC',
  EpisodeByEpisodeIdSourceDataAsc = 'EPISODE_BY_EPISODE_ID__SOURCE_DATA_ASC',
  EpisodeByEpisodeIdSourceDataDesc = 'EPISODE_BY_EPISODE_ID__SOURCE_DATA_DESC',
  EpisodeByEpisodeIdTitleAsc = 'EPISODE_BY_EPISODE_ID__TITLE_ASC',
  EpisodeByEpisodeIdTitleDesc = 'EPISODE_BY_EPISODE_ID__TITLE_DESC',
  EpisodeIdAsc = 'EPISODE_ID_ASC',
  EpisodeIdDesc = 'EPISODE_ID_DESC',
  FailedAtAsc = 'FAILED_AT_ASC',
  FailedAtDesc = 'FAILED_AT_DESC',
  FailedReasonAsc = 'FAILED_REASON_ASC',
  FailedReasonDesc = 'FAILED_REASON_DESC',
  FilePathAsc = 'FILE_PATH_ASC',
  FilePathDesc = 'FILE_PATH_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  ImportPathAsc = 'IMPORT_PATH_ASC',
  ImportPathDesc = 'IMPORT_PATH_DESC',
  IsCancelledAsc = 'IS_CANCELLED_ASC',
  IsCancelledDesc = 'IS_CANCELLED_DESC',
  IsFailedAsc = 'IS_FAILED_ASC',
  IsFailedDesc = 'IS_FAILED_DESC',
  IsSmartDownloadAsc = 'IS_SMART_DOWNLOAD_ASC',
  IsSmartDownloadDesc = 'IS_SMART_DOWNLOAD_DESC',
  JellyfinEpisodeIdAsc = 'JELLYFIN_EPISODE_ID_ASC',
  JellyfinEpisodeIdDesc = 'JELLYFIN_EPISODE_ID_DESC',
  LegacyStageAsc = 'LEGACY_STAGE_ASC',
  LegacyStageDesc = 'LEGACY_STAGE_DESC',
  Natural = 'NATURAL',
  NfoPathAsc = 'NFO_PATH_ASC',
  NfoPathDesc = 'NFO_PATH_DESC',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  QbtLastSyncAsc = 'QBT_LAST_SYNC_ASC',
  QbtLastSyncDesc = 'QBT_LAST_SYNC_DESC',
  QbtTorrentHashAsc = 'QBT_TORRENT_HASH_ASC',
  QbtTorrentHashDesc = 'QBT_TORRENT_HASH_DESC',
  SmartDownloadDecisionAsc = 'SMART_DOWNLOAD_DECISION_ASC',
  SmartDownloadDecisionDesc = 'SMART_DOWNLOAD_DECISION_DESC',
  SmartDownloadTorrentHashAsc = 'SMART_DOWNLOAD_TORRENT_HASH_ASC',
  SmartDownloadTorrentHashDesc = 'SMART_DOWNLOAD_TORRENT_HASH_DESC',
  SourcePathAsc = 'SOURCE_PATH_ASC',
  SourcePathDesc = 'SOURCE_PATH_DESC',
  TaskEpisodesByTaskIdCountAsc = 'TASK_EPISODES_BY_TASK_ID__COUNT_ASC',
  TaskEpisodesByTaskIdCountDesc = 'TASK_EPISODES_BY_TASK_ID__COUNT_DESC',
  TaskEpisodesByTaskIdMaxEpisodeIdAsc = 'TASK_EPISODES_BY_TASK_ID__MAX_EPISODE_ID_ASC',
  TaskEpisodesByTaskIdMaxEpisodeIdDesc = 'TASK_EPISODES_BY_TASK_ID__MAX_EPISODE_ID_DESC',
  TaskEpisodesByTaskIdMaxTaskIdAsc = 'TASK_EPISODES_BY_TASK_ID__MAX_TASK_ID_ASC',
  TaskEpisodesByTaskIdMaxTaskIdDesc = 'TASK_EPISODES_BY_TASK_ID__MAX_TASK_ID_DESC',
  TaskEpisodesByTaskIdMinEpisodeIdAsc = 'TASK_EPISODES_BY_TASK_ID__MIN_EPISODE_ID_ASC',
  TaskEpisodesByTaskIdMinEpisodeIdDesc = 'TASK_EPISODES_BY_TASK_ID__MIN_EPISODE_ID_DESC',
  TaskEpisodesByTaskIdMinTaskIdAsc = 'TASK_EPISODES_BY_TASK_ID__MIN_TASK_ID_ASC',
  TaskEpisodesByTaskIdMinTaskIdDesc = 'TASK_EPISODES_BY_TASK_ID__MIN_TASK_ID_DESC',
  TorrentLinkAsc = 'TORRENT_LINK_ASC',
  TorrentLinkDesc = 'TORRENT_LINK_DESC',
  TorrentTitleAsc = 'TORRENT_TITLE_ASC',
  TorrentTitleDesc = 'TORRENT_TITLE_DESC',
  TypeAsc = 'TYPE_ASC',
  TypeDesc = 'TYPE_DESC',
  UpdatedAtAsc = 'UPDATED_AT_ASC',
  UpdatedAtDesc = 'UPDATED_AT_DESC',
  VersionAsc = 'VERSION_ASC',
  VersionDesc = 'VERSION_DESC',
  WorkflowAsc = 'WORKFLOW_ASC',
  WorkflowDesc = 'WORKFLOW_DESC'
}

export type Torrent = Node & {
  __typename?: 'Torrent';
  channel: TorrentChannel;
  createdAt: Scalars['Datetime'];
  displayId: Scalars['Int'];
  episodeIndex?: Maybe<Scalars['Int']>;
  episodeInfo?: Maybe<Scalars['JSON']>;
  episodeNumber?: Maybe<Scalars['BigFloat']>;
  episodeNumberFrom?: Maybe<Scalars['BigFloat']>;
  episodeNumberTo?: Maybe<Scalars['BigFloat']>;
  episodeSort?: Maybe<Scalars['BigFloat']>;
  episodeType?: Maybe<EpisodeType>;
  formatAudioEncoding?: Maybe<Scalars['String']>;
  formatColorDepth?: Maybe<Scalars['String']>;
  formatContainer?: Maybe<Scalars['String']>;
  formatResolution?: Maybe<Scalars['String']>;
  formatVideoEncoding?: Maybe<Scalars['String']>;
  hash: Scalars['String'];
  id: Scalars['Int'];
  index?: Maybe<Scalars['Int']>;
  indexFrom?: Maybe<Scalars['Int']>;
  indexTo?: Maybe<Scalars['Int']>;
  matchDetails?: Maybe<Scalars['JSON']>;
  matchStatus?: Maybe<TorrentMatchStatus>;
  matchedAt?: Maybe<Scalars['Datetime']>;
  matchedSeasonId?: Maybe<Scalars['Int']>;
  metadata?: Maybe<Scalars['JSON']>;
  metadataError?: Maybe<Scalars['String']>;
  metadataFetchedAt?: Maybe<Scalars['Datetime']>;
  metadataStatus: Scalars['String'];
  /** A globally unique identifier. Can be used in various places throughout the system to identify this single value. */
  nodeId: Scalars['ID'];
  organizationParts?: Maybe<Array<Maybe<Scalars['String']>>>;
  organizationRaw?: Maybe<Scalars['String']>;
  parseResult?: Maybe<Scalars['JSON']>;
  parseVersion?: Maybe<Scalars['Int']>;
  parsedAt?: Maybe<Scalars['Datetime']>;
  permalink?: Maybe<Scalars['String']>;
  publishDate: Scalars['Datetime'];
  /** Reads a single `Season` that is related to this `Torrent`. */
  seasonByMatchedSeasonId?: Maybe<Season>;
  seasonTitleAliases?: Maybe<Array<Maybe<Scalars['String']>>>;
  seasonTitleRaw?: Maybe<Scalars['String']>;
  size: Scalars['BigInt'];
  sourcePlatform?: Maybe<TorrentPlatform>;
  sourceType?: Maybe<TorrentSourceType>;
  subtitleHasChs: Scalars['Boolean'];
  subtitleHasCht: Scalars['Boolean'];
  subtitleHasJp: Scalars['Boolean'];
  subtitleInfo?: Maybe<Scalars['JSON']>;
  subtitleType?: Maybe<Scalars['String']>;
  title: Scalars['String'];
  /** Link used to download */
  torrentLink: Scalars['String'];
};

export enum TorrentChannel {
  Mikan = 'MIKAN',
  Nyaa = 'NYAA'
}

/** A filter to be used against TorrentChannel fields. All fields are combined with a logical ‘and.’ */
export type TorrentChannelFilter = {
  /** Not equal to the specified value, treating null like an ordinary value. */
  distinctFrom?: InputMaybe<TorrentChannel>;
  /** Equal to the specified value. */
  equalTo?: InputMaybe<TorrentChannel>;
  /** Greater than the specified value. */
  greaterThan?: InputMaybe<TorrentChannel>;
  /** Greater than or equal to the specified value. */
  greaterThanOrEqualTo?: InputMaybe<TorrentChannel>;
  /** Included in the specified list. */
  in?: InputMaybe<Array<TorrentChannel>>;
  /** Is null (if `true` is specified) or is not null (if `false` is specified). */
  isNull?: InputMaybe<Scalars['Boolean']>;
  /** Less than the specified value. */
  lessThan?: InputMaybe<TorrentChannel>;
  /** Less than or equal to the specified value. */
  lessThanOrEqualTo?: InputMaybe<TorrentChannel>;
  /** Equal to the specified value, treating null like an ordinary value. */
  notDistinctFrom?: InputMaybe<TorrentChannel>;
  /** Not equal to the specified value. */
  notEqualTo?: InputMaybe<TorrentChannel>;
  /** Not included in the specified list. */
  notIn?: InputMaybe<Array<TorrentChannel>>;
};

/** A condition to be used against `Torrent` object types. All fields are tested for equality and combined with a logical ‘and.’ */
export type TorrentCondition = {
  /** Checks for equality with the object’s `channel` field. */
  channel?: InputMaybe<TorrentChannel>;
  /** Checks for equality with the object’s `createdAt` field. */
  createdAt?: InputMaybe<Scalars['Datetime']>;
  /** Checks for equality with the object’s `displayId` field. */
  displayId?: InputMaybe<Scalars['Int']>;
  /** Checks for equality with the object’s `episodeIndex` field. */
  episodeIndex?: InputMaybe<Scalars['Int']>;
  /** Checks for equality with the object’s `episodeNumber` field. */
  episodeNumber?: InputMaybe<Scalars['BigFloat']>;
  /** Checks for equality with the object’s `episodeNumberFrom` field. */
  episodeNumberFrom?: InputMaybe<Scalars['BigFloat']>;
  /** Checks for equality with the object’s `episodeNumberTo` field. */
  episodeNumberTo?: InputMaybe<Scalars['BigFloat']>;
  /** Checks for equality with the object’s `episodeType` field. */
  episodeType?: InputMaybe<EpisodeType>;
  /** Checks for equality with the object’s `formatAudioEncoding` field. */
  formatAudioEncoding?: InputMaybe<Scalars['String']>;
  /** Checks for equality with the object’s `formatColorDepth` field. */
  formatColorDepth?: InputMaybe<Scalars['String']>;
  /** Checks for equality with the object’s `formatContainer` field. */
  formatContainer?: InputMaybe<Scalars['String']>;
  /** Checks for equality with the object’s `formatResolution` field. */
  formatResolution?: InputMaybe<Scalars['String']>;
  /** Checks for equality with the object’s `formatVideoEncoding` field. */
  formatVideoEncoding?: InputMaybe<Scalars['String']>;
  /** Checks for equality with the object’s `hash` field. */
  hash?: InputMaybe<Scalars['String']>;
  /** Checks for equality with the object’s `id` field. */
  id?: InputMaybe<Scalars['Int']>;
  /** Checks for equality with the object’s `index` field. */
  index?: InputMaybe<Scalars['Int']>;
  /** Checks for equality with the object’s `indexFrom` field. */
  indexFrom?: InputMaybe<Scalars['Int']>;
  /** Checks for equality with the object’s `indexTo` field. */
  indexTo?: InputMaybe<Scalars['Int']>;
  /** Checks for equality with the object’s `matchDetails` field. */
  matchDetails?: InputMaybe<Scalars['JSON']>;
  /** Checks for equality with the object’s `matchStatus` field. */
  matchStatus?: InputMaybe<TorrentMatchStatus>;
  /** Checks for equality with the object’s `matchedAt` field. */
  matchedAt?: InputMaybe<Scalars['Datetime']>;
  /** Checks for equality with the object’s `matchedSeasonId` field. */
  matchedSeasonId?: InputMaybe<Scalars['Int']>;
  /** Checks for equality with the object’s `metadata` field. */
  metadata?: InputMaybe<Scalars['JSON']>;
  /** Checks for equality with the object’s `metadataError` field. */
  metadataError?: InputMaybe<Scalars['String']>;
  /** Checks for equality with the object’s `metadataFetchedAt` field. */
  metadataFetchedAt?: InputMaybe<Scalars['Datetime']>;
  /** Checks for equality with the object’s `metadataStatus` field. */
  metadataStatus?: InputMaybe<Scalars['String']>;
  /** Checks for equality with the object’s `organizationParts` field. */
  organizationParts?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Checks for equality with the object’s `organizationRaw` field. */
  organizationRaw?: InputMaybe<Scalars['String']>;
  /** Checks for equality with the object’s `parseResult` field. */
  parseResult?: InputMaybe<Scalars['JSON']>;
  /** Checks for equality with the object’s `parseVersion` field. */
  parseVersion?: InputMaybe<Scalars['Int']>;
  /** Checks for equality with the object’s `parsedAt` field. */
  parsedAt?: InputMaybe<Scalars['Datetime']>;
  /** Checks for equality with the object’s `permalink` field. */
  permalink?: InputMaybe<Scalars['String']>;
  /** Checks for equality with the object’s `publishDate` field. */
  publishDate?: InputMaybe<Scalars['Datetime']>;
  /** Checks for equality with the object’s `seasonTitleAliases` field. */
  seasonTitleAliases?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Checks for equality with the object’s `seasonTitleRaw` field. */
  seasonTitleRaw?: InputMaybe<Scalars['String']>;
  /** Checks for equality with the object’s `size` field. */
  size?: InputMaybe<Scalars['BigInt']>;
  /** Checks for equality with the object’s `sourcePlatform` field. */
  sourcePlatform?: InputMaybe<TorrentPlatform>;
  /** Checks for equality with the object’s `sourceType` field. */
  sourceType?: InputMaybe<TorrentSourceType>;
  /** Checks for equality with the object’s `subtitleHasChs` field. */
  subtitleHasChs?: InputMaybe<Scalars['Boolean']>;
  /** Checks for equality with the object’s `subtitleHasCht` field. */
  subtitleHasCht?: InputMaybe<Scalars['Boolean']>;
  /** Checks for equality with the object’s `subtitleHasJp` field. */
  subtitleHasJp?: InputMaybe<Scalars['Boolean']>;
  /** Checks for equality with the object’s `subtitleType` field. */
  subtitleType?: InputMaybe<Scalars['String']>;
  /** Checks for equality with the object’s `title` field. */
  title?: InputMaybe<Scalars['String']>;
  /** Checks for equality with the object’s `torrentLink` field. */
  torrentLink?: InputMaybe<Scalars['String']>;
};

/** A filter to be used against `Torrent` object types. All fields are combined with a logical ‘and.’ */
export type TorrentFilter = {
  /** Checks for all expressions in this list. */
  and?: InputMaybe<Array<TorrentFilter>>;
  /** Filter by the object’s `channel` field. */
  channel?: InputMaybe<TorrentChannelFilter>;
  /** Filter by the object’s `createdAt` field. */
  createdAt?: InputMaybe<DatetimeFilter>;
  /** Filter by the object’s `displayId` field. */
  displayId?: InputMaybe<IntFilter>;
  /** Filter by the object’s `episodeIndex` field. */
  episodeIndex?: InputMaybe<IntFilter>;
  /** Filter by the object’s `episodeInfo` field. */
  episodeInfo?: InputMaybe<JsonFilter>;
  /** Filter by the object’s `episodeNumber` field. */
  episodeNumber?: InputMaybe<BigFloatFilter>;
  /** Filter by the object’s `episodeNumberFrom` field. */
  episodeNumberFrom?: InputMaybe<BigFloatFilter>;
  /** Filter by the object’s `episodeNumberTo` field. */
  episodeNumberTo?: InputMaybe<BigFloatFilter>;
  /** Filter by the object’s `episodeSort` field. */
  episodeSort?: InputMaybe<BigFloatFilter>;
  /** Filter by the object’s `episodeType` field. */
  episodeType?: InputMaybe<EpisodeTypeFilter>;
  /** Filter by the object’s `formatAudioEncoding` field. */
  formatAudioEncoding?: InputMaybe<StringFilter>;
  /** Filter by the object’s `formatColorDepth` field. */
  formatColorDepth?: InputMaybe<StringFilter>;
  /** Filter by the object’s `formatContainer` field. */
  formatContainer?: InputMaybe<StringFilter>;
  /** Filter by the object’s `formatResolution` field. */
  formatResolution?: InputMaybe<StringFilter>;
  /** Filter by the object’s `formatVideoEncoding` field. */
  formatVideoEncoding?: InputMaybe<StringFilter>;
  /** Filter by the object’s `hash` field. */
  hash?: InputMaybe<StringFilter>;
  /** Filter by the object’s `id` field. */
  id?: InputMaybe<IntFilter>;
  /** Filter by the object’s `index` field. */
  index?: InputMaybe<IntFilter>;
  /** Filter by the object’s `indexFrom` field. */
  indexFrom?: InputMaybe<IntFilter>;
  /** Filter by the object’s `indexTo` field. */
  indexTo?: InputMaybe<IntFilter>;
  /** Filter by the object’s `matchDetails` field. */
  matchDetails?: InputMaybe<JsonFilter>;
  /** Filter by the object’s `matchStatus` field. */
  matchStatus?: InputMaybe<TorrentMatchStatusFilter>;
  /** Filter by the object’s `matchedAt` field. */
  matchedAt?: InputMaybe<DatetimeFilter>;
  /** Filter by the object’s `matchedSeasonId` field. */
  matchedSeasonId?: InputMaybe<IntFilter>;
  /** Filter by the object’s `metadata` field. */
  metadata?: InputMaybe<JsonFilter>;
  /** Filter by the object’s `metadataError` field. */
  metadataError?: InputMaybe<StringFilter>;
  /** Filter by the object’s `metadataFetchedAt` field. */
  metadataFetchedAt?: InputMaybe<DatetimeFilter>;
  /** Filter by the object’s `metadataStatus` field. */
  metadataStatus?: InputMaybe<StringFilter>;
  /** Negates the expression. */
  not?: InputMaybe<TorrentFilter>;
  /** Checks for any expressions in this list. */
  or?: InputMaybe<Array<TorrentFilter>>;
  /** Filter by the object’s `organizationParts` field. */
  organizationParts?: InputMaybe<StringListFilter>;
  /** Filter by the object’s `organizationRaw` field. */
  organizationRaw?: InputMaybe<StringFilter>;
  /** Filter by the object’s `parseResult` field. */
  parseResult?: InputMaybe<JsonFilter>;
  /** Filter by the object’s `parseVersion` field. */
  parseVersion?: InputMaybe<IntFilter>;
  /** Filter by the object’s `parsedAt` field. */
  parsedAt?: InputMaybe<DatetimeFilter>;
  /** Filter by the object’s `permalink` field. */
  permalink?: InputMaybe<StringFilter>;
  /** Filter by the object’s `publishDate` field. */
  publishDate?: InputMaybe<DatetimeFilter>;
  /** Filter by the object’s `seasonByMatchedSeasonId` relation. */
  seasonByMatchedSeasonId?: InputMaybe<SeasonFilter>;
  /** A related `seasonByMatchedSeasonId` exists. */
  seasonByMatchedSeasonIdExists?: InputMaybe<Scalars['Boolean']>;
  /** Filter by the object’s `seasonTitleAliases` field. */
  seasonTitleAliases?: InputMaybe<StringListFilter>;
  /** Filter by the object’s `seasonTitleRaw` field. */
  seasonTitleRaw?: InputMaybe<StringFilter>;
  /** Filter by the object’s `size` field. */
  size?: InputMaybe<BigIntFilter>;
  /** Filter by the object’s `sourcePlatform` field. */
  sourcePlatform?: InputMaybe<TorrentPlatformFilter>;
  /** Filter by the object’s `sourceType` field. */
  sourceType?: InputMaybe<TorrentSourceTypeFilter>;
  /** Filter by the object’s `subtitleHasChs` field. */
  subtitleHasChs?: InputMaybe<BooleanFilter>;
  /** Filter by the object’s `subtitleHasCht` field. */
  subtitleHasCht?: InputMaybe<BooleanFilter>;
  /** Filter by the object’s `subtitleHasJp` field. */
  subtitleHasJp?: InputMaybe<BooleanFilter>;
  /** Filter by the object’s `subtitleType` field. */
  subtitleType?: InputMaybe<StringFilter>;
  /** Filter by the object’s `title` field. */
  title?: InputMaybe<StringFilter>;
  /** Filter by the object’s `torrentLink` field. */
  torrentLink?: InputMaybe<StringFilter>;
};

export type TorrentHistorySyncState = {
  __typename?: 'TorrentHistorySyncState';
  added: Scalars['Int'];
  error?: Maybe<Scalars['String']>;
  running: Scalars['Boolean'];
};

export enum TorrentMatchStatus {
  Dismissed = 'DISMISSED',
  Matched = 'MATCHED',
  NoMatch = 'NO_MATCH',
  Pending = 'PENDING',
  Unsupported = 'UNSUPPORTED'
}

/** A filter to be used against TorrentMatchStatus fields. All fields are combined with a logical ‘and.’ */
export type TorrentMatchStatusFilter = {
  /** Not equal to the specified value, treating null like an ordinary value. */
  distinctFrom?: InputMaybe<TorrentMatchStatus>;
  /** Equal to the specified value. */
  equalTo?: InputMaybe<TorrentMatchStatus>;
  /** Greater than the specified value. */
  greaterThan?: InputMaybe<TorrentMatchStatus>;
  /** Greater than or equal to the specified value. */
  greaterThanOrEqualTo?: InputMaybe<TorrentMatchStatus>;
  /** Included in the specified list. */
  in?: InputMaybe<Array<TorrentMatchStatus>>;
  /** Is null (if `true` is specified) or is not null (if `false` is specified). */
  isNull?: InputMaybe<Scalars['Boolean']>;
  /** Less than the specified value. */
  lessThan?: InputMaybe<TorrentMatchStatus>;
  /** Less than or equal to the specified value. */
  lessThanOrEqualTo?: InputMaybe<TorrentMatchStatus>;
  /** Equal to the specified value, treating null like an ordinary value. */
  notDistinctFrom?: InputMaybe<TorrentMatchStatus>;
  /** Not equal to the specified value. */
  notEqualTo?: InputMaybe<TorrentMatchStatus>;
  /** Not included in the specified list. */
  notIn?: InputMaybe<Array<TorrentMatchStatus>>;
};

export enum TorrentPlatform {
  Baha = 'BAHA',
  Bilibili = 'BILIBILI',
  BGlobal = 'B_GLOBAL',
  BThm = 'B_THM',
  Viutv = 'VIUTV'
}

/** A filter to be used against TorrentPlatform fields. All fields are combined with a logical ‘and.’ */
export type TorrentPlatformFilter = {
  /** Not equal to the specified value, treating null like an ordinary value. */
  distinctFrom?: InputMaybe<TorrentPlatform>;
  /** Equal to the specified value. */
  equalTo?: InputMaybe<TorrentPlatform>;
  /** Greater than the specified value. */
  greaterThan?: InputMaybe<TorrentPlatform>;
  /** Greater than or equal to the specified value. */
  greaterThanOrEqualTo?: InputMaybe<TorrentPlatform>;
  /** Included in the specified list. */
  in?: InputMaybe<Array<TorrentPlatform>>;
  /** Is null (if `true` is specified) or is not null (if `false` is specified). */
  isNull?: InputMaybe<Scalars['Boolean']>;
  /** Less than the specified value. */
  lessThan?: InputMaybe<TorrentPlatform>;
  /** Less than or equal to the specified value. */
  lessThanOrEqualTo?: InputMaybe<TorrentPlatform>;
  /** Equal to the specified value, treating null like an ordinary value. */
  notDistinctFrom?: InputMaybe<TorrentPlatform>;
  /** Not equal to the specified value. */
  notEqualTo?: InputMaybe<TorrentPlatform>;
  /** Not included in the specified list. */
  notIn?: InputMaybe<Array<TorrentPlatform>>;
};

export type TorrentPreview = {
  __typename?: 'TorrentPreview';
  files: Array<TorrentPreviewFile>;
  token: Scalars['String'];
};

export type TorrentPreviewFile = {
  __typename?: 'TorrentPreviewFile';
  path: Scalars['String'];
  size: Scalars['Float'];
};

export enum TorrentSourceType {
  Bd = 'BD',
  Bdrip = 'BDRIP',
  Donghua = 'DONGHUA',
  Webdl = 'WEBDL',
  Webrip = 'WEBRIP'
}

/** A filter to be used against TorrentSourceType fields. All fields are combined with a logical ‘and.’ */
export type TorrentSourceTypeFilter = {
  /** Not equal to the specified value, treating null like an ordinary value. */
  distinctFrom?: InputMaybe<TorrentSourceType>;
  /** Equal to the specified value. */
  equalTo?: InputMaybe<TorrentSourceType>;
  /** Greater than the specified value. */
  greaterThan?: InputMaybe<TorrentSourceType>;
  /** Greater than or equal to the specified value. */
  greaterThanOrEqualTo?: InputMaybe<TorrentSourceType>;
  /** Included in the specified list. */
  in?: InputMaybe<Array<TorrentSourceType>>;
  /** Is null (if `true` is specified) or is not null (if `false` is specified). */
  isNull?: InputMaybe<Scalars['Boolean']>;
  /** Less than the specified value. */
  lessThan?: InputMaybe<TorrentSourceType>;
  /** Less than or equal to the specified value. */
  lessThanOrEqualTo?: InputMaybe<TorrentSourceType>;
  /** Equal to the specified value, treating null like an ordinary value. */
  notDistinctFrom?: InputMaybe<TorrentSourceType>;
  /** Not equal to the specified value. */
  notEqualTo?: InputMaybe<TorrentSourceType>;
  /** Not included in the specified list. */
  notIn?: InputMaybe<Array<TorrentSourceType>>;
};

/** A connection to a list of `Torrent` values. */
export type TorrentsConnection = {
  __typename?: 'TorrentsConnection';
  /** A list of edges which contains the `Torrent` and cursor to aid in pagination. */
  edges: Array<TorrentsEdge>;
  /** A list of `Torrent` objects. */
  nodes: Array<Maybe<Torrent>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** The count of *all* `Torrent` you could get from the connection. */
  totalCount: Scalars['Int'];
};

/** A `Torrent` edge in the connection. */
export type TorrentsEdge = {
  __typename?: 'TorrentsEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']>;
  /** The `Torrent` at the end of the edge. */
  node?: Maybe<Torrent>;
};

/** Methods to use when ordering `Torrent`. */
export enum TorrentsOrderBy {
  ChannelAsc = 'CHANNEL_ASC',
  ChannelDesc = 'CHANNEL_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
  DisplayIdAsc = 'DISPLAY_ID_ASC',
  DisplayIdDesc = 'DISPLAY_ID_DESC',
  EpisodeIndexAsc = 'EPISODE_INDEX_ASC',
  EpisodeIndexDesc = 'EPISODE_INDEX_DESC',
  EpisodeNumberAsc = 'EPISODE_NUMBER_ASC',
  EpisodeNumberDesc = 'EPISODE_NUMBER_DESC',
  EpisodeNumberFromAsc = 'EPISODE_NUMBER_FROM_ASC',
  EpisodeNumberFromDesc = 'EPISODE_NUMBER_FROM_DESC',
  EpisodeNumberToAsc = 'EPISODE_NUMBER_TO_ASC',
  EpisodeNumberToDesc = 'EPISODE_NUMBER_TO_DESC',
  EpisodeSortAsc = 'EPISODE_SORT_ASC',
  EpisodeSortDesc = 'EPISODE_SORT_DESC',
  EpisodeTypeAsc = 'EPISODE_TYPE_ASC',
  EpisodeTypeDesc = 'EPISODE_TYPE_DESC',
  FormatAudioEncodingAsc = 'FORMAT_AUDIO_ENCODING_ASC',
  FormatAudioEncodingDesc = 'FORMAT_AUDIO_ENCODING_DESC',
  FormatColorDepthAsc = 'FORMAT_COLOR_DEPTH_ASC',
  FormatColorDepthDesc = 'FORMAT_COLOR_DEPTH_DESC',
  FormatContainerAsc = 'FORMAT_CONTAINER_ASC',
  FormatContainerDesc = 'FORMAT_CONTAINER_DESC',
  FormatResolutionAsc = 'FORMAT_RESOLUTION_ASC',
  FormatResolutionDesc = 'FORMAT_RESOLUTION_DESC',
  FormatVideoEncodingAsc = 'FORMAT_VIDEO_ENCODING_ASC',
  FormatVideoEncodingDesc = 'FORMAT_VIDEO_ENCODING_DESC',
  HashAsc = 'HASH_ASC',
  HashDesc = 'HASH_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  IndexAsc = 'INDEX_ASC',
  IndexDesc = 'INDEX_DESC',
  IndexFromAsc = 'INDEX_FROM_ASC',
  IndexFromDesc = 'INDEX_FROM_DESC',
  IndexToAsc = 'INDEX_TO_ASC',
  IndexToDesc = 'INDEX_TO_DESC',
  MatchedAtAsc = 'MATCHED_AT_ASC',
  MatchedAtDesc = 'MATCHED_AT_DESC',
  MatchedSeasonIdAsc = 'MATCHED_SEASON_ID_ASC',
  MatchedSeasonIdDesc = 'MATCHED_SEASON_ID_DESC',
  MatchDetailsAsc = 'MATCH_DETAILS_ASC',
  MatchDetailsDesc = 'MATCH_DETAILS_DESC',
  MatchStatusAsc = 'MATCH_STATUS_ASC',
  MatchStatusDesc = 'MATCH_STATUS_DESC',
  MetadataAsc = 'METADATA_ASC',
  MetadataDesc = 'METADATA_DESC',
  MetadataErrorAsc = 'METADATA_ERROR_ASC',
  MetadataErrorDesc = 'METADATA_ERROR_DESC',
  MetadataFetchedAtAsc = 'METADATA_FETCHED_AT_ASC',
  MetadataFetchedAtDesc = 'METADATA_FETCHED_AT_DESC',
  MetadataStatusAsc = 'METADATA_STATUS_ASC',
  MetadataStatusDesc = 'METADATA_STATUS_DESC',
  Natural = 'NATURAL',
  OrganizationPartsAsc = 'ORGANIZATION_PARTS_ASC',
  OrganizationPartsDesc = 'ORGANIZATION_PARTS_DESC',
  OrganizationRawAsc = 'ORGANIZATION_RAW_ASC',
  OrganizationRawDesc = 'ORGANIZATION_RAW_DESC',
  ParsedAtAsc = 'PARSED_AT_ASC',
  ParsedAtDesc = 'PARSED_AT_DESC',
  ParseResultAsc = 'PARSE_RESULT_ASC',
  ParseResultDesc = 'PARSE_RESULT_DESC',
  ParseVersionAsc = 'PARSE_VERSION_ASC',
  ParseVersionDesc = 'PARSE_VERSION_DESC',
  PermalinkAsc = 'PERMALINK_ASC',
  PermalinkDesc = 'PERMALINK_DESC',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  PublishDateAsc = 'PUBLISH_DATE_ASC',
  PublishDateDesc = 'PUBLISH_DATE_DESC',
  SeasonByMatchedSeasonIdAirTimeAsc = 'SEASON_BY_MATCHED_SEASON_ID__AIR_TIME_ASC',
  SeasonByMatchedSeasonIdAirTimeDesc = 'SEASON_BY_MATCHED_SEASON_ID__AIR_TIME_DESC',
  SeasonByMatchedSeasonIdAliasesAsc = 'SEASON_BY_MATCHED_SEASON_ID__ALIASES_ASC',
  SeasonByMatchedSeasonIdAliasesDesc = 'SEASON_BY_MATCHED_SEASON_ID__ALIASES_DESC',
  SeasonByMatchedSeasonIdBangumiIdAsc = 'SEASON_BY_MATCHED_SEASON_ID__BANGUMI_ID_ASC',
  SeasonByMatchedSeasonIdBangumiIdDesc = 'SEASON_BY_MATCHED_SEASON_ID__BANGUMI_ID_DESC',
  SeasonByMatchedSeasonIdBannerImageIdAsc = 'SEASON_BY_MATCHED_SEASON_ID__BANNER_IMAGE_ID_ASC',
  SeasonByMatchedSeasonIdBannerImageIdDesc = 'SEASON_BY_MATCHED_SEASON_ID__BANNER_IMAGE_ID_DESC',
  SeasonByMatchedSeasonIdBilibiliMainlandIdAsc = 'SEASON_BY_MATCHED_SEASON_ID__BILIBILI_MAINLAND_ID_ASC',
  SeasonByMatchedSeasonIdBilibiliMainlandIdDesc = 'SEASON_BY_MATCHED_SEASON_ID__BILIBILI_MAINLAND_ID_DESC',
  SeasonByMatchedSeasonIdBilibiliThmIdAsc = 'SEASON_BY_MATCHED_SEASON_ID__BILIBILI_THM_ID_ASC',
  SeasonByMatchedSeasonIdBilibiliThmIdDesc = 'SEASON_BY_MATCHED_SEASON_ID__BILIBILI_THM_ID_DESC',
  SeasonByMatchedSeasonIdCreatedAtAsc = 'SEASON_BY_MATCHED_SEASON_ID__CREATED_AT_ASC',
  SeasonByMatchedSeasonIdCreatedAtDesc = 'SEASON_BY_MATCHED_SEASON_ID__CREATED_AT_DESC',
  SeasonByMatchedSeasonIdDandanplayAnimeIdAsc = 'SEASON_BY_MATCHED_SEASON_ID__DANDANPLAY_ANIME_ID_ASC',
  SeasonByMatchedSeasonIdDandanplayAnimeIdDesc = 'SEASON_BY_MATCHED_SEASON_ID__DANDANPLAY_ANIME_ID_DESC',
  SeasonByMatchedSeasonIdDeclaredEpisodeCountAsc = 'SEASON_BY_MATCHED_SEASON_ID__DECLARED_EPISODE_COUNT_ASC',
  SeasonByMatchedSeasonIdDeclaredEpisodeCountDesc = 'SEASON_BY_MATCHED_SEASON_ID__DECLARED_EPISODE_COUNT_DESC',
  SeasonByMatchedSeasonIdDescriptionAsc = 'SEASON_BY_MATCHED_SEASON_ID__DESCRIPTION_ASC',
  SeasonByMatchedSeasonIdDescriptionDesc = 'SEASON_BY_MATCHED_SEASON_ID__DESCRIPTION_DESC',
  SeasonByMatchedSeasonIdDirectoryAsc = 'SEASON_BY_MATCHED_SEASON_ID__DIRECTORY_ASC',
  SeasonByMatchedSeasonIdDirectoryDesc = 'SEASON_BY_MATCHED_SEASON_ID__DIRECTORY_DESC',
  SeasonByMatchedSeasonIdDownloadOffsetHoursAsc = 'SEASON_BY_MATCHED_SEASON_ID__DOWNLOAD_OFFSET_HOURS_ASC',
  SeasonByMatchedSeasonIdDownloadOffsetHoursDesc = 'SEASON_BY_MATCHED_SEASON_ID__DOWNLOAD_OFFSET_HOURS_DESC',
  SeasonByMatchedSeasonIdEpisodesAutoSyncAsc = 'SEASON_BY_MATCHED_SEASON_ID__EPISODES_AUTO_SYNC_ASC',
  SeasonByMatchedSeasonIdEpisodesAutoSyncDesc = 'SEASON_BY_MATCHED_SEASON_ID__EPISODES_AUTO_SYNC_DESC',
  SeasonByMatchedSeasonIdEpisodesLastSyncAsc = 'SEASON_BY_MATCHED_SEASON_ID__EPISODES_LAST_SYNC_ASC',
  SeasonByMatchedSeasonIdEpisodesLastSyncDesc = 'SEASON_BY_MATCHED_SEASON_ID__EPISODES_LAST_SYNC_DESC',
  SeasonByMatchedSeasonIdEpisodesSourceAsc = 'SEASON_BY_MATCHED_SEASON_ID__EPISODES_SOURCE_ASC',
  SeasonByMatchedSeasonIdEpisodesSourceDesc = 'SEASON_BY_MATCHED_SEASON_ID__EPISODES_SOURCE_DESC',
  SeasonByMatchedSeasonIdFanartImageIdAsc = 'SEASON_BY_MATCHED_SEASON_ID__FANART_IMAGE_ID_ASC',
  SeasonByMatchedSeasonIdFanartImageIdDesc = 'SEASON_BY_MATCHED_SEASON_ID__FANART_IMAGE_ID_DESC',
  SeasonByMatchedSeasonIdIdAsc = 'SEASON_BY_MATCHED_SEASON_ID__ID_ASC',
  SeasonByMatchedSeasonIdIdDesc = 'SEASON_BY_MATCHED_SEASON_ID__ID_DESC',
  SeasonByMatchedSeasonIdInfoSourceAsc = 'SEASON_BY_MATCHED_SEASON_ID__INFO_SOURCE_ASC',
  SeasonByMatchedSeasonIdInfoSourceDesc = 'SEASON_BY_MATCHED_SEASON_ID__INFO_SOURCE_DESC',
  SeasonByMatchedSeasonIdIntegrationsLaniaSyncAsc = 'SEASON_BY_MATCHED_SEASON_ID__INTEGRATIONS_LANIA_SYNC_ASC',
  SeasonByMatchedSeasonIdIntegrationsLaniaSyncDesc = 'SEASON_BY_MATCHED_SEASON_ID__INTEGRATIONS_LANIA_SYNC_DESC',
  SeasonByMatchedSeasonIdIsMonitoringAsc = 'SEASON_BY_MATCHED_SEASON_ID__IS_MONITORING_ASC',
  SeasonByMatchedSeasonIdIsMonitoringDesc = 'SEASON_BY_MATCHED_SEASON_ID__IS_MONITORING_DESC',
  SeasonByMatchedSeasonIdJellyfinFolderIdAsc = 'SEASON_BY_MATCHED_SEASON_ID__JELLYFIN_FOLDER_ID_ASC',
  SeasonByMatchedSeasonIdJellyfinFolderIdDesc = 'SEASON_BY_MATCHED_SEASON_ID__JELLYFIN_FOLDER_ID_DESC',
  SeasonByMatchedSeasonIdJellyfinIdAsc = 'SEASON_BY_MATCHED_SEASON_ID__JELLYFIN_ID_ASC',
  SeasonByMatchedSeasonIdJellyfinIdDesc = 'SEASON_BY_MATCHED_SEASON_ID__JELLYFIN_ID_DESC',
  SeasonByMatchedSeasonIdLastWriteDirectoryAsc = 'SEASON_BY_MATCHED_SEASON_ID__LAST_WRITE_DIRECTORY_ASC',
  SeasonByMatchedSeasonIdLastWriteDirectoryDesc = 'SEASON_BY_MATCHED_SEASON_ID__LAST_WRITE_DIRECTORY_DESC',
  SeasonByMatchedSeasonIdLastWriteTitleAsc = 'SEASON_BY_MATCHED_SEASON_ID__LAST_WRITE_TITLE_ASC',
  SeasonByMatchedSeasonIdLastWriteTitleDesc = 'SEASON_BY_MATCHED_SEASON_ID__LAST_WRITE_TITLE_DESC',
  SeasonByMatchedSeasonIdLastWriteToDiskAsc = 'SEASON_BY_MATCHED_SEASON_ID__LAST_WRITE_TO_DISK_ASC',
  SeasonByMatchedSeasonIdLastWriteToDiskDesc = 'SEASON_BY_MATCHED_SEASON_ID__LAST_WRITE_TO_DISK_DESC',
  SeasonByMatchedSeasonIdMikanAnimeIdAsc = 'SEASON_BY_MATCHED_SEASON_ID__MIKAN_ANIME_ID_ASC',
  SeasonByMatchedSeasonIdMikanAnimeIdDesc = 'SEASON_BY_MATCHED_SEASON_ID__MIKAN_ANIME_ID_DESC',
  SeasonByMatchedSeasonIdNeedDownloadCcAsc = 'SEASON_BY_MATCHED_SEASON_ID__NEED_DOWNLOAD_CC_ASC',
  SeasonByMatchedSeasonIdNeedDownloadCcDesc = 'SEASON_BY_MATCHED_SEASON_ID__NEED_DOWNLOAD_CC_DESC',
  SeasonByMatchedSeasonIdNotifyMissingAsc = 'SEASON_BY_MATCHED_SEASON_ID__NOTIFY_MISSING_ASC',
  SeasonByMatchedSeasonIdNotifyMissingDesc = 'SEASON_BY_MATCHED_SEASON_ID__NOTIFY_MISSING_DESC',
  SeasonByMatchedSeasonIdNotifyPublishAsc = 'SEASON_BY_MATCHED_SEASON_ID__NOTIFY_PUBLISH_ASC',
  SeasonByMatchedSeasonIdNotifyPublishDesc = 'SEASON_BY_MATCHED_SEASON_ID__NOTIFY_PUBLISH_DESC',
  SeasonByMatchedSeasonIdPosterImageIdAsc = 'SEASON_BY_MATCHED_SEASON_ID__POSTER_IMAGE_ID_ASC',
  SeasonByMatchedSeasonIdPosterImageIdDesc = 'SEASON_BY_MATCHED_SEASON_ID__POSTER_IMAGE_ID_DESC',
  SeasonByMatchedSeasonIdPremiereDateAsc = 'SEASON_BY_MATCHED_SEASON_ID__PREMIERE_DATE_ASC',
  SeasonByMatchedSeasonIdPremiereDateDesc = 'SEASON_BY_MATCHED_SEASON_ID__PREMIERE_DATE_DESC',
  SeasonByMatchedSeasonIdSmartDownloadEnabledAsc = 'SEASON_BY_MATCHED_SEASON_ID__SMART_DOWNLOAD_ENABLED_ASC',
  SeasonByMatchedSeasonIdSmartDownloadEnabledDesc = 'SEASON_BY_MATCHED_SEASON_ID__SMART_DOWNLOAD_ENABLED_DESC',
  SeasonByMatchedSeasonIdSmartDownloadPreferBahaAsc = 'SEASON_BY_MATCHED_SEASON_ID__SMART_DOWNLOAD_PREFER_BAHA_ASC',
  SeasonByMatchedSeasonIdSmartDownloadPreferBahaDesc = 'SEASON_BY_MATCHED_SEASON_ID__SMART_DOWNLOAD_PREFER_BAHA_DESC',
  SeasonByMatchedSeasonIdSmartDownloadSubtitleAsc = 'SEASON_BY_MATCHED_SEASON_ID__SMART_DOWNLOAD_SUBTITLE_ASC',
  SeasonByMatchedSeasonIdSmartDownloadSubtitleDesc = 'SEASON_BY_MATCHED_SEASON_ID__SMART_DOWNLOAD_SUBTITLE_DESC',
  SeasonByMatchedSeasonIdSmartDownloadTimeoutMinutesAsc = 'SEASON_BY_MATCHED_SEASON_ID__SMART_DOWNLOAD_TIMEOUT_MINUTES_ASC',
  SeasonByMatchedSeasonIdSmartDownloadTimeoutMinutesDesc = 'SEASON_BY_MATCHED_SEASON_ID__SMART_DOWNLOAD_TIMEOUT_MINUTES_DESC',
  SeasonByMatchedSeasonIdSmartDownloadWindowHoursAsc = 'SEASON_BY_MATCHED_SEASON_ID__SMART_DOWNLOAD_WINDOW_HOURS_ASC',
  SeasonByMatchedSeasonIdSmartDownloadWindowHoursDesc = 'SEASON_BY_MATCHED_SEASON_ID__SMART_DOWNLOAD_WINDOW_HOURS_DESC',
  SeasonByMatchedSeasonIdTagsAsc = 'SEASON_BY_MATCHED_SEASON_ID__TAGS_ASC',
  SeasonByMatchedSeasonIdTagsDesc = 'SEASON_BY_MATCHED_SEASON_ID__TAGS_DESC',
  SeasonByMatchedSeasonIdTitleAsc = 'SEASON_BY_MATCHED_SEASON_ID__TITLE_ASC',
  SeasonByMatchedSeasonIdTitleDesc = 'SEASON_BY_MATCHED_SEASON_ID__TITLE_DESC',
  SeasonByMatchedSeasonIdTvdbIdAsc = 'SEASON_BY_MATCHED_SEASON_ID__TVDB_ID_ASC',
  SeasonByMatchedSeasonIdTvdbIdDesc = 'SEASON_BY_MATCHED_SEASON_ID__TVDB_ID_DESC',
  SeasonByMatchedSeasonIdTvdbSeasonAsc = 'SEASON_BY_MATCHED_SEASON_ID__TVDB_SEASON_ASC',
  SeasonByMatchedSeasonIdTvdbSeasonDesc = 'SEASON_BY_MATCHED_SEASON_ID__TVDB_SEASON_DESC',
  SeasonByMatchedSeasonIdWeekdayAsc = 'SEASON_BY_MATCHED_SEASON_ID__WEEKDAY_ASC',
  SeasonByMatchedSeasonIdWeekdayDesc = 'SEASON_BY_MATCHED_SEASON_ID__WEEKDAY_DESC',
  SeasonByMatchedSeasonIdYearAndSemesterAsc = 'SEASON_BY_MATCHED_SEASON_ID__YEAR_AND_SEMESTER_ASC',
  SeasonByMatchedSeasonIdYearAndSemesterCanonicalAsc = 'SEASON_BY_MATCHED_SEASON_ID__YEAR_AND_SEMESTER_CANONICAL_ASC',
  SeasonByMatchedSeasonIdYearAndSemesterCanonicalDesc = 'SEASON_BY_MATCHED_SEASON_ID__YEAR_AND_SEMESTER_CANONICAL_DESC',
  SeasonByMatchedSeasonIdYearAndSemesterDesc = 'SEASON_BY_MATCHED_SEASON_ID__YEAR_AND_SEMESTER_DESC',
  SeasonTitleAliasesAsc = 'SEASON_TITLE_ALIASES_ASC',
  SeasonTitleAliasesDesc = 'SEASON_TITLE_ALIASES_DESC',
  SeasonTitleRawAsc = 'SEASON_TITLE_RAW_ASC',
  SeasonTitleRawDesc = 'SEASON_TITLE_RAW_DESC',
  SizeAsc = 'SIZE_ASC',
  SizeDesc = 'SIZE_DESC',
  SourcePlatformAsc = 'SOURCE_PLATFORM_ASC',
  SourcePlatformDesc = 'SOURCE_PLATFORM_DESC',
  SourceTypeAsc = 'SOURCE_TYPE_ASC',
  SourceTypeDesc = 'SOURCE_TYPE_DESC',
  SubtitleHasChsAsc = 'SUBTITLE_HAS_CHS_ASC',
  SubtitleHasChsDesc = 'SUBTITLE_HAS_CHS_DESC',
  SubtitleHasChtAsc = 'SUBTITLE_HAS_CHT_ASC',
  SubtitleHasChtDesc = 'SUBTITLE_HAS_CHT_DESC',
  SubtitleHasJpAsc = 'SUBTITLE_HAS_JP_ASC',
  SubtitleHasJpDesc = 'SUBTITLE_HAS_JP_DESC',
  SubtitleTypeAsc = 'SUBTITLE_TYPE_ASC',
  SubtitleTypeDesc = 'SUBTITLE_TYPE_DESC',
  TitleAsc = 'TITLE_ASC',
  TitleDesc = 'TITLE_DESC',
  TorrentLinkAsc = 'TORRENT_LINK_ASC',
  TorrentLinkDesc = 'TORRENT_LINK_DESC'
}

/** All input for the `updateEpisodeById` mutation. */
export type UpdateEpisodeByIdInput = {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** An object where the defined keys will be set on the `Episode` being updated. */
  episodePatch: EpisodePatch;
  id: Scalars['Int'];
};

/** All input for the `updateEpisodeBySeasonIdAndBangumiEpisodeId` mutation. */
export type UpdateEpisodeBySeasonIdAndBangumiEpisodeIdInput = {
  bangumiEpisodeId: Scalars['Int'];
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** An object where the defined keys will be set on the `Episode` being updated. */
  episodePatch: EpisodePatch;
  seasonId: Scalars['Int'];
};

/** All input for the `updateEpisodeBySeasonIdAndEpisodeTypeAndEpisodeNumber` mutation. */
export type UpdateEpisodeBySeasonIdAndEpisodeTypeAndEpisodeNumberInput = {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']>;
  episodeNumber: Scalars['BigFloat'];
  /** An object where the defined keys will be set on the `Episode` being updated. */
  episodePatch: EpisodePatch;
  episodeType: EpisodeType;
  seasonId: Scalars['Int'];
};

/** All input for the `updateEpisodeBySeasonIdAndIndex` mutation. */
export type UpdateEpisodeBySeasonIdAndIndexInput = {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** An object where the defined keys will be set on the `Episode` being updated. */
  episodePatch: EpisodePatch;
  index: Scalars['Int'];
  seasonId: Scalars['Int'];
};

/** All input for the `updateEpisode` mutation. */
export type UpdateEpisodeInput = {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** An object where the defined keys will be set on the `Episode` being updated. */
  episodePatch: EpisodePatch;
  /** The globally unique `ID` which will identify a single `Episode` to be updated. */
  nodeId: Scalars['ID'];
};

/** The output of our update `Episode` mutation. */
export type UpdateEpisodePayload = {
  __typename?: 'UpdateEpisodePayload';
  /**
   * The exact same `clientMutationId` that was provided in the mutation input,
   * unchanged and unused. May be used by a client to track mutations.
   */
  clientMutationId?: Maybe<Scalars['String']>;
  /** The `Episode` that was updated by this mutation. */
  episode?: Maybe<Episode>;
  /** An edge for our `Episode`. May be used by Relay 1. */
  episodeEdge?: Maybe<EpisodesEdge>;
  /** Our root query field type. Allows us to run any query from our mutation payload. */
  query?: Maybe<Query>;
  /** Reads a single `Season` that is related to this `Episode`. */
  seasonBySeasonId?: Maybe<Season>;
};


/** The output of our update `Episode` mutation. */
export type UpdateEpisodePayloadEpisodeEdgeArgs = {
  orderBy?: InputMaybe<Array<EpisodesOrderBy>>;
};

/** All input for the `updateImageById` mutation. */
export type UpdateImageByIdInput = {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']>;
  id: Scalars['Int'];
  /** An object where the defined keys will be set on the `Image` being updated. */
  imagePatch: ImagePatch;
};

/** All input for the `updateImageBySourceUrl` mutation. */
export type UpdateImageBySourceUrlInput = {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** An object where the defined keys will be set on the `Image` being updated. */
  imagePatch: ImagePatch;
  sourceUrl: Scalars['String'];
};

/** All input for the `updateImage` mutation. */
export type UpdateImageInput = {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** An object where the defined keys will be set on the `Image` being updated. */
  imagePatch: ImagePatch;
  /** The globally unique `ID` which will identify a single `Image` to be updated. */
  nodeId: Scalars['ID'];
};

/** The output of our update `Image` mutation. */
export type UpdateImagePayload = {
  __typename?: 'UpdateImagePayload';
  /**
   * The exact same `clientMutationId` that was provided in the mutation input,
   * unchanged and unused. May be used by a client to track mutations.
   */
  clientMutationId?: Maybe<Scalars['String']>;
  /** The `Image` that was updated by this mutation. */
  image?: Maybe<Image>;
  /** An edge for our `Image`. May be used by Relay 1. */
  imageEdge?: Maybe<ImagesEdge>;
  /** Our root query field type. Allows us to run any query from our mutation payload. */
  query?: Maybe<Query>;
};


/** The output of our update `Image` mutation. */
export type UpdateImagePayloadImageEdgeArgs = {
  orderBy?: InputMaybe<Array<ImagesOrderBy>>;
};

/** All input for the `updateJellyfinFolderById` mutation. */
export type UpdateJellyfinFolderByIdInput = {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']>;
  id: Scalars['Int'];
  /** An object where the defined keys will be set on the `JellyfinFolder` being updated. */
  jellyfinFolderPatch: JellyfinFolderPatch;
};

/** All input for the `updateJellyfinFolderByJellyfinId` mutation. */
export type UpdateJellyfinFolderByJellyfinIdInput = {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** An object where the defined keys will be set on the `JellyfinFolder` being updated. */
  jellyfinFolderPatch: JellyfinFolderPatch;
  jellyfinId: Scalars['String'];
};

/** All input for the `updateJellyfinFolder` mutation. */
export type UpdateJellyfinFolderInput = {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** An object where the defined keys will be set on the `JellyfinFolder` being updated. */
  jellyfinFolderPatch: JellyfinFolderPatch;
  /** The globally unique `ID` which will identify a single `JellyfinFolder` to be updated. */
  nodeId: Scalars['ID'];
};

/** The output of our update `JellyfinFolder` mutation. */
export type UpdateJellyfinFolderPayload = {
  __typename?: 'UpdateJellyfinFolderPayload';
  /**
   * The exact same `clientMutationId` that was provided in the mutation input,
   * unchanged and unused. May be used by a client to track mutations.
   */
  clientMutationId?: Maybe<Scalars['String']>;
  /** The `JellyfinFolder` that was updated by this mutation. */
  jellyfinFolder?: Maybe<JellyfinFolder>;
  /** An edge for our `JellyfinFolder`. May be used by Relay 1. */
  jellyfinFolderEdge?: Maybe<JellyfinFoldersEdge>;
  /** Our root query field type. Allows us to run any query from our mutation payload. */
  query?: Maybe<Query>;
};


/** The output of our update `JellyfinFolder` mutation. */
export type UpdateJellyfinFolderPayloadJellyfinFolderEdgeArgs = {
  orderBy?: InputMaybe<Array<JellyfinFoldersOrderBy>>;
};

/** All input for the `updateSeasonById` mutation. */
export type UpdateSeasonByIdInput = {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']>;
  id: Scalars['Int'];
  /** An object where the defined keys will be set on the `Season` being updated. */
  seasonPatch: SeasonPatch;
};

/** All input for the `updateSeasonByTitle` mutation. */
export type UpdateSeasonByTitleInput = {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** An object where the defined keys will be set on the `Season` being updated. */
  seasonPatch: SeasonPatch;
  title: Scalars['String'];
};

/** All input for the `updateSeason` mutation. */
export type UpdateSeasonInput = {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** The globally unique `ID` which will identify a single `Season` to be updated. */
  nodeId: Scalars['ID'];
  /** An object where the defined keys will be set on the `Season` being updated. */
  seasonPatch: SeasonPatch;
};

/** The output of our update `Season` mutation. */
export type UpdateSeasonPayload = {
  __typename?: 'UpdateSeasonPayload';
  /**
   * The exact same `clientMutationId` that was provided in the mutation input,
   * unchanged and unused. May be used by a client to track mutations.
   */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Reads a single `Image` that is related to this `Season`. */
  imageByBannerImageId?: Maybe<Image>;
  /** Reads a single `Image` that is related to this `Season`. */
  imageByFanartImageId?: Maybe<Image>;
  /** Reads a single `Image` that is related to this `Season`. */
  imageByPosterImageId?: Maybe<Image>;
  /** Reads a single `JellyfinFolder` that is related to this `Season`. */
  jellyfinFolderByJellyfinFolderId?: Maybe<JellyfinFolder>;
  /** Our root query field type. Allows us to run any query from our mutation payload. */
  query?: Maybe<Query>;
  /** The `Season` that was updated by this mutation. */
  season?: Maybe<Season>;
  /** An edge for our `Season`. May be used by Relay 1. */
  seasonEdge?: Maybe<SeasonsEdge>;
};


/** The output of our update `Season` mutation. */
export type UpdateSeasonPayloadSeasonEdgeArgs = {
  orderBy?: InputMaybe<Array<SeasonsOrderBy>>;
};

export type PreviewTorrentMutationVariables = Exact<{
  torrentId: Scalars['Int'];
}>;


export type PreviewTorrentMutation = { __typename?: 'Mutation', previewTorrent: { __typename?: 'TorrentPreview', token: string, files: Array<{ __typename?: 'TorrentPreviewFile', path: string, size: number }> } };

export type DownloadTorrentForSeasonMutationVariables = Exact<{
  seasonId: Scalars['Int'];
  previewToken: Scalars['String'];
  entries: Array<BatchDownloadEntry> | BatchDownloadEntry;
}>;


export type DownloadTorrentForSeasonMutation = { __typename?: 'Mutation', downloadTorrentForSeason: number };

export type GetEpisodeByIdQueryVariables = Exact<{
  episodeByIdId: Scalars['Int'];
}>;


export type GetEpisodeByIdQuery = { __typename?: 'Query', episodeById?: { __typename?: 'Episode', rawAirTime?: any | null, airTime?: any | null, createdAt: any, description: string, id: number, index?: number | null, numbering?: any | null, jellyfinEpisodeId?: string | null, title: string, tasksByEpisodeId: { __typename?: 'TasksConnection', edges: Array<{ __typename?: 'TasksEdge', node?: { __typename?: 'Task', type: TaskType, isSmartDownload: boolean, batchEntries?: any | null, sourcePath?: string | null, episodeId?: number | null, createdAt: any, downloadPath?: string | null, failedAt?: any | null, failedReason: string, filePath?: string | null, id: number, importPath?: string | null, isFailed: boolean, isCancelled: boolean, workflow?: any | null, version: number, nfoPath?: string | null, qbtTorrentHash?: string | null, legacyStage: LegacyTaskStage, torrentLink?: string | null, jellyfinEpisodeId?: string | null, torrentTitle?: string | null, taskEpisodesByTaskId: { __typename?: 'TaskEpisodesConnection', nodes: Array<{ __typename?: 'TaskEpisode', episodeId: number, episodeByEpisodeId?: { __typename?: 'Episode', id: number, title: string, numbering?: any | null, seasonBySeasonId?: { __typename?: 'Season', id: number, title: string, jellyfinId: string } | null } | null } | null> } } | null }> }, seasonBySeasonId?: { __typename?: 'Season', id: number, title: string, downloadOffsetHours: number } | null } | null };

export type GetEpisodeNavigationQueryVariables = Exact<{
  episodeId: Scalars['Int'];
}>;


export type GetEpisodeNavigationQuery = { __typename?: 'Query', episodeById?: { __typename?: 'Episode', id: number, seasonBySeasonId?: { __typename?: 'Season', id: number, episodesBySeasonId: { __typename?: 'EpisodesConnection', edges: Array<{ __typename?: 'EpisodesEdge', node?: { __typename?: 'Episode', id: number, numbering?: any | null } | null }> } } | null } | null };

export type EpisodeDetailsFieldsFragment = { __typename?: 'Episode', rawAirTime?: any | null, airTime?: any | null, createdAt: any, description: string, id: number, index?: number | null, numbering?: any | null, jellyfinEpisodeId?: string | null, title: string, tasksByEpisodeId: { __typename?: 'TasksConnection', edges: Array<{ __typename?: 'TasksEdge', node?: { __typename?: 'Task', type: TaskType, isSmartDownload: boolean, batchEntries?: any | null, sourcePath?: string | null, episodeId?: number | null, createdAt: any, downloadPath?: string | null, failedAt?: any | null, failedReason: string, filePath?: string | null, id: number, importPath?: string | null, isFailed: boolean, isCancelled: boolean, workflow?: any | null, version: number, nfoPath?: string | null, qbtTorrentHash?: string | null, legacyStage: LegacyTaskStage, torrentLink?: string | null, jellyfinEpisodeId?: string | null, torrentTitle?: string | null, taskEpisodesByTaskId: { __typename?: 'TaskEpisodesConnection', nodes: Array<{ __typename?: 'TaskEpisode', episodeId: number, episodeByEpisodeId?: { __typename?: 'Episode', id: number, title: string, numbering?: any | null, seasonBySeasonId?: { __typename?: 'Season', id: number, title: string, jellyfinId: string } | null } | null } | null> } } | null }> }, seasonBySeasonId?: { __typename?: 'Season', id: number, title: string, downloadOffsetHours: number } | null };

export type GetTaskByIdQueryVariables = Exact<{
  id: Scalars['Int'];
}>;


export type GetTaskByIdQuery = { __typename?: 'Query', taskById?: { __typename?: 'Task', type: TaskType, isSmartDownload: boolean, batchEntries?: any | null, sourcePath?: string | null, episodeId?: number | null, createdAt: any, downloadPath?: string | null, failedAt?: any | null, failedReason: string, filePath?: string | null, id: number, importPath?: string | null, isFailed: boolean, isCancelled: boolean, workflow?: any | null, version: number, nfoPath?: string | null, qbtTorrentHash?: string | null, legacyStage: LegacyTaskStage, torrentLink?: string | null, jellyfinEpisodeId?: string | null, torrentTitle?: string | null, episodeByEpisodeId?: { __typename?: 'Episode', rawAirTime?: any | null, airTime?: any | null, createdAt: any, description: string, id: number, index?: number | null, numbering?: any | null, jellyfinEpisodeId?: string | null, title: string, tasksByEpisodeId: { __typename?: 'TasksConnection', edges: Array<{ __typename?: 'TasksEdge', node?: { __typename?: 'Task', type: TaskType, isSmartDownload: boolean, batchEntries?: any | null, sourcePath?: string | null, episodeId?: number | null, createdAt: any, downloadPath?: string | null, failedAt?: any | null, failedReason: string, filePath?: string | null, id: number, importPath?: string | null, isFailed: boolean, isCancelled: boolean, workflow?: any | null, version: number, nfoPath?: string | null, qbtTorrentHash?: string | null, legacyStage: LegacyTaskStage, torrentLink?: string | null, jellyfinEpisodeId?: string | null, torrentTitle?: string | null, taskEpisodesByTaskId: { __typename?: 'TaskEpisodesConnection', nodes: Array<{ __typename?: 'TaskEpisode', episodeId: number, episodeByEpisodeId?: { __typename?: 'Episode', id: number, title: string, numbering?: any | null, seasonBySeasonId?: { __typename?: 'Season', id: number, title: string, jellyfinId: string } | null } | null } | null> } } | null }> }, seasonBySeasonId?: { __typename?: 'Season', id: number, title: string, downloadOffsetHours: number } | null } | null, taskEpisodesByTaskId: { __typename?: 'TaskEpisodesConnection', nodes: Array<{ __typename?: 'TaskEpisode', episodeId: number, episodeByEpisodeId?: { __typename?: 'Episode', id: number, title: string, numbering?: any | null, seasonBySeasonId?: { __typename?: 'Season', id: number, title: string, jellyfinId: string } | null } | null } | null> } } | null };

export type ListFilesQueryVariables = Exact<{
  path: Scalars['String'];
}>;


export type ListFilesQuery = { __typename?: 'Query', listFiles: Array<{ __typename?: 'FileEntry', lastModified: string, name: string, path: string, size?: any | null, type: FileEntryType }> };

export type ImportSingleMutationVariables = Exact<{
  episodeId: Scalars['Int'];
  path: Scalars['String'];
}>;


export type ImportSingleMutation = { __typename?: 'Mutation', importSingle: number };

export type ImportMultipleMutationVariables = Exact<{
  entries: Array<ImportMultipleEntry> | ImportMultipleEntry;
}>;


export type ImportMultipleMutation = { __typename?: 'Mutation', importMultiple: number };

export type GetImportSeasonQueryVariables = Exact<{
  id: Scalars['Int'];
  offset: Scalars['Int'];
}>;


export type GetImportSeasonQuery = { __typename?: 'Query', seasonById?: { __typename?: 'Season', id: number, title: string, episodesBySeasonId: { __typename?: 'EpisodesConnection', totalCount: number, nodes: Array<{ __typename?: 'Episode', id: number, title: string, index?: number | null, numbering?: any | null, jellyfinEpisodeId?: string | null, airTime?: any | null, matchingTasks: { __typename?: 'TasksConnection', nodes: Array<{ __typename?: 'Task', id: number, type: TaskType, legacyStage: LegacyTaskStage, isFailed: boolean, isCancelled: boolean, workflow?: any | null, version: number } | null> }, tasks: { __typename?: 'TasksConnection', edges: Array<{ __typename?: 'TasksEdge', node?: { __typename?: 'Task', id: number, type: TaskType, statusSummary?: TaskSummary | null } | null }> } } | null> } } | null };

export type SearchTorrentQueryVariables = Exact<{
  keyword: Scalars['String'];
  first: Scalars['Int'];
  offset?: InputMaybe<Scalars['Int']>;
}>;


export type SearchTorrentQuery = { __typename?: 'Query', allTorrents?: { __typename?: 'TorrentsConnection', totalCount: number, edges: Array<{ __typename?: 'TorrentsEdge', node?: { __typename?: 'Torrent', id: number, displayId: number, channel: TorrentChannel, permalink?: string | null, publishDate: any, size: any, title: string, torrentLink: string, episodeInfo?: any | null, subtitleInfo?: any | null } | null }> } | null };

export type TaskDetailsFieldsFragment = { __typename?: 'Task', type: TaskType, isSmartDownload: boolean, batchEntries?: any | null, sourcePath?: string | null, episodeId?: number | null, createdAt: any, downloadPath?: string | null, failedAt?: any | null, failedReason: string, filePath?: string | null, id: number, importPath?: string | null, isFailed: boolean, isCancelled: boolean, workflow?: any | null, version: number, nfoPath?: string | null, qbtTorrentHash?: string | null, legacyStage: LegacyTaskStage, torrentLink?: string | null, jellyfinEpisodeId?: string | null, torrentTitle?: string | null, taskEpisodesByTaskId: { __typename?: 'TaskEpisodesConnection', nodes: Array<{ __typename?: 'TaskEpisode', episodeId: number, episodeByEpisodeId?: { __typename?: 'Episode', id: number, title: string, numbering?: any | null, seasonBySeasonId?: { __typename?: 'Season', id: number, title: string, jellyfinId: string } | null } | null } | null> } };

export type GetTaskStatesQueryVariables = Exact<{
  taskIds: Array<Scalars['Int']> | Scalars['Int'];
}>;


export type GetTaskStatesQuery = { __typename?: 'Query', getTaskStates: Array<{ __typename?: 'TaskState', id: number, type: TaskType, version: number, workflow?: Workflow | null, legacyStage: LegacyTaskStage, isFailed: boolean, isCancelled: boolean, failedReason: string, canRetry: boolean, canCancel: boolean, qbtTorrentHash?: string | null, torrentTitle?: string | null, downloadPath?: string | null, importPath?: string | null, filePath?: string | null, nfoPath?: string | null, jellyfinEpisodeId?: string | null, batchEntries?: Array<{ __typename?: 'BatchImportEntryState', id: string, episodeId: number, sourcePath: string, importPath?: string | null, filePath?: string | null, nfoPath?: string | null, jellyfinEpisodeId?: string | null }> | null }> };

export type CancelTaskMutationVariables = Exact<{
  taskId: Scalars['Int'];
}>;


export type CancelTaskMutation = { __typename?: 'Mutation', cancelTask: string };

export type RetryTaskMutationVariables = Exact<{
  taskId: Scalars['Int'];
}>;


export type RetryTaskMutation = { __typename?: 'Mutation', retryTask: string };

export type GetDownloadProgressQueryVariables = Exact<{
  taskIds: Array<Scalars['Int']> | Scalars['Int'];
}>;


export type GetDownloadProgressQuery = { __typename?: 'Query', getDownloadProgress: Array<{ __typename?: 'DownloadProgress', downloaded: any, eta?: number | null, id: number, peers?: number | null, seeds?: number | null, speed: number, total: any }> };

export type TaskStatusFieldsFragment = { __typename?: 'Task', id: number, type: TaskType, legacyStage: LegacyTaskStage, isFailed: boolean, isCancelled: boolean, workflow?: any | null, version: number };

export type EpisodeStatusFieldsFragment = { __typename?: 'Episode', jellyfinEpisodeId?: string | null, airTime?: any | null, id: number, tasks: { __typename?: 'TasksConnection', edges: Array<{ __typename?: 'TasksEdge', node?: { __typename?: 'Task', id: number, type: TaskType, statusSummary?: TaskSummary | null } | null }> } };

export type TaskSummaryFieldsFragment = { __typename?: 'Task', id: number, type: TaskType, statusSummary?: TaskSummary | null };

export type GetTaskSummariesQueryVariables = Exact<{
  taskIds: Array<Scalars['Int']> | Scalars['Int'];
}>;


export type GetTaskSummariesQuery = { __typename?: 'Query', allTasks?: { __typename?: 'TasksConnection', nodes: Array<{ __typename?: 'Task', id: number, type: TaskType, statusSummary?: TaskSummary | null } | null> } | null };

export type Folders_ListFoldersFieldsFragment = { __typename?: 'JellyfinFolder', jellyfinId: string, location: string, name: string, id: number, isDefault: boolean, isHidden: boolean, mappedLocation?: string | null };

export type Folders_ListFoldersQueryVariables = Exact<{
  offset?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<JellyfinFoldersOrderBy> | JellyfinFoldersOrderBy>;
  filter?: InputMaybe<JellyfinFolderFilter>;
}>;


export type Folders_ListFoldersQuery = { __typename?: 'Query', data?: { __typename?: 'JellyfinFoldersConnection', totalCount: number, edges: Array<{ __typename?: 'JellyfinFoldersEdge', node?: { __typename?: 'JellyfinFolder', jellyfinId: string, location: string, name: string, id: number, isDefault: boolean, isHidden: boolean, mappedLocation?: string | null } | null }> } | null };

export type Folders_UpdateFolderByIdMutationVariables = Exact<{
  id: Scalars['Int'];
  folderPatch: JellyfinFolderPatch;
}>;


export type Folders_UpdateFolderByIdMutation = { __typename?: 'Mutation', updateJellyfinFolderById?: { __typename: 'UpdateJellyfinFolderPayload' } | null };

export type Folders_SetFolderDefaultMutationVariables = Exact<{
  id: Scalars['Int'];
}>;


export type Folders_SetFolderDefaultMutation = { __typename?: 'Mutation', setJellyfinFolderDefault: string };

export type Folders_SyncJellyfinFoldersMutationVariables = Exact<{ [key: string]: never; }>;


export type Folders_SyncJellyfinFoldersMutation = { __typename?: 'Mutation', syncJellyfinFolders: string };

export type ListTasksFieldsFragment = { __typename?: 'Task', id: number, type: TaskType, legacyStage: LegacyTaskStage, isFailed: boolean, isCancelled: boolean, workflow?: any | null, version: number, jellyfinEpisodeId?: string | null, createdAt: any, failedReason: string, taskEpisodesByTaskId: { __typename?: 'TaskEpisodesConnection', nodes: Array<{ __typename?: 'TaskEpisode', episodeId: number, episodeByEpisodeId?: { __typename?: 'Episode', id: number, numbering?: any | null, seasonBySeasonId?: { __typename?: 'Season', id: number, title: string } | null } | null } | null> }, episodeByEpisodeId?: { __typename?: 'Episode', id: number, airTime?: any | null, title: string, index?: number | null, numbering?: any | null, seasonBySeasonId?: { __typename?: 'Season', id: number, title: string } | null } | null };

export type ListTasksQueryVariables = Exact<{
  offset?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  filter?: InputMaybe<TaskFilter>;
}>;


export type ListTasksQuery = { __typename?: 'Query', allTasks?: { __typename?: 'TasksConnection', totalCount: number, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean }, edges: Array<{ __typename?: 'TasksEdge', cursor?: any | null, node?: { __typename?: 'Task', id: number, type: TaskType, legacyStage: LegacyTaskStage, isFailed: boolean, isCancelled: boolean, workflow?: any | null, version: number, jellyfinEpisodeId?: string | null, createdAt: any, failedReason: string, taskEpisodesByTaskId: { __typename?: 'TaskEpisodesConnection', nodes: Array<{ __typename?: 'TaskEpisode', episodeId: number, episodeByEpisodeId?: { __typename?: 'Episode', id: number, numbering?: any | null, seasonBySeasonId?: { __typename?: 'Season', id: number, title: string } | null } | null } | null> }, episodeByEpisodeId?: { __typename?: 'Episode', id: number, airTime?: any | null, title: string, index?: number | null, numbering?: any | null, seasonBySeasonId?: { __typename?: 'Season', id: number, title: string } | null } | null } | null }> } | null };

export type GetTaskPageSignatureQueryVariables = Exact<{
  offset?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  filter?: InputMaybe<TaskFilter>;
}>;


export type GetTaskPageSignatureQuery = { __typename?: 'Query', allTasks?: { __typename?: 'TasksConnection', totalCount: number, edges: Array<{ __typename?: 'TasksEdge', node?: { __typename?: 'Task', id: number } | null }> } | null };

export type GetEpisodesStatusQueryVariables = Exact<{
  episodeIds: Array<Scalars['Int']> | Scalars['Int'];
}>;


export type GetEpisodesStatusQuery = { __typename?: 'Query', allEpisodes?: { __typename?: 'EpisodesConnection', edges: Array<{ __typename?: 'EpisodesEdge', node?: { __typename?: 'Episode', jellyfinEpisodeId?: string | null, airTime?: any | null, id: number, tasks: { __typename?: 'TasksConnection', edges: Array<{ __typename?: 'TasksEdge', node?: { __typename?: 'Task', id: number, type: TaskType, statusSummary?: TaskSummary | null } | null }> } } | null }> } | null };

export type MockEpisodePublishMutationVariables = Exact<{
  episodeId: Scalars['Int'];
}>;


export type MockEpisodePublishMutation = { __typename?: 'Mutation', mockEpisodePublish: string };

export type SmartDownloadPreviewQueryVariables = Exact<{
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  after?: InputMaybe<Scalars['Cursor']>;
  filter: TorrentFilter;
}>;


export type SmartDownloadPreviewQuery = { __typename?: 'Query', allTorrents?: { __typename?: 'TorrentsConnection', nodes: Array<{ __typename?: 'Torrent', id: number, hash: string, title: string, publishDate: any, size: any, episodeInfo?: any | null, subtitleInfo?: any | null, parseVersion?: number | null, channel: TorrentChannel, metadataFetchedAt?: any | null } | null>, pageInfo: { __typename?: 'PageInfo', endCursor?: any | null, hasNextPage: boolean, hasPreviousPage: boolean } } | null, config: { __typename?: 'AdminConfig', smartDownloadTitleExcludes?: Array<string> | null } };

export type SmartDownloadStateQueryVariables = Exact<{
  seasonId: Scalars['Int'];
  after?: InputMaybe<Scalars['Cursor']>;
}>;


export type SmartDownloadStateQuery = { __typename?: 'Query', allTasks?: { __typename?: 'TasksConnection', nodes: Array<{ __typename?: 'Task', id: number, smartDownloadTorrentHash?: string | null, statusSummary?: TaskSummary | null } | null>, pageInfo: { __typename?: 'PageInfo', endCursor?: any | null, hasNextPage: boolean } } | null, config: { __typename?: 'AdminConfig', matching?: { __typename?: 'PublicMatchingConfig', enabled: boolean, backend: string, mode?: string | null } | null } };

export type DisplayImageFieldsFragment = { __typename?: 'Image', id: number, downloadPath?: string | null };

export type SeasonEpisodesFragment = { __typename?: 'Season', episodesLastSync?: any | null, episodesBySeasonId: { __typename?: 'EpisodesConnection', edges: Array<{ __typename?: 'EpisodesEdge', node?: { __typename?: 'Episode', airTime?: any | null, rawAirTime?: any | null, bangumiSort?: any | null, id: number, index?: number | null, numbering?: any | null, jellyfinEpisodeId?: string | null, title: string, tasks: { __typename?: 'TasksConnection', edges: Array<{ __typename?: 'TasksEdge', node?: { __typename?: 'Task', id: number, type: TaskType, statusSummary?: TaskSummary | null } | null }> } } | null }> } };

export type SeasonConfigFieldsFragment = { __typename?: 'Season', id: number, infoSource: MetadataSource, isMonitoring: boolean, smartDownloadEnabled: boolean, smartDownloadSubtitle: string, smartDownloadPreferBaha: boolean, smartDownloadWindowHours: number, smartDownloadTimeoutMinutes?: number | null, tags: Array<string | null>, title: string, tvdbId: string, tvdbSeason?: number | null, weekday?: number | null, yearAndSemester: string, airTime: string, bangumiId: string, bilibiliMainlandId: string, bilibiliThmId: string, createdAt: any, description: string, aliases: Array<string | null>, episodesSource: MetadataSource, needDownloadCc: boolean, notifyMissing: boolean, notifyPublish: boolean, episodesAutoSync: boolean, downloadOffsetHours: number, integrationsLaniaSync: boolean, downloadSourcesBySeasonId: { __typename?: 'DownloadSourcesConnection', edges: Array<{ __typename?: 'DownloadSourcesEdge', node?: { __typename?: 'DownloadSource', id: number, pattern: string, offset: number } | null }> }, poster?: { __typename?: 'Image', id: number, downloadPath?: string | null } | null, banner?: { __typename?: 'Image', id: number, downloadPath?: string | null } | null, fanart?: { __typename?: 'Image', id: number, downloadPath?: string | null } | null, jellyfinFolder?: { __typename?: 'JellyfinFolder', name: string, location: string } | null };

export type GetSeasonByIdQueryVariables = Exact<{
  id: Scalars['Int'];
  withConfig?: Scalars['Boolean'];
  withEpisodes?: Scalars['Boolean'];
}>;


export type GetSeasonByIdQuery = { __typename: 'Query', seasonById?: { __typename?: 'Season', id: number, infoSource: MetadataSource, isMonitoring: boolean, smartDownloadEnabled: boolean, smartDownloadSubtitle: string, smartDownloadPreferBaha: boolean, smartDownloadWindowHours: number, smartDownloadTimeoutMinutes?: number | null, tags: Array<string | null>, title: string, tvdbId: string, tvdbSeason?: number | null, weekday?: number | null, yearAndSemester: string, airTime: string, bangumiId: string, bilibiliMainlandId: string, bilibiliThmId: string, createdAt: any, description: string, aliases: Array<string | null>, episodesSource: MetadataSource, needDownloadCc: boolean, notifyMissing: boolean, notifyPublish: boolean, episodesAutoSync: boolean, downloadOffsetHours: number, integrationsLaniaSync: boolean, episodesLastSync?: any | null, downloadSourcesBySeasonId: { __typename?: 'DownloadSourcesConnection', edges: Array<{ __typename?: 'DownloadSourcesEdge', node?: { __typename?: 'DownloadSource', id: number, pattern: string, offset: number } | null }> }, poster?: { __typename?: 'Image', id: number, downloadPath?: string | null } | null, banner?: { __typename?: 'Image', id: number, downloadPath?: string | null } | null, fanart?: { __typename?: 'Image', id: number, downloadPath?: string | null } | null, jellyfinFolder?: { __typename?: 'JellyfinFolder', name: string, location: string } | null, episodesBySeasonId: { __typename?: 'EpisodesConnection', edges: Array<{ __typename?: 'EpisodesEdge', node?: { __typename?: 'Episode', airTime?: any | null, rawAirTime?: any | null, bangumiSort?: any | null, id: number, index?: number | null, numbering?: any | null, jellyfinEpisodeId?: string | null, title: string, tasks: { __typename?: 'TasksConnection', edges: Array<{ __typename?: 'TasksEdge', node?: { __typename?: 'Task', id: number, type: TaskType, statusSummary?: TaskSummary | null } | null }> } } | null }> } } | null };

export type UpdateSeasonByIdMutationVariables = Exact<{
  id: Scalars['Int'];
  seasonPatch: SeasonPatch;
}>;


export type UpdateSeasonByIdMutation = { __typename?: 'Mutation', updateSeasonById?: { __typename: 'UpdateSeasonPayload' } | null };

export type GetSeasonByTitleQueryVariables = Exact<{
  title: Scalars['String'];
}>;


export type GetSeasonByTitleQuery = { __typename?: 'Query', seasonByTitle?: { __typename?: 'Season', id: number } | null };

export type SyncMetadataMutationVariables = Exact<{
  seasonId: Scalars['Int'];
}>;


export type SyncMetadataMutation = { __typename?: 'Mutation', syncMetadata: string };

export type SyncEpisodeDataMutationVariables = Exact<{
  seasonId: Scalars['Int'];
}>;


export type SyncEpisodeDataMutation = { __typename?: 'Mutation', syncEpisodeData: string };

export type DownloadTorrentForEpisodeMutationVariables = Exact<{
  episodeId: Scalars['Int'];
  torrentLink: Scalars['String'];
}>;


export type DownloadTorrentForEpisodeMutation = { __typename?: 'Mutation', downloadTorrentForEpisode: number };

export type AllJellyfinFoldersQueryVariables = Exact<{ [key: string]: never; }>;


export type AllJellyfinFoldersQuery = { __typename?: 'Query', allJellyfinFolders?: { __typename?: 'JellyfinFoldersConnection', edges: Array<{ __typename?: 'JellyfinFoldersEdge', node?: { __typename?: 'JellyfinFolder', id: number, location: string, name: string } | null }> } | null };

export type SyncJellyfinSeriesIdMutationVariables = Exact<{
  seasonId: Scalars['Int'];
}>;


export type SyncJellyfinSeriesIdMutation = { __typename?: 'Mutation', syncJellyfinSeriesId: boolean };

export type DownloadBilibiliCcMutationVariables = Exact<{
  episodeId: Scalars['Int'];
}>;


export type DownloadBilibiliCcMutation = { __typename?: 'Mutation', downloadBilibiliCC: string };

export type GetJellyfinIdByIdQueryVariables = Exact<{
  id: Scalars['Int'];
}>;


export type GetJellyfinIdByIdQuery = { __typename?: 'Query', seasonById?: { __typename?: 'Season', jellyfinId: string } | null };

export type GetMatchingTorrentsQueryVariables = Exact<{
  filter: TorrentFilter;
  first: Scalars['Int'];
}>;


export type GetMatchingTorrentsQuery = { __typename?: 'Query', allTorrents?: { __typename?: 'TorrentsConnection', edges: Array<{ __typename?: 'TorrentsEdge', node?: { __typename?: 'Torrent', id: number, title: string, episodeInfo?: any | null, publishDate: any } | null }> } | null };

export type SaveSeasonMutationVariables = Exact<{
  id: Scalars['Int'];
  patch: SaveSeasonPatch;
}>;


export type SaveSeasonMutation = { __typename?: 'Mutation', saveSeason: string };

export type CardSeasonFieldsFragment = { __typename?: 'Season', id: number, title: string, isMonitoring: boolean, poster?: { __typename?: 'Image', id: number, downloadPath?: string | null } | null, mainEpisodes: { __typename?: 'EpisodesConnection', edges: Array<{ __typename?: 'EpisodesEdge', node?: { __typename?: 'Episode', title: string, numbering?: any | null, jellyfinEpisodeId?: string | null, airTime?: any | null, id: number, tasks: { __typename?: 'TasksConnection', edges: Array<{ __typename?: 'TasksEdge', node?: { __typename?: 'Task', id: number, type: TaskType, statusSummary?: TaskSummary | null } | null }> } } | null }> } };

export type ListSeasonCardsQueryVariables = Exact<{
  offset: Scalars['Int'];
  first: Scalars['Int'];
  filter?: InputMaybe<SeasonFilter>;
}>;


export type ListSeasonCardsQuery = { __typename?: 'Query', allSeasons?: { __typename?: 'SeasonsConnection', totalCount: number, edges: Array<{ __typename?: 'SeasonsEdge', node?: { __typename?: 'Season', id: number, title: string, isMonitoring: boolean, poster?: { __typename?: 'Image', id: number, downloadPath?: string | null } | null, mainEpisodes: { __typename?: 'EpisodesConnection', edges: Array<{ __typename?: 'EpisodesEdge', node?: { __typename?: 'Episode', title: string, numbering?: any | null, jellyfinEpisodeId?: string | null, airTime?: any | null, id: number, tasks: { __typename?: 'TasksConnection', edges: Array<{ __typename?: 'TasksEdge', node?: { __typename?: 'Task', id: number, type: TaskType, statusSummary?: TaskSummary | null } | null }> } } | null }> } } | null }> } | null };

export type ListSeasonsFieldsFragment = { __typename?: 'Season', bangumiId: string, airTime: string, weekday?: number | null, isMonitoring: boolean, title: string, id: number, yearAndSemester: string, tvdbId: string, tvdbSeason?: number | null, bilibiliThmId: string, bilibiliMainlandId: string, jellyfinId: string, jellyfinFolderByJellyfinFolderId?: { __typename?: 'JellyfinFolder', name: string } | null, allEpisodes: { __typename?: 'EpisodesConnection', totalCount: number }, airedEpisodes: { __typename?: 'EpisodesConnection', totalCount: number }, availableEpisodes: { __typename?: 'EpisodesConnection', totalCount: number }, firstEpisode: { __typename?: 'EpisodesConnection', edges: Array<{ __typename?: 'EpisodesEdge', node?: { __typename?: 'Episode', airTime?: any | null } | null }> }, nextEpisode: { __typename?: 'EpisodesConnection', edges: Array<{ __typename?: 'EpisodesEdge', node?: { __typename?: 'Episode', airTime?: any | null } | null }> }, latestEpisode?: { __typename?: 'Episode', jellyfinEpisodeId?: string | null, airTime?: any | null, id: number, tasks: { __typename?: 'TasksConnection', edges: Array<{ __typename?: 'TasksEdge', node?: { __typename?: 'Task', id: number, type: TaskType, statusSummary?: TaskSummary | null } | null }> } } | null };

export type ListSeasonsQueryVariables = Exact<{
  offset?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<SeasonsOrderBy> | SeasonsOrderBy>;
  filter?: InputMaybe<SeasonFilter>;
  now: Scalars['Datetime'];
}>;


export type ListSeasonsQuery = { __typename?: 'Query', allSeasons?: { __typename?: 'SeasonsConnection', totalCount: number, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean }, edges: Array<{ __typename?: 'SeasonsEdge', cursor?: any | null, node?: { __typename?: 'Season', bangumiId: string, airTime: string, weekday?: number | null, isMonitoring: boolean, title: string, id: number, yearAndSemester: string, tvdbId: string, tvdbSeason?: number | null, bilibiliThmId: string, bilibiliMainlandId: string, jellyfinId: string, jellyfinFolderByJellyfinFolderId?: { __typename?: 'JellyfinFolder', name: string } | null, allEpisodes: { __typename?: 'EpisodesConnection', totalCount: number }, airedEpisodes: { __typename?: 'EpisodesConnection', totalCount: number }, availableEpisodes: { __typename?: 'EpisodesConnection', totalCount: number }, firstEpisode: { __typename?: 'EpisodesConnection', edges: Array<{ __typename?: 'EpisodesEdge', node?: { __typename?: 'Episode', airTime?: any | null } | null }> }, nextEpisode: { __typename?: 'EpisodesConnection', edges: Array<{ __typename?: 'EpisodesEdge', node?: { __typename?: 'Episode', airTime?: any | null } | null }> }, latestEpisode?: { __typename?: 'Episode', jellyfinEpisodeId?: string | null, airTime?: any | null, id: number, tasks: { __typename?: 'TasksConnection', edges: Array<{ __typename?: 'TasksEdge', node?: { __typename?: 'Task', id: number, type: TaskType, statusSummary?: TaskSummary | null } | null }> } } | null } | null }> } | null };

export type CreateSeasonMutationVariables = Exact<{
  season: SeasonInput;
}>;


export type CreateSeasonMutation = { __typename?: 'Mutation', createSeason?: { __typename?: 'CreateSeasonPayload', season?: { __typename?: 'Season', id: number } | null } | null };

export type SearchBangumiQueryVariables = Exact<{
  keywords: Scalars['String'];
  useNewBangumiSearchApi?: InputMaybe<Scalars['Boolean']>;
  offset?: InputMaybe<Scalars['Int']>;
}>;


export type SearchBangumiQuery = { __typename?: 'Query', searchBangumi: Array<{ __typename?: 'SearchBangumiSeason', added: boolean, airDate?: string | null, id: string, image?: string | null, name: string, tags: Array<string> }> };

export type JellyfinFolderFieldsFragment = { __typename?: 'JellyfinFolder', id: number, name: string, location: string, isHidden: boolean, isDefault: boolean };

export type GetMetadataPageOptionsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetMetadataPageOptionsQuery = { __typename?: 'Query', getAvailableSemesters: Array<string>, allJellyfinFolders?: { __typename?: 'JellyfinFoldersConnection', edges: Array<{ __typename?: 'JellyfinFoldersEdge', node?: { __typename?: 'JellyfinFolder', id: number, name: string, location: string, isHidden: boolean, isDefault: boolean } | null }> } | null };

export type DeleteSeasonByIdMutationVariables = Exact<{
  id: Scalars['Int'];
}>;


export type DeleteSeasonByIdMutation = { __typename?: 'Mutation', deleteSeasonById: string };

export type ListJellyfinFoldersQueryVariables = Exact<{ [key: string]: never; }>;


export type ListJellyfinFoldersQuery = { __typename?: 'Query', allJellyfinFolders?: { __typename?: 'JellyfinFoldersConnection', edges: Array<{ __typename?: 'JellyfinFoldersEdge', node?: { __typename?: 'JellyfinFolder', id: number, name: string, location: string, isHidden: boolean, isDefault: boolean } | null }> } | null };

export type WriteSeasonMetadataMutationVariables = Exact<{
  id: Scalars['Int'];
}>;


export type WriteSeasonMetadataMutation = { __typename?: 'Mutation', writeMetadata: string };

export type GetSeasonsStatusQueryVariables = Exact<{
  seasonIds: Array<Scalars['Int']> | Scalars['Int'];
  now: Scalars['Datetime'];
}>;


export type GetSeasonsStatusQuery = { __typename?: 'Query', allSeasons?: { __typename?: 'SeasonsConnection', edges: Array<{ __typename?: 'SeasonsEdge', node?: { __typename?: 'Season', id: number, latestEpisode?: { __typename?: 'Episode', jellyfinEpisodeId?: string | null, airTime?: any | null, id: number, tasks: { __typename?: 'TasksConnection', edges: Array<{ __typename?: 'TasksEdge', node?: { __typename?: 'Task', id: number, type: TaskType, statusSummary?: TaskSummary | null } | null }> } } | null } | null }> } | null };

export type TorrentFieldsFragment = { __typename?: 'Torrent', id: number, displayId: number, channel: TorrentChannel, permalink?: string | null, publishDate: any, size: any, title: string, torrentLink: string, episodeInfo?: any | null, subtitleInfo?: any | null };

export type TorrentParseFieldsFragment = { __typename?: 'Torrent', organizationParts?: Array<string | null> | null, seasonTitleAliases?: Array<string | null> | null, matchStatus?: TorrentMatchStatus | null, matchedAt?: any | null, matchedSeasonId?: number | null, seasonByMatchedSeasonId?: { __typename?: 'Season', id: number, title: string } | null };

export type ListTorrentsQueryVariables = Exact<{
  offset?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<TorrentsOrderBy> | TorrentsOrderBy>;
  filter?: InputMaybe<TorrentFilter>;
}>;


export type ListTorrentsQuery = { __typename?: 'Query', allTorrents?: { __typename?: 'TorrentsConnection', totalCount: number, edges: Array<{ __typename?: 'TorrentsEdge', cursor?: any | null, node?: { __typename?: 'Torrent', id: number, displayId: number, channel: TorrentChannel, permalink?: string | null, publishDate: any, size: any, title: string, torrentLink: string, episodeInfo?: any | null, subtitleInfo?: any | null, organizationParts?: Array<string | null> | null, seasonTitleAliases?: Array<string | null> | null, matchStatus?: TorrentMatchStatus | null, matchedAt?: any | null, matchedSeasonId?: number | null, seasonByMatchedSeasonId?: { __typename?: 'Season', id: number, title: string } | null } | null }>, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean } } | null };

export type SyncTorrentHistoryMutationVariables = Exact<{ [key: string]: never; }>;


export type SyncTorrentHistoryMutation = { __typename?: 'Mutation', syncTorrentHistory: string };

export type TorrentHistorySyncStateQueryVariables = Exact<{
  id: Scalars['String'];
}>;


export type TorrentHistorySyncStateQuery = { __typename?: 'Query', torrentHistorySyncState: { __typename?: 'TorrentHistorySyncState', running: boolean, added: number, error?: string | null } };

export type CancelTorrentSeasonMatchMutationVariables = Exact<{
  torrentId: Scalars['Int'];
}>;


export type CancelTorrentSeasonMatchMutation = { __typename?: 'Mutation', cancelTorrentSeasonMatch: boolean };

export type GetConfigQueryVariables = Exact<{ [key: string]: never; }>;


export type GetConfigQuery = { __typename?: 'Query', config: { __typename?: 'AdminConfig', env: string, jellyfin?: { __typename?: 'JellyfinConfig', publicHost: string } | null, lania?: { __typename?: 'LaniaConfig', publicHost: string } | null, features: { __typename?: 'FeaturesConfig', lania: boolean } } };

export type LiveTaskFragment = { __typename?: 'Task', id: number, type: TaskType, batchEntries?: any | null, version: number, workflow?: any | null, legacyStage: LegacyTaskStage, isFailed: boolean, isCancelled: boolean, failedReason: string, qbtTorrentHash?: string | null, torrentTitle?: string | null, downloadPath?: string | null, importPath?: string | null, filePath?: string | null, nfoPath?: string | null, jellyfinEpisodeId?: string | null };

export type TaskVersionFragment = { __typename?: 'Task', version: number };

export const TaskDetailsFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"taskDetailsFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Task"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"taskEpisodesByTaskId"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orderBy"},"value":{"kind":"EnumValue","value":"EPISODE_ID_ASC"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"episodeId"}},{"kind":"Field","name":{"kind":"Name","value":"episodeByEpisodeId"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"numbering"}},{"kind":"Field","name":{"kind":"Name","value":"seasonBySeasonId"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"jellyfinId"}}]}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"isSmartDownload"}},{"kind":"Field","name":{"kind":"Name","value":"batchEntries"}},{"kind":"Field","name":{"kind":"Name","value":"sourcePath"}},{"kind":"Field","name":{"kind":"Name","value":"episodeId"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"downloadPath"}},{"kind":"Field","name":{"kind":"Name","value":"failedAt"}},{"kind":"Field","name":{"kind":"Name","value":"failedReason"}},{"kind":"Field","name":{"kind":"Name","value":"filePath"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"importPath"}},{"kind":"Field","name":{"kind":"Name","value":"isFailed"}},{"kind":"Field","name":{"kind":"Name","value":"isCancelled"}},{"kind":"Field","name":{"kind":"Name","value":"workflow"}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"nfoPath"}},{"kind":"Field","name":{"kind":"Name","value":"qbtTorrentHash"}},{"kind":"Field","name":{"kind":"Name","value":"legacyStage"}},{"kind":"Field","name":{"kind":"Name","value":"torrentLink"}},{"kind":"Field","name":{"kind":"Name","value":"jellyfinEpisodeId"}},{"kind":"Field","name":{"kind":"Name","value":"torrentTitle"}}]}}]} as unknown as DocumentNode<TaskDetailsFieldsFragment, unknown>;
export const EpisodeDetailsFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"episodeDetailsFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Episode"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"rawAirTime"}},{"kind":"Field","name":{"kind":"Name","value":"airTime"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"tasksByEpisodeId"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orderBy"},"value":{"kind":"EnumValue","value":"ID_DESC"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"taskDetailsFields"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"index"}},{"kind":"Field","name":{"kind":"Name","value":"numbering"}},{"kind":"Field","name":{"kind":"Name","value":"jellyfinEpisodeId"}},{"kind":"Field","name":{"kind":"Name","value":"seasonBySeasonId"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"downloadOffsetHours"}}]}},{"kind":"Field","name":{"kind":"Name","value":"title"}}]}}]} as unknown as DocumentNode<EpisodeDetailsFieldsFragment, unknown>;
export const TaskStatusFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"taskStatusFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Task"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"legacyStage"}},{"kind":"Field","name":{"kind":"Name","value":"isFailed"}},{"kind":"Field","name":{"kind":"Name","value":"isCancelled"}},{"kind":"Field","name":{"kind":"Name","value":"workflow"}},{"kind":"Field","name":{"kind":"Name","value":"version"}}]}}]} as unknown as DocumentNode<TaskStatusFieldsFragment, unknown>;
export const Folders_ListFoldersFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"folders_listFoldersFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"JellyfinFolder"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"jellyfinId"}},{"kind":"Field","name":{"kind":"Name","value":"location"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"isDefault"}},{"kind":"Field","name":{"kind":"Name","value":"isHidden"}},{"kind":"Field","name":{"kind":"Name","value":"mappedLocation"}}]}}]} as unknown as DocumentNode<Folders_ListFoldersFieldsFragment, unknown>;
export const ListTasksFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"listTasksFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Task"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"taskEpisodesByTaskId"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orderBy"},"value":{"kind":"EnumValue","value":"EPISODE_ID_ASC"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"episodeId"}},{"kind":"Field","name":{"kind":"Name","value":"episodeByEpisodeId"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"numbering"}},{"kind":"Field","name":{"kind":"Name","value":"seasonBySeasonId"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}}]}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"legacyStage"}},{"kind":"Field","name":{"kind":"Name","value":"isFailed"}},{"kind":"Field","name":{"kind":"Name","value":"isCancelled"}},{"kind":"Field","name":{"kind":"Name","value":"workflow"}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"jellyfinEpisodeId"}},{"kind":"Field","name":{"kind":"Name","value":"episodeByEpisodeId"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"airTime"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"index"}},{"kind":"Field","name":{"kind":"Name","value":"numbering"}},{"kind":"Field","name":{"kind":"Name","value":"seasonBySeasonId"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"failedReason"}}]}}]} as unknown as DocumentNode<ListTasksFieldsFragment, unknown>;
export const TaskSummaryFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"taskSummaryFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Task"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"statusSummary"}}]}}]} as unknown as DocumentNode<TaskSummaryFieldsFragment, unknown>;
export const EpisodeStatusFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"episodeStatusFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Episode"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"jellyfinEpisodeId"}},{"kind":"Field","name":{"kind":"Name","value":"airTime"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","alias":{"kind":"Name","value":"tasks"},"name":{"kind":"Name","value":"tasksByEpisodeId"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"1"}},{"kind":"Argument","name":{"kind":"Name","value":"orderBy"},"value":{"kind":"EnumValue","value":"ID_DESC"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"taskSummaryFields"}}]}}]}}]}}]}}]} as unknown as DocumentNode<EpisodeStatusFieldsFragment, unknown>;
export const SeasonEpisodesFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"seasonEpisodes"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Season"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"episodesLastSync"}},{"kind":"Field","name":{"kind":"Name","value":"episodesBySeasonId"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orderBy"},"value":{"kind":"EnumValue","value":"INDEX_ASC"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"airTime"}},{"kind":"Field","name":{"kind":"Name","value":"rawAirTime"}},{"kind":"Field","name":{"kind":"Name","value":"bangumiSort"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"index"}},{"kind":"Field","name":{"kind":"Name","value":"numbering"}},{"kind":"Field","name":{"kind":"Name","value":"jellyfinEpisodeId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"episodeStatusFields"}}]}}]}}]}}]}}]} as unknown as DocumentNode<SeasonEpisodesFragment, unknown>;
export const DisplayImageFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"displayImageFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Image"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"downloadPath"}}]}}]} as unknown as DocumentNode<DisplayImageFieldsFragment, unknown>;
export const SeasonConfigFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"seasonConfigFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Season"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"infoSource"}},{"kind":"Field","name":{"kind":"Name","value":"isMonitoring"}},{"kind":"Field","name":{"kind":"Name","value":"smartDownloadEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"smartDownloadSubtitle"}},{"kind":"Field","name":{"kind":"Name","value":"smartDownloadPreferBaha"}},{"kind":"Field","name":{"kind":"Name","value":"smartDownloadWindowHours"}},{"kind":"Field","name":{"kind":"Name","value":"smartDownloadTimeoutMinutes"}},{"kind":"Field","name":{"kind":"Name","value":"tags"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"tvdbId"}},{"kind":"Field","name":{"kind":"Name","value":"tvdbSeason"}},{"kind":"Field","name":{"kind":"Name","value":"weekday"}},{"kind":"Field","name":{"kind":"Name","value":"yearAndSemester"}},{"kind":"Field","name":{"kind":"Name","value":"airTime"}},{"kind":"Field","name":{"kind":"Name","value":"bangumiId"}},{"kind":"Field","name":{"kind":"Name","value":"bilibiliMainlandId"}},{"kind":"Field","name":{"kind":"Name","value":"bilibiliThmId"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"aliases"}},{"kind":"Field","name":{"kind":"Name","value":"episodesSource"}},{"kind":"Field","name":{"kind":"Name","value":"downloadSourcesBySeasonId"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"pattern"}},{"kind":"Field","name":{"kind":"Name","value":"offset"}}]}}]}}]}},{"kind":"Field","alias":{"kind":"Name","value":"poster"},"name":{"kind":"Name","value":"imageByPosterImageId"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"displayImageFields"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"banner"},"name":{"kind":"Name","value":"imageByBannerImageId"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"displayImageFields"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"fanart"},"name":{"kind":"Name","value":"imageByFanartImageId"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"displayImageFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"needDownloadCc"}},{"kind":"Field","alias":{"kind":"Name","value":"jellyfinFolder"},"name":{"kind":"Name","value":"jellyfinFolderByJellyfinFolderId"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"location"}}]}},{"kind":"Field","name":{"kind":"Name","value":"notifyMissing"}},{"kind":"Field","name":{"kind":"Name","value":"notifyPublish"}},{"kind":"Field","name":{"kind":"Name","value":"episodesAutoSync"}},{"kind":"Field","name":{"kind":"Name","value":"downloadOffsetHours"}},{"kind":"Field","name":{"kind":"Name","value":"integrationsLaniaSync"}}]}}]} as unknown as DocumentNode<SeasonConfigFieldsFragment, unknown>;
export const CardSeasonFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"cardSeasonFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Season"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"isMonitoring"}},{"kind":"Field","alias":{"kind":"Name","value":"poster"},"name":{"kind":"Name","value":"imageByPosterImageId"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"downloadPath"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"thumbnail"},"value":{"kind":"BooleanValue","value":true}}]}]}},{"kind":"Field","name":{"kind":"Name","value":"mainEpisodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"numbering"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"episodeStatusFields"}}]}}]}}]}}]}}]} as unknown as DocumentNode<CardSeasonFieldsFragment, unknown>;
export const ListSeasonsFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"listSeasonsFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Season"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"bangumiId"}},{"kind":"Field","name":{"kind":"Name","value":"airTime"}},{"kind":"Field","name":{"kind":"Name","value":"weekday"}},{"kind":"Field","name":{"kind":"Name","value":"isMonitoring"}},{"kind":"Field","name":{"kind":"Name","value":"jellyfinFolderByJellyfinFolderId"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"yearAndSemester"}},{"kind":"Field","name":{"kind":"Name","value":"tvdbId"}},{"kind":"Field","name":{"kind":"Name","value":"tvdbSeason"}},{"kind":"Field","name":{"kind":"Name","value":"bilibiliThmId"}},{"kind":"Field","name":{"kind":"Name","value":"bilibiliMainlandId"}},{"kind":"Field","name":{"kind":"Name","value":"jellyfinId"}},{"kind":"Field","alias":{"kind":"Name","value":"allEpisodes"},"name":{"kind":"Name","value":"mainEpisodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"airedEpisodes"},"name":{"kind":"Name","value":"mainEpisodes"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"airTime"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"lessThanOrEqualTo"},"value":{"kind":"Variable","name":{"kind":"Name","value":"now"}}}]}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"availableEpisodes"},"name":{"kind":"Name","value":"mainEpisodes"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"jellyfinEpisodeId"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"isNull"},"value":{"kind":"BooleanValue","value":false}}]}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"firstEpisode"},"name":{"kind":"Name","value":"mainEpisodes"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"1"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"airTime"}}]}}]}}]}},{"kind":"Field","alias":{"kind":"Name","value":"nextEpisode"},"name":{"kind":"Name","value":"mainEpisodes"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"1"}},{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"airTime"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"greaterThanOrEqualTo"},"value":{"kind":"Variable","name":{"kind":"Name","value":"now"}}}]}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"airTime"}}]}}]}}]}},{"kind":"Field","alias":{"kind":"Name","value":"latestEpisode"},"name":{"kind":"Name","value":"latestMainEpisode"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"atTime"},"value":{"kind":"Variable","name":{"kind":"Name","value":"now"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"episodeStatusFields"}}]}}]}}]} as unknown as DocumentNode<ListSeasonsFieldsFragment, unknown>;
export const JellyfinFolderFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"jellyfinFolderFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"JellyfinFolder"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"location"}},{"kind":"Field","name":{"kind":"Name","value":"isHidden"}},{"kind":"Field","name":{"kind":"Name","value":"isDefault"}}]}}]} as unknown as DocumentNode<JellyfinFolderFieldsFragment, unknown>;
export const TorrentFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"torrentFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Torrent"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"displayId"}},{"kind":"Field","name":{"kind":"Name","value":"channel"}},{"kind":"Field","name":{"kind":"Name","value":"permalink"}},{"kind":"Field","name":{"kind":"Name","value":"publishDate"}},{"kind":"Field","name":{"kind":"Name","value":"size"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"torrentLink"}},{"kind":"Field","name":{"kind":"Name","value":"episodeInfo"}},{"kind":"Field","name":{"kind":"Name","value":"subtitleInfo"}}]}}]} as unknown as DocumentNode<TorrentFieldsFragment, unknown>;
export const TorrentParseFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"torrentParseFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Torrent"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"organizationParts"}},{"kind":"Field","name":{"kind":"Name","value":"seasonTitleAliases"}},{"kind":"Field","name":{"kind":"Name","value":"matchStatus"}},{"kind":"Field","name":{"kind":"Name","value":"matchedAt"}},{"kind":"Field","name":{"kind":"Name","value":"matchedSeasonId"}},{"kind":"Field","name":{"kind":"Name","value":"seasonByMatchedSeasonId"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}}]}}]}}]} as unknown as DocumentNode<TorrentParseFieldsFragment, unknown>;
export const LiveTaskFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"LiveTask"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Task"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"batchEntries"}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"workflow"}},{"kind":"Field","name":{"kind":"Name","value":"legacyStage"}},{"kind":"Field","name":{"kind":"Name","value":"isFailed"}},{"kind":"Field","name":{"kind":"Name","value":"isCancelled"}},{"kind":"Field","name":{"kind":"Name","value":"failedReason"}},{"kind":"Field","name":{"kind":"Name","value":"qbtTorrentHash"}},{"kind":"Field","name":{"kind":"Name","value":"torrentTitle"}},{"kind":"Field","name":{"kind":"Name","value":"downloadPath"}},{"kind":"Field","name":{"kind":"Name","value":"importPath"}},{"kind":"Field","name":{"kind":"Name","value":"filePath"}},{"kind":"Field","name":{"kind":"Name","value":"nfoPath"}},{"kind":"Field","name":{"kind":"Name","value":"jellyfinEpisodeId"}}]}}]} as unknown as DocumentNode<LiveTaskFragment, unknown>;
export const TaskVersionFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TaskVersion"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Task"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"version"}}]}}]} as unknown as DocumentNode<TaskVersionFragment, unknown>;
export const PreviewTorrentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"PreviewTorrent"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"torrentId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"previewTorrent"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"torrentId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"torrentId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"token"}},{"kind":"Field","name":{"kind":"Name","value":"files"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"path"}},{"kind":"Field","name":{"kind":"Name","value":"size"}}]}}]}}]}}]} as unknown as DocumentNode<PreviewTorrentMutation, PreviewTorrentMutationVariables>;
export const DownloadTorrentForSeasonDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DownloadTorrentForSeason"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"seasonId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"previewToken"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"entries"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"BatchDownloadEntry"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"downloadTorrentForSeason"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"seasonId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"seasonId"}}},{"kind":"Argument","name":{"kind":"Name","value":"previewToken"},"value":{"kind":"Variable","name":{"kind":"Name","value":"previewToken"}}},{"kind":"Argument","name":{"kind":"Name","value":"entries"},"value":{"kind":"Variable","name":{"kind":"Name","value":"entries"}}}]}]}}]} as unknown as DocumentNode<DownloadTorrentForSeasonMutation, DownloadTorrentForSeasonMutationVariables>;
export const GetEpisodeByIdDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetEpisodeById"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"episodeByIdId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"episodeById"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"episodeByIdId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"episodeDetailsFields"}}]}}]}},...EpisodeDetailsFieldsFragmentDoc.definitions,...TaskDetailsFieldsFragmentDoc.definitions]} as unknown as DocumentNode<GetEpisodeByIdQuery, GetEpisodeByIdQueryVariables>;
export const GetEpisodeNavigationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetEpisodeNavigation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"episodeId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"episodeById"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"episodeId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"seasonBySeasonId"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"episodesBySeasonId"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orderBy"},"value":{"kind":"EnumValue","value":"INDEX_ASC"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"numbering"}}]}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<GetEpisodeNavigationQuery, GetEpisodeNavigationQueryVariables>;
export const GetTaskByIdDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetTaskById"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"taskById"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"taskDetailsFields"}},{"kind":"Field","name":{"kind":"Name","value":"episodeByEpisodeId"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"episodeDetailsFields"}}]}}]}}]}},...TaskDetailsFieldsFragmentDoc.definitions,...EpisodeDetailsFieldsFragmentDoc.definitions]} as unknown as DocumentNode<GetTaskByIdQuery, GetTaskByIdQueryVariables>;
export const ListFilesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ListFiles"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"path"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"listFiles"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"path"},"value":{"kind":"Variable","name":{"kind":"Name","value":"path"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lastModified"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"path"}},{"kind":"Field","name":{"kind":"Name","value":"size"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}}]}}]} as unknown as DocumentNode<ListFilesQuery, ListFilesQueryVariables>;
export const ImportSingleDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ImportSingle"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"episodeId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"path"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"importSingle"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"episodeId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"episodeId"}}},{"kind":"Argument","name":{"kind":"Name","value":"importPath"},"value":{"kind":"Variable","name":{"kind":"Name","value":"path"}}}]}]}}]} as unknown as DocumentNode<ImportSingleMutation, ImportSingleMutationVariables>;
export const ImportMultipleDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ImportMultiple"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"entries"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ImportMultipleEntry"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"importMultiple"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"entries"},"value":{"kind":"Variable","name":{"kind":"Name","value":"entries"}}}]}]}}]} as unknown as DocumentNode<ImportMultipleMutation, ImportMultipleMutationVariables>;
export const GetImportSeasonDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetImportSeason"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"offset"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"seasonById"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"episodesBySeasonId"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"100"}},{"kind":"Argument","name":{"kind":"Name","value":"offset"},"value":{"kind":"Variable","name":{"kind":"Name","value":"offset"}}},{"kind":"Argument","name":{"kind":"Name","value":"orderBy"},"value":{"kind":"EnumValue","value":"ID_ASC"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"index"}},{"kind":"Field","name":{"kind":"Name","value":"numbering"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"episodeStatusFields"}},{"kind":"Field","alias":{"kind":"Name","value":"matchingTasks"},"name":{"kind":"Name","value":"tasksByEpisodeId"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"taskStatusFields"}}]}}]}}]}}]}}]}}]}},...EpisodeStatusFieldsFragmentDoc.definitions,...TaskSummaryFieldsFragmentDoc.definitions,...TaskStatusFieldsFragmentDoc.definitions]} as unknown as DocumentNode<GetImportSeasonQuery, GetImportSeasonQueryVariables>;
export const SearchTorrentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SearchTorrent"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"keyword"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"offset"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}},"defaultValue":{"kind":"IntValue","value":"0"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"allTorrents"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"title"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"includesInsensitive"},"value":{"kind":"Variable","name":{"kind":"Name","value":"keyword"}}}]}}]}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"offset"},"value":{"kind":"Variable","name":{"kind":"Name","value":"offset"}}},{"kind":"Argument","name":{"kind":"Name","value":"orderBy"},"value":{"kind":"EnumValue","value":"PUBLISH_DATE_DESC"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"torrentFields"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalCount"}}]}}]}},...TorrentFieldsFragmentDoc.definitions]} as unknown as DocumentNode<SearchTorrentQuery, SearchTorrentQueryVariables>;
export const GetTaskStatesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetTaskStates"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"taskIds"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getTaskStates"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"taskIds"},"value":{"kind":"Variable","name":{"kind":"Name","value":"taskIds"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"batchEntries"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"episodeId"}},{"kind":"Field","name":{"kind":"Name","value":"sourcePath"}},{"kind":"Field","name":{"kind":"Name","value":"importPath"}},{"kind":"Field","name":{"kind":"Name","value":"filePath"}},{"kind":"Field","name":{"kind":"Name","value":"nfoPath"}},{"kind":"Field","name":{"kind":"Name","value":"jellyfinEpisodeId"}}]}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"workflow"}},{"kind":"Field","name":{"kind":"Name","value":"legacyStage"}},{"kind":"Field","name":{"kind":"Name","value":"isFailed"}},{"kind":"Field","name":{"kind":"Name","value":"isCancelled"}},{"kind":"Field","name":{"kind":"Name","value":"failedReason"}},{"kind":"Field","name":{"kind":"Name","value":"canRetry"}},{"kind":"Field","name":{"kind":"Name","value":"canCancel"}},{"kind":"Field","name":{"kind":"Name","value":"qbtTorrentHash"}},{"kind":"Field","name":{"kind":"Name","value":"torrentTitle"}},{"kind":"Field","name":{"kind":"Name","value":"downloadPath"}},{"kind":"Field","name":{"kind":"Name","value":"importPath"}},{"kind":"Field","name":{"kind":"Name","value":"filePath"}},{"kind":"Field","name":{"kind":"Name","value":"nfoPath"}},{"kind":"Field","name":{"kind":"Name","value":"jellyfinEpisodeId"}}]}}]}}]} as unknown as DocumentNode<GetTaskStatesQuery, GetTaskStatesQueryVariables>;
export const CancelTaskDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CancelTask"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"taskId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cancelTask"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"taskId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"taskId"}}}]}]}}]} as unknown as DocumentNode<CancelTaskMutation, CancelTaskMutationVariables>;
export const RetryTaskDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RetryTask"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"taskId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"retryTask"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"taskId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"taskId"}}}]}]}}]} as unknown as DocumentNode<RetryTaskMutation, RetryTaskMutationVariables>;
export const GetDownloadProgressDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetDownloadProgress"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"taskIds"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getDownloadProgress"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"taskIds"},"value":{"kind":"Variable","name":{"kind":"Name","value":"taskIds"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"downloaded"}},{"kind":"Field","name":{"kind":"Name","value":"eta"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"peers"}},{"kind":"Field","name":{"kind":"Name","value":"seeds"}},{"kind":"Field","name":{"kind":"Name","value":"speed"}},{"kind":"Field","name":{"kind":"Name","value":"total"}}]}}]}}]} as unknown as DocumentNode<GetDownloadProgressQuery, GetDownloadProgressQueryVariables>;
export const GetTaskSummariesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetTaskSummaries"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"taskIds"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"allTasks"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"id"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"in"},"value":{"kind":"Variable","name":{"kind":"Name","value":"taskIds"}}}]}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"taskSummaryFields"}}]}}]}}]}},...TaskSummaryFieldsFragmentDoc.definitions]} as unknown as DocumentNode<GetTaskSummariesQuery, GetTaskSummariesQueryVariables>;
export const Folders_ListFoldersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Folders_ListFolders"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"offset"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orderBy"}},"type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"JellyfinFoldersOrderBy"}}}},"defaultValue":{"kind":"ListValue","values":[]}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"JellyfinFolderFilter"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":{"kind":"Name","value":"data"},"name":{"kind":"Name","value":"allJellyfinFolders"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"offset"},"value":{"kind":"Variable","name":{"kind":"Name","value":"offset"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"orderBy"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orderBy"}}},{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filter"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"folders_listFoldersFields"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalCount"}}]}}]}},...Folders_ListFoldersFieldsFragmentDoc.definitions]} as unknown as DocumentNode<Folders_ListFoldersQuery, Folders_ListFoldersQueryVariables>;
export const Folders_UpdateFolderByIdDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Folders_UpdateFolderById"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"folderPatch"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"JellyfinFolderPatch"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateJellyfinFolderById"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"jellyfinFolderPatch"},"value":{"kind":"Variable","name":{"kind":"Name","value":"folderPatch"}}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}}]}}]}}]} as unknown as DocumentNode<Folders_UpdateFolderByIdMutation, Folders_UpdateFolderByIdMutationVariables>;
export const Folders_SetFolderDefaultDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Folders_SetFolderDefault"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"setJellyfinFolderDefault"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<Folders_SetFolderDefaultMutation, Folders_SetFolderDefaultMutationVariables>;
export const Folders_SyncJellyfinFoldersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Folders_SyncJellyfinFolders"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"syncJellyfinFolders"}}]}}]} as unknown as DocumentNode<Folders_SyncJellyfinFoldersMutation, Folders_SyncJellyfinFoldersMutationVariables>;
export const ListTasksDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ListTasks"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"offset"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"TaskFilter"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"allTasks"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"offset"},"value":{"kind":"Variable","name":{"kind":"Name","value":"offset"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filter"}}},{"kind":"Argument","name":{"kind":"Name","value":"orderBy"},"value":{"kind":"EnumValue","value":"ID_DESC"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"listTasksFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"cursor"}}]}}]}}]}},...ListTasksFieldsFragmentDoc.definitions]} as unknown as DocumentNode<ListTasksQuery, ListTasksQueryVariables>;
export const GetTaskPageSignatureDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetTaskPageSignature"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"offset"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"TaskFilter"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"allTasks"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"offset"},"value":{"kind":"Variable","name":{"kind":"Name","value":"offset"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filter"}}},{"kind":"Argument","name":{"kind":"Name","value":"orderBy"},"value":{"kind":"EnumValue","value":"ID_DESC"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]}}]}}]} as unknown as DocumentNode<GetTaskPageSignatureQuery, GetTaskPageSignatureQueryVariables>;
export const GetEpisodesStatusDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetEpisodesStatus"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"episodeIds"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"allEpisodes"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"id"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"in"},"value":{"kind":"Variable","name":{"kind":"Name","value":"episodeIds"}}}]}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"episodeStatusFields"}}]}}]}}]}}]}},...EpisodeStatusFieldsFragmentDoc.definitions,...TaskSummaryFieldsFragmentDoc.definitions]} as unknown as DocumentNode<GetEpisodesStatusQuery, GetEpisodesStatusQueryVariables>;
export const MockEpisodePublishDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"MockEpisodePublish"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"episodeId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"mockEpisodePublish"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"episodeId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"episodeId"}}}]}]}}]} as unknown as DocumentNode<MockEpisodePublishMutation, MockEpisodePublishMutationVariables>;
export const SmartDownloadPreviewDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SmartDownloadPreview"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"last"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"after"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Cursor"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filter"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"TorrentFilter"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"allTorrents"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"last"},"value":{"kind":"Variable","name":{"kind":"Name","value":"last"}}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}},{"kind":"Argument","name":{"kind":"Name","value":"orderBy"},"value":{"kind":"ListValue","values":[{"kind":"EnumValue","value":"PUBLISH_DATE_ASC"},{"kind":"EnumValue","value":"ID_ASC"}]}},{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filter"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"hash"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"publishDate"}},{"kind":"Field","name":{"kind":"Name","value":"size"}},{"kind":"Field","name":{"kind":"Name","value":"episodeInfo"}},{"kind":"Field","name":{"kind":"Name","value":"subtitleInfo"}},{"kind":"Field","name":{"kind":"Name","value":"parseVersion"}},{"kind":"Field","name":{"kind":"Name","value":"channel"}},{"kind":"Field","name":{"kind":"Name","value":"metadataFetchedAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"endCursor"}},{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"hasPreviousPage"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"config"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"smartDownloadTitleExcludes"}}]}}]}}]} as unknown as DocumentNode<SmartDownloadPreviewQuery, SmartDownloadPreviewQueryVariables>;
export const SmartDownloadStateDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SmartDownloadState"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"seasonId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"after"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Cursor"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"allTasks"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"isSmartDownload"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"equalTo"},"value":{"kind":"BooleanValue","value":true}}]}},{"kind":"ObjectField","name":{"kind":"Name","value":"episodeByEpisodeId"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"seasonId"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"equalTo"},"value":{"kind":"Variable","name":{"kind":"Name","value":"seasonId"}}}]}}]}}]}},{"kind":"Argument","name":{"kind":"Name","value":"orderBy"},"value":{"kind":"ListValue","values":[{"kind":"EnumValue","value":"CREATED_AT_DESC"},{"kind":"EnumValue","value":"ID_DESC"}]}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"100"}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"smartDownloadTorrentHash"}},{"kind":"Field","name":{"kind":"Name","value":"statusSummary"}}]}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"endCursor"}},{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"config"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"matching"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"enabled"}},{"kind":"Field","name":{"kind":"Name","value":"backend"}},{"kind":"Field","name":{"kind":"Name","value":"mode"}}]}}]}}]}}]} as unknown as DocumentNode<SmartDownloadStateQuery, SmartDownloadStateQueryVariables>;
export const GetSeasonByIdDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetSeasonById"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"withConfig"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}},"defaultValue":{"kind":"BooleanValue","value":true}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"withEpisodes"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}},"defaultValue":{"kind":"BooleanValue","value":true}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"seasonById"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"seasonConfigFields"},"directives":[{"kind":"Directive","name":{"kind":"Name","value":"include"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"if"},"value":{"kind":"Variable","name":{"kind":"Name","value":"withConfig"}}}]}]},{"kind":"FragmentSpread","name":{"kind":"Name","value":"seasonEpisodes"},"directives":[{"kind":"Directive","name":{"kind":"Name","value":"include"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"if"},"value":{"kind":"Variable","name":{"kind":"Name","value":"withEpisodes"}}}]}]}]}}]}},...SeasonConfigFieldsFragmentDoc.definitions,...DisplayImageFieldsFragmentDoc.definitions,...SeasonEpisodesFragmentDoc.definitions,...EpisodeStatusFieldsFragmentDoc.definitions,...TaskSummaryFieldsFragmentDoc.definitions]} as unknown as DocumentNode<GetSeasonByIdQuery, GetSeasonByIdQueryVariables>;
export const UpdateSeasonByIdDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateSeasonById"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"seasonPatch"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SeasonPatch"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateSeasonById"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"seasonPatch"},"value":{"kind":"Variable","name":{"kind":"Name","value":"seasonPatch"}}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}}]}}]}}]} as unknown as DocumentNode<UpdateSeasonByIdMutation, UpdateSeasonByIdMutationVariables>;
export const GetSeasonByTitleDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetSeasonByTitle"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"title"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"seasonByTitle"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"title"},"value":{"kind":"Variable","name":{"kind":"Name","value":"title"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<GetSeasonByTitleQuery, GetSeasonByTitleQueryVariables>;
export const SyncMetadataDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SyncMetadata"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"seasonId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"syncMetadata"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"seasonId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"seasonId"}}}]}]}}]} as unknown as DocumentNode<SyncMetadataMutation, SyncMetadataMutationVariables>;
export const SyncEpisodeDataDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SyncEpisodeData"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"seasonId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"syncEpisodeData"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"seasonId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"seasonId"}}}]}]}}]} as unknown as DocumentNode<SyncEpisodeDataMutation, SyncEpisodeDataMutationVariables>;
export const DownloadTorrentForEpisodeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DownloadTorrentForEpisode"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"episodeId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"torrentLink"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"downloadTorrentForEpisode"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"episodeId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"episodeId"}}},{"kind":"Argument","name":{"kind":"Name","value":"torrentLink"},"value":{"kind":"Variable","name":{"kind":"Name","value":"torrentLink"}}}]}]}}]} as unknown as DocumentNode<DownloadTorrentForEpisodeMutation, DownloadTorrentForEpisodeMutationVariables>;
export const AllJellyfinFoldersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AllJellyfinFolders"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"allJellyfinFolders"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"location"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]}}]} as unknown as DocumentNode<AllJellyfinFoldersQuery, AllJellyfinFoldersQueryVariables>;
export const SyncJellyfinSeriesIdDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SyncJellyfinSeriesId"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"seasonId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"syncJellyfinSeriesId"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"seasonId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"seasonId"}}}]}]}}]} as unknown as DocumentNode<SyncJellyfinSeriesIdMutation, SyncJellyfinSeriesIdMutationVariables>;
export const DownloadBilibiliCcDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DownloadBilibiliCC"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"episodeId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"downloadBilibiliCC"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"episodeId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"episodeId"}}}]}]}}]} as unknown as DocumentNode<DownloadBilibiliCcMutation, DownloadBilibiliCcMutationVariables>;
export const GetJellyfinIdByIdDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetJellyfinIdById"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"seasonById"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"jellyfinId"}}]}}]}}]} as unknown as DocumentNode<GetJellyfinIdByIdQuery, GetJellyfinIdByIdQueryVariables>;
export const GetMatchingTorrentsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetMatchingTorrents"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filter"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"TorrentFilter"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"allTorrents"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orderBy"},"value":{"kind":"EnumValue","value":"PUBLISH_DATE_ASC"}},{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filter"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"episodeInfo"}},{"kind":"Field","name":{"kind":"Name","value":"publishDate"}}]}}]}}]}}]}}]} as unknown as DocumentNode<GetMatchingTorrentsQuery, GetMatchingTorrentsQueryVariables>;
export const SaveSeasonDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SaveSeason"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"patch"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SaveSeasonPatch"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"saveSeason"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"patch"},"value":{"kind":"Variable","name":{"kind":"Name","value":"patch"}}}]}]}}]} as unknown as DocumentNode<SaveSeasonMutation, SaveSeasonMutationVariables>;
export const ListSeasonCardsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ListSeasonCards"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"offset"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"SeasonFilter"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"allSeasons"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"offset"},"value":{"kind":"Variable","name":{"kind":"Name","value":"offset"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"orderBy"},"value":{"kind":"EnumValue","value":"ID_DESC"}},{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filter"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"cardSeasonFields"}}]}}]}}]}}]}},...CardSeasonFieldsFragmentDoc.definitions,...EpisodeStatusFieldsFragmentDoc.definitions,...TaskSummaryFieldsFragmentDoc.definitions]} as unknown as DocumentNode<ListSeasonCardsQuery, ListSeasonCardsQueryVariables>;
export const ListSeasonsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ListSeasons"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"offset"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orderBy"}},"type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SeasonsOrderBy"}}}},"defaultValue":{"kind":"ListValue","values":[]}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"SeasonFilter"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"now"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Datetime"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"allSeasons"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"offset"},"value":{"kind":"Variable","name":{"kind":"Name","value":"offset"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"orderBy"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orderBy"}}},{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filter"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"listSeasonsFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"cursor"}}]}}]}}]}},...ListSeasonsFieldsFragmentDoc.definitions,...EpisodeStatusFieldsFragmentDoc.definitions,...TaskSummaryFieldsFragmentDoc.definitions]} as unknown as DocumentNode<ListSeasonsQuery, ListSeasonsQueryVariables>;
export const CreateSeasonDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateSeason"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"season"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SeasonInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createSeason"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"season"},"value":{"kind":"Variable","name":{"kind":"Name","value":"season"}}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"season"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]}}]} as unknown as DocumentNode<CreateSeasonMutation, CreateSeasonMutationVariables>;
export const SearchBangumiDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SearchBangumi"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"keywords"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"useNewBangumiSearchApi"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"offset"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"searchBangumi"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"keywords"},"value":{"kind":"Variable","name":{"kind":"Name","value":"keywords"}}},{"kind":"Argument","name":{"kind":"Name","value":"useNewBangumiSearchApi"},"value":{"kind":"Variable","name":{"kind":"Name","value":"useNewBangumiSearchApi"}}},{"kind":"Argument","name":{"kind":"Name","value":"offset"},"value":{"kind":"Variable","name":{"kind":"Name","value":"offset"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"added"}},{"kind":"Field","name":{"kind":"Name","value":"airDate"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"image"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"tags"}}]}}]}}]} as unknown as DocumentNode<SearchBangumiQuery, SearchBangumiQueryVariables>;
export const GetMetadataPageOptionsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetMetadataPageOptions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getAvailableSemesters"}},{"kind":"Field","name":{"kind":"Name","value":"allJellyfinFolders"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"jellyfinFolderFields"}}]}}]}}]}}]}},...JellyfinFolderFieldsFragmentDoc.definitions]} as unknown as DocumentNode<GetMetadataPageOptionsQuery, GetMetadataPageOptionsQueryVariables>;
export const DeleteSeasonByIdDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteSeasonById"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteSeasonById"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeleteSeasonByIdMutation, DeleteSeasonByIdMutationVariables>;
export const ListJellyfinFoldersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ListJellyfinFolders"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"allJellyfinFolders"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"jellyfinFolderFields"}}]}}]}}]}}]}},...JellyfinFolderFieldsFragmentDoc.definitions]} as unknown as DocumentNode<ListJellyfinFoldersQuery, ListJellyfinFoldersQueryVariables>;
export const WriteSeasonMetadataDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"WriteSeasonMetadata"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"writeMetadata"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"seasonId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<WriteSeasonMetadataMutation, WriteSeasonMetadataMutationVariables>;
export const GetSeasonsStatusDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetSeasonsStatus"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"seasonIds"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"now"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Datetime"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"allSeasons"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"id"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"in"},"value":{"kind":"Variable","name":{"kind":"Name","value":"seasonIds"}}}]}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","alias":{"kind":"Name","value":"latestEpisode"},"name":{"kind":"Name","value":"latestMainEpisode"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"atTime"},"value":{"kind":"Variable","name":{"kind":"Name","value":"now"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"episodeStatusFields"}}]}}]}}]}}]}}]}},...EpisodeStatusFieldsFragmentDoc.definitions,...TaskSummaryFieldsFragmentDoc.definitions]} as unknown as DocumentNode<GetSeasonsStatusQuery, GetSeasonsStatusQueryVariables>;
export const ListTorrentsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ListTorrents"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"offset"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orderBy"}},"type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"TorrentsOrderBy"}}}},"defaultValue":{"kind":"ListValue","values":[]}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"TorrentFilter"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"allTorrents"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"offset"},"value":{"kind":"Variable","name":{"kind":"Name","value":"offset"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"orderBy"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orderBy"}}},{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filter"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"torrentFields"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"torrentParseFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"cursor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalCount"}}]}}]}},...TorrentFieldsFragmentDoc.definitions,...TorrentParseFieldsFragmentDoc.definitions]} as unknown as DocumentNode<ListTorrentsQuery, ListTorrentsQueryVariables>;
export const SyncTorrentHistoryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SyncTorrentHistory"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"syncTorrentHistory"}}]}}]} as unknown as DocumentNode<SyncTorrentHistoryMutation, SyncTorrentHistoryMutationVariables>;
export const TorrentHistorySyncStateDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"TorrentHistorySyncState"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"torrentHistorySyncState"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"running"}},{"kind":"Field","name":{"kind":"Name","value":"added"}},{"kind":"Field","name":{"kind":"Name","value":"error"}}]}}]}}]} as unknown as DocumentNode<TorrentHistorySyncStateQuery, TorrentHistorySyncStateQueryVariables>;
export const CancelTorrentSeasonMatchDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CancelTorrentSeasonMatch"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"torrentId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cancelTorrentSeasonMatch"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"torrentId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"torrentId"}}}]}]}}]} as unknown as DocumentNode<CancelTorrentSeasonMatchMutation, CancelTorrentSeasonMatchMutationVariables>;
export const GetConfigDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetConfig"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"config"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"jellyfin"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"publicHost"}}]}},{"kind":"Field","name":{"kind":"Name","value":"lania"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"publicHost"}}]}},{"kind":"Field","name":{"kind":"Name","value":"features"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lania"}}]}},{"kind":"Field","name":{"kind":"Name","value":"env"}}]}}]}}]} as unknown as DocumentNode<GetConfigQuery, GetConfigQueryVariables>;
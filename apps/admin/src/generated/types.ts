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
  /** BigInt */
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
};

export type AdminConfig = {
  __typename?: 'AdminConfig';
  jellyfin?: Maybe<JellyfinConfig>;
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

export type DownloadJob = Node & {
  __typename?: 'DownloadJob';
  cancelledAt?: Maybe<Scalars['Datetime']>;
  createdAt: Scalars['Datetime'];
  /**
   * Only available after torrent finished downloading.
   * This is the save_path from qbt, which might be a directory.
   * If job is started after this step, this field will also be null.
   */
  downloadPath?: Maybe<Scalars['String']>;
  /** Reads a single `Episode` that is related to this `DownloadJob`. */
  episodeByEpisodeId?: Maybe<Episode>;
  episodeId: Scalars['Int'];
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
  jellyfinEpisodeId?: Maybe<Scalars['String']>;
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
  status: DownloadStatus;
  torrentLink?: Maybe<Scalars['String']>;
};

/**
 * A condition to be used against `DownloadJob` object types. All fields are tested
 * for equality and combined with a logical ‘and.’
 */
export type DownloadJobCondition = {
  /** Checks for equality with the object’s `cancelledAt` field. */
  cancelledAt?: InputMaybe<Scalars['Datetime']>;
  /** Checks for equality with the object’s `createdAt` field. */
  createdAt?: InputMaybe<Scalars['Datetime']>;
  /** Checks for equality with the object’s `downloadPath` field. */
  downloadPath?: InputMaybe<Scalars['String']>;
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
  /** Checks for equality with the object’s `jellyfinEpisodeId` field. */
  jellyfinEpisodeId?: InputMaybe<Scalars['String']>;
  /** Checks for equality with the object’s `nfoPath` field. */
  nfoPath?: InputMaybe<Scalars['String']>;
  /** Checks for equality with the object’s `qbtLastSync` field. */
  qbtLastSync?: InputMaybe<Scalars['Datetime']>;
  /** Checks for equality with the object’s `qbtTorrentHash` field. */
  qbtTorrentHash?: InputMaybe<Scalars['String']>;
  /** Checks for equality with the object’s `status` field. */
  status?: InputMaybe<DownloadStatus>;
  /** Checks for equality with the object’s `torrentLink` field. */
  torrentLink?: InputMaybe<Scalars['String']>;
};

/** A filter to be used against `DownloadJob` object types. All fields are combined with a logical ‘and.’ */
export type DownloadJobFilter = {
  /** Checks for all expressions in this list. */
  and?: InputMaybe<Array<DownloadJobFilter>>;
  /** Filter by the object’s `cancelledAt` field. */
  cancelledAt?: InputMaybe<DatetimeFilter>;
  /** Filter by the object’s `createdAt` field. */
  createdAt?: InputMaybe<DatetimeFilter>;
  /** Filter by the object’s `downloadPath` field. */
  downloadPath?: InputMaybe<StringFilter>;
  /** Filter by the object’s `episodeByEpisodeId` relation. */
  episodeByEpisodeId?: InputMaybe<EpisodeFilter>;
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
  /** Filter by the object’s `jellyfinEpisodeId` field. */
  jellyfinEpisodeId?: InputMaybe<StringFilter>;
  /** Filter by the object’s `nfoPath` field. */
  nfoPath?: InputMaybe<StringFilter>;
  /** Negates the expression. */
  not?: InputMaybe<DownloadJobFilter>;
  /** Checks for any expressions in this list. */
  or?: InputMaybe<Array<DownloadJobFilter>>;
  /** Filter by the object’s `qbtLastSync` field. */
  qbtLastSync?: InputMaybe<DatetimeFilter>;
  /** Filter by the object’s `qbtTorrentHash` field. */
  qbtTorrentHash?: InputMaybe<StringFilter>;
  /** Filter by the object’s `status` field. */
  status?: InputMaybe<DownloadStatusFilter>;
  /** Filter by the object’s `torrentLink` field. */
  torrentLink?: InputMaybe<StringFilter>;
};

/** A connection to a list of `DownloadJob` values. */
export type DownloadJobsConnection = {
  __typename?: 'DownloadJobsConnection';
  /** A list of edges which contains the `DownloadJob` and cursor to aid in pagination. */
  edges: Array<DownloadJobsEdge>;
  /** A list of `DownloadJob` objects. */
  nodes: Array<Maybe<DownloadJob>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** The count of *all* `DownloadJob` you could get from the connection. */
  totalCount: Scalars['Int'];
};

/** A `DownloadJob` edge in the connection. */
export type DownloadJobsEdge = {
  __typename?: 'DownloadJobsEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']>;
  /** The `DownloadJob` at the end of the edge. */
  node?: Maybe<DownloadJob>;
};

/** Methods to use when ordering `DownloadJob`. */
export enum DownloadJobsOrderBy {
  CancelledAtAsc = 'CANCELLED_AT_ASC',
  CancelledAtDesc = 'CANCELLED_AT_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
  DownloadPathAsc = 'DOWNLOAD_PATH_ASC',
  DownloadPathDesc = 'DOWNLOAD_PATH_DESC',
  EpisodeByEpisodeIdAirTimeAsc = 'EPISODE_BY_EPISODE_ID__AIR_TIME_ASC',
  EpisodeByEpisodeIdAirTimeDesc = 'EPISODE_BY_EPISODE_ID__AIR_TIME_DESC',
  EpisodeByEpisodeIdCreatedAtAsc = 'EPISODE_BY_EPISODE_ID__CREATED_AT_ASC',
  EpisodeByEpisodeIdCreatedAtDesc = 'EPISODE_BY_EPISODE_ID__CREATED_AT_DESC',
  EpisodeByEpisodeIdDescriptionAsc = 'EPISODE_BY_EPISODE_ID__DESCRIPTION_ASC',
  EpisodeByEpisodeIdDescriptionDesc = 'EPISODE_BY_EPISODE_ID__DESCRIPTION_DESC',
  EpisodeByEpisodeIdIdAsc = 'EPISODE_BY_EPISODE_ID__ID_ASC',
  EpisodeByEpisodeIdIdDesc = 'EPISODE_BY_EPISODE_ID__ID_DESC',
  EpisodeByEpisodeIdIndexAsc = 'EPISODE_BY_EPISODE_ID__INDEX_ASC',
  EpisodeByEpisodeIdIndexDesc = 'EPISODE_BY_EPISODE_ID__INDEX_DESC',
  EpisodeByEpisodeIdJellyfinEpisodeIdAsc = 'EPISODE_BY_EPISODE_ID__JELLYFIN_EPISODE_ID_ASC',
  EpisodeByEpisodeIdJellyfinEpisodeIdDesc = 'EPISODE_BY_EPISODE_ID__JELLYFIN_EPISODE_ID_DESC',
  EpisodeByEpisodeIdLastMissingNotifyTimeAsc = 'EPISODE_BY_EPISODE_ID__LAST_MISSING_NOTIFY_TIME_ASC',
  EpisodeByEpisodeIdLastMissingNotifyTimeDesc = 'EPISODE_BY_EPISODE_ID__LAST_MISSING_NOTIFY_TIME_DESC',
  EpisodeByEpisodeIdSeasonIdAsc = 'EPISODE_BY_EPISODE_ID__SEASON_ID_ASC',
  EpisodeByEpisodeIdSeasonIdDesc = 'EPISODE_BY_EPISODE_ID__SEASON_ID_DESC',
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
  JellyfinEpisodeIdAsc = 'JELLYFIN_EPISODE_ID_ASC',
  JellyfinEpisodeIdDesc = 'JELLYFIN_EPISODE_ID_DESC',
  Natural = 'NATURAL',
  NfoPathAsc = 'NFO_PATH_ASC',
  NfoPathDesc = 'NFO_PATH_DESC',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  QbtLastSyncAsc = 'QBT_LAST_SYNC_ASC',
  QbtLastSyncDesc = 'QBT_LAST_SYNC_DESC',
  QbtTorrentHashAsc = 'QBT_TORRENT_HASH_ASC',
  QbtTorrentHashDesc = 'QBT_TORRENT_HASH_DESC',
  StatusAsc = 'STATUS_ASC',
  StatusDesc = 'STATUS_DESC',
  TorrentLinkAsc = 'TORRENT_LINK_ASC',
  TorrentLinkDesc = 'TORRENT_LINK_DESC'
}

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
  SeasonBySeasonIdDescriptionAsc = 'SEASON_BY_SEASON_ID__DESCRIPTION_ASC',
  SeasonBySeasonIdDescriptionDesc = 'SEASON_BY_SEASON_ID__DESCRIPTION_DESC',
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
  SeasonBySeasonIdIsMonitoringAsc = 'SEASON_BY_SEASON_ID__IS_MONITORING_ASC',
  SeasonBySeasonIdIsMonitoringDesc = 'SEASON_BY_SEASON_ID__IS_MONITORING_DESC',
  SeasonBySeasonIdJellyfinFolderIdAsc = 'SEASON_BY_SEASON_ID__JELLYFIN_FOLDER_ID_ASC',
  SeasonBySeasonIdJellyfinFolderIdDesc = 'SEASON_BY_SEASON_ID__JELLYFIN_FOLDER_ID_DESC',
  SeasonBySeasonIdJellyfinIdAsc = 'SEASON_BY_SEASON_ID__JELLYFIN_ID_ASC',
  SeasonBySeasonIdJellyfinIdDesc = 'SEASON_BY_SEASON_ID__JELLYFIN_ID_DESC',
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
  SeasonBySeasonIdYearAndSemesterDesc = 'SEASON_BY_SEASON_ID__YEAR_AND_SEMESTER_DESC',
  SeasonIdAsc = 'SEASON_ID_ASC',
  SeasonIdDesc = 'SEASON_ID_DESC'
}

export enum DownloadStatus {
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

/** A filter to be used against DownloadStatus fields. All fields are combined with a logical ‘and.’ */
export type DownloadStatusFilter = {
  /** Not equal to the specified value, treating null like an ordinary value. */
  distinctFrom?: InputMaybe<DownloadStatus>;
  /** Equal to the specified value. */
  equalTo?: InputMaybe<DownloadStatus>;
  /** Greater than the specified value. */
  greaterThan?: InputMaybe<DownloadStatus>;
  /** Greater than or equal to the specified value. */
  greaterThanOrEqualTo?: InputMaybe<DownloadStatus>;
  /** Included in the specified list. */
  in?: InputMaybe<Array<DownloadStatus>>;
  /** Is null (if `true` is specified) or is not null (if `false` is specified). */
  isNull?: InputMaybe<Scalars['Boolean']>;
  /** Less than the specified value. */
  lessThan?: InputMaybe<DownloadStatus>;
  /** Less than or equal to the specified value. */
  lessThanOrEqualTo?: InputMaybe<DownloadStatus>;
  /** Equal to the specified value, treating null like an ordinary value. */
  notDistinctFrom?: InputMaybe<DownloadStatus>;
  /** Not equal to the specified value. */
  notEqualTo?: InputMaybe<DownloadStatus>;
  /** Not included in the specified list. */
  notIn?: InputMaybe<Array<DownloadStatus>>;
};

export type Episode = Node & {
  __typename?: 'Episode';
  airTime?: Maybe<Scalars['Datetime']>;
  createdAt: Scalars['Datetime'];
  description: Scalars['String'];
  /** Reads and enables pagination through a set of `DownloadJob`. */
  downloadJobsByEpisodeId: DownloadJobsConnection;
  id: Scalars['Int'];
  index: Scalars['Int'];
  jellyfinEpisodeId?: Maybe<Scalars['String']>;
  lastMissingNotifyTime?: Maybe<Scalars['Datetime']>;
  /** A globally unique identifier. Can be used in various places throughout the system to identify this single value. */
  nodeId: Scalars['ID'];
  /** Reads a single `Season` that is related to this `Episode`. */
  seasonBySeasonId?: Maybe<Season>;
  seasonId: Scalars['Int'];
  title: Scalars['String'];
};


export type EpisodeDownloadJobsByEpisodeIdArgs = {
  after?: InputMaybe<Scalars['Cursor']>;
  before?: InputMaybe<Scalars['Cursor']>;
  condition?: InputMaybe<DownloadJobCondition>;
  filter?: InputMaybe<DownloadJobFilter>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<DownloadJobsOrderBy>>;
};

/** A condition to be used against `Episode` object types. All fields are tested for equality and combined with a logical ‘and.’ */
export type EpisodeCondition = {
  /** Checks for equality with the object’s `airTime` field. */
  airTime?: InputMaybe<Scalars['Datetime']>;
  /** Checks for equality with the object’s `createdAt` field. */
  createdAt?: InputMaybe<Scalars['Datetime']>;
  /** Checks for equality with the object’s `description` field. */
  description?: InputMaybe<Scalars['String']>;
  /** Checks for equality with the object’s `id` field. */
  id?: InputMaybe<Scalars['Int']>;
  /** Checks for equality with the object’s `index` field. */
  index?: InputMaybe<Scalars['Int']>;
  /** Checks for equality with the object’s `jellyfinEpisodeId` field. */
  jellyfinEpisodeId?: InputMaybe<Scalars['String']>;
  /** Checks for equality with the object’s `lastMissingNotifyTime` field. */
  lastMissingNotifyTime?: InputMaybe<Scalars['Datetime']>;
  /** Checks for equality with the object’s `seasonId` field. */
  seasonId?: InputMaybe<Scalars['Int']>;
  /** Checks for equality with the object’s `title` field. */
  title?: InputMaybe<Scalars['String']>;
};

/** A filter to be used against `Episode` object types. All fields are combined with a logical ‘and.’ */
export type EpisodeFilter = {
  /** Filter by the object’s `airTime` field. */
  airTime?: InputMaybe<DatetimeFilter>;
  /** Checks for all expressions in this list. */
  and?: InputMaybe<Array<EpisodeFilter>>;
  /** Filter by the object’s `createdAt` field. */
  createdAt?: InputMaybe<DatetimeFilter>;
  /** Filter by the object’s `description` field. */
  description?: InputMaybe<StringFilter>;
  /** Filter by the object’s `downloadJobsByEpisodeId` relation. */
  downloadJobsByEpisodeId?: InputMaybe<EpisodeToManyDownloadJobFilter>;
  /** Some related `downloadJobsByEpisodeId` exist. */
  downloadJobsByEpisodeIdExist?: InputMaybe<Scalars['Boolean']>;
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
  /** Checks for any expressions in this list. */
  or?: InputMaybe<Array<EpisodeFilter>>;
  /** Filter by the object’s `seasonBySeasonId` relation. */
  seasonBySeasonId?: InputMaybe<SeasonFilter>;
  /** Filter by the object’s `seasonId` field. */
  seasonId?: InputMaybe<IntFilter>;
  /** Filter by the object’s `title` field. */
  title?: InputMaybe<StringFilter>;
};

/** Represents an update to a `Episode`. Fields that are set will be updated. */
export type EpisodePatch = {
  airTime?: InputMaybe<Scalars['Datetime']>;
  createdAt?: InputMaybe<Scalars['Datetime']>;
  description?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['Int']>;
  index?: InputMaybe<Scalars['Int']>;
  jellyfinEpisodeId?: InputMaybe<Scalars['String']>;
  lastMissingNotifyTime?: InputMaybe<Scalars['Datetime']>;
  seasonId?: InputMaybe<Scalars['Int']>;
  title?: InputMaybe<Scalars['String']>;
};

/** A filter to be used against many `DownloadJob` object types. All fields are combined with a logical ‘and.’ */
export type EpisodeToManyDownloadJobFilter = {
  /** Every related `DownloadJob` matches the filter criteria. All fields are combined with a logical ‘and.’ */
  every?: InputMaybe<DownloadJobFilter>;
  /** No related `DownloadJob` matches the filter criteria. All fields are combined with a logical ‘and.’ */
  none?: InputMaybe<DownloadJobFilter>;
  /** Some related `DownloadJob` matches the filter criteria. All fields are combined with a logical ‘and.’ */
  some?: InputMaybe<DownloadJobFilter>;
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
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
  DescriptionAsc = 'DESCRIPTION_ASC',
  DescriptionDesc = 'DESCRIPTION_DESC',
  DownloadJobsByEpisodeIdCountAsc = 'DOWNLOAD_JOBS_BY_EPISODE_ID__COUNT_ASC',
  DownloadJobsByEpisodeIdCountDesc = 'DOWNLOAD_JOBS_BY_EPISODE_ID__COUNT_DESC',
  DownloadJobsByEpisodeIdMaxCancelledAtAsc = 'DOWNLOAD_JOBS_BY_EPISODE_ID__MAX_CANCELLED_AT_ASC',
  DownloadJobsByEpisodeIdMaxCancelledAtDesc = 'DOWNLOAD_JOBS_BY_EPISODE_ID__MAX_CANCELLED_AT_DESC',
  DownloadJobsByEpisodeIdMaxCreatedAtAsc = 'DOWNLOAD_JOBS_BY_EPISODE_ID__MAX_CREATED_AT_ASC',
  DownloadJobsByEpisodeIdMaxCreatedAtDesc = 'DOWNLOAD_JOBS_BY_EPISODE_ID__MAX_CREATED_AT_DESC',
  DownloadJobsByEpisodeIdMaxDownloadPathAsc = 'DOWNLOAD_JOBS_BY_EPISODE_ID__MAX_DOWNLOAD_PATH_ASC',
  DownloadJobsByEpisodeIdMaxDownloadPathDesc = 'DOWNLOAD_JOBS_BY_EPISODE_ID__MAX_DOWNLOAD_PATH_DESC',
  DownloadJobsByEpisodeIdMaxEpisodeIdAsc = 'DOWNLOAD_JOBS_BY_EPISODE_ID__MAX_EPISODE_ID_ASC',
  DownloadJobsByEpisodeIdMaxEpisodeIdDesc = 'DOWNLOAD_JOBS_BY_EPISODE_ID__MAX_EPISODE_ID_DESC',
  DownloadJobsByEpisodeIdMaxFailedAtAsc = 'DOWNLOAD_JOBS_BY_EPISODE_ID__MAX_FAILED_AT_ASC',
  DownloadJobsByEpisodeIdMaxFailedAtDesc = 'DOWNLOAD_JOBS_BY_EPISODE_ID__MAX_FAILED_AT_DESC',
  DownloadJobsByEpisodeIdMaxFailedReasonAsc = 'DOWNLOAD_JOBS_BY_EPISODE_ID__MAX_FAILED_REASON_ASC',
  DownloadJobsByEpisodeIdMaxFailedReasonDesc = 'DOWNLOAD_JOBS_BY_EPISODE_ID__MAX_FAILED_REASON_DESC',
  DownloadJobsByEpisodeIdMaxFilePathAsc = 'DOWNLOAD_JOBS_BY_EPISODE_ID__MAX_FILE_PATH_ASC',
  DownloadJobsByEpisodeIdMaxFilePathDesc = 'DOWNLOAD_JOBS_BY_EPISODE_ID__MAX_FILE_PATH_DESC',
  DownloadJobsByEpisodeIdMaxIdAsc = 'DOWNLOAD_JOBS_BY_EPISODE_ID__MAX_ID_ASC',
  DownloadJobsByEpisodeIdMaxIdDesc = 'DOWNLOAD_JOBS_BY_EPISODE_ID__MAX_ID_DESC',
  DownloadJobsByEpisodeIdMaxImportPathAsc = 'DOWNLOAD_JOBS_BY_EPISODE_ID__MAX_IMPORT_PATH_ASC',
  DownloadJobsByEpisodeIdMaxImportPathDesc = 'DOWNLOAD_JOBS_BY_EPISODE_ID__MAX_IMPORT_PATH_DESC',
  DownloadJobsByEpisodeIdMaxIsCancelledAsc = 'DOWNLOAD_JOBS_BY_EPISODE_ID__MAX_IS_CANCELLED_ASC',
  DownloadJobsByEpisodeIdMaxIsCancelledDesc = 'DOWNLOAD_JOBS_BY_EPISODE_ID__MAX_IS_CANCELLED_DESC',
  DownloadJobsByEpisodeIdMaxIsFailedAsc = 'DOWNLOAD_JOBS_BY_EPISODE_ID__MAX_IS_FAILED_ASC',
  DownloadJobsByEpisodeIdMaxIsFailedDesc = 'DOWNLOAD_JOBS_BY_EPISODE_ID__MAX_IS_FAILED_DESC',
  DownloadJobsByEpisodeIdMaxJellyfinEpisodeIdAsc = 'DOWNLOAD_JOBS_BY_EPISODE_ID__MAX_JELLYFIN_EPISODE_ID_ASC',
  DownloadJobsByEpisodeIdMaxJellyfinEpisodeIdDesc = 'DOWNLOAD_JOBS_BY_EPISODE_ID__MAX_JELLYFIN_EPISODE_ID_DESC',
  DownloadJobsByEpisodeIdMaxNfoPathAsc = 'DOWNLOAD_JOBS_BY_EPISODE_ID__MAX_NFO_PATH_ASC',
  DownloadJobsByEpisodeIdMaxNfoPathDesc = 'DOWNLOAD_JOBS_BY_EPISODE_ID__MAX_NFO_PATH_DESC',
  DownloadJobsByEpisodeIdMaxQbtLastSyncAsc = 'DOWNLOAD_JOBS_BY_EPISODE_ID__MAX_QBT_LAST_SYNC_ASC',
  DownloadJobsByEpisodeIdMaxQbtLastSyncDesc = 'DOWNLOAD_JOBS_BY_EPISODE_ID__MAX_QBT_LAST_SYNC_DESC',
  DownloadJobsByEpisodeIdMaxQbtTorrentHashAsc = 'DOWNLOAD_JOBS_BY_EPISODE_ID__MAX_QBT_TORRENT_HASH_ASC',
  DownloadJobsByEpisodeIdMaxQbtTorrentHashDesc = 'DOWNLOAD_JOBS_BY_EPISODE_ID__MAX_QBT_TORRENT_HASH_DESC',
  DownloadJobsByEpisodeIdMaxStatusAsc = 'DOWNLOAD_JOBS_BY_EPISODE_ID__MAX_STATUS_ASC',
  DownloadJobsByEpisodeIdMaxStatusDesc = 'DOWNLOAD_JOBS_BY_EPISODE_ID__MAX_STATUS_DESC',
  DownloadJobsByEpisodeIdMaxTorrentLinkAsc = 'DOWNLOAD_JOBS_BY_EPISODE_ID__MAX_TORRENT_LINK_ASC',
  DownloadJobsByEpisodeIdMaxTorrentLinkDesc = 'DOWNLOAD_JOBS_BY_EPISODE_ID__MAX_TORRENT_LINK_DESC',
  DownloadJobsByEpisodeIdMinCancelledAtAsc = 'DOWNLOAD_JOBS_BY_EPISODE_ID__MIN_CANCELLED_AT_ASC',
  DownloadJobsByEpisodeIdMinCancelledAtDesc = 'DOWNLOAD_JOBS_BY_EPISODE_ID__MIN_CANCELLED_AT_DESC',
  DownloadJobsByEpisodeIdMinCreatedAtAsc = 'DOWNLOAD_JOBS_BY_EPISODE_ID__MIN_CREATED_AT_ASC',
  DownloadJobsByEpisodeIdMinCreatedAtDesc = 'DOWNLOAD_JOBS_BY_EPISODE_ID__MIN_CREATED_AT_DESC',
  DownloadJobsByEpisodeIdMinDownloadPathAsc = 'DOWNLOAD_JOBS_BY_EPISODE_ID__MIN_DOWNLOAD_PATH_ASC',
  DownloadJobsByEpisodeIdMinDownloadPathDesc = 'DOWNLOAD_JOBS_BY_EPISODE_ID__MIN_DOWNLOAD_PATH_DESC',
  DownloadJobsByEpisodeIdMinEpisodeIdAsc = 'DOWNLOAD_JOBS_BY_EPISODE_ID__MIN_EPISODE_ID_ASC',
  DownloadJobsByEpisodeIdMinEpisodeIdDesc = 'DOWNLOAD_JOBS_BY_EPISODE_ID__MIN_EPISODE_ID_DESC',
  DownloadJobsByEpisodeIdMinFailedAtAsc = 'DOWNLOAD_JOBS_BY_EPISODE_ID__MIN_FAILED_AT_ASC',
  DownloadJobsByEpisodeIdMinFailedAtDesc = 'DOWNLOAD_JOBS_BY_EPISODE_ID__MIN_FAILED_AT_DESC',
  DownloadJobsByEpisodeIdMinFailedReasonAsc = 'DOWNLOAD_JOBS_BY_EPISODE_ID__MIN_FAILED_REASON_ASC',
  DownloadJobsByEpisodeIdMinFailedReasonDesc = 'DOWNLOAD_JOBS_BY_EPISODE_ID__MIN_FAILED_REASON_DESC',
  DownloadJobsByEpisodeIdMinFilePathAsc = 'DOWNLOAD_JOBS_BY_EPISODE_ID__MIN_FILE_PATH_ASC',
  DownloadJobsByEpisodeIdMinFilePathDesc = 'DOWNLOAD_JOBS_BY_EPISODE_ID__MIN_FILE_PATH_DESC',
  DownloadJobsByEpisodeIdMinIdAsc = 'DOWNLOAD_JOBS_BY_EPISODE_ID__MIN_ID_ASC',
  DownloadJobsByEpisodeIdMinIdDesc = 'DOWNLOAD_JOBS_BY_EPISODE_ID__MIN_ID_DESC',
  DownloadJobsByEpisodeIdMinImportPathAsc = 'DOWNLOAD_JOBS_BY_EPISODE_ID__MIN_IMPORT_PATH_ASC',
  DownloadJobsByEpisodeIdMinImportPathDesc = 'DOWNLOAD_JOBS_BY_EPISODE_ID__MIN_IMPORT_PATH_DESC',
  DownloadJobsByEpisodeIdMinIsCancelledAsc = 'DOWNLOAD_JOBS_BY_EPISODE_ID__MIN_IS_CANCELLED_ASC',
  DownloadJobsByEpisodeIdMinIsCancelledDesc = 'DOWNLOAD_JOBS_BY_EPISODE_ID__MIN_IS_CANCELLED_DESC',
  DownloadJobsByEpisodeIdMinIsFailedAsc = 'DOWNLOAD_JOBS_BY_EPISODE_ID__MIN_IS_FAILED_ASC',
  DownloadJobsByEpisodeIdMinIsFailedDesc = 'DOWNLOAD_JOBS_BY_EPISODE_ID__MIN_IS_FAILED_DESC',
  DownloadJobsByEpisodeIdMinJellyfinEpisodeIdAsc = 'DOWNLOAD_JOBS_BY_EPISODE_ID__MIN_JELLYFIN_EPISODE_ID_ASC',
  DownloadJobsByEpisodeIdMinJellyfinEpisodeIdDesc = 'DOWNLOAD_JOBS_BY_EPISODE_ID__MIN_JELLYFIN_EPISODE_ID_DESC',
  DownloadJobsByEpisodeIdMinNfoPathAsc = 'DOWNLOAD_JOBS_BY_EPISODE_ID__MIN_NFO_PATH_ASC',
  DownloadJobsByEpisodeIdMinNfoPathDesc = 'DOWNLOAD_JOBS_BY_EPISODE_ID__MIN_NFO_PATH_DESC',
  DownloadJobsByEpisodeIdMinQbtLastSyncAsc = 'DOWNLOAD_JOBS_BY_EPISODE_ID__MIN_QBT_LAST_SYNC_ASC',
  DownloadJobsByEpisodeIdMinQbtLastSyncDesc = 'DOWNLOAD_JOBS_BY_EPISODE_ID__MIN_QBT_LAST_SYNC_DESC',
  DownloadJobsByEpisodeIdMinQbtTorrentHashAsc = 'DOWNLOAD_JOBS_BY_EPISODE_ID__MIN_QBT_TORRENT_HASH_ASC',
  DownloadJobsByEpisodeIdMinQbtTorrentHashDesc = 'DOWNLOAD_JOBS_BY_EPISODE_ID__MIN_QBT_TORRENT_HASH_DESC',
  DownloadJobsByEpisodeIdMinStatusAsc = 'DOWNLOAD_JOBS_BY_EPISODE_ID__MIN_STATUS_ASC',
  DownloadJobsByEpisodeIdMinStatusDesc = 'DOWNLOAD_JOBS_BY_EPISODE_ID__MIN_STATUS_DESC',
  DownloadJobsByEpisodeIdMinTorrentLinkAsc = 'DOWNLOAD_JOBS_BY_EPISODE_ID__MIN_TORRENT_LINK_ASC',
  DownloadJobsByEpisodeIdMinTorrentLinkDesc = 'DOWNLOAD_JOBS_BY_EPISODE_ID__MIN_TORRENT_LINK_DESC',
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
  SeasonBySeasonIdAirTimeAsc = 'SEASON_BY_SEASON_ID__AIR_TIME_ASC',
  SeasonBySeasonIdAirTimeDesc = 'SEASON_BY_SEASON_ID__AIR_TIME_DESC',
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
  SeasonBySeasonIdDescriptionAsc = 'SEASON_BY_SEASON_ID__DESCRIPTION_ASC',
  SeasonBySeasonIdDescriptionDesc = 'SEASON_BY_SEASON_ID__DESCRIPTION_DESC',
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
  SeasonBySeasonIdIsMonitoringAsc = 'SEASON_BY_SEASON_ID__IS_MONITORING_ASC',
  SeasonBySeasonIdIsMonitoringDesc = 'SEASON_BY_SEASON_ID__IS_MONITORING_DESC',
  SeasonBySeasonIdJellyfinFolderIdAsc = 'SEASON_BY_SEASON_ID__JELLYFIN_FOLDER_ID_ASC',
  SeasonBySeasonIdJellyfinFolderIdDesc = 'SEASON_BY_SEASON_ID__JELLYFIN_FOLDER_ID_DESC',
  SeasonBySeasonIdJellyfinIdAsc = 'SEASON_BY_SEASON_ID__JELLYFIN_ID_ASC',
  SeasonBySeasonIdJellyfinIdDesc = 'SEASON_BY_SEASON_ID__JELLYFIN_ID_DESC',
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
  SeasonBySeasonIdYearAndSemesterDesc = 'SEASON_BY_SEASON_ID__YEAR_AND_SEMESTER_DESC',
  SeasonIdAsc = 'SEASON_ID_ASC',
  SeasonIdDesc = 'SEASON_ID_DESC',
  TitleAsc = 'TITLE_ASC',
  TitleDesc = 'TITLE_DESC'
}

export type FetchPartialSeasonRequest = {
  characters?: InputMaybe<Scalars['Boolean']>;
  episodes?: InputMaybe<Scalars['Boolean']>;
  images?: InputMaybe<Scalars['Boolean']>;
  info?: InputMaybe<Scalars['Boolean']>;
};

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
  SeasonsByBannerImageIdMaxDescriptionAsc = 'SEASONS_BY_BANNER_IMAGE_ID__MAX_DESCRIPTION_ASC',
  SeasonsByBannerImageIdMaxDescriptionDesc = 'SEASONS_BY_BANNER_IMAGE_ID__MAX_DESCRIPTION_DESC',
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
  SeasonsByBannerImageIdMaxIsMonitoringAsc = 'SEASONS_BY_BANNER_IMAGE_ID__MAX_IS_MONITORING_ASC',
  SeasonsByBannerImageIdMaxIsMonitoringDesc = 'SEASONS_BY_BANNER_IMAGE_ID__MAX_IS_MONITORING_DESC',
  SeasonsByBannerImageIdMaxJellyfinFolderIdAsc = 'SEASONS_BY_BANNER_IMAGE_ID__MAX_JELLYFIN_FOLDER_ID_ASC',
  SeasonsByBannerImageIdMaxJellyfinFolderIdDesc = 'SEASONS_BY_BANNER_IMAGE_ID__MAX_JELLYFIN_FOLDER_ID_DESC',
  SeasonsByBannerImageIdMaxJellyfinIdAsc = 'SEASONS_BY_BANNER_IMAGE_ID__MAX_JELLYFIN_ID_ASC',
  SeasonsByBannerImageIdMaxJellyfinIdDesc = 'SEASONS_BY_BANNER_IMAGE_ID__MAX_JELLYFIN_ID_DESC',
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
  SeasonsByBannerImageIdMaxYearAndSemesterDesc = 'SEASONS_BY_BANNER_IMAGE_ID__MAX_YEAR_AND_SEMESTER_DESC',
  SeasonsByBannerImageIdMinAirTimeAsc = 'SEASONS_BY_BANNER_IMAGE_ID__MIN_AIR_TIME_ASC',
  SeasonsByBannerImageIdMinAirTimeDesc = 'SEASONS_BY_BANNER_IMAGE_ID__MIN_AIR_TIME_DESC',
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
  SeasonsByBannerImageIdMinDescriptionAsc = 'SEASONS_BY_BANNER_IMAGE_ID__MIN_DESCRIPTION_ASC',
  SeasonsByBannerImageIdMinDescriptionDesc = 'SEASONS_BY_BANNER_IMAGE_ID__MIN_DESCRIPTION_DESC',
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
  SeasonsByBannerImageIdMinIsMonitoringAsc = 'SEASONS_BY_BANNER_IMAGE_ID__MIN_IS_MONITORING_ASC',
  SeasonsByBannerImageIdMinIsMonitoringDesc = 'SEASONS_BY_BANNER_IMAGE_ID__MIN_IS_MONITORING_DESC',
  SeasonsByBannerImageIdMinJellyfinFolderIdAsc = 'SEASONS_BY_BANNER_IMAGE_ID__MIN_JELLYFIN_FOLDER_ID_ASC',
  SeasonsByBannerImageIdMinJellyfinFolderIdDesc = 'SEASONS_BY_BANNER_IMAGE_ID__MIN_JELLYFIN_FOLDER_ID_DESC',
  SeasonsByBannerImageIdMinJellyfinIdAsc = 'SEASONS_BY_BANNER_IMAGE_ID__MIN_JELLYFIN_ID_ASC',
  SeasonsByBannerImageIdMinJellyfinIdDesc = 'SEASONS_BY_BANNER_IMAGE_ID__MIN_JELLYFIN_ID_DESC',
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
  SeasonsByBannerImageIdMinYearAndSemesterDesc = 'SEASONS_BY_BANNER_IMAGE_ID__MIN_YEAR_AND_SEMESTER_DESC',
  SeasonsByFanartImageIdCountAsc = 'SEASONS_BY_FANART_IMAGE_ID__COUNT_ASC',
  SeasonsByFanartImageIdCountDesc = 'SEASONS_BY_FANART_IMAGE_ID__COUNT_DESC',
  SeasonsByFanartImageIdMaxAirTimeAsc = 'SEASONS_BY_FANART_IMAGE_ID__MAX_AIR_TIME_ASC',
  SeasonsByFanartImageIdMaxAirTimeDesc = 'SEASONS_BY_FANART_IMAGE_ID__MAX_AIR_TIME_DESC',
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
  SeasonsByFanartImageIdMaxDescriptionAsc = 'SEASONS_BY_FANART_IMAGE_ID__MAX_DESCRIPTION_ASC',
  SeasonsByFanartImageIdMaxDescriptionDesc = 'SEASONS_BY_FANART_IMAGE_ID__MAX_DESCRIPTION_DESC',
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
  SeasonsByFanartImageIdMaxIsMonitoringAsc = 'SEASONS_BY_FANART_IMAGE_ID__MAX_IS_MONITORING_ASC',
  SeasonsByFanartImageIdMaxIsMonitoringDesc = 'SEASONS_BY_FANART_IMAGE_ID__MAX_IS_MONITORING_DESC',
  SeasonsByFanartImageIdMaxJellyfinFolderIdAsc = 'SEASONS_BY_FANART_IMAGE_ID__MAX_JELLYFIN_FOLDER_ID_ASC',
  SeasonsByFanartImageIdMaxJellyfinFolderIdDesc = 'SEASONS_BY_FANART_IMAGE_ID__MAX_JELLYFIN_FOLDER_ID_DESC',
  SeasonsByFanartImageIdMaxJellyfinIdAsc = 'SEASONS_BY_FANART_IMAGE_ID__MAX_JELLYFIN_ID_ASC',
  SeasonsByFanartImageIdMaxJellyfinIdDesc = 'SEASONS_BY_FANART_IMAGE_ID__MAX_JELLYFIN_ID_DESC',
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
  SeasonsByFanartImageIdMaxYearAndSemesterDesc = 'SEASONS_BY_FANART_IMAGE_ID__MAX_YEAR_AND_SEMESTER_DESC',
  SeasonsByFanartImageIdMinAirTimeAsc = 'SEASONS_BY_FANART_IMAGE_ID__MIN_AIR_TIME_ASC',
  SeasonsByFanartImageIdMinAirTimeDesc = 'SEASONS_BY_FANART_IMAGE_ID__MIN_AIR_TIME_DESC',
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
  SeasonsByFanartImageIdMinDescriptionAsc = 'SEASONS_BY_FANART_IMAGE_ID__MIN_DESCRIPTION_ASC',
  SeasonsByFanartImageIdMinDescriptionDesc = 'SEASONS_BY_FANART_IMAGE_ID__MIN_DESCRIPTION_DESC',
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
  SeasonsByFanartImageIdMinIsMonitoringAsc = 'SEASONS_BY_FANART_IMAGE_ID__MIN_IS_MONITORING_ASC',
  SeasonsByFanartImageIdMinIsMonitoringDesc = 'SEASONS_BY_FANART_IMAGE_ID__MIN_IS_MONITORING_DESC',
  SeasonsByFanartImageIdMinJellyfinFolderIdAsc = 'SEASONS_BY_FANART_IMAGE_ID__MIN_JELLYFIN_FOLDER_ID_ASC',
  SeasonsByFanartImageIdMinJellyfinFolderIdDesc = 'SEASONS_BY_FANART_IMAGE_ID__MIN_JELLYFIN_FOLDER_ID_DESC',
  SeasonsByFanartImageIdMinJellyfinIdAsc = 'SEASONS_BY_FANART_IMAGE_ID__MIN_JELLYFIN_ID_ASC',
  SeasonsByFanartImageIdMinJellyfinIdDesc = 'SEASONS_BY_FANART_IMAGE_ID__MIN_JELLYFIN_ID_DESC',
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
  SeasonsByFanartImageIdMinYearAndSemesterDesc = 'SEASONS_BY_FANART_IMAGE_ID__MIN_YEAR_AND_SEMESTER_DESC',
  SeasonsByPosterImageIdCountAsc = 'SEASONS_BY_POSTER_IMAGE_ID__COUNT_ASC',
  SeasonsByPosterImageIdCountDesc = 'SEASONS_BY_POSTER_IMAGE_ID__COUNT_DESC',
  SeasonsByPosterImageIdMaxAirTimeAsc = 'SEASONS_BY_POSTER_IMAGE_ID__MAX_AIR_TIME_ASC',
  SeasonsByPosterImageIdMaxAirTimeDesc = 'SEASONS_BY_POSTER_IMAGE_ID__MAX_AIR_TIME_DESC',
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
  SeasonsByPosterImageIdMaxDescriptionAsc = 'SEASONS_BY_POSTER_IMAGE_ID__MAX_DESCRIPTION_ASC',
  SeasonsByPosterImageIdMaxDescriptionDesc = 'SEASONS_BY_POSTER_IMAGE_ID__MAX_DESCRIPTION_DESC',
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
  SeasonsByPosterImageIdMaxIsMonitoringAsc = 'SEASONS_BY_POSTER_IMAGE_ID__MAX_IS_MONITORING_ASC',
  SeasonsByPosterImageIdMaxIsMonitoringDesc = 'SEASONS_BY_POSTER_IMAGE_ID__MAX_IS_MONITORING_DESC',
  SeasonsByPosterImageIdMaxJellyfinFolderIdAsc = 'SEASONS_BY_POSTER_IMAGE_ID__MAX_JELLYFIN_FOLDER_ID_ASC',
  SeasonsByPosterImageIdMaxJellyfinFolderIdDesc = 'SEASONS_BY_POSTER_IMAGE_ID__MAX_JELLYFIN_FOLDER_ID_DESC',
  SeasonsByPosterImageIdMaxJellyfinIdAsc = 'SEASONS_BY_POSTER_IMAGE_ID__MAX_JELLYFIN_ID_ASC',
  SeasonsByPosterImageIdMaxJellyfinIdDesc = 'SEASONS_BY_POSTER_IMAGE_ID__MAX_JELLYFIN_ID_DESC',
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
  SeasonsByPosterImageIdMaxYearAndSemesterDesc = 'SEASONS_BY_POSTER_IMAGE_ID__MAX_YEAR_AND_SEMESTER_DESC',
  SeasonsByPosterImageIdMinAirTimeAsc = 'SEASONS_BY_POSTER_IMAGE_ID__MIN_AIR_TIME_ASC',
  SeasonsByPosterImageIdMinAirTimeDesc = 'SEASONS_BY_POSTER_IMAGE_ID__MIN_AIR_TIME_DESC',
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
  SeasonsByPosterImageIdMinDescriptionAsc = 'SEASONS_BY_POSTER_IMAGE_ID__MIN_DESCRIPTION_ASC',
  SeasonsByPosterImageIdMinDescriptionDesc = 'SEASONS_BY_POSTER_IMAGE_ID__MIN_DESCRIPTION_DESC',
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
  SeasonsByPosterImageIdMinIsMonitoringAsc = 'SEASONS_BY_POSTER_IMAGE_ID__MIN_IS_MONITORING_ASC',
  SeasonsByPosterImageIdMinIsMonitoringDesc = 'SEASONS_BY_POSTER_IMAGE_ID__MIN_IS_MONITORING_DESC',
  SeasonsByPosterImageIdMinJellyfinFolderIdAsc = 'SEASONS_BY_POSTER_IMAGE_ID__MIN_JELLYFIN_FOLDER_ID_ASC',
  SeasonsByPosterImageIdMinJellyfinFolderIdDesc = 'SEASONS_BY_POSTER_IMAGE_ID__MIN_JELLYFIN_FOLDER_ID_DESC',
  SeasonsByPosterImageIdMinJellyfinIdAsc = 'SEASONS_BY_POSTER_IMAGE_ID__MIN_JELLYFIN_ID_ASC',
  SeasonsByPosterImageIdMinJellyfinIdDesc = 'SEASONS_BY_POSTER_IMAGE_ID__MIN_JELLYFIN_ID_DESC',
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
  SeasonsByPosterImageIdMinYearAndSemesterDesc = 'SEASONS_BY_POSTER_IMAGE_ID__MIN_YEAR_AND_SEMESTER_DESC',
  SourceUrlAsc = 'SOURCE_URL_ASC',
  SourceUrlDesc = 'SOURCE_URL_DESC'
}

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
  SeasonsByJellyfinFolderIdMaxDescriptionAsc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MAX_DESCRIPTION_ASC',
  SeasonsByJellyfinFolderIdMaxDescriptionDesc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MAX_DESCRIPTION_DESC',
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
  SeasonsByJellyfinFolderIdMaxIsMonitoringAsc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MAX_IS_MONITORING_ASC',
  SeasonsByJellyfinFolderIdMaxIsMonitoringDesc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MAX_IS_MONITORING_DESC',
  SeasonsByJellyfinFolderIdMaxJellyfinFolderIdAsc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MAX_JELLYFIN_FOLDER_ID_ASC',
  SeasonsByJellyfinFolderIdMaxJellyfinFolderIdDesc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MAX_JELLYFIN_FOLDER_ID_DESC',
  SeasonsByJellyfinFolderIdMaxJellyfinIdAsc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MAX_JELLYFIN_ID_ASC',
  SeasonsByJellyfinFolderIdMaxJellyfinIdDesc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MAX_JELLYFIN_ID_DESC',
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
  SeasonsByJellyfinFolderIdMaxYearAndSemesterDesc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MAX_YEAR_AND_SEMESTER_DESC',
  SeasonsByJellyfinFolderIdMinAirTimeAsc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MIN_AIR_TIME_ASC',
  SeasonsByJellyfinFolderIdMinAirTimeDesc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MIN_AIR_TIME_DESC',
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
  SeasonsByJellyfinFolderIdMinDescriptionAsc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MIN_DESCRIPTION_ASC',
  SeasonsByJellyfinFolderIdMinDescriptionDesc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MIN_DESCRIPTION_DESC',
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
  SeasonsByJellyfinFolderIdMinIsMonitoringAsc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MIN_IS_MONITORING_ASC',
  SeasonsByJellyfinFolderIdMinIsMonitoringDesc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MIN_IS_MONITORING_DESC',
  SeasonsByJellyfinFolderIdMinJellyfinFolderIdAsc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MIN_JELLYFIN_FOLDER_ID_ASC',
  SeasonsByJellyfinFolderIdMinJellyfinFolderIdDesc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MIN_JELLYFIN_FOLDER_ID_DESC',
  SeasonsByJellyfinFolderIdMinJellyfinIdAsc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MIN_JELLYFIN_ID_ASC',
  SeasonsByJellyfinFolderIdMinJellyfinIdDesc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MIN_JELLYFIN_ID_DESC',
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
  SeasonsByJellyfinFolderIdMinYearAndSemesterDesc = 'SEASONS_BY_JELLYFIN_FOLDER_ID__MIN_YEAR_AND_SEMESTER_DESC'
}

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

export type MikanRssItem = {
  __typename?: 'MikanRSSItem';
  hash: Scalars['String'];
  link: Scalars['String'];
  publishDate: Scalars['DateTime'];
  size: Scalars['BigInt'];
  title: Scalars['String'];
  torrentLink: Scalars['String'];
};

export type Mutation = {
  __typename?: 'Mutation';
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
  downloadBilibiliCC: Scalars['ID'];
  downloadTorrentForEpisode: Scalars['Int'];
  enqueueDownloadJobs: Scalars['Int'];
  larkSendTestMessage: Scalars['ID'];
  mockEpisodePublish: Scalars['ID'];
  notifyMissingEpisodes: Scalars['Int'];
  parseTorrentTitleForAll: Scalars['ID'];
  refreshAllDownloadStatus: Scalars['Int'];
  refreshAllPlayerWaitingStatus: Scalars['Int'];
  retryJobStep: Scalars['ID'];
  setJellyfinFolderDefault: Scalars['ID'];
  syncAllSeasonsEpisodeData: Scalars['Int'];
  syncEpisodeData: Scalars['ID'];
  syncJellyfinFolders: Scalars['ID'];
  syncJellyfinSeriesId: Scalars['Boolean'];
  syncMetadata: Scalars['ID'];
  /** Returns newly added torrent count */
  syncMikan: Scalars['Int'];
  syncMikanHistory: Scalars['Int'];
  /** Updates a single `Episode` using its globally unique id and a patch. */
  updateEpisode?: Maybe<UpdateEpisodePayload>;
  /** Updates a single `Episode` using a unique key and a patch. */
  updateEpisodeById?: Maybe<UpdateEpisodePayload>;
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
  updateSeasonDownloadSources: Scalars['ID'];
  writeMetadata: Scalars['ID'];
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


export type MutationDownloadBilibiliCcArgs = {
  episodeId: Scalars['Int'];
};


export type MutationDownloadTorrentForEpisodeArgs = {
  episodeId: Scalars['Int'];
  torrentLink: Scalars['String'];
};


export type MutationMockEpisodePublishArgs = {
  episodeId: Scalars['Int'];
};


export type MutationRetryJobStepArgs = {
  jobId: Scalars['Int'];
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


export type MutationUpdateSeasonDownloadSourcesArgs = {
  input: UpdateSeasonDownloadSourcesInput;
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

export type Query = {
  __typename?: 'Query';
  /** Reads and enables pagination through a set of `DownloadJob`. */
  allDownloadJobs?: Maybe<DownloadJobsConnection>;
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
  /** Reads and enables pagination through a set of `Torrent`. */
  allTorrents?: Maybe<TorrentsConnection>;
  config: AdminConfig;
  /** Reads a single `DownloadJob` using its globally unique `ID`. */
  downloadJob?: Maybe<DownloadJob>;
  downloadJobById?: Maybe<DownloadJob>;
  /** Reads a single `DownloadSource` using its globally unique `ID`. */
  downloadSource?: Maybe<DownloadSource>;
  downloadSourceById?: Maybe<DownloadSource>;
  downloadSourceByPattern?: Maybe<DownloadSource>;
  environment: Scalars['ID'];
  /** Reads a single `Episode` using its globally unique `ID`. */
  episode?: Maybe<Episode>;
  episodeById?: Maybe<Episode>;
  episodeBySeasonIdAndIndex?: Maybe<Episode>;
  fetchBangumiSeason: PartialSeason;
  fetchMikan: Array<MikanRssItem>;
  fetchSkyhookSeason: PartialSeason;
  getAvailableSemesters: Array<Scalars['String']>;
  /** Reads a single `Image` using its globally unique `ID`. */
  image?: Maybe<Image>;
  imageById?: Maybe<Image>;
  imageBySourceUrl?: Maybe<Image>;
  /** Reads a single `JellyfinFolder` using its globally unique `ID`. */
  jellyfinFolder?: Maybe<JellyfinFolder>;
  jellyfinFolderById?: Maybe<JellyfinFolder>;
  jellyfinFolderByJellyfinId?: Maybe<JellyfinFolder>;
  searchBangumi: Array<SearchBangumiSeason>;
  /** Reads a single `Season` using its globally unique `ID`. */
  season?: Maybe<Season>;
  seasonById?: Maybe<Season>;
  seasonByTitle?: Maybe<Season>;
  /** Reads a single `Torrent` using its globally unique `ID`. */
  torrent?: Maybe<Torrent>;
  torrentByHash?: Maybe<Torrent>;
  torrentById?: Maybe<Torrent>;
};


export type QueryAllDownloadJobsArgs = {
  after?: InputMaybe<Scalars['Cursor']>;
  before?: InputMaybe<Scalars['Cursor']>;
  condition?: InputMaybe<DownloadJobCondition>;
  filter?: InputMaybe<DownloadJobFilter>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<DownloadJobsOrderBy>>;
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


export type QueryDownloadJobArgs = {
  nodeId: Scalars['ID'];
};


export type QueryDownloadJobByIdArgs = {
  id: Scalars['Int'];
};


export type QueryDownloadSourceArgs = {
  nodeId: Scalars['ID'];
};


export type QueryDownloadSourceByIdArgs = {
  id: Scalars['Int'];
};


export type QueryDownloadSourceByPatternArgs = {
  pattern: Scalars['String'];
};


export type QueryEpisodeArgs = {
  nodeId: Scalars['ID'];
};


export type QueryEpisodeByIdArgs = {
  id: Scalars['Int'];
};


export type QueryEpisodeBySeasonIdAndIndexArgs = {
  index: Scalars['Int'];
  seasonId: Scalars['Int'];
};


export type QueryFetchBangumiSeasonArgs = {
  bangumiId: Scalars['Int'];
  request: FetchPartialSeasonRequest;
};


export type QueryFetchMikanArgs = {
  partialURL: Scalars['String'];
};


export type QueryFetchSkyhookSeasonArgs = {
  request: FetchPartialSeasonRequest;
  seasonId: Scalars['Int'];
  tvdbId: Scalars['Int'];
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


export type QuerySearchBangumiArgs = {
  keywords: Scalars['String'];
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


export type QueryTorrentArgs = {
  nodeId: Scalars['ID'];
};


export type QueryTorrentByHashArgs = {
  hash: Scalars['String'];
};


export type QueryTorrentByIdArgs = {
  id: Scalars['Int'];
};

export type SearchBangumiSeason = {
  __typename?: 'SearchBangumiSeason';
  added: Scalars['Boolean'];
  airDate?: Maybe<Scalars['String']>;
  id: Scalars['String'];
  image?: Maybe<Scalars['String']>;
  name: Scalars['String'];
};

export type Season = Node & {
  __typename?: 'Season';
  /** hh:mm air time, or null if unknown, hour can be up to 48, timezone always GMT+8 */
  airTime: Scalars['String'];
  bangumiId: Scalars['String'];
  bannerImageId?: Maybe<Scalars['Int']>;
  bilibiliMainlandId: Scalars['String'];
  bilibiliThmId: Scalars['String'];
  createdAt: Scalars['Datetime'];
  description: Scalars['String'];
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
  isMonitoring: Scalars['Boolean'];
  /** Reads a single `JellyfinFolder` that is related to this `Season`. */
  jellyfinFolderByJellyfinFolderId?: Maybe<JellyfinFolder>;
  jellyfinFolderId: Scalars['Int'];
  jellyfinId: Scalars['String'];
  lastWriteTitle?: Maybe<Scalars['String']>;
  lastWriteToDisk?: Maybe<Scalars['Datetime']>;
  mikanAnimeId: Scalars['String'];
  needDownloadCc: Scalars['Boolean'];
  /** A globally unique identifier. Can be used in various places throughout the system to identify this single value. */
  nodeId: Scalars['ID'];
  notifyMissing: Scalars['Boolean'];
  notifyPublish: Scalars['Boolean'];
  posterImageId?: Maybe<Scalars['Int']>;
  tags: Array<Maybe<Scalars['String']>>;
  title: Scalars['String'];
  tvdbId: Scalars['String'];
  /** null if unknown */
  tvdbSeason?: Maybe<Scalars['Int']>;
  /** 0 for monday, 6 for sunday, null if unknown, past 24:00 time counts as last day (like Monday 25:00) */
  weekday?: Maybe<Scalars['Int']>;
  /** like '202201' ~ '202204', or null if unknown */
  yearAndSemester: Scalars['String'];
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
  /** Checks for equality with the object’s `description` field. */
  description?: InputMaybe<Scalars['String']>;
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
  /** Checks for equality with the object’s `isMonitoring` field. */
  isMonitoring?: InputMaybe<Scalars['Boolean']>;
  /** Checks for equality with the object’s `jellyfinFolderId` field. */
  jellyfinFolderId?: InputMaybe<Scalars['Int']>;
  /** Checks for equality with the object’s `jellyfinId` field. */
  jellyfinId?: InputMaybe<Scalars['String']>;
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
};

export type SeasonEpisode = {
  __typename?: 'SeasonEpisode';
  airDate?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  index: Scalars['Int'];
  title: Scalars['String'];
};

/** A filter to be used against `Season` object types. All fields are combined with a logical ‘and.’ */
export type SeasonFilter = {
  /** Filter by the object’s `airTime` field. */
  airTime?: InputMaybe<StringFilter>;
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
  /** Filter by the object’s `description` field. */
  description?: InputMaybe<StringFilter>;
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
  /** Filter by the object’s `isMonitoring` field. */
  isMonitoring?: InputMaybe<BooleanFilter>;
  /** Filter by the object’s `jellyfinFolderByJellyfinFolderId` relation. */
  jellyfinFolderByJellyfinFolderId?: InputMaybe<JellyfinFolderFilter>;
  /** Filter by the object’s `jellyfinFolderId` field. */
  jellyfinFolderId?: InputMaybe<IntFilter>;
  /** Filter by the object’s `jellyfinId` field. */
  jellyfinId?: InputMaybe<StringFilter>;
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
  /** Filter by the object’s `tags` field. */
  tags?: InputMaybe<StringListFilter>;
  /** Filter by the object’s `title` field. */
  title?: InputMaybe<StringFilter>;
  /** Filter by the object’s `tvdbId` field. */
  tvdbId?: InputMaybe<StringFilter>;
  /** Filter by the object’s `tvdbSeason` field. */
  tvdbSeason?: InputMaybe<IntFilter>;
  /** Filter by the object’s `weekday` field. */
  weekday?: InputMaybe<IntFilter>;
  /** Filter by the object’s `yearAndSemester` field. */
  yearAndSemester?: InputMaybe<StringFilter>;
};

export type SeasonImages = {
  __typename?: 'SeasonImages';
  bannerURL?: Maybe<Scalars['String']>;
  fanartURL?: Maybe<Scalars['String']>;
  posterURL?: Maybe<Scalars['String']>;
};

export type SeasonInfo = {
  __typename?: 'SeasonInfo';
  description?: Maybe<Scalars['String']>;
  genres: Array<Scalars['String']>;
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
  bangumiId?: InputMaybe<Scalars['String']>;
  bannerImageId?: InputMaybe<Scalars['Int']>;
  bilibiliMainlandId?: InputMaybe<Scalars['String']>;
  bilibiliThmId?: InputMaybe<Scalars['String']>;
  createdAt?: InputMaybe<Scalars['Datetime']>;
  description?: InputMaybe<Scalars['String']>;
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
  tags: Array<InputMaybe<Scalars['String']>>;
  title?: InputMaybe<Scalars['String']>;
  tvdbId?: InputMaybe<Scalars['String']>;
  /** null if unknown */
  tvdbSeason?: InputMaybe<Scalars['Int']>;
  /** 0 for monday, 6 for sunday, null if unknown, past 24:00 time counts as last day (like Monday 25:00) */
  weekday?: InputMaybe<Scalars['Int']>;
  /** like '202201' ~ '202204', or null if unknown */
  yearAndSemester?: InputMaybe<Scalars['String']>;
};

/** Represents an update to a `Season`. Fields that are set will be updated. */
export type SeasonPatch = {
  /** hh:mm air time, or null if unknown, hour can be up to 48, timezone always GMT+8 */
  airTime?: InputMaybe<Scalars['String']>;
  bangumiId?: InputMaybe<Scalars['String']>;
  bannerImageId?: InputMaybe<Scalars['Int']>;
  bilibiliMainlandId?: InputMaybe<Scalars['String']>;
  bilibiliThmId?: InputMaybe<Scalars['String']>;
  createdAt?: InputMaybe<Scalars['Datetime']>;
  description?: InputMaybe<Scalars['String']>;
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
  tags?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  title?: InputMaybe<Scalars['String']>;
  tvdbId?: InputMaybe<Scalars['String']>;
  /** null if unknown */
  tvdbSeason?: InputMaybe<Scalars['Int']>;
  /** 0 for monday, 6 for sunday, null if unknown, past 24:00 time counts as last day (like Monday 25:00) */
  weekday?: InputMaybe<Scalars['Int']>;
  /** like '202201' ~ '202204', or null if unknown */
  yearAndSemester?: InputMaybe<Scalars['String']>;
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
  DescriptionAsc = 'DESCRIPTION_ASC',
  DescriptionDesc = 'DESCRIPTION_DESC',
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
  EpisodesBySeasonIdMaxCreatedAtAsc = 'EPISODES_BY_SEASON_ID__MAX_CREATED_AT_ASC',
  EpisodesBySeasonIdMaxCreatedAtDesc = 'EPISODES_BY_SEASON_ID__MAX_CREATED_AT_DESC',
  EpisodesBySeasonIdMaxDescriptionAsc = 'EPISODES_BY_SEASON_ID__MAX_DESCRIPTION_ASC',
  EpisodesBySeasonIdMaxDescriptionDesc = 'EPISODES_BY_SEASON_ID__MAX_DESCRIPTION_DESC',
  EpisodesBySeasonIdMaxIdAsc = 'EPISODES_BY_SEASON_ID__MAX_ID_ASC',
  EpisodesBySeasonIdMaxIdDesc = 'EPISODES_BY_SEASON_ID__MAX_ID_DESC',
  EpisodesBySeasonIdMaxIndexAsc = 'EPISODES_BY_SEASON_ID__MAX_INDEX_ASC',
  EpisodesBySeasonIdMaxIndexDesc = 'EPISODES_BY_SEASON_ID__MAX_INDEX_DESC',
  EpisodesBySeasonIdMaxJellyfinEpisodeIdAsc = 'EPISODES_BY_SEASON_ID__MAX_JELLYFIN_EPISODE_ID_ASC',
  EpisodesBySeasonIdMaxJellyfinEpisodeIdDesc = 'EPISODES_BY_SEASON_ID__MAX_JELLYFIN_EPISODE_ID_DESC',
  EpisodesBySeasonIdMaxLastMissingNotifyTimeAsc = 'EPISODES_BY_SEASON_ID__MAX_LAST_MISSING_NOTIFY_TIME_ASC',
  EpisodesBySeasonIdMaxLastMissingNotifyTimeDesc = 'EPISODES_BY_SEASON_ID__MAX_LAST_MISSING_NOTIFY_TIME_DESC',
  EpisodesBySeasonIdMaxSeasonIdAsc = 'EPISODES_BY_SEASON_ID__MAX_SEASON_ID_ASC',
  EpisodesBySeasonIdMaxSeasonIdDesc = 'EPISODES_BY_SEASON_ID__MAX_SEASON_ID_DESC',
  EpisodesBySeasonIdMaxTitleAsc = 'EPISODES_BY_SEASON_ID__MAX_TITLE_ASC',
  EpisodesBySeasonIdMaxTitleDesc = 'EPISODES_BY_SEASON_ID__MAX_TITLE_DESC',
  EpisodesBySeasonIdMinAirTimeAsc = 'EPISODES_BY_SEASON_ID__MIN_AIR_TIME_ASC',
  EpisodesBySeasonIdMinAirTimeDesc = 'EPISODES_BY_SEASON_ID__MIN_AIR_TIME_DESC',
  EpisodesBySeasonIdMinCreatedAtAsc = 'EPISODES_BY_SEASON_ID__MIN_CREATED_AT_ASC',
  EpisodesBySeasonIdMinCreatedAtDesc = 'EPISODES_BY_SEASON_ID__MIN_CREATED_AT_DESC',
  EpisodesBySeasonIdMinDescriptionAsc = 'EPISODES_BY_SEASON_ID__MIN_DESCRIPTION_ASC',
  EpisodesBySeasonIdMinDescriptionDesc = 'EPISODES_BY_SEASON_ID__MIN_DESCRIPTION_DESC',
  EpisodesBySeasonIdMinIdAsc = 'EPISODES_BY_SEASON_ID__MIN_ID_ASC',
  EpisodesBySeasonIdMinIdDesc = 'EPISODES_BY_SEASON_ID__MIN_ID_DESC',
  EpisodesBySeasonIdMinIndexAsc = 'EPISODES_BY_SEASON_ID__MIN_INDEX_ASC',
  EpisodesBySeasonIdMinIndexDesc = 'EPISODES_BY_SEASON_ID__MIN_INDEX_DESC',
  EpisodesBySeasonIdMinJellyfinEpisodeIdAsc = 'EPISODES_BY_SEASON_ID__MIN_JELLYFIN_EPISODE_ID_ASC',
  EpisodesBySeasonIdMinJellyfinEpisodeIdDesc = 'EPISODES_BY_SEASON_ID__MIN_JELLYFIN_EPISODE_ID_DESC',
  EpisodesBySeasonIdMinLastMissingNotifyTimeAsc = 'EPISODES_BY_SEASON_ID__MIN_LAST_MISSING_NOTIFY_TIME_ASC',
  EpisodesBySeasonIdMinLastMissingNotifyTimeDesc = 'EPISODES_BY_SEASON_ID__MIN_LAST_MISSING_NOTIFY_TIME_DESC',
  EpisodesBySeasonIdMinSeasonIdAsc = 'EPISODES_BY_SEASON_ID__MIN_SEASON_ID_ASC',
  EpisodesBySeasonIdMinSeasonIdDesc = 'EPISODES_BY_SEASON_ID__MIN_SEASON_ID_DESC',
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
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  TagsAsc = 'TAGS_ASC',
  TagsDesc = 'TAGS_DESC',
  TitleAsc = 'TITLE_ASC',
  TitleDesc = 'TITLE_DESC',
  TvdbIdAsc = 'TVDB_ID_ASC',
  TvdbIdDesc = 'TVDB_ID_DESC',
  TvdbSeasonAsc = 'TVDB_SEASON_ASC',
  TvdbSeasonDesc = 'TVDB_SEASON_DESC',
  WeekdayAsc = 'WEEKDAY_ASC',
  WeekdayDesc = 'WEEKDAY_DESC',
  YearAndSemesterAsc = 'YEAR_AND_SEMESTER_ASC',
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

export type Torrent = Node & {
  __typename?: 'Torrent';
  createdAt: Scalars['Datetime'];
  episodeIndex?: Maybe<Scalars['Int']>;
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
  /** A globally unique identifier. Can be used in various places throughout the system to identify this single value. */
  nodeId: Scalars['ID'];
  organizationParts?: Maybe<Array<Maybe<Scalars['String']>>>;
  organizationRaw?: Maybe<Scalars['String']>;
  publishDate: Scalars['Datetime'];
  seasonTitleAliases?: Maybe<Array<Maybe<Scalars['String']>>>;
  seasonTitleRaw?: Maybe<Scalars['String']>;
  size: Scalars['BigInt'];
  sourcePlatform?: Maybe<TorrentPlatform>;
  sourceType?: Maybe<TorrentSourceType>;
  subtitleHasChs: Scalars['Boolean'];
  subtitleHasCht: Scalars['Boolean'];
  subtitleHasJp: Scalars['Boolean'];
  subtitleType?: Maybe<Scalars['String']>;
  title: Scalars['String'];
  /** Link used to download */
  torrentLink: Scalars['String'];
};

/** A condition to be used against `Torrent` object types. All fields are tested for equality and combined with a logical ‘and.’ */
export type TorrentCondition = {
  /** Checks for equality with the object’s `createdAt` field. */
  createdAt?: InputMaybe<Scalars['Datetime']>;
  /** Checks for equality with the object’s `episodeIndex` field. */
  episodeIndex?: InputMaybe<Scalars['Int']>;
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
  /** Checks for equality with the object’s `organizationParts` field. */
  organizationParts?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Checks for equality with the object’s `organizationRaw` field. */
  organizationRaw?: InputMaybe<Scalars['String']>;
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
  /** Filter by the object’s `createdAt` field. */
  createdAt?: InputMaybe<DatetimeFilter>;
  /** Filter by the object’s `episodeIndex` field. */
  episodeIndex?: InputMaybe<IntFilter>;
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
  /** Negates the expression. */
  not?: InputMaybe<TorrentFilter>;
  /** Checks for any expressions in this list. */
  or?: InputMaybe<Array<TorrentFilter>>;
  /** Filter by the object’s `organizationParts` field. */
  organizationParts?: InputMaybe<StringListFilter>;
  /** Filter by the object’s `organizationRaw` field. */
  organizationRaw?: InputMaybe<StringFilter>;
  /** Filter by the object’s `publishDate` field. */
  publishDate?: InputMaybe<DatetimeFilter>;
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
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
  EpisodeIndexAsc = 'EPISODE_INDEX_ASC',
  EpisodeIndexDesc = 'EPISODE_INDEX_DESC',
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
  Natural = 'NATURAL',
  OrganizationPartsAsc = 'ORGANIZATION_PARTS_ASC',
  OrganizationPartsDesc = 'ORGANIZATION_PARTS_DESC',
  OrganizationRawAsc = 'ORGANIZATION_RAW_ASC',
  OrganizationRawDesc = 'ORGANIZATION_RAW_DESC',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  PublishDateAsc = 'PUBLISH_DATE_ASC',
  PublishDateDesc = 'PUBLISH_DATE_DESC',
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

export type UpdateSeasonDownloadSourcesInput = {
  seasonId: Scalars['Int'];
  sources: Array<DownloadSourcesInput>;
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

export type GetEpisodeByIdQueryVariables = Exact<{
  episodeByIdId: Scalars['Int'];
}>;


export type GetEpisodeByIdQuery = { __typename?: 'Query', episodeById?: { __typename?: 'Episode', airTime?: any | null, createdAt: any, description: string, id: number, index: number, jellyfinEpisodeId?: string | null, title: string, downloadJobsByEpisodeId: { __typename?: 'DownloadJobsConnection', edges: Array<{ __typename?: 'DownloadJobsEdge', node?: { __typename?: 'DownloadJob', createdAt: any, downloadPath?: string | null, failedAt?: any | null, failedReason: string, filePath?: string | null, id: number, importPath?: string | null, isFailed: boolean, nfoPath?: string | null, qbtTorrentHash?: string | null, qbtLastSync?: any | null, status: DownloadStatus, torrentLink?: string | null, jellyfinEpisodeId?: string | null } | null }> }, seasonBySeasonId?: { __typename?: 'Season', id: number, title: string } | null } | null };

export type RetryJobStepMutationVariables = Exact<{
  jobId: Scalars['Int'];
}>;


export type RetryJobStepMutation = { __typename?: 'Mutation', retryJobStep: string };

export type SearchTorrentQueryVariables = Exact<{
  keyword: Scalars['String'];
  first: Scalars['Int'];
}>;


export type SearchTorrentQuery = { __typename?: 'Query', allTorrents?: { __typename?: 'TorrentsConnection', edges: Array<{ __typename?: 'TorrentsEdge', node?: { __typename?: 'Torrent', id: number, publishDate: any, size: any, title: string, torrentLink: string, episodeIndex?: number | null } | null }> } | null };

export type DownloadJobStatusFieldsFragment = { __typename?: 'DownloadJob', status: DownloadStatus, isFailed: boolean };

export type EpisodeStatusFieldsFragment = { __typename?: 'Episode', airTime?: any | null, jobs: { __typename?: 'DownloadJobsConnection', edges: Array<{ __typename?: 'DownloadJobsEdge', node?: { __typename?: 'DownloadJob', status: DownloadStatus, isFailed: boolean } | null }> } };

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

export type ListDownloadJobsFieldsFragment = { __typename?: 'DownloadJob', id: number, status: DownloadStatus, isFailed: boolean, jellyfinEpisodeId?: string | null, createdAt: any, failedReason: string, episodeByEpisodeId?: { __typename?: 'Episode', id: number, airTime?: any | null, title: string, index: number, seasonBySeasonId?: { __typename?: 'Season', id: number, title: string } | null } | null };

export type ListDownloadJobsQueryVariables = Exact<{
  offset?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  filter?: InputMaybe<DownloadJobFilter>;
}>;


export type ListDownloadJobsQuery = { __typename?: 'Query', allDownloadJobs?: { __typename?: 'DownloadJobsConnection', totalCount: number, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean }, edges: Array<{ __typename?: 'DownloadJobsEdge', cursor?: any | null, node?: { __typename?: 'DownloadJob', id: number, status: DownloadStatus, isFailed: boolean, jellyfinEpisodeId?: string | null, createdAt: any, failedReason: string, episodeByEpisodeId?: { __typename?: 'Episode', id: number, airTime?: any | null, title: string, index: number, seasonBySeasonId?: { __typename?: 'Season', id: number, title: string } | null } | null } | null }> } | null };

export type DisplayImageFieldsFragment = { __typename?: 'Image', id: number, downloadPath?: string | null };

export type SeasonEpisodesFragment = { __typename?: 'Season', episodesLastSync?: any | null, episodesBySeasonId: { __typename?: 'EpisodesConnection', edges: Array<{ __typename?: 'EpisodesEdge', node?: { __typename?: 'Episode', airTime?: any | null, id: number, index: number, jellyfinEpisodeId?: string | null, title: string, jobs: { __typename?: 'DownloadJobsConnection', edges: Array<{ __typename?: 'DownloadJobsEdge', node?: { __typename?: 'DownloadJob', status: DownloadStatus, isFailed: boolean } | null }> } } | null }> } };

export type SeasonConfigFieldsFragment = { __typename?: 'Season', id: number, infoSource: MetadataSource, isMonitoring: boolean, mikanAnimeId: string, tags: Array<string | null>, title: string, tvdbId: string, tvdbSeason?: number | null, weekday?: number | null, yearAndSemester: string, airTime: string, bangumiId: string, bilibiliMainlandId: string, bilibiliThmId: string, createdAt: any, description: string, episodesSource: MetadataSource, needDownloadCc: boolean, notifyMissing: boolean, notifyPublish: boolean, episodesAutoSync: boolean, downloadSourcesBySeasonId: { __typename?: 'DownloadSourcesConnection', edges: Array<{ __typename?: 'DownloadSourcesEdge', node?: { __typename?: 'DownloadSource', id: number, pattern: string, offset: number } | null }> }, poster?: { __typename?: 'Image', id: number, downloadPath?: string | null } | null, banner?: { __typename?: 'Image', id: number, downloadPath?: string | null } | null, fanart?: { __typename?: 'Image', id: number, downloadPath?: string | null } | null, jellyfinFolder?: { __typename?: 'JellyfinFolder', name: string, location: string } | null };

export type GetSeasonByIdQueryVariables = Exact<{
  id: Scalars['Int'];
  withConfig?: Scalars['Boolean'];
  withEpisodes?: Scalars['Boolean'];
}>;


export type GetSeasonByIdQuery = { __typename: 'Query', seasonById?: { __typename?: 'Season', id: number, infoSource: MetadataSource, isMonitoring: boolean, mikanAnimeId: string, tags: Array<string | null>, title: string, tvdbId: string, tvdbSeason?: number | null, weekday?: number | null, yearAndSemester: string, airTime: string, bangumiId: string, bilibiliMainlandId: string, bilibiliThmId: string, createdAt: any, description: string, episodesSource: MetadataSource, needDownloadCc: boolean, notifyMissing: boolean, notifyPublish: boolean, episodesAutoSync: boolean, episodesLastSync?: any | null, downloadSourcesBySeasonId: { __typename?: 'DownloadSourcesConnection', edges: Array<{ __typename?: 'DownloadSourcesEdge', node?: { __typename?: 'DownloadSource', id: number, pattern: string, offset: number } | null }> }, poster?: { __typename?: 'Image', id: number, downloadPath?: string | null } | null, banner?: { __typename?: 'Image', id: number, downloadPath?: string | null } | null, fanart?: { __typename?: 'Image', id: number, downloadPath?: string | null } | null, jellyfinFolder?: { __typename?: 'JellyfinFolder', name: string, location: string } | null, episodesBySeasonId: { __typename?: 'EpisodesConnection', edges: Array<{ __typename?: 'EpisodesEdge', node?: { __typename?: 'Episode', airTime?: any | null, id: number, index: number, jellyfinEpisodeId?: string | null, title: string, jobs: { __typename?: 'DownloadJobsConnection', edges: Array<{ __typename?: 'DownloadJobsEdge', node?: { __typename?: 'DownloadJob', status: DownloadStatus, isFailed: boolean } | null }> } } | null }> } } | null };

export type UpdateSeasonByIdMutationVariables = Exact<{
  id: Scalars['Int'];
  seasonPatch: SeasonPatch;
}>;


export type UpdateSeasonByIdMutation = { __typename?: 'Mutation', updateSeasonById?: { __typename: 'UpdateSeasonPayload' } | null };

export type GetSeasonByTitleQueryVariables = Exact<{
  title: Scalars['String'];
}>;


export type GetSeasonByTitleQuery = { __typename?: 'Query', seasonByTitle?: { __typename?: 'Season', id: number } | null };

export type UpdateSeasonDownloadSourcesMutationVariables = Exact<{
  input: UpdateSeasonDownloadSourcesInput;
}>;


export type UpdateSeasonDownloadSourcesMutation = { __typename?: 'Mutation', updateSeasonDownloadSources: string };

export type GetDownloadSourceByPatternQueryVariables = Exact<{
  pattern: Scalars['String'];
}>;


export type GetDownloadSourceByPatternQuery = { __typename?: 'Query', downloadSourceByPattern?: { __typename?: 'DownloadSource', id: number } | null };

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

export type ListSeasonsFieldsFragment = { __typename?: 'Season', bangumiId: string, airTime: string, weekday?: number | null, mikanAnimeId: string, isMonitoring: boolean, title: string, id: number, yearAndSemester: string, tvdbId: string, tvdbSeason?: number | null, bilibiliThmId: string, bilibiliMainlandId: string, jellyfinId: string, jellyfinFolderByJellyfinFolderId?: { __typename?: 'JellyfinFolder', name: string } | null, allEpisodes: { __typename?: 'EpisodesConnection', totalCount: number }, airedEpisodes: { __typename?: 'EpisodesConnection', totalCount: number }, availableEpisodes: { __typename?: 'EpisodesConnection', totalCount: number }, firstEpisode: { __typename?: 'EpisodesConnection', edges: Array<{ __typename?: 'EpisodesEdge', node?: { __typename?: 'Episode', airTime?: any | null } | null }> }, nextEpisode: { __typename?: 'EpisodesConnection', edges: Array<{ __typename?: 'EpisodesEdge', node?: { __typename?: 'Episode', airTime?: any | null } | null }> }, latestEpisode: { __typename?: 'EpisodesConnection', edges: Array<{ __typename?: 'EpisodesEdge', node?: { __typename?: 'Episode', airTime?: any | null, jobs: { __typename?: 'DownloadJobsConnection', edges: Array<{ __typename?: 'DownloadJobsEdge', node?: { __typename?: 'DownloadJob', status: DownloadStatus, isFailed: boolean } | null }> } } | null }> } };

export type ListSeasonsQueryVariables = Exact<{
  offset?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<SeasonsOrderBy> | SeasonsOrderBy>;
  filter?: InputMaybe<SeasonFilter>;
  now: Scalars['Datetime'];
}>;


export type ListSeasonsQuery = { __typename?: 'Query', allSeasons?: { __typename?: 'SeasonsConnection', totalCount: number, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean }, edges: Array<{ __typename?: 'SeasonsEdge', cursor?: any | null, node?: { __typename?: 'Season', bangumiId: string, airTime: string, weekday?: number | null, mikanAnimeId: string, isMonitoring: boolean, title: string, id: number, yearAndSemester: string, tvdbId: string, tvdbSeason?: number | null, bilibiliThmId: string, bilibiliMainlandId: string, jellyfinId: string, jellyfinFolderByJellyfinFolderId?: { __typename?: 'JellyfinFolder', name: string } | null, allEpisodes: { __typename?: 'EpisodesConnection', totalCount: number }, airedEpisodes: { __typename?: 'EpisodesConnection', totalCount: number }, availableEpisodes: { __typename?: 'EpisodesConnection', totalCount: number }, firstEpisode: { __typename?: 'EpisodesConnection', edges: Array<{ __typename?: 'EpisodesEdge', node?: { __typename?: 'Episode', airTime?: any | null } | null }> }, nextEpisode: { __typename?: 'EpisodesConnection', edges: Array<{ __typename?: 'EpisodesEdge', node?: { __typename?: 'Episode', airTime?: any | null } | null }> }, latestEpisode: { __typename?: 'EpisodesConnection', edges: Array<{ __typename?: 'EpisodesEdge', node?: { __typename?: 'Episode', airTime?: any | null, jobs: { __typename?: 'DownloadJobsConnection', edges: Array<{ __typename?: 'DownloadJobsEdge', node?: { __typename?: 'DownloadJob', status: DownloadStatus, isFailed: boolean } | null }> } } | null }> } } | null }> } | null };

export type CreateSeasonMutationVariables = Exact<{
  season: SeasonInput;
}>;


export type CreateSeasonMutation = { __typename?: 'Mutation', createSeason?: { __typename?: 'CreateSeasonPayload', season?: { __typename?: 'Season', id: number } | null } | null };

export type SearchBangumiQueryVariables = Exact<{
  keywords: Scalars['String'];
}>;


export type SearchBangumiQuery = { __typename?: 'Query', searchBangumi: Array<{ __typename?: 'SearchBangumiSeason', added: boolean, airDate?: string | null, id: string, image?: string | null, name: string }> };

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

export type TorrentFieldsFragment = { __typename?: 'Torrent', id: number, publishDate: any, size: any, title: string, torrentLink: string, episodeIndex?: number | null };

export type TorrentParseFieldsFragment = { __typename?: 'Torrent', index?: number | null, indexFrom?: number | null, indexTo?: number | null, organizationParts?: Array<string | null> | null, seasonTitleAliases?: Array<string | null> | null, subtitleHasChs: boolean, subtitleHasCht: boolean, subtitleHasJp: boolean, subtitleType?: string | null };

export type ListTorrentsQueryVariables = Exact<{
  offset?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<TorrentsOrderBy> | TorrentsOrderBy>;
  filter?: InputMaybe<TorrentFilter>;
}>;


export type ListTorrentsQuery = { __typename?: 'Query', allTorrents?: { __typename?: 'TorrentsConnection', totalCount: number, edges: Array<{ __typename?: 'TorrentsEdge', cursor?: any | null, node?: { __typename?: 'Torrent', id: number, publishDate: any, size: any, title: string, torrentLink: string, episodeIndex?: number | null, index?: number | null, indexFrom?: number | null, indexTo?: number | null, organizationParts?: Array<string | null> | null, seasonTitleAliases?: Array<string | null> | null, subtitleHasChs: boolean, subtitleHasCht: boolean, subtitleHasJp: boolean, subtitleType?: string | null } | null }>, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean } } | null };

export type SyncMikanHistoryMutationVariables = Exact<{ [key: string]: never; }>;


export type SyncMikanHistoryMutation = { __typename?: 'Mutation', syncMikanHistory: number };

export type GetConfigQueryVariables = Exact<{ [key: string]: never; }>;


export type GetConfigQuery = { __typename?: 'Query', config: { __typename?: 'AdminConfig', jellyfin?: { __typename?: 'JellyfinConfig', publicHost: string } | null } };

export const Folders_ListFoldersFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"folders_listFoldersFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"JellyfinFolder"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"jellyfinId"}},{"kind":"Field","name":{"kind":"Name","value":"location"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"isDefault"}},{"kind":"Field","name":{"kind":"Name","value":"isHidden"}},{"kind":"Field","name":{"kind":"Name","value":"mappedLocation"}}]}}]} as unknown as DocumentNode<Folders_ListFoldersFieldsFragment, unknown>;
export const ListDownloadJobsFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"listDownloadJobsFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"DownloadJob"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"isFailed"}},{"kind":"Field","name":{"kind":"Name","value":"jellyfinEpisodeId"}},{"kind":"Field","name":{"kind":"Name","value":"episodeByEpisodeId"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"airTime"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"index"}},{"kind":"Field","name":{"kind":"Name","value":"seasonBySeasonId"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"failedReason"}}]}}]} as unknown as DocumentNode<ListDownloadJobsFieldsFragment, unknown>;
export const DownloadJobStatusFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"downloadJobStatusFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"DownloadJob"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"isFailed"}}]}}]} as unknown as DocumentNode<DownloadJobStatusFieldsFragment, unknown>;
export const EpisodeStatusFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"episodeStatusFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Episode"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"airTime"}},{"kind":"Field","alias":{"kind":"Name","value":"jobs"},"name":{"kind":"Name","value":"downloadJobsByEpisodeId"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"1"}},{"kind":"Argument","name":{"kind":"Name","value":"orderBy"},"value":{"kind":"EnumValue","value":"ID_DESC"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"downloadJobStatusFields"}}]}}]}}]}}]}},...DownloadJobStatusFieldsFragmentDoc.definitions]} as unknown as DocumentNode<EpisodeStatusFieldsFragment, unknown>;
export const SeasonEpisodesFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"seasonEpisodes"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Season"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"episodesLastSync"}},{"kind":"Field","name":{"kind":"Name","value":"episodesBySeasonId"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orderBy"},"value":{"kind":"EnumValue","value":"INDEX_ASC"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"airTime"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"index"}},{"kind":"Field","name":{"kind":"Name","value":"jellyfinEpisodeId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"episodeStatusFields"}}]}}]}}]}}]}},...EpisodeStatusFieldsFragmentDoc.definitions]} as unknown as DocumentNode<SeasonEpisodesFragment, unknown>;
export const DisplayImageFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"displayImageFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Image"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"downloadPath"}}]}}]} as unknown as DocumentNode<DisplayImageFieldsFragment, unknown>;
export const SeasonConfigFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"seasonConfigFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Season"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"infoSource"}},{"kind":"Field","name":{"kind":"Name","value":"isMonitoring"}},{"kind":"Field","name":{"kind":"Name","value":"mikanAnimeId"}},{"kind":"Field","name":{"kind":"Name","value":"tags"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"tvdbId"}},{"kind":"Field","name":{"kind":"Name","value":"tvdbSeason"}},{"kind":"Field","name":{"kind":"Name","value":"weekday"}},{"kind":"Field","name":{"kind":"Name","value":"yearAndSemester"}},{"kind":"Field","name":{"kind":"Name","value":"airTime"}},{"kind":"Field","name":{"kind":"Name","value":"bangumiId"}},{"kind":"Field","name":{"kind":"Name","value":"bilibiliMainlandId"}},{"kind":"Field","name":{"kind":"Name","value":"bilibiliThmId"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"episodesSource"}},{"kind":"Field","name":{"kind":"Name","value":"downloadSourcesBySeasonId"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"pattern"}},{"kind":"Field","name":{"kind":"Name","value":"offset"}}]}}]}}]}},{"kind":"Field","alias":{"kind":"Name","value":"poster"},"name":{"kind":"Name","value":"imageByPosterImageId"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"displayImageFields"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"banner"},"name":{"kind":"Name","value":"imageByBannerImageId"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"displayImageFields"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"fanart"},"name":{"kind":"Name","value":"imageByFanartImageId"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"displayImageFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"needDownloadCc"}},{"kind":"Field","alias":{"kind":"Name","value":"jellyfinFolder"},"name":{"kind":"Name","value":"jellyfinFolderByJellyfinFolderId"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"location"}}]}},{"kind":"Field","name":{"kind":"Name","value":"notifyMissing"}},{"kind":"Field","name":{"kind":"Name","value":"notifyPublish"}},{"kind":"Field","name":{"kind":"Name","value":"episodesAutoSync"}}]}},...DisplayImageFieldsFragmentDoc.definitions]} as unknown as DocumentNode<SeasonConfigFieldsFragment, unknown>;
export const ListSeasonsFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"listSeasonsFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Season"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"bangumiId"}},{"kind":"Field","name":{"kind":"Name","value":"airTime"}},{"kind":"Field","name":{"kind":"Name","value":"weekday"}},{"kind":"Field","name":{"kind":"Name","value":"mikanAnimeId"}},{"kind":"Field","name":{"kind":"Name","value":"isMonitoring"}},{"kind":"Field","name":{"kind":"Name","value":"jellyfinFolderByJellyfinFolderId"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"yearAndSemester"}},{"kind":"Field","name":{"kind":"Name","value":"tvdbId"}},{"kind":"Field","name":{"kind":"Name","value":"tvdbSeason"}},{"kind":"Field","name":{"kind":"Name","value":"bilibiliThmId"}},{"kind":"Field","name":{"kind":"Name","value":"bilibiliMainlandId"}},{"kind":"Field","name":{"kind":"Name","value":"jellyfinId"}},{"kind":"Field","alias":{"kind":"Name","value":"allEpisodes"},"name":{"kind":"Name","value":"episodesBySeasonId"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"airedEpisodes"},"name":{"kind":"Name","value":"episodesBySeasonId"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"airTime"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"lessThanOrEqualTo"},"value":{"kind":"Variable","name":{"kind":"Name","value":"now"}}}]}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"availableEpisodes"},"name":{"kind":"Name","value":"episodesBySeasonId"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"jellyfinEpisodeId"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"isNull"},"value":{"kind":"BooleanValue","value":false}}]}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"firstEpisode"},"name":{"kind":"Name","value":"episodesBySeasonId"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"1"}},{"kind":"Argument","name":{"kind":"Name","value":"orderBy"},"value":{"kind":"EnumValue","value":"INDEX_ASC"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"airTime"}}]}}]}}]}},{"kind":"Field","alias":{"kind":"Name","value":"nextEpisode"},"name":{"kind":"Name","value":"episodesBySeasonId"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"1"}},{"kind":"Argument","name":{"kind":"Name","value":"orderBy"},"value":{"kind":"EnumValue","value":"INDEX_ASC"}},{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"airTime"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"greaterThanOrEqualTo"},"value":{"kind":"Variable","name":{"kind":"Name","value":"now"}}}]}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"airTime"}}]}}]}}]}},{"kind":"Field","alias":{"kind":"Name","value":"latestEpisode"},"name":{"kind":"Name","value":"episodesBySeasonId"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"1"}},{"kind":"Argument","name":{"kind":"Name","value":"orderBy"},"value":{"kind":"EnumValue","value":"INDEX_DESC"}},{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"airTime"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"lessThanOrEqualTo"},"value":{"kind":"Variable","name":{"kind":"Name","value":"now"}}}]}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"episodeStatusFields"}}]}}]}}]}}]}},...EpisodeStatusFieldsFragmentDoc.definitions]} as unknown as DocumentNode<ListSeasonsFieldsFragment, unknown>;
export const JellyfinFolderFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"jellyfinFolderFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"JellyfinFolder"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"location"}},{"kind":"Field","name":{"kind":"Name","value":"isHidden"}},{"kind":"Field","name":{"kind":"Name","value":"isDefault"}}]}}]} as unknown as DocumentNode<JellyfinFolderFieldsFragment, unknown>;
export const TorrentFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"torrentFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Torrent"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"publishDate"}},{"kind":"Field","name":{"kind":"Name","value":"size"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"torrentLink"}},{"kind":"Field","name":{"kind":"Name","value":"episodeIndex"}}]}}]} as unknown as DocumentNode<TorrentFieldsFragment, unknown>;
export const TorrentParseFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"torrentParseFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Torrent"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"index"}},{"kind":"Field","name":{"kind":"Name","value":"indexFrom"}},{"kind":"Field","name":{"kind":"Name","value":"indexTo"}},{"kind":"Field","name":{"kind":"Name","value":"organizationParts"}},{"kind":"Field","name":{"kind":"Name","value":"seasonTitleAliases"}},{"kind":"Field","name":{"kind":"Name","value":"subtitleHasChs"}},{"kind":"Field","name":{"kind":"Name","value":"subtitleHasCht"}},{"kind":"Field","name":{"kind":"Name","value":"subtitleHasJp"}},{"kind":"Field","name":{"kind":"Name","value":"subtitleType"}}]}}]} as unknown as DocumentNode<TorrentParseFieldsFragment, unknown>;
export const GetEpisodeByIdDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetEpisodeById"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"episodeByIdId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"episodeById"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"episodeByIdId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"airTime"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"downloadJobsByEpisodeId"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orderBy"},"value":{"kind":"EnumValue","value":"ID_DESC"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"downloadPath"}},{"kind":"Field","name":{"kind":"Name","value":"failedAt"}},{"kind":"Field","name":{"kind":"Name","value":"failedReason"}},{"kind":"Field","name":{"kind":"Name","value":"filePath"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"importPath"}},{"kind":"Field","name":{"kind":"Name","value":"isFailed"}},{"kind":"Field","name":{"kind":"Name","value":"nfoPath"}},{"kind":"Field","name":{"kind":"Name","value":"qbtTorrentHash"}},{"kind":"Field","name":{"kind":"Name","value":"qbtLastSync"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"torrentLink"}},{"kind":"Field","name":{"kind":"Name","value":"jellyfinEpisodeId"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"index"}},{"kind":"Field","name":{"kind":"Name","value":"jellyfinEpisodeId"}},{"kind":"Field","name":{"kind":"Name","value":"seasonBySeasonId"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}}]}},{"kind":"Field","name":{"kind":"Name","value":"title"}}]}}]}}]} as unknown as DocumentNode<GetEpisodeByIdQuery, GetEpisodeByIdQueryVariables>;
export const RetryJobStepDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RetryJobStep"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"jobId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"retryJobStep"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"jobId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"jobId"}}}]}]}}]} as unknown as DocumentNode<RetryJobStepMutation, RetryJobStepMutationVariables>;
export const SearchTorrentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SearchTorrent"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"keyword"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"allTorrents"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"title"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"includesInsensitive"},"value":{"kind":"Variable","name":{"kind":"Name","value":"keyword"}}}]}}]}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"orderBy"},"value":{"kind":"EnumValue","value":"PUBLISH_DATE_DESC"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"torrentFields"}}]}}]}}]}}]}},...TorrentFieldsFragmentDoc.definitions]} as unknown as DocumentNode<SearchTorrentQuery, SearchTorrentQueryVariables>;
export const Folders_ListFoldersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Folders_ListFolders"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"offset"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orderBy"}},"type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"JellyfinFoldersOrderBy"}}}},"defaultValue":{"kind":"ListValue","values":[]}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"JellyfinFolderFilter"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":{"kind":"Name","value":"data"},"name":{"kind":"Name","value":"allJellyfinFolders"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"offset"},"value":{"kind":"Variable","name":{"kind":"Name","value":"offset"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"orderBy"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orderBy"}}},{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filter"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"folders_listFoldersFields"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalCount"}}]}}]}},...Folders_ListFoldersFieldsFragmentDoc.definitions]} as unknown as DocumentNode<Folders_ListFoldersQuery, Folders_ListFoldersQueryVariables>;
export const Folders_UpdateFolderByIdDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Folders_UpdateFolderById"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"folderPatch"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"JellyfinFolderPatch"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateJellyfinFolderById"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"jellyfinFolderPatch"},"value":{"kind":"Variable","name":{"kind":"Name","value":"folderPatch"}}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}}]}}]}}]} as unknown as DocumentNode<Folders_UpdateFolderByIdMutation, Folders_UpdateFolderByIdMutationVariables>;
export const Folders_SetFolderDefaultDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Folders_SetFolderDefault"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"setJellyfinFolderDefault"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<Folders_SetFolderDefaultMutation, Folders_SetFolderDefaultMutationVariables>;
export const Folders_SyncJellyfinFoldersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Folders_SyncJellyfinFolders"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"syncJellyfinFolders"}}]}}]} as unknown as DocumentNode<Folders_SyncJellyfinFoldersMutation, Folders_SyncJellyfinFoldersMutationVariables>;
export const ListDownloadJobsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ListDownloadJobs"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"offset"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"DownloadJobFilter"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"allDownloadJobs"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"offset"},"value":{"kind":"Variable","name":{"kind":"Name","value":"offset"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filter"}}},{"kind":"Argument","name":{"kind":"Name","value":"orderBy"},"value":{"kind":"EnumValue","value":"ID_DESC"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"listDownloadJobsFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"cursor"}}]}}]}}]}},...ListDownloadJobsFieldsFragmentDoc.definitions]} as unknown as DocumentNode<ListDownloadJobsQuery, ListDownloadJobsQueryVariables>;
export const GetSeasonByIdDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetSeasonById"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"withConfig"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}},"defaultValue":{"kind":"BooleanValue","value":true}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"withEpisodes"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}},"defaultValue":{"kind":"BooleanValue","value":true}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"seasonById"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"seasonConfigFields"},"directives":[{"kind":"Directive","name":{"kind":"Name","value":"include"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"if"},"value":{"kind":"Variable","name":{"kind":"Name","value":"withConfig"}}}]}]},{"kind":"FragmentSpread","name":{"kind":"Name","value":"seasonEpisodes"},"directives":[{"kind":"Directive","name":{"kind":"Name","value":"include"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"if"},"value":{"kind":"Variable","name":{"kind":"Name","value":"withEpisodes"}}}]}]}]}}]}},...SeasonConfigFieldsFragmentDoc.definitions,...SeasonEpisodesFragmentDoc.definitions]} as unknown as DocumentNode<GetSeasonByIdQuery, GetSeasonByIdQueryVariables>;
export const UpdateSeasonByIdDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateSeasonById"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"seasonPatch"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SeasonPatch"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateSeasonById"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"seasonPatch"},"value":{"kind":"Variable","name":{"kind":"Name","value":"seasonPatch"}}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}}]}}]}}]} as unknown as DocumentNode<UpdateSeasonByIdMutation, UpdateSeasonByIdMutationVariables>;
export const GetSeasonByTitleDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetSeasonByTitle"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"title"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"seasonByTitle"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"title"},"value":{"kind":"Variable","name":{"kind":"Name","value":"title"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<GetSeasonByTitleQuery, GetSeasonByTitleQueryVariables>;
export const UpdateSeasonDownloadSourcesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateSeasonDownloadSources"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateSeasonDownloadSourcesInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateSeasonDownloadSources"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}]}]}}]} as unknown as DocumentNode<UpdateSeasonDownloadSourcesMutation, UpdateSeasonDownloadSourcesMutationVariables>;
export const GetDownloadSourceByPatternDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetDownloadSourceByPattern"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"pattern"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"downloadSourceByPattern"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"pattern"},"value":{"kind":"Variable","name":{"kind":"Name","value":"pattern"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<GetDownloadSourceByPatternQuery, GetDownloadSourceByPatternQueryVariables>;
export const SyncMetadataDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SyncMetadata"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"seasonId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"syncMetadata"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"seasonId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"seasonId"}}}]}]}}]} as unknown as DocumentNode<SyncMetadataMutation, SyncMetadataMutationVariables>;
export const SyncEpisodeDataDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SyncEpisodeData"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"seasonId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"syncEpisodeData"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"seasonId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"seasonId"}}}]}]}}]} as unknown as DocumentNode<SyncEpisodeDataMutation, SyncEpisodeDataMutationVariables>;
export const DownloadTorrentForEpisodeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DownloadTorrentForEpisode"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"episodeId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"torrentLink"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"downloadTorrentForEpisode"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"episodeId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"episodeId"}}},{"kind":"Argument","name":{"kind":"Name","value":"torrentLink"},"value":{"kind":"Variable","name":{"kind":"Name","value":"torrentLink"}}}]}]}}]} as unknown as DocumentNode<DownloadTorrentForEpisodeMutation, DownloadTorrentForEpisodeMutationVariables>;
export const AllJellyfinFoldersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AllJellyfinFolders"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"allJellyfinFolders"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"location"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]}}]} as unknown as DocumentNode<AllJellyfinFoldersQuery, AllJellyfinFoldersQueryVariables>;
export const SyncJellyfinSeriesIdDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SyncJellyfinSeriesId"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"seasonId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"syncJellyfinSeriesId"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"seasonId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"seasonId"}}}]}]}}]} as unknown as DocumentNode<SyncJellyfinSeriesIdMutation, SyncJellyfinSeriesIdMutationVariables>;
export const DownloadBilibiliCcDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DownloadBilibiliCC"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"episodeId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"downloadBilibiliCC"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"episodeId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"episodeId"}}}]}]}}]} as unknown as DocumentNode<DownloadBilibiliCcMutation, DownloadBilibiliCcMutationVariables>;
export const GetJellyfinIdByIdDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetJellyfinIdById"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"seasonById"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"jellyfinId"}}]}}]}}]} as unknown as DocumentNode<GetJellyfinIdByIdQuery, GetJellyfinIdByIdQueryVariables>;
export const ListSeasonsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ListSeasons"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"offset"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orderBy"}},"type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SeasonsOrderBy"}}}},"defaultValue":{"kind":"ListValue","values":[]}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"SeasonFilter"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"now"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Datetime"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"allSeasons"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"offset"},"value":{"kind":"Variable","name":{"kind":"Name","value":"offset"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"orderBy"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orderBy"}}},{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filter"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"listSeasonsFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"cursor"}}]}}]}}]}},...ListSeasonsFieldsFragmentDoc.definitions]} as unknown as DocumentNode<ListSeasonsQuery, ListSeasonsQueryVariables>;
export const CreateSeasonDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateSeason"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"season"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SeasonInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createSeason"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"season"},"value":{"kind":"Variable","name":{"kind":"Name","value":"season"}}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"season"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]}}]} as unknown as DocumentNode<CreateSeasonMutation, CreateSeasonMutationVariables>;
export const SearchBangumiDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SearchBangumi"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"keywords"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"searchBangumi"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"keywords"},"value":{"kind":"Variable","name":{"kind":"Name","value":"keywords"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"added"}},{"kind":"Field","name":{"kind":"Name","value":"airDate"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"image"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<SearchBangumiQuery, SearchBangumiQueryVariables>;
export const GetMetadataPageOptionsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetMetadataPageOptions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getAvailableSemesters"}},{"kind":"Field","name":{"kind":"Name","value":"allJellyfinFolders"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"jellyfinFolderFields"}}]}}]}}]}}]}},...JellyfinFolderFieldsFragmentDoc.definitions]} as unknown as DocumentNode<GetMetadataPageOptionsQuery, GetMetadataPageOptionsQueryVariables>;
export const DeleteSeasonByIdDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteSeasonById"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteSeasonById"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeleteSeasonByIdMutation, DeleteSeasonByIdMutationVariables>;
export const ListJellyfinFoldersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ListJellyfinFolders"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"allJellyfinFolders"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"jellyfinFolderFields"}}]}}]}}]}}]}},...JellyfinFolderFieldsFragmentDoc.definitions]} as unknown as DocumentNode<ListJellyfinFoldersQuery, ListJellyfinFoldersQueryVariables>;
export const WriteSeasonMetadataDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"WriteSeasonMetadata"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"writeMetadata"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"seasonId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<WriteSeasonMetadataMutation, WriteSeasonMetadataMutationVariables>;
export const ListTorrentsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ListTorrents"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"offset"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orderBy"}},"type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"TorrentsOrderBy"}}}},"defaultValue":{"kind":"ListValue","values":[]}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"TorrentFilter"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"allTorrents"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"offset"},"value":{"kind":"Variable","name":{"kind":"Name","value":"offset"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"orderBy"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orderBy"}}},{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filter"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"torrentFields"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"torrentParseFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"cursor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalCount"}}]}}]}},...TorrentFieldsFragmentDoc.definitions,...TorrentParseFieldsFragmentDoc.definitions]} as unknown as DocumentNode<ListTorrentsQuery, ListTorrentsQueryVariables>;
export const SyncMikanHistoryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SyncMikanHistory"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"syncMikanHistory"}}]}}]} as unknown as DocumentNode<SyncMikanHistoryMutation, SyncMikanHistoryMutationVariables>;
export const GetConfigDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetConfig"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"config"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"jellyfin"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"publicHost"}}]}}]}}]}}]} as unknown as DocumentNode<GetConfigQuery, GetConfigQueryVariables>;
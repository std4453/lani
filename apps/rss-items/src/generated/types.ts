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
  /**
   * A signed eight-byte integer. The upper big integer values are greater than the
   * max value for a JavaScript number. Therefore all big integers will be output as
   * strings and not numbers.
   */
  BigInt: any;
  /** A location in a connection that can be used for resuming pagination. */
  Cursor: any;
  /**
   * A point in time as described by the [ISO
   * 8601](https://en.wikipedia.org/wiki/ISO_8601) standard. May or may not include a timezone.
   */
  Datetime: string;
  /** The `JSON` scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
  JSON: { [key: string]: any };
};

/** A connection to a list of `AnimeMetadatum` values. */
export type AnimeMetadataConnection = {
  __typename?: 'AnimeMetadataConnection';
  /** A list of edges which contains the `AnimeMetadatum` and cursor to aid in pagination. */
  edges: Array<AnimeMetadataEdge>;
  /** A list of `AnimeMetadatum` objects. */
  nodes: Array<Maybe<AnimeMetadatum>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** The count of *all* `AnimeMetadatum` you could get from the connection. */
  totalCount: Scalars['Int'];
};

/** A `AnimeMetadatum` edge in the connection. */
export type AnimeMetadataEdge = {
  __typename?: 'AnimeMetadataEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']>;
  /** The `AnimeMetadatum` at the end of the edge. */
  node?: Maybe<AnimeMetadatum>;
};

/** Methods to use when ordering `AnimeMetadatum`. */
export enum AnimeMetadataOrderBy {
  BangumiIdAsc = 'BANGUMI_ID_ASC',
  BangumiIdDesc = 'BANGUMI_ID_DESC',
  BilibiliMainlandSsidAsc = 'BILIBILI_MAINLAND_SSID_ASC',
  BilibiliMainlandSsidDesc = 'BILIBILI_MAINLAND_SSID_DESC',
  BilibiliThmSsidAsc = 'BILIBILI_THM_SSID_ASC',
  BilibiliThmSsidDesc = 'BILIBILI_THM_SSID_DESC',
  DownloadCcAsc = 'DOWNLOAD_CC_ASC',
  DownloadCcDesc = 'DOWNLOAD_CC_DESC',
  DownloadCcLanguageAsc = 'DOWNLOAD_CC_LANGUAGE_ASC',
  DownloadCcLanguageDesc = 'DOWNLOAD_CC_LANGUAGE_DESC',
  ForceScratchAsc = 'FORCE_SCRATCH_ASC',
  ForceScratchDesc = 'FORCE_SCRATCH_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  IsArchivedAsc = 'IS_ARCHIVED_ASC',
  IsArchivedDesc = 'IS_ARCHIVED_DESC',
  JellyfinSeasonIdAsc = 'JELLYFIN_SEASON_ID_ASC',
  JellyfinSeasonIdDesc = 'JELLYFIN_SEASON_ID_DESC',
  MikanAnimeIdAsc = 'MIKAN_ANIME_ID_ASC',
  MikanAnimeIdDesc = 'MIKAN_ANIME_ID_DESC',
  Natural = 'NATURAL',
  OverrideQbtAsc = 'OVERRIDE_QBT_ASC',
  OverrideQbtDesc = 'OVERRIDE_QBT_DESC',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  ScheduleAsc = 'SCHEDULE_ASC',
  ScheduleDesc = 'SCHEDULE_DESC',
  ScratchDisabledAsc = 'SCRATCH_DISABLED_ASC',
  ScratchDisabledDesc = 'SCRATCH_DISABLED_DESC',
  SeasonAsc = 'SEASON_ASC',
  SeasonDesc = 'SEASON_DESC',
  SonarrSeasonAsc = 'SONARR_SEASON_ASC',
  SonarrSeasonDesc = 'SONARR_SEASON_DESC',
  SonarrSeriesAsc = 'SONARR_SERIES_ASC',
  SonarrSeriesDesc = 'SONARR_SERIES_DESC',
  UniformNameAsc = 'UNIFORM_NAME_ASC',
  UniformNameDesc = 'UNIFORM_NAME_DESC',
  YearAsc = 'YEAR_ASC',
  YearDesc = 'YEAR_DESC'
}

export type AnimeMetadatum = Node & {
  __typename?: 'AnimeMetadatum';
  bangumiId: Scalars['String'];
  bilibiliMainlandSsid: Scalars['String'];
  bilibiliThmSsid: Scalars['String'];
  downloadCc: Scalars['Boolean'];
  downloadCcLanguage: Scalars['String'];
  /** Reads and enables pagination through a set of `DownloadConfig`. */
  downloadConfigsByAnime: DownloadConfigsConnection;
  forceScratch: Scalars['Boolean'];
  id: Scalars['Int'];
  isArchived: Scalars['Boolean'];
  jellyfinSeasonId: Scalars['String'];
  mikanAnimeId: Scalars['String'];
  /** A globally unique identifier. Can be used in various places throughout the system to identify this single value. */
  nodeId: Scalars['ID'];
  overrideQbt: Scalars['Boolean'];
  schedule?: Maybe<Scalars['JSON']>;
  scratchDisabled: Scalars['Boolean'];
  season?: Maybe<SeasonEnum>;
  /** sonarr seasonNumber, usually 1-based, 0 is used for OAD */
  sonarrSeason?: Maybe<Scalars['Int']>;
  sonarrSeries?: Maybe<Scalars['Int']>;
  /** Reads a single `SonarrSery` that is related to this `AnimeMetadatum`. */
  sonarrSeryBySonarrSeries?: Maybe<SonarrSery>;
  /** https://std-4453.feishu.cn/wiki/wikcnPbNZAT9OhTAJwp2WALnJld */
  uniformName: Scalars['String'];
  year?: Maybe<Scalars['Int']>;
};


export type AnimeMetadatumDownloadConfigsByAnimeArgs = {
  after?: InputMaybe<Scalars['Cursor']>;
  before?: InputMaybe<Scalars['Cursor']>;
  condition?: InputMaybe<DownloadConfigCondition>;
  filter?: InputMaybe<DownloadConfigFilter>;
  first?: InputMaybe<Scalars['Int']>;
  includeArchived?: InputMaybe<IncludeArchivedOption>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<DownloadConfigsOrderBy>>;
};

/**
 * A condition to be used against `AnimeMetadatum` object types. All fields are
 * tested for equality and combined with a logical ‘and.’
 */
export type AnimeMetadatumCondition = {
  /** Checks for equality with the object’s `bangumiId` field. */
  bangumiId?: InputMaybe<Scalars['String']>;
  /** Checks for equality with the object’s `bilibiliMainlandSsid` field. */
  bilibiliMainlandSsid?: InputMaybe<Scalars['String']>;
  /** Checks for equality with the object’s `bilibiliThmSsid` field. */
  bilibiliThmSsid?: InputMaybe<Scalars['String']>;
  /** Checks for equality with the object’s `downloadCc` field. */
  downloadCc?: InputMaybe<Scalars['Boolean']>;
  /** Checks for equality with the object’s `downloadCcLanguage` field. */
  downloadCcLanguage?: InputMaybe<Scalars['String']>;
  /** Checks for equality with the object’s `forceScratch` field. */
  forceScratch?: InputMaybe<Scalars['Boolean']>;
  /** Checks for equality with the object’s `id` field. */
  id?: InputMaybe<Scalars['Int']>;
  /** Checks for equality with the object’s `isArchived` field. */
  isArchived?: InputMaybe<Scalars['Boolean']>;
  /** Checks for equality with the object’s `jellyfinSeasonId` field. */
  jellyfinSeasonId?: InputMaybe<Scalars['String']>;
  /** Checks for equality with the object’s `mikanAnimeId` field. */
  mikanAnimeId?: InputMaybe<Scalars['String']>;
  /** Checks for equality with the object’s `overrideQbt` field. */
  overrideQbt?: InputMaybe<Scalars['Boolean']>;
  /** Checks for equality with the object’s `schedule` field. */
  schedule?: InputMaybe<Scalars['JSON']>;
  /** Checks for equality with the object’s `scratchDisabled` field. */
  scratchDisabled?: InputMaybe<Scalars['Boolean']>;
  /** Checks for equality with the object’s `season` field. */
  season?: InputMaybe<SeasonEnum>;
  /** Checks for equality with the object’s `sonarrSeason` field. */
  sonarrSeason?: InputMaybe<Scalars['Int']>;
  /** Checks for equality with the object’s `sonarrSeries` field. */
  sonarrSeries?: InputMaybe<Scalars['Int']>;
  /** Checks for equality with the object’s `uniformName` field. */
  uniformName?: InputMaybe<Scalars['String']>;
  /** Checks for equality with the object’s `year` field. */
  year?: InputMaybe<Scalars['Int']>;
};

/** A filter to be used against `AnimeMetadatum` object types. All fields are combined with a logical ‘and.’ */
export type AnimeMetadatumFilter = {
  /** Checks for all expressions in this list. */
  and?: InputMaybe<Array<AnimeMetadatumFilter>>;
  /** Filter by the object’s `bangumiId` field. */
  bangumiId?: InputMaybe<StringFilter>;
  /** Filter by the object’s `bilibiliMainlandSsid` field. */
  bilibiliMainlandSsid?: InputMaybe<StringFilter>;
  /** Filter by the object’s `bilibiliThmSsid` field. */
  bilibiliThmSsid?: InputMaybe<StringFilter>;
  /** Filter by the object’s `downloadCc` field. */
  downloadCc?: InputMaybe<BooleanFilter>;
  /** Filter by the object’s `downloadCcLanguage` field. */
  downloadCcLanguage?: InputMaybe<StringFilter>;
  /** Filter by the object’s `forceScratch` field. */
  forceScratch?: InputMaybe<BooleanFilter>;
  /** Filter by the object’s `id` field. */
  id?: InputMaybe<IntFilter>;
  /** Filter by the object’s `isArchived` field. */
  isArchived?: InputMaybe<BooleanFilter>;
  /** Filter by the object’s `jellyfinSeasonId` field. */
  jellyfinSeasonId?: InputMaybe<StringFilter>;
  /** Filter by the object’s `mikanAnimeId` field. */
  mikanAnimeId?: InputMaybe<StringFilter>;
  /** Negates the expression. */
  not?: InputMaybe<AnimeMetadatumFilter>;
  /** Checks for any expressions in this list. */
  or?: InputMaybe<Array<AnimeMetadatumFilter>>;
  /** Filter by the object’s `overrideQbt` field. */
  overrideQbt?: InputMaybe<BooleanFilter>;
  /** Filter by the object’s `scratchDisabled` field. */
  scratchDisabled?: InputMaybe<BooleanFilter>;
  /** Filter by the object’s `season` field. */
  season?: InputMaybe<SeasonEnumFilter>;
  /** Filter by the object’s `sonarrSeason` field. */
  sonarrSeason?: InputMaybe<IntFilter>;
  /** Filter by the object’s `sonarrSeries` field. */
  sonarrSeries?: InputMaybe<IntFilter>;
  /** Filter by the object’s `uniformName` field. */
  uniformName?: InputMaybe<StringFilter>;
  /** Filter by the object’s `year` field. */
  year?: InputMaybe<IntFilter>;
};

/** An input for mutations affecting `AnimeMetadatum` */
export type AnimeMetadatumInput = {
  bangumiId?: InputMaybe<Scalars['String']>;
  bilibiliMainlandSsid?: InputMaybe<Scalars['String']>;
  bilibiliThmSsid?: InputMaybe<Scalars['String']>;
  downloadCc?: InputMaybe<Scalars['Boolean']>;
  downloadCcLanguage?: InputMaybe<Scalars['String']>;
  forceScratch?: InputMaybe<Scalars['Boolean']>;
  id?: InputMaybe<Scalars['Int']>;
  isArchived?: InputMaybe<Scalars['Boolean']>;
  jellyfinSeasonId?: InputMaybe<Scalars['String']>;
  mikanAnimeId?: InputMaybe<Scalars['String']>;
  overrideQbt?: InputMaybe<Scalars['Boolean']>;
  schedule?: InputMaybe<Scalars['JSON']>;
  scratchDisabled?: InputMaybe<Scalars['Boolean']>;
  season?: InputMaybe<SeasonEnum>;
  /** sonarr seasonNumber, usually 1-based, 0 is used for OAD */
  sonarrSeason?: InputMaybe<Scalars['Int']>;
  sonarrSeries?: InputMaybe<Scalars['Int']>;
  /** https://std-4453.feishu.cn/wiki/wikcnPbNZAT9OhTAJwp2WALnJld */
  uniformName: Scalars['String'];
  year?: InputMaybe<Scalars['Int']>;
};

/** Represents an update to a `AnimeMetadatum`. Fields that are set will be updated. */
export type AnimeMetadatumPatch = {
  bangumiId?: InputMaybe<Scalars['String']>;
  bilibiliMainlandSsid?: InputMaybe<Scalars['String']>;
  bilibiliThmSsid?: InputMaybe<Scalars['String']>;
  downloadCc?: InputMaybe<Scalars['Boolean']>;
  downloadCcLanguage?: InputMaybe<Scalars['String']>;
  forceScratch?: InputMaybe<Scalars['Boolean']>;
  id?: InputMaybe<Scalars['Int']>;
  isArchived?: InputMaybe<Scalars['Boolean']>;
  jellyfinSeasonId?: InputMaybe<Scalars['String']>;
  mikanAnimeId?: InputMaybe<Scalars['String']>;
  overrideQbt?: InputMaybe<Scalars['Boolean']>;
  schedule?: InputMaybe<Scalars['JSON']>;
  scratchDisabled?: InputMaybe<Scalars['Boolean']>;
  season?: InputMaybe<SeasonEnum>;
  /** sonarr seasonNumber, usually 1-based, 0 is used for OAD */
  sonarrSeason?: InputMaybe<Scalars['Int']>;
  sonarrSeries?: InputMaybe<Scalars['Int']>;
  /** https://std-4453.feishu.cn/wiki/wikcnPbNZAT9OhTAJwp2WALnJld */
  uniformName?: InputMaybe<Scalars['String']>;
  year?: InputMaybe<Scalars['Int']>;
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

/** All input for the create `AnimeMetadatum` mutation. */
export type CreateAnimeMetadatumInput = {
  /** The `AnimeMetadatum` to be created by this mutation. */
  animeMetadatum: AnimeMetadatumInput;
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']>;
};

/** The output of our create `AnimeMetadatum` mutation. */
export type CreateAnimeMetadatumPayload = {
  __typename?: 'CreateAnimeMetadatumPayload';
  /** The `AnimeMetadatum` that was created by this mutation. */
  animeMetadatum?: Maybe<AnimeMetadatum>;
  /** An edge for our `AnimeMetadatum`. May be used by Relay 1. */
  animeMetadatumEdge?: Maybe<AnimeMetadataEdge>;
  /**
   * The exact same `clientMutationId` that was provided in the mutation input,
   * unchanged and unused. May be used by a client to track mutations.
   */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Our root query field type. Allows us to run any query from our mutation payload. */
  query?: Maybe<Query>;
  /** Reads a single `SonarrSery` that is related to this `AnimeMetadatum`. */
  sonarrSeryBySonarrSeries?: Maybe<SonarrSery>;
};


/** The output of our create `AnimeMetadatum` mutation. */
export type CreateAnimeMetadatumPayloadAnimeMetadatumEdgeArgs = {
  orderBy?: InputMaybe<Array<AnimeMetadataOrderBy>>;
};

/** All input for the create `DownloadConfig` mutation. */
export type CreateDownloadConfigInput = {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** The `DownloadConfig` to be created by this mutation. */
  downloadConfig: DownloadConfigInput;
};

/** The output of our create `DownloadConfig` mutation. */
export type CreateDownloadConfigPayload = {
  __typename?: 'CreateDownloadConfigPayload';
  /** Reads a single `AnimeMetadatum` that is related to this `DownloadConfig`. */
  animeMetadatumByAnime?: Maybe<AnimeMetadatum>;
  /**
   * The exact same `clientMutationId` that was provided in the mutation input,
   * unchanged and unused. May be used by a client to track mutations.
   */
  clientMutationId?: Maybe<Scalars['String']>;
  /** The `DownloadConfig` that was created by this mutation. */
  downloadConfig?: Maybe<DownloadConfig>;
  /** An edge for our `DownloadConfig`. May be used by Relay 1. */
  downloadConfigEdge?: Maybe<DownloadConfigsEdge>;
  /** Our root query field type. Allows us to run any query from our mutation payload. */
  query?: Maybe<Query>;
};


/** The output of our create `DownloadConfig` mutation. */
export type CreateDownloadConfigPayloadDownloadConfigEdgeArgs = {
  orderBy?: InputMaybe<Array<DownloadConfigsOrderBy>>;
};

/** All input for the create `RssItem` mutation. */
export type CreateRssItemInput = {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** The `RssItem` to be created by this mutation. */
  rssItem: RssItemInput;
};

/** The output of our create `RssItem` mutation. */
export type CreateRssItemPayload = {
  __typename?: 'CreateRssItemPayload';
  /**
   * The exact same `clientMutationId` that was provided in the mutation input,
   * unchanged and unused. May be used by a client to track mutations.
   */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Our root query field type. Allows us to run any query from our mutation payload. */
  query?: Maybe<Query>;
  /** The `RssItem` that was created by this mutation. */
  rssItem?: Maybe<RssItem>;
  /** An edge for our `RssItem`. May be used by Relay 1. */
  rssItemEdge?: Maybe<RssItemsEdge>;
};


/** The output of our create `RssItem` mutation. */
export type CreateRssItemPayloadRssItemEdgeArgs = {
  orderBy?: InputMaybe<Array<RssItemsOrderBy>>;
};

/** All input for the create `SonarrSery` mutation. */
export type CreateSonarrSeryInput = {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** The `SonarrSery` to be created by this mutation. */
  sonarrSery: SonarrSeryInput;
};

/** The output of our create `SonarrSery` mutation. */
export type CreateSonarrSeryPayload = {
  __typename?: 'CreateSonarrSeryPayload';
  /**
   * The exact same `clientMutationId` that was provided in the mutation input,
   * unchanged and unused. May be used by a client to track mutations.
   */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Our root query field type. Allows us to run any query from our mutation payload. */
  query?: Maybe<Query>;
  /** The `SonarrSery` that was created by this mutation. */
  sonarrSery?: Maybe<SonarrSery>;
  /** An edge for our `SonarrSery`. May be used by Relay 1. */
  sonarrSeryEdge?: Maybe<SonarrSeriesEdge>;
};


/** The output of our create `SonarrSery` mutation. */
export type CreateSonarrSeryPayloadSonarrSeryEdgeArgs = {
  orderBy?: InputMaybe<Array<SonarrSeriesOrderBy>>;
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

/** All input for the `deleteAnimeMetadatumById` mutation. */
export type DeleteAnimeMetadatumByIdInput = {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']>;
  id: Scalars['Int'];
};

/** All input for the `deleteAnimeMetadatum` mutation. */
export type DeleteAnimeMetadatumInput = {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** The globally unique `ID` which will identify a single `AnimeMetadatum` to be deleted. */
  nodeId: Scalars['ID'];
};

/** The output of our delete `AnimeMetadatum` mutation. */
export type DeleteAnimeMetadatumPayload = {
  __typename?: 'DeleteAnimeMetadatumPayload';
  /** The `AnimeMetadatum` that was deleted by this mutation. */
  animeMetadatum?: Maybe<AnimeMetadatum>;
  /** An edge for our `AnimeMetadatum`. May be used by Relay 1. */
  animeMetadatumEdge?: Maybe<AnimeMetadataEdge>;
  /**
   * The exact same `clientMutationId` that was provided in the mutation input,
   * unchanged and unused. May be used by a client to track mutations.
   */
  clientMutationId?: Maybe<Scalars['String']>;
  deletedAnimeMetadatumId?: Maybe<Scalars['ID']>;
  /** Our root query field type. Allows us to run any query from our mutation payload. */
  query?: Maybe<Query>;
  /** Reads a single `SonarrSery` that is related to this `AnimeMetadatum`. */
  sonarrSeryBySonarrSeries?: Maybe<SonarrSery>;
};


/** The output of our delete `AnimeMetadatum` mutation. */
export type DeleteAnimeMetadatumPayloadAnimeMetadatumEdgeArgs = {
  orderBy?: InputMaybe<Array<AnimeMetadataOrderBy>>;
};

/** All input for the `deleteDownloadConfigById` mutation. */
export type DeleteDownloadConfigByIdInput = {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']>;
  id: Scalars['Int'];
};

/** All input for the `deleteDownloadConfig` mutation. */
export type DeleteDownloadConfigInput = {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** The globally unique `ID` which will identify a single `DownloadConfig` to be deleted. */
  nodeId: Scalars['ID'];
};

/** The output of our delete `DownloadConfig` mutation. */
export type DeleteDownloadConfigPayload = {
  __typename?: 'DeleteDownloadConfigPayload';
  /** Reads a single `AnimeMetadatum` that is related to this `DownloadConfig`. */
  animeMetadatumByAnime?: Maybe<AnimeMetadatum>;
  /**
   * The exact same `clientMutationId` that was provided in the mutation input,
   * unchanged and unused. May be used by a client to track mutations.
   */
  clientMutationId?: Maybe<Scalars['String']>;
  deletedDownloadConfigId?: Maybe<Scalars['ID']>;
  /** The `DownloadConfig` that was deleted by this mutation. */
  downloadConfig?: Maybe<DownloadConfig>;
  /** An edge for our `DownloadConfig`. May be used by Relay 1. */
  downloadConfigEdge?: Maybe<DownloadConfigsEdge>;
  /** Our root query field type. Allows us to run any query from our mutation payload. */
  query?: Maybe<Query>;
};


/** The output of our delete `DownloadConfig` mutation. */
export type DeleteDownloadConfigPayloadDownloadConfigEdgeArgs = {
  orderBy?: InputMaybe<Array<DownloadConfigsOrderBy>>;
};

/** All input for the `deleteRssItemByHash` mutation. */
export type DeleteRssItemByHashInput = {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']>;
  hash: Scalars['String'];
};

/** All input for the `deleteRssItemById` mutation. */
export type DeleteRssItemByIdInput = {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']>;
  id: Scalars['Int'];
};

/** All input for the `deleteRssItem` mutation. */
export type DeleteRssItemInput = {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** The globally unique `ID` which will identify a single `RssItem` to be deleted. */
  nodeId: Scalars['ID'];
};

/** The output of our delete `RssItem` mutation. */
export type DeleteRssItemPayload = {
  __typename?: 'DeleteRssItemPayload';
  /**
   * The exact same `clientMutationId` that was provided in the mutation input,
   * unchanged and unused. May be used by a client to track mutations.
   */
  clientMutationId?: Maybe<Scalars['String']>;
  deletedRssItemId?: Maybe<Scalars['ID']>;
  /** Our root query field type. Allows us to run any query from our mutation payload. */
  query?: Maybe<Query>;
  /** The `RssItem` that was deleted by this mutation. */
  rssItem?: Maybe<RssItem>;
  /** An edge for our `RssItem`. May be used by Relay 1. */
  rssItemEdge?: Maybe<RssItemsEdge>;
};


/** The output of our delete `RssItem` mutation. */
export type DeleteRssItemPayloadRssItemEdgeArgs = {
  orderBy?: InputMaybe<Array<RssItemsOrderBy>>;
};

/** All input for the `deleteSonarrSeryById` mutation. */
export type DeleteSonarrSeryByIdInput = {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']>;
  id: Scalars['Int'];
};

/** All input for the `deleteSonarrSeryBySonarrId` mutation. */
export type DeleteSonarrSeryBySonarrIdInput = {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']>;
  sonarrId: Scalars['Int'];
};

/** All input for the `deleteSonarrSeryBySonarrSlug` mutation. */
export type DeleteSonarrSeryBySonarrSlugInput = {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']>;
  sonarrSlug: Scalars['String'];
};

/** All input for the `deleteSonarrSery` mutation. */
export type DeleteSonarrSeryInput = {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** The globally unique `ID` which will identify a single `SonarrSery` to be deleted. */
  nodeId: Scalars['ID'];
};

/** The output of our delete `SonarrSery` mutation. */
export type DeleteSonarrSeryPayload = {
  __typename?: 'DeleteSonarrSeryPayload';
  /**
   * The exact same `clientMutationId` that was provided in the mutation input,
   * unchanged and unused. May be used by a client to track mutations.
   */
  clientMutationId?: Maybe<Scalars['String']>;
  deletedSonarrSeryId?: Maybe<Scalars['ID']>;
  /** Our root query field type. Allows us to run any query from our mutation payload. */
  query?: Maybe<Query>;
  /** The `SonarrSery` that was deleted by this mutation. */
  sonarrSery?: Maybe<SonarrSery>;
  /** An edge for our `SonarrSery`. May be used by Relay 1. */
  sonarrSeryEdge?: Maybe<SonarrSeriesEdge>;
};


/** The output of our delete `SonarrSery` mutation. */
export type DeleteSonarrSeryPayloadSonarrSeryEdgeArgs = {
  orderBy?: InputMaybe<Array<SonarrSeriesOrderBy>>;
};

export type DownloadConfig = Node & {
  __typename?: 'DownloadConfig';
  anime: Scalars['Int'];
  /** Reads a single `AnimeMetadatum` that is related to this `DownloadConfig`. */
  animeMetadatumByAnime?: Maybe<AnimeMetadatum>;
  /** mikan anime bangumi ID */
  bangumiId: Scalars['String'];
  id: Scalars['Int'];
  isArchived: Scalars['Boolean'];
  language: Scalars['String'];
  /** A globally unique identifier. Can be used in various places throughout the system to identify this single value. */
  nodeId: Scalars['ID'];
  pattern: Scalars['String'];
  /** mikan anime publish group id */
  publishGroupId: Scalars['String'];
  quality: Scalars['Int'];
  type: Scalars['String'];
};

/**
 * A condition to be used against `DownloadConfig` object types. All fields are
 * tested for equality and combined with a logical ‘and.’
 */
export type DownloadConfigCondition = {
  /** Checks for equality with the object’s `anime` field. */
  anime?: InputMaybe<Scalars['Int']>;
  /** Checks for equality with the object’s `bangumiId` field. */
  bangumiId?: InputMaybe<Scalars['String']>;
  /** Checks for equality with the object’s `id` field. */
  id?: InputMaybe<Scalars['Int']>;
  /** Checks for equality with the object’s `isArchived` field. */
  isArchived?: InputMaybe<Scalars['Boolean']>;
  /** Checks for equality with the object’s `language` field. */
  language?: InputMaybe<Scalars['String']>;
  /** Checks for equality with the object’s `pattern` field. */
  pattern?: InputMaybe<Scalars['String']>;
  /** Checks for equality with the object’s `publishGroupId` field. */
  publishGroupId?: InputMaybe<Scalars['String']>;
  /** Checks for equality with the object’s `quality` field. */
  quality?: InputMaybe<Scalars['Int']>;
  /** Checks for equality with the object’s `type` field. */
  type?: InputMaybe<Scalars['String']>;
};

/** A filter to be used against `DownloadConfig` object types. All fields are combined with a logical ‘and.’ */
export type DownloadConfigFilter = {
  /** Checks for all expressions in this list. */
  and?: InputMaybe<Array<DownloadConfigFilter>>;
  /** Filter by the object’s `anime` field. */
  anime?: InputMaybe<IntFilter>;
  /** Filter by the object’s `bangumiId` field. */
  bangumiId?: InputMaybe<StringFilter>;
  /** Filter by the object’s `id` field. */
  id?: InputMaybe<IntFilter>;
  /** Filter by the object’s `isArchived` field. */
  isArchived?: InputMaybe<BooleanFilter>;
  /** Filter by the object’s `language` field. */
  language?: InputMaybe<StringFilter>;
  /** Negates the expression. */
  not?: InputMaybe<DownloadConfigFilter>;
  /** Checks for any expressions in this list. */
  or?: InputMaybe<Array<DownloadConfigFilter>>;
  /** Filter by the object’s `pattern` field. */
  pattern?: InputMaybe<StringFilter>;
  /** Filter by the object’s `publishGroupId` field. */
  publishGroupId?: InputMaybe<StringFilter>;
  /** Filter by the object’s `quality` field. */
  quality?: InputMaybe<IntFilter>;
  /** Filter by the object’s `type` field. */
  type?: InputMaybe<StringFilter>;
};

/** An input for mutations affecting `DownloadConfig` */
export type DownloadConfigInput = {
  anime: Scalars['Int'];
  /** mikan anime bangumi ID */
  bangumiId?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['Int']>;
  isArchived?: InputMaybe<Scalars['Boolean']>;
  language: Scalars['String'];
  pattern?: InputMaybe<Scalars['String']>;
  /** mikan anime publish group id */
  publishGroupId?: InputMaybe<Scalars['String']>;
  quality: Scalars['Int'];
  type?: InputMaybe<Scalars['String']>;
};

/** Represents an update to a `DownloadConfig`. Fields that are set will be updated. */
export type DownloadConfigPatch = {
  anime?: InputMaybe<Scalars['Int']>;
  /** mikan anime bangumi ID */
  bangumiId?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['Int']>;
  isArchived?: InputMaybe<Scalars['Boolean']>;
  language?: InputMaybe<Scalars['String']>;
  pattern?: InputMaybe<Scalars['String']>;
  /** mikan anime publish group id */
  publishGroupId?: InputMaybe<Scalars['String']>;
  quality?: InputMaybe<Scalars['Int']>;
  type?: InputMaybe<Scalars['String']>;
};

/** A connection to a list of `DownloadConfig` values. */
export type DownloadConfigsConnection = {
  __typename?: 'DownloadConfigsConnection';
  /** A list of edges which contains the `DownloadConfig` and cursor to aid in pagination. */
  edges: Array<DownloadConfigsEdge>;
  /** A list of `DownloadConfig` objects. */
  nodes: Array<Maybe<DownloadConfig>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** The count of *all* `DownloadConfig` you could get from the connection. */
  totalCount: Scalars['Int'];
};

/** A `DownloadConfig` edge in the connection. */
export type DownloadConfigsEdge = {
  __typename?: 'DownloadConfigsEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']>;
  /** The `DownloadConfig` at the end of the edge. */
  node?: Maybe<DownloadConfig>;
};

/** Methods to use when ordering `DownloadConfig`. */
export enum DownloadConfigsOrderBy {
  AnimeAsc = 'ANIME_ASC',
  AnimeDesc = 'ANIME_DESC',
  BangumiIdAsc = 'BANGUMI_ID_ASC',
  BangumiIdDesc = 'BANGUMI_ID_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  IsArchivedAsc = 'IS_ARCHIVED_ASC',
  IsArchivedDesc = 'IS_ARCHIVED_DESC',
  LanguageAsc = 'LANGUAGE_ASC',
  LanguageDesc = 'LANGUAGE_DESC',
  Natural = 'NATURAL',
  PatternAsc = 'PATTERN_ASC',
  PatternDesc = 'PATTERN_DESC',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  PublishGroupIdAsc = 'PUBLISH_GROUP_ID_ASC',
  PublishGroupIdDesc = 'PUBLISH_GROUP_ID_DESC',
  QualityAsc = 'QUALITY_ASC',
  QualityDesc = 'QUALITY_DESC',
  TypeAsc = 'TYPE_ASC',
  TypeDesc = 'TYPE_DESC'
}

/** Indicates whether archived items should be included in the results or not. */
export enum IncludeArchivedOption {
  /** Only include archived items (i.e. exclude non-archived items). */
  Exclusively = 'EXCLUSIVELY',
  /** If there is a parent GraphQL record and it is archived then this is equivalent to YES, in all other cases this is equivalent to NO. */
  Inherit = 'INHERIT',
  /** Exclude archived items. */
  No = 'NO',
  /** Include archived items. */
  Yes = 'YES'
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

/** The root mutation type which contains root level fields which mutate data. */
export type Mutation = {
  __typename?: 'Mutation';
  /** Creates a single `AnimeMetadatum`. */
  createAnimeMetadatum?: Maybe<CreateAnimeMetadatumPayload>;
  /** Creates a single `DownloadConfig`. */
  createDownloadConfig?: Maybe<CreateDownloadConfigPayload>;
  /** Creates a single `RssItem`. */
  createRssItem?: Maybe<CreateRssItemPayload>;
  /** Creates a single `SonarrSery`. */
  createSonarrSery?: Maybe<CreateSonarrSeryPayload>;
  /** Deletes a single `AnimeMetadatum` using its globally unique id. */
  deleteAnimeMetadatum?: Maybe<DeleteAnimeMetadatumPayload>;
  /** Deletes a single `AnimeMetadatum` using a unique key. */
  deleteAnimeMetadatumById?: Maybe<DeleteAnimeMetadatumPayload>;
  /** Deletes a single `DownloadConfig` using its globally unique id. */
  deleteDownloadConfig?: Maybe<DeleteDownloadConfigPayload>;
  /** Deletes a single `DownloadConfig` using a unique key. */
  deleteDownloadConfigById?: Maybe<DeleteDownloadConfigPayload>;
  /** Deletes a single `RssItem` using its globally unique id. */
  deleteRssItem?: Maybe<DeleteRssItemPayload>;
  /** Deletes a single `RssItem` using a unique key. */
  deleteRssItemByHash?: Maybe<DeleteRssItemPayload>;
  /** Deletes a single `RssItem` using a unique key. */
  deleteRssItemById?: Maybe<DeleteRssItemPayload>;
  /** Deletes a single `SonarrSery` using its globally unique id. */
  deleteSonarrSery?: Maybe<DeleteSonarrSeryPayload>;
  /** Deletes a single `SonarrSery` using a unique key. */
  deleteSonarrSeryById?: Maybe<DeleteSonarrSeryPayload>;
  /** Deletes a single `SonarrSery` using a unique key. */
  deleteSonarrSeryBySonarrId?: Maybe<DeleteSonarrSeryPayload>;
  /** Deletes a single `SonarrSery` using a unique key. */
  deleteSonarrSeryBySonarrSlug?: Maybe<DeleteSonarrSeryPayload>;
  /** Updates a single `AnimeMetadatum` using its globally unique id and a patch. */
  updateAnimeMetadatum?: Maybe<UpdateAnimeMetadatumPayload>;
  /** Updates a single `AnimeMetadatum` using a unique key and a patch. */
  updateAnimeMetadatumById?: Maybe<UpdateAnimeMetadatumPayload>;
  /** Updates a single `DownloadConfig` using its globally unique id and a patch. */
  updateDownloadConfig?: Maybe<UpdateDownloadConfigPayload>;
  /** Updates a single `DownloadConfig` using a unique key and a patch. */
  updateDownloadConfigById?: Maybe<UpdateDownloadConfigPayload>;
  /** Updates a single `RssItem` using its globally unique id and a patch. */
  updateRssItem?: Maybe<UpdateRssItemPayload>;
  /** Updates a single `RssItem` using a unique key and a patch. */
  updateRssItemByHash?: Maybe<UpdateRssItemPayload>;
  /** Updates a single `RssItem` using a unique key and a patch. */
  updateRssItemById?: Maybe<UpdateRssItemPayload>;
  /** Updates a single `SonarrSery` using its globally unique id and a patch. */
  updateSonarrSery?: Maybe<UpdateSonarrSeryPayload>;
  /** Updates a single `SonarrSery` using a unique key and a patch. */
  updateSonarrSeryById?: Maybe<UpdateSonarrSeryPayload>;
  /** Updates a single `SonarrSery` using a unique key and a patch. */
  updateSonarrSeryBySonarrId?: Maybe<UpdateSonarrSeryPayload>;
  /** Updates a single `SonarrSery` using a unique key and a patch. */
  updateSonarrSeryBySonarrSlug?: Maybe<UpdateSonarrSeryPayload>;
};


/** The root mutation type which contains root level fields which mutate data. */
export type MutationCreateAnimeMetadatumArgs = {
  input: CreateAnimeMetadatumInput;
};


/** The root mutation type which contains root level fields which mutate data. */
export type MutationCreateDownloadConfigArgs = {
  input: CreateDownloadConfigInput;
};


/** The root mutation type which contains root level fields which mutate data. */
export type MutationCreateRssItemArgs = {
  input: CreateRssItemInput;
};


/** The root mutation type which contains root level fields which mutate data. */
export type MutationCreateSonarrSeryArgs = {
  input: CreateSonarrSeryInput;
};


/** The root mutation type which contains root level fields which mutate data. */
export type MutationDeleteAnimeMetadatumArgs = {
  input: DeleteAnimeMetadatumInput;
};


/** The root mutation type which contains root level fields which mutate data. */
export type MutationDeleteAnimeMetadatumByIdArgs = {
  input: DeleteAnimeMetadatumByIdInput;
};


/** The root mutation type which contains root level fields which mutate data. */
export type MutationDeleteDownloadConfigArgs = {
  input: DeleteDownloadConfigInput;
};


/** The root mutation type which contains root level fields which mutate data. */
export type MutationDeleteDownloadConfigByIdArgs = {
  input: DeleteDownloadConfigByIdInput;
};


/** The root mutation type which contains root level fields which mutate data. */
export type MutationDeleteRssItemArgs = {
  input: DeleteRssItemInput;
};


/** The root mutation type which contains root level fields which mutate data. */
export type MutationDeleteRssItemByHashArgs = {
  input: DeleteRssItemByHashInput;
};


/** The root mutation type which contains root level fields which mutate data. */
export type MutationDeleteRssItemByIdArgs = {
  input: DeleteRssItemByIdInput;
};


/** The root mutation type which contains root level fields which mutate data. */
export type MutationDeleteSonarrSeryArgs = {
  input: DeleteSonarrSeryInput;
};


/** The root mutation type which contains root level fields which mutate data. */
export type MutationDeleteSonarrSeryByIdArgs = {
  input: DeleteSonarrSeryByIdInput;
};


/** The root mutation type which contains root level fields which mutate data. */
export type MutationDeleteSonarrSeryBySonarrIdArgs = {
  input: DeleteSonarrSeryBySonarrIdInput;
};


/** The root mutation type which contains root level fields which mutate data. */
export type MutationDeleteSonarrSeryBySonarrSlugArgs = {
  input: DeleteSonarrSeryBySonarrSlugInput;
};


/** The root mutation type which contains root level fields which mutate data. */
export type MutationUpdateAnimeMetadatumArgs = {
  input: UpdateAnimeMetadatumInput;
};


/** The root mutation type which contains root level fields which mutate data. */
export type MutationUpdateAnimeMetadatumByIdArgs = {
  input: UpdateAnimeMetadatumByIdInput;
};


/** The root mutation type which contains root level fields which mutate data. */
export type MutationUpdateDownloadConfigArgs = {
  input: UpdateDownloadConfigInput;
};


/** The root mutation type which contains root level fields which mutate data. */
export type MutationUpdateDownloadConfigByIdArgs = {
  input: UpdateDownloadConfigByIdInput;
};


/** The root mutation type which contains root level fields which mutate data. */
export type MutationUpdateRssItemArgs = {
  input: UpdateRssItemInput;
};


/** The root mutation type which contains root level fields which mutate data. */
export type MutationUpdateRssItemByHashArgs = {
  input: UpdateRssItemByHashInput;
};


/** The root mutation type which contains root level fields which mutate data. */
export type MutationUpdateRssItemByIdArgs = {
  input: UpdateRssItemByIdInput;
};


/** The root mutation type which contains root level fields which mutate data. */
export type MutationUpdateSonarrSeryArgs = {
  input: UpdateSonarrSeryInput;
};


/** The root mutation type which contains root level fields which mutate data. */
export type MutationUpdateSonarrSeryByIdArgs = {
  input: UpdateSonarrSeryByIdInput;
};


/** The root mutation type which contains root level fields which mutate data. */
export type MutationUpdateSonarrSeryBySonarrIdArgs = {
  input: UpdateSonarrSeryBySonarrIdInput;
};


/** The root mutation type which contains root level fields which mutate data. */
export type MutationUpdateSonarrSeryBySonarrSlugArgs = {
  input: UpdateSonarrSeryBySonarrSlugInput;
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

/** The root query type which gives access points into the data universe. */
export type Query = Node & {
  __typename?: 'Query';
  /** Reads and enables pagination through a set of `AnimeMetadatum`. */
  allAnimeMetadata?: Maybe<AnimeMetadataConnection>;
  /** Reads and enables pagination through a set of `DownloadConfig`. */
  allDownloadConfigs?: Maybe<DownloadConfigsConnection>;
  /** Reads and enables pagination through a set of `RssItem`. */
  allRssItems?: Maybe<RssItemsConnection>;
  /** Reads and enables pagination through a set of `SonarrSery`. */
  allSonarrSeries?: Maybe<SonarrSeriesConnection>;
  /** Reads a single `AnimeMetadatum` using its globally unique `ID`. */
  animeMetadatum?: Maybe<AnimeMetadatum>;
  animeMetadatumById?: Maybe<AnimeMetadatum>;
  /** Reads a single `DownloadConfig` using its globally unique `ID`. */
  downloadConfig?: Maybe<DownloadConfig>;
  downloadConfigById?: Maybe<DownloadConfig>;
  /** Fetches an object given its globally unique `ID`. */
  node?: Maybe<Node>;
  /** The root query type must be a `Node` to work well with Relay 1 mutations. This just resolves to `query`. */
  nodeId: Scalars['ID'];
  /**
   * Exposes the root query type nested one level down. This is helpful for Relay 1
   * which can only query top level fields if they are in a particular form.
   */
  query: Query;
  /** Reads a single `RssItem` using its globally unique `ID`. */
  rssItem?: Maybe<RssItem>;
  rssItemByHash?: Maybe<RssItem>;
  rssItemById?: Maybe<RssItem>;
  /** Reads a single `SonarrSery` using its globally unique `ID`. */
  sonarrSery?: Maybe<SonarrSery>;
  sonarrSeryById?: Maybe<SonarrSery>;
  sonarrSeryBySonarrId?: Maybe<SonarrSery>;
  sonarrSeryBySonarrSlug?: Maybe<SonarrSery>;
};


/** The root query type which gives access points into the data universe. */
export type QueryAllAnimeMetadataArgs = {
  after?: InputMaybe<Scalars['Cursor']>;
  before?: InputMaybe<Scalars['Cursor']>;
  condition?: InputMaybe<AnimeMetadatumCondition>;
  filter?: InputMaybe<AnimeMetadatumFilter>;
  first?: InputMaybe<Scalars['Int']>;
  includeArchived?: InputMaybe<IncludeArchivedOption>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<AnimeMetadataOrderBy>>;
};


/** The root query type which gives access points into the data universe. */
export type QueryAllDownloadConfigsArgs = {
  after?: InputMaybe<Scalars['Cursor']>;
  before?: InputMaybe<Scalars['Cursor']>;
  condition?: InputMaybe<DownloadConfigCondition>;
  filter?: InputMaybe<DownloadConfigFilter>;
  first?: InputMaybe<Scalars['Int']>;
  includeArchived?: InputMaybe<IncludeArchivedOption>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<DownloadConfigsOrderBy>>;
};


/** The root query type which gives access points into the data universe. */
export type QueryAllRssItemsArgs = {
  after?: InputMaybe<Scalars['Cursor']>;
  before?: InputMaybe<Scalars['Cursor']>;
  condition?: InputMaybe<RssItemCondition>;
  filter?: InputMaybe<RssItemFilter>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<RssItemsOrderBy>>;
};


/** The root query type which gives access points into the data universe. */
export type QueryAllSonarrSeriesArgs = {
  after?: InputMaybe<Scalars['Cursor']>;
  before?: InputMaybe<Scalars['Cursor']>;
  condition?: InputMaybe<SonarrSeryCondition>;
  filter?: InputMaybe<SonarrSeryFilter>;
  first?: InputMaybe<Scalars['Int']>;
  includeArchived?: InputMaybe<IncludeArchivedOption>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<SonarrSeriesOrderBy>>;
};


/** The root query type which gives access points into the data universe. */
export type QueryAnimeMetadatumArgs = {
  nodeId: Scalars['ID'];
};


/** The root query type which gives access points into the data universe. */
export type QueryAnimeMetadatumByIdArgs = {
  id: Scalars['Int'];
};


/** The root query type which gives access points into the data universe. */
export type QueryDownloadConfigArgs = {
  nodeId: Scalars['ID'];
};


/** The root query type which gives access points into the data universe. */
export type QueryDownloadConfigByIdArgs = {
  id: Scalars['Int'];
};


/** The root query type which gives access points into the data universe. */
export type QueryNodeArgs = {
  nodeId: Scalars['ID'];
};


/** The root query type which gives access points into the data universe. */
export type QueryRssItemArgs = {
  nodeId: Scalars['ID'];
};


/** The root query type which gives access points into the data universe. */
export type QueryRssItemByHashArgs = {
  hash: Scalars['String'];
};


/** The root query type which gives access points into the data universe. */
export type QueryRssItemByIdArgs = {
  id: Scalars['Int'];
};


/** The root query type which gives access points into the data universe. */
export type QuerySonarrSeryArgs = {
  nodeId: Scalars['ID'];
};


/** The root query type which gives access points into the data universe. */
export type QuerySonarrSeryByIdArgs = {
  id: Scalars['Int'];
};


/** The root query type which gives access points into the data universe. */
export type QuerySonarrSeryBySonarrIdArgs = {
  sonarrId: Scalars['Int'];
};


/** The root query type which gives access points into the data universe. */
export type QuerySonarrSeryBySonarrSlugArgs = {
  sonarrSlug: Scalars['String'];
};

export type RssItem = Node & {
  __typename?: 'RssItem';
  hash: Scalars['String'];
  id: Scalars['Int'];
  /** A globally unique identifier. Can be used in various places throughout the system to identify this single value. */
  nodeId: Scalars['ID'];
  publishDate: Scalars['Datetime'];
  size: Scalars['BigInt'];
  title: Scalars['String'];
  torrentLink: Scalars['String'];
};

/** A condition to be used against `RssItem` object types. All fields are tested for equality and combined with a logical ‘and.’ */
export type RssItemCondition = {
  /** Checks for equality with the object’s `hash` field. */
  hash?: InputMaybe<Scalars['String']>;
  /** Checks for equality with the object’s `id` field. */
  id?: InputMaybe<Scalars['Int']>;
  /** Checks for equality with the object’s `publishDate` field. */
  publishDate?: InputMaybe<Scalars['Datetime']>;
  /** Checks for equality with the object’s `size` field. */
  size?: InputMaybe<Scalars['BigInt']>;
  /** Checks for equality with the object’s `title` field. */
  title?: InputMaybe<Scalars['String']>;
  /** Checks for equality with the object’s `torrentLink` field. */
  torrentLink?: InputMaybe<Scalars['String']>;
};

/** A filter to be used against `RssItem` object types. All fields are combined with a logical ‘and.’ */
export type RssItemFilter = {
  /** Checks for all expressions in this list. */
  and?: InputMaybe<Array<RssItemFilter>>;
  /** Filter by the object’s `hash` field. */
  hash?: InputMaybe<StringFilter>;
  /** Filter by the object’s `id` field. */
  id?: InputMaybe<IntFilter>;
  /** Negates the expression. */
  not?: InputMaybe<RssItemFilter>;
  /** Checks for any expressions in this list. */
  or?: InputMaybe<Array<RssItemFilter>>;
  /** Filter by the object’s `publishDate` field. */
  publishDate?: InputMaybe<DatetimeFilter>;
  /** Filter by the object’s `size` field. */
  size?: InputMaybe<BigIntFilter>;
  /** Filter by the object’s `title` field. */
  title?: InputMaybe<StringFilter>;
  /** Filter by the object’s `torrentLink` field. */
  torrentLink?: InputMaybe<StringFilter>;
};

/** An input for mutations affecting `RssItem` */
export type RssItemInput = {
  hash: Scalars['String'];
  id?: InputMaybe<Scalars['Int']>;
  publishDate: Scalars['Datetime'];
  size: Scalars['BigInt'];
  title: Scalars['String'];
  torrentLink: Scalars['String'];
};

/** Represents an update to a `RssItem`. Fields that are set will be updated. */
export type RssItemPatch = {
  hash?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['Int']>;
  publishDate?: InputMaybe<Scalars['Datetime']>;
  size?: InputMaybe<Scalars['BigInt']>;
  title?: InputMaybe<Scalars['String']>;
  torrentLink?: InputMaybe<Scalars['String']>;
};

/** A connection to a list of `RssItem` values. */
export type RssItemsConnection = {
  __typename?: 'RssItemsConnection';
  /** A list of edges which contains the `RssItem` and cursor to aid in pagination. */
  edges: Array<RssItemsEdge>;
  /** A list of `RssItem` objects. */
  nodes: Array<Maybe<RssItem>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** The count of *all* `RssItem` you could get from the connection. */
  totalCount: Scalars['Int'];
};

/** A `RssItem` edge in the connection. */
export type RssItemsEdge = {
  __typename?: 'RssItemsEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']>;
  /** The `RssItem` at the end of the edge. */
  node?: Maybe<RssItem>;
};

/** Methods to use when ordering `RssItem`. */
export enum RssItemsOrderBy {
  HashAsc = 'HASH_ASC',
  HashDesc = 'HASH_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  Natural = 'NATURAL',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  PublishDateAsc = 'PUBLISH_DATE_ASC',
  PublishDateDesc = 'PUBLISH_DATE_DESC',
  SizeAsc = 'SIZE_ASC',
  SizeDesc = 'SIZE_DESC',
  TitleAsc = 'TITLE_ASC',
  TitleDesc = 'TITLE_DESC',
  TorrentLinkAsc = 'TORRENT_LINK_ASC',
  TorrentLinkDesc = 'TORRENT_LINK_DESC'
}

export enum SeasonEnum {
  Autumn = 'AUTUMN',
  Spring = 'SPRING',
  Summer = 'SUMMER',
  Winter = 'WINTER'
}

/** A filter to be used against SeasonEnum fields. All fields are combined with a logical ‘and.’ */
export type SeasonEnumFilter = {
  /** Not equal to the specified value, treating null like an ordinary value. */
  distinctFrom?: InputMaybe<SeasonEnum>;
  /** Equal to the specified value. */
  equalTo?: InputMaybe<SeasonEnum>;
  /** Greater than the specified value. */
  greaterThan?: InputMaybe<SeasonEnum>;
  /** Greater than or equal to the specified value. */
  greaterThanOrEqualTo?: InputMaybe<SeasonEnum>;
  /** Included in the specified list. */
  in?: InputMaybe<Array<SeasonEnum>>;
  /** Is null (if `true` is specified) or is not null (if `false` is specified). */
  isNull?: InputMaybe<Scalars['Boolean']>;
  /** Less than the specified value. */
  lessThan?: InputMaybe<SeasonEnum>;
  /** Less than or equal to the specified value. */
  lessThanOrEqualTo?: InputMaybe<SeasonEnum>;
  /** Equal to the specified value, treating null like an ordinary value. */
  notDistinctFrom?: InputMaybe<SeasonEnum>;
  /** Not equal to the specified value. */
  notEqualTo?: InputMaybe<SeasonEnum>;
  /** Not included in the specified list. */
  notIn?: InputMaybe<Array<SeasonEnum>>;
};

/** A connection to a list of `SonarrSery` values. */
export type SonarrSeriesConnection = {
  __typename?: 'SonarrSeriesConnection';
  /** A list of edges which contains the `SonarrSery` and cursor to aid in pagination. */
  edges: Array<SonarrSeriesEdge>;
  /** A list of `SonarrSery` objects. */
  nodes: Array<Maybe<SonarrSery>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** The count of *all* `SonarrSery` you could get from the connection. */
  totalCount: Scalars['Int'];
};

/** A `SonarrSery` edge in the connection. */
export type SonarrSeriesEdge = {
  __typename?: 'SonarrSeriesEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']>;
  /** The `SonarrSery` at the end of the edge. */
  node?: Maybe<SonarrSery>;
};

/** Methods to use when ordering `SonarrSery`. */
export enum SonarrSeriesOrderBy {
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  IsArchivedAsc = 'IS_ARCHIVED_ASC',
  IsArchivedDesc = 'IS_ARCHIVED_DESC',
  Natural = 'NATURAL',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  SonarrIdAsc = 'SONARR_ID_ASC',
  SonarrIdDesc = 'SONARR_ID_DESC',
  SonarrSlugAsc = 'SONARR_SLUG_ASC',
  SonarrSlugDesc = 'SONARR_SLUG_DESC',
  TvdbidAsc = 'TVDBID_ASC',
  TvdbidDesc = 'TVDBID_DESC'
}

export type SonarrSery = Node & {
  __typename?: 'SonarrSery';
  /** Reads and enables pagination through a set of `AnimeMetadatum`. */
  animeMetadataBySonarrSeries: AnimeMetadataConnection;
  id: Scalars['Int'];
  isArchived: Scalars['Boolean'];
  /** A globally unique identifier. Can be used in various places throughout the system to identify this single value. */
  nodeId: Scalars['ID'];
  sonarrId: Scalars['Int'];
  sonarrSlug: Scalars['String'];
  tvdbid: Scalars['Int'];
};


export type SonarrSeryAnimeMetadataBySonarrSeriesArgs = {
  after?: InputMaybe<Scalars['Cursor']>;
  before?: InputMaybe<Scalars['Cursor']>;
  condition?: InputMaybe<AnimeMetadatumCondition>;
  filter?: InputMaybe<AnimeMetadatumFilter>;
  first?: InputMaybe<Scalars['Int']>;
  includeArchived?: InputMaybe<IncludeArchivedOption>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<AnimeMetadataOrderBy>>;
};

/**
 * A condition to be used against `SonarrSery` object types. All fields are tested
 * for equality and combined with a logical ‘and.’
 */
export type SonarrSeryCondition = {
  /** Checks for equality with the object’s `id` field. */
  id?: InputMaybe<Scalars['Int']>;
  /** Checks for equality with the object’s `isArchived` field. */
  isArchived?: InputMaybe<Scalars['Boolean']>;
  /** Checks for equality with the object’s `sonarrId` field. */
  sonarrId?: InputMaybe<Scalars['Int']>;
  /** Checks for equality with the object’s `sonarrSlug` field. */
  sonarrSlug?: InputMaybe<Scalars['String']>;
  /** Checks for equality with the object’s `tvdbid` field. */
  tvdbid?: InputMaybe<Scalars['Int']>;
};

/** A filter to be used against `SonarrSery` object types. All fields are combined with a logical ‘and.’ */
export type SonarrSeryFilter = {
  /** Checks for all expressions in this list. */
  and?: InputMaybe<Array<SonarrSeryFilter>>;
  /** Filter by the object’s `id` field. */
  id?: InputMaybe<IntFilter>;
  /** Filter by the object’s `isArchived` field. */
  isArchived?: InputMaybe<BooleanFilter>;
  /** Negates the expression. */
  not?: InputMaybe<SonarrSeryFilter>;
  /** Checks for any expressions in this list. */
  or?: InputMaybe<Array<SonarrSeryFilter>>;
  /** Filter by the object’s `sonarrId` field. */
  sonarrId?: InputMaybe<IntFilter>;
  /** Filter by the object’s `sonarrSlug` field. */
  sonarrSlug?: InputMaybe<StringFilter>;
  /** Filter by the object’s `tvdbid` field. */
  tvdbid?: InputMaybe<IntFilter>;
};

/** An input for mutations affecting `SonarrSery` */
export type SonarrSeryInput = {
  id?: InputMaybe<Scalars['Int']>;
  isArchived?: InputMaybe<Scalars['Boolean']>;
  sonarrId: Scalars['Int'];
  sonarrSlug: Scalars['String'];
  tvdbid: Scalars['Int'];
};

/** Represents an update to a `SonarrSery`. Fields that are set will be updated. */
export type SonarrSeryPatch = {
  id?: InputMaybe<Scalars['Int']>;
  isArchived?: InputMaybe<Scalars['Boolean']>;
  sonarrId?: InputMaybe<Scalars['Int']>;
  sonarrSlug?: InputMaybe<Scalars['String']>;
  tvdbid?: InputMaybe<Scalars['Int']>;
};

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

/** All input for the `updateAnimeMetadatumById` mutation. */
export type UpdateAnimeMetadatumByIdInput = {
  /** An object where the defined keys will be set on the `AnimeMetadatum` being updated. */
  animeMetadatumPatch: AnimeMetadatumPatch;
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']>;
  id: Scalars['Int'];
};

/** All input for the `updateAnimeMetadatum` mutation. */
export type UpdateAnimeMetadatumInput = {
  /** An object where the defined keys will be set on the `AnimeMetadatum` being updated. */
  animeMetadatumPatch: AnimeMetadatumPatch;
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** The globally unique `ID` which will identify a single `AnimeMetadatum` to be updated. */
  nodeId: Scalars['ID'];
};

/** The output of our update `AnimeMetadatum` mutation. */
export type UpdateAnimeMetadatumPayload = {
  __typename?: 'UpdateAnimeMetadatumPayload';
  /** The `AnimeMetadatum` that was updated by this mutation. */
  animeMetadatum?: Maybe<AnimeMetadatum>;
  /** An edge for our `AnimeMetadatum`. May be used by Relay 1. */
  animeMetadatumEdge?: Maybe<AnimeMetadataEdge>;
  /**
   * The exact same `clientMutationId` that was provided in the mutation input,
   * unchanged and unused. May be used by a client to track mutations.
   */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Our root query field type. Allows us to run any query from our mutation payload. */
  query?: Maybe<Query>;
  /** Reads a single `SonarrSery` that is related to this `AnimeMetadatum`. */
  sonarrSeryBySonarrSeries?: Maybe<SonarrSery>;
};


/** The output of our update `AnimeMetadatum` mutation. */
export type UpdateAnimeMetadatumPayloadAnimeMetadatumEdgeArgs = {
  orderBy?: InputMaybe<Array<AnimeMetadataOrderBy>>;
};

/** All input for the `updateDownloadConfigById` mutation. */
export type UpdateDownloadConfigByIdInput = {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** An object where the defined keys will be set on the `DownloadConfig` being updated. */
  downloadConfigPatch: DownloadConfigPatch;
  id: Scalars['Int'];
};

/** All input for the `updateDownloadConfig` mutation. */
export type UpdateDownloadConfigInput = {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** An object where the defined keys will be set on the `DownloadConfig` being updated. */
  downloadConfigPatch: DownloadConfigPatch;
  /** The globally unique `ID` which will identify a single `DownloadConfig` to be updated. */
  nodeId: Scalars['ID'];
};

/** The output of our update `DownloadConfig` mutation. */
export type UpdateDownloadConfigPayload = {
  __typename?: 'UpdateDownloadConfigPayload';
  /** Reads a single `AnimeMetadatum` that is related to this `DownloadConfig`. */
  animeMetadatumByAnime?: Maybe<AnimeMetadatum>;
  /**
   * The exact same `clientMutationId` that was provided in the mutation input,
   * unchanged and unused. May be used by a client to track mutations.
   */
  clientMutationId?: Maybe<Scalars['String']>;
  /** The `DownloadConfig` that was updated by this mutation. */
  downloadConfig?: Maybe<DownloadConfig>;
  /** An edge for our `DownloadConfig`. May be used by Relay 1. */
  downloadConfigEdge?: Maybe<DownloadConfigsEdge>;
  /** Our root query field type. Allows us to run any query from our mutation payload. */
  query?: Maybe<Query>;
};


/** The output of our update `DownloadConfig` mutation. */
export type UpdateDownloadConfigPayloadDownloadConfigEdgeArgs = {
  orderBy?: InputMaybe<Array<DownloadConfigsOrderBy>>;
};

/** All input for the `updateRssItemByHash` mutation. */
export type UpdateRssItemByHashInput = {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']>;
  hash: Scalars['String'];
  /** An object where the defined keys will be set on the `RssItem` being updated. */
  rssItemPatch: RssItemPatch;
};

/** All input for the `updateRssItemById` mutation. */
export type UpdateRssItemByIdInput = {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']>;
  id: Scalars['Int'];
  /** An object where the defined keys will be set on the `RssItem` being updated. */
  rssItemPatch: RssItemPatch;
};

/** All input for the `updateRssItem` mutation. */
export type UpdateRssItemInput = {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** The globally unique `ID` which will identify a single `RssItem` to be updated. */
  nodeId: Scalars['ID'];
  /** An object where the defined keys will be set on the `RssItem` being updated. */
  rssItemPatch: RssItemPatch;
};

/** The output of our update `RssItem` mutation. */
export type UpdateRssItemPayload = {
  __typename?: 'UpdateRssItemPayload';
  /**
   * The exact same `clientMutationId` that was provided in the mutation input,
   * unchanged and unused. May be used by a client to track mutations.
   */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Our root query field type. Allows us to run any query from our mutation payload. */
  query?: Maybe<Query>;
  /** The `RssItem` that was updated by this mutation. */
  rssItem?: Maybe<RssItem>;
  /** An edge for our `RssItem`. May be used by Relay 1. */
  rssItemEdge?: Maybe<RssItemsEdge>;
};


/** The output of our update `RssItem` mutation. */
export type UpdateRssItemPayloadRssItemEdgeArgs = {
  orderBy?: InputMaybe<Array<RssItemsOrderBy>>;
};

/** All input for the `updateSonarrSeryById` mutation. */
export type UpdateSonarrSeryByIdInput = {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']>;
  id: Scalars['Int'];
  /** An object where the defined keys will be set on the `SonarrSery` being updated. */
  sonarrSeryPatch: SonarrSeryPatch;
};

/** All input for the `updateSonarrSeryBySonarrId` mutation. */
export type UpdateSonarrSeryBySonarrIdInput = {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']>;
  sonarrId: Scalars['Int'];
  /** An object where the defined keys will be set on the `SonarrSery` being updated. */
  sonarrSeryPatch: SonarrSeryPatch;
};

/** All input for the `updateSonarrSeryBySonarrSlug` mutation. */
export type UpdateSonarrSeryBySonarrSlugInput = {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** An object where the defined keys will be set on the `SonarrSery` being updated. */
  sonarrSeryPatch: SonarrSeryPatch;
  sonarrSlug: Scalars['String'];
};

/** All input for the `updateSonarrSery` mutation. */
export type UpdateSonarrSeryInput = {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** The globally unique `ID` which will identify a single `SonarrSery` to be updated. */
  nodeId: Scalars['ID'];
  /** An object where the defined keys will be set on the `SonarrSery` being updated. */
  sonarrSeryPatch: SonarrSeryPatch;
};

/** The output of our update `SonarrSery` mutation. */
export type UpdateSonarrSeryPayload = {
  __typename?: 'UpdateSonarrSeryPayload';
  /**
   * The exact same `clientMutationId` that was provided in the mutation input,
   * unchanged and unused. May be used by a client to track mutations.
   */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Our root query field type. Allows us to run any query from our mutation payload. */
  query?: Maybe<Query>;
  /** The `SonarrSery` that was updated by this mutation. */
  sonarrSery?: Maybe<SonarrSery>;
  /** An edge for our `SonarrSery`. May be used by Relay 1. */
  sonarrSeryEdge?: Maybe<SonarrSeriesEdge>;
};


/** The output of our update `SonarrSery` mutation. */
export type UpdateSonarrSeryPayloadSonarrSeryEdgeArgs = {
  orderBy?: InputMaybe<Array<SonarrSeriesOrderBy>>;
};

export type GetDataForDefaultItemsQueryVariables = Exact<{
  first: Scalars['Int'];
}>;


export type GetDataForDefaultItemsQuery = { __typename?: 'Query', allRssItems?: { __typename?: 'RssItemsConnection', edges: Array<{ __typename?: 'RssItemsEdge', node?: { __typename?: 'RssItem', hash: string, publishDate: string, size: any, title: string, torrentLink: string } | null | undefined }> } | null | undefined, allDownloadConfigs?: { __typename?: 'DownloadConfigsConnection', edges: Array<{ __typename?: 'DownloadConfigsEdge', node?: { __typename?: 'DownloadConfig', language: string, quality: number, type: string, anime: number, pattern: string } | null | undefined }> } | null | undefined };

export type GetDataForForcedItemsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetDataForForcedItemsQuery = { __typename?: 'Query', allAnimeMetadata?: { __typename?: 'AnimeMetadataConnection', edges: Array<{ __typename?: 'AnimeMetadataEdge', node?: { __typename?: 'AnimeMetadatum', id: number, mikanAnimeId: string, downloadConfigsByAnime: { __typename?: 'DownloadConfigsConnection', edges: Array<{ __typename?: 'DownloadConfigsEdge', node?: { __typename?: 'DownloadConfig', language: string, pattern: string, quality: number, type: string, publishGroupId: string, bangumiId: string } | null | undefined }> } } | null | undefined }> } | null | undefined };


export const GetDataForDefaultItemsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetDataForDefaultItems"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"allRssItems"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orderBy"},"value":{"kind":"EnumValue","value":"PUBLISH_DATE_DESC"}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hash"}},{"kind":"Field","name":{"kind":"Name","value":"publishDate"}},{"kind":"Field","name":{"kind":"Name","value":"size"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"torrentLink"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"allDownloadConfigs"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"language"}},{"kind":"Field","name":{"kind":"Name","value":"quality"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"anime"}},{"kind":"Field","name":{"kind":"Name","value":"pattern"}}]}}]}}]}}]}}]} as unknown as DocumentNode<GetDataForDefaultItemsQuery, GetDataForDefaultItemsQueryVariables>;
export const GetDataForForcedItemsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetDataForForcedItems"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"allAnimeMetadata"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"condition"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"forceScratch"},"value":{"kind":"BooleanValue","value":true}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"downloadConfigsByAnime"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"language"}},{"kind":"Field","name":{"kind":"Name","value":"pattern"}},{"kind":"Field","name":{"kind":"Name","value":"quality"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"publishGroupId"}},{"kind":"Field","name":{"kind":"Name","value":"bangumiId"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"mikanAnimeId"}}]}}]}}]}}]}}]} as unknown as DocumentNode<GetDataForForcedItemsQuery, GetDataForForcedItemsQueryVariables>;
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
  /** A location in a connection that can be used for resuming pagination. */
  Cursor: any;
  /** A JavaScript object encoded in the JSON format as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
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
  BamgumiIdAsc = 'BAMGUMI_ID_ASC',
  BamgumiIdDesc = 'BAMGUMI_ID_DESC',
  BilibiliMainlandSsidAsc = 'BILIBILI_MAINLAND_SSID_ASC',
  BilibiliMainlandSsidDesc = 'BILIBILI_MAINLAND_SSID_DESC',
  BilibiliThmSsidAsc = 'BILIBILI_THM_SSID_ASC',
  BilibiliThmSsidDesc = 'BILIBILI_THM_SSID_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  JellyfinSeasonIdAsc = 'JELLYFIN_SEASON_ID_ASC',
  JellyfinSeasonIdDesc = 'JELLYFIN_SEASON_ID_DESC',
  MikanAnimeIdAsc = 'MIKAN_ANIME_ID_ASC',
  MikanAnimeIdDesc = 'MIKAN_ANIME_ID_DESC',
  Natural = 'NATURAL',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  ScheduleAsc = 'SCHEDULE_ASC',
  ScheduleDesc = 'SCHEDULE_DESC',
  SemesterAsc = 'SEMESTER_ASC',
  SemesterDesc = 'SEMESTER_DESC',
  SonarrSeasonAsc = 'SONARR_SEASON_ASC',
  SonarrSeasonDesc = 'SONARR_SEASON_DESC',
  SonarrSeriesAsc = 'SONARR_SERIES_ASC',
  SonarrSeriesDesc = 'SONARR_SERIES_DESC',
  UniformNameAsc = 'UNIFORM_NAME_ASC',
  UniformNameDesc = 'UNIFORM_NAME_DESC'
}

export type AnimeMetadatum = Node & {
  __typename?: 'AnimeMetadatum';
  bamgumiId?: Maybe<Scalars['Int']>;
  bilibiliMainlandSsid?: Maybe<Scalars['Int']>;
  bilibiliThmSsid?: Maybe<Scalars['Int']>;
  id: Scalars['Int'];
  jellyfinSeasonId?: Maybe<Scalars['String']>;
  mikanAnimeId?: Maybe<Scalars['Int']>;
  /** A globally unique identifier. Can be used in various places throughout the system to identify this single value. */
  nodeId: Scalars['ID'];
  schedule?: Maybe<Scalars['JSON']>;
  semester?: Maybe<Scalars['Int']>;
  /** Reads a single `Semester` that is related to this `AnimeMetadatum`. */
  semesterBySemester?: Maybe<Semester>;
  /** sonarr seasonNumber, usually 1-based, 0 is used for OAD */
  sonarrSeason?: Maybe<Scalars['Int']>;
  sonarrSeries?: Maybe<Scalars['Int']>;
  /** Reads a single `SonarrSery` that is related to this `AnimeMetadatum`. */
  sonarrSeryBySonarrSeries?: Maybe<SonarrSery>;
  /** https://std-4453.feishu.cn/wiki/wikcnPbNZAT9OhTAJwp2WALnJld */
  uniformName: Scalars['String'];
};

/**
 * A condition to be used against `AnimeMetadatum` object types. All fields are
 * tested for equality and combined with a logical ‘and.’
 */
export type AnimeMetadatumCondition = {
  /** Checks for equality with the object’s `bamgumiId` field. */
  bamgumiId?: InputMaybe<Scalars['Int']>;
  /** Checks for equality with the object’s `bilibiliMainlandSsid` field. */
  bilibiliMainlandSsid?: InputMaybe<Scalars['Int']>;
  /** Checks for equality with the object’s `bilibiliThmSsid` field. */
  bilibiliThmSsid?: InputMaybe<Scalars['Int']>;
  /** Checks for equality with the object’s `id` field. */
  id?: InputMaybe<Scalars['Int']>;
  /** Checks for equality with the object’s `jellyfinSeasonId` field. */
  jellyfinSeasonId?: InputMaybe<Scalars['String']>;
  /** Checks for equality with the object’s `mikanAnimeId` field. */
  mikanAnimeId?: InputMaybe<Scalars['Int']>;
  /** Checks for equality with the object’s `schedule` field. */
  schedule?: InputMaybe<Scalars['JSON']>;
  /** Checks for equality with the object’s `semester` field. */
  semester?: InputMaybe<Scalars['Int']>;
  /** Checks for equality with the object’s `sonarrSeason` field. */
  sonarrSeason?: InputMaybe<Scalars['Int']>;
  /** Checks for equality with the object’s `sonarrSeries` field. */
  sonarrSeries?: InputMaybe<Scalars['Int']>;
  /** Checks for equality with the object’s `uniformName` field. */
  uniformName?: InputMaybe<Scalars['String']>;
};

/** A filter to be used against `AnimeMetadatum` object types. All fields are combined with a logical ‘and.’ */
export type AnimeMetadatumFilter = {
  /** Checks for all expressions in this list. */
  and?: InputMaybe<Array<AnimeMetadatumFilter>>;
  /** Filter by the object’s `bamgumiId` field. */
  bamgumiId?: InputMaybe<IntFilter>;
  /** Filter by the object’s `bilibiliMainlandSsid` field. */
  bilibiliMainlandSsid?: InputMaybe<IntFilter>;
  /** Filter by the object’s `bilibiliThmSsid` field. */
  bilibiliThmSsid?: InputMaybe<IntFilter>;
  /** Filter by the object’s `id` field. */
  id?: InputMaybe<IntFilter>;
  /** Filter by the object’s `jellyfinSeasonId` field. */
  jellyfinSeasonId?: InputMaybe<StringFilter>;
  /** Filter by the object’s `mikanAnimeId` field. */
  mikanAnimeId?: InputMaybe<IntFilter>;
  /** Negates the expression. */
  not?: InputMaybe<AnimeMetadatumFilter>;
  /** Checks for any expressions in this list. */
  or?: InputMaybe<Array<AnimeMetadatumFilter>>;
  /** Filter by the object’s `semester` field. */
  semester?: InputMaybe<IntFilter>;
  /** Filter by the object’s `sonarrSeason` field. */
  sonarrSeason?: InputMaybe<IntFilter>;
  /** Filter by the object’s `sonarrSeries` field. */
  sonarrSeries?: InputMaybe<IntFilter>;
  /** Filter by the object’s `uniformName` field. */
  uniformName?: InputMaybe<StringFilter>;
};

/** An input for mutations affecting `AnimeMetadatum` */
export type AnimeMetadatumInput = {
  bamgumiId?: InputMaybe<Scalars['Int']>;
  bilibiliMainlandSsid?: InputMaybe<Scalars['Int']>;
  bilibiliThmSsid?: InputMaybe<Scalars['Int']>;
  id?: InputMaybe<Scalars['Int']>;
  jellyfinSeasonId?: InputMaybe<Scalars['String']>;
  mikanAnimeId?: InputMaybe<Scalars['Int']>;
  schedule?: InputMaybe<Scalars['JSON']>;
  semester?: InputMaybe<Scalars['Int']>;
  /** sonarr seasonNumber, usually 1-based, 0 is used for OAD */
  sonarrSeason?: InputMaybe<Scalars['Int']>;
  sonarrSeries?: InputMaybe<Scalars['Int']>;
  /** https://std-4453.feishu.cn/wiki/wikcnPbNZAT9OhTAJwp2WALnJld */
  uniformName: Scalars['String'];
};

/** Represents an update to a `AnimeMetadatum`. Fields that are set will be updated. */
export type AnimeMetadatumPatch = {
  bamgumiId?: InputMaybe<Scalars['Int']>;
  bilibiliMainlandSsid?: InputMaybe<Scalars['Int']>;
  bilibiliThmSsid?: InputMaybe<Scalars['Int']>;
  id?: InputMaybe<Scalars['Int']>;
  jellyfinSeasonId?: InputMaybe<Scalars['String']>;
  mikanAnimeId?: InputMaybe<Scalars['Int']>;
  schedule?: InputMaybe<Scalars['JSON']>;
  semester?: InputMaybe<Scalars['Int']>;
  /** sonarr seasonNumber, usually 1-based, 0 is used for OAD */
  sonarrSeason?: InputMaybe<Scalars['Int']>;
  sonarrSeries?: InputMaybe<Scalars['Int']>;
  /** https://std-4453.feishu.cn/wiki/wikcnPbNZAT9OhTAJwp2WALnJld */
  uniformName?: InputMaybe<Scalars['String']>;
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
  /** Reads a single `Semester` that is related to this `AnimeMetadatum`. */
  semesterBySemester?: Maybe<Semester>;
  /** Reads a single `SonarrSery` that is related to this `AnimeMetadatum`. */
  sonarrSeryBySonarrSeries?: Maybe<SonarrSery>;
};


/** The output of our create `AnimeMetadatum` mutation. */
export type CreateAnimeMetadatumPayloadAnimeMetadatumEdgeArgs = {
  orderBy?: InputMaybe<Array<AnimeMetadataOrderBy>>;
};

/** All input for the create `Semester` mutation. */
export type CreateSemesterInput = {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** The `Semester` to be created by this mutation. */
  semester: SemesterInput;
};

/** The output of our create `Semester` mutation. */
export type CreateSemesterPayload = {
  __typename?: 'CreateSemesterPayload';
  /**
   * The exact same `clientMutationId` that was provided in the mutation input,
   * unchanged and unused. May be used by a client to track mutations.
   */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Our root query field type. Allows us to run any query from our mutation payload. */
  query?: Maybe<Query>;
  /** The `Semester` that was created by this mutation. */
  semester?: Maybe<Semester>;
  /** An edge for our `Semester`. May be used by Relay 1. */
  semesterEdge?: Maybe<SemestersEdge>;
};


/** The output of our create `Semester` mutation. */
export type CreateSemesterPayloadSemesterEdgeArgs = {
  orderBy?: InputMaybe<Array<SemestersOrderBy>>;
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
  /** Reads a single `Semester` that is related to this `AnimeMetadatum`. */
  semesterBySemester?: Maybe<Semester>;
  /** Reads a single `SonarrSery` that is related to this `AnimeMetadatum`. */
  sonarrSeryBySonarrSeries?: Maybe<SonarrSery>;
};


/** The output of our delete `AnimeMetadatum` mutation. */
export type DeleteAnimeMetadatumPayloadAnimeMetadatumEdgeArgs = {
  orderBy?: InputMaybe<Array<AnimeMetadataOrderBy>>;
};

/** All input for the `deleteSemesterById` mutation. */
export type DeleteSemesterByIdInput = {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']>;
  id: Scalars['Int'];
};

/** All input for the `deleteSemester` mutation. */
export type DeleteSemesterInput = {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** The globally unique `ID` which will identify a single `Semester` to be deleted. */
  nodeId: Scalars['ID'];
};

/** The output of our delete `Semester` mutation. */
export type DeleteSemesterPayload = {
  __typename?: 'DeleteSemesterPayload';
  /**
   * The exact same `clientMutationId` that was provided in the mutation input,
   * unchanged and unused. May be used by a client to track mutations.
   */
  clientMutationId?: Maybe<Scalars['String']>;
  deletedSemesterId?: Maybe<Scalars['ID']>;
  /** Our root query field type. Allows us to run any query from our mutation payload. */
  query?: Maybe<Query>;
  /** The `Semester` that was deleted by this mutation. */
  semester?: Maybe<Semester>;
  /** An edge for our `Semester`. May be used by Relay 1. */
  semesterEdge?: Maybe<SemestersEdge>;
};


/** The output of our delete `Semester` mutation. */
export type DeleteSemesterPayloadSemesterEdgeArgs = {
  orderBy?: InputMaybe<Array<SemestersOrderBy>>;
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
  /** Creates a single `Semester`. */
  createSemester?: Maybe<CreateSemesterPayload>;
  /** Creates a single `SonarrSery`. */
  createSonarrSery?: Maybe<CreateSonarrSeryPayload>;
  /** Deletes a single `AnimeMetadatum` using its globally unique id. */
  deleteAnimeMetadatum?: Maybe<DeleteAnimeMetadatumPayload>;
  /** Deletes a single `AnimeMetadatum` using a unique key. */
  deleteAnimeMetadatumById?: Maybe<DeleteAnimeMetadatumPayload>;
  /** Deletes a single `Semester` using its globally unique id. */
  deleteSemester?: Maybe<DeleteSemesterPayload>;
  /** Deletes a single `Semester` using a unique key. */
  deleteSemesterById?: Maybe<DeleteSemesterPayload>;
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
  /** Updates a single `Semester` using its globally unique id and a patch. */
  updateSemester?: Maybe<UpdateSemesterPayload>;
  /** Updates a single `Semester` using a unique key and a patch. */
  updateSemesterById?: Maybe<UpdateSemesterPayload>;
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
export type MutationCreateSemesterArgs = {
  input: CreateSemesterInput;
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
export type MutationDeleteSemesterArgs = {
  input: DeleteSemesterInput;
};


/** The root mutation type which contains root level fields which mutate data. */
export type MutationDeleteSemesterByIdArgs = {
  input: DeleteSemesterByIdInput;
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
export type MutationUpdateSemesterArgs = {
  input: UpdateSemesterInput;
};


/** The root mutation type which contains root level fields which mutate data. */
export type MutationUpdateSemesterByIdArgs = {
  input: UpdateSemesterByIdInput;
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
  /** Reads and enables pagination through a set of `Semester`. */
  allSemesters?: Maybe<SemestersConnection>;
  /** Reads and enables pagination through a set of `SonarrSery`. */
  allSonarrSeries?: Maybe<SonarrSeriesConnection>;
  /** Reads a single `AnimeMetadatum` using its globally unique `ID`. */
  animeMetadatum?: Maybe<AnimeMetadatum>;
  animeMetadatumById?: Maybe<AnimeMetadatum>;
  /** Fetches an object given its globally unique `ID`. */
  node?: Maybe<Node>;
  /** The root query type must be a `Node` to work well with Relay 1 mutations. This just resolves to `query`. */
  nodeId: Scalars['ID'];
  /**
   * Exposes the root query type nested one level down. This is helpful for Relay 1
   * which can only query top level fields if they are in a particular form.
   */
  query: Query;
  /** Reads a single `Semester` using its globally unique `ID`. */
  semester?: Maybe<Semester>;
  semesterById?: Maybe<Semester>;
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
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<AnimeMetadataOrderBy>>;
};


/** The root query type which gives access points into the data universe. */
export type QueryAllSemestersArgs = {
  after?: InputMaybe<Scalars['Cursor']>;
  before?: InputMaybe<Scalars['Cursor']>;
  condition?: InputMaybe<SemesterCondition>;
  filter?: InputMaybe<SemesterFilter>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<SemestersOrderBy>>;
};


/** The root query type which gives access points into the data universe. */
export type QueryAllSonarrSeriesArgs = {
  after?: InputMaybe<Scalars['Cursor']>;
  before?: InputMaybe<Scalars['Cursor']>;
  condition?: InputMaybe<SonarrSeryCondition>;
  filter?: InputMaybe<SonarrSeryFilter>;
  first?: InputMaybe<Scalars['Int']>;
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
export type QueryNodeArgs = {
  nodeId: Scalars['ID'];
};


/** The root query type which gives access points into the data universe. */
export type QuerySemesterArgs = {
  nodeId: Scalars['ID'];
};


/** The root query type which gives access points into the data universe. */
export type QuerySemesterByIdArgs = {
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

export type Semester = Node & {
  __typename?: 'Semester';
  /** Reads and enables pagination through a set of `AnimeMetadatum`. */
  animeMetadataBySemester: AnimeMetadataConnection;
  id: Scalars['Int'];
  /** A globally unique identifier. Can be used in various places throughout the system to identify this single value. */
  nodeId: Scalars['ID'];
  season: SeasonEnum;
  year: Scalars['Int'];
};


export type SemesterAnimeMetadataBySemesterArgs = {
  after?: InputMaybe<Scalars['Cursor']>;
  before?: InputMaybe<Scalars['Cursor']>;
  condition?: InputMaybe<AnimeMetadatumCondition>;
  filter?: InputMaybe<AnimeMetadatumFilter>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<AnimeMetadataOrderBy>>;
};

/**
 * A condition to be used against `Semester` object types. All fields are tested
 * for equality and combined with a logical ‘and.’
 */
export type SemesterCondition = {
  /** Checks for equality with the object’s `id` field. */
  id?: InputMaybe<Scalars['Int']>;
  /** Checks for equality with the object’s `season` field. */
  season?: InputMaybe<SeasonEnum>;
  /** Checks for equality with the object’s `year` field. */
  year?: InputMaybe<Scalars['Int']>;
};

/** A filter to be used against `Semester` object types. All fields are combined with a logical ‘and.’ */
export type SemesterFilter = {
  /** Checks for all expressions in this list. */
  and?: InputMaybe<Array<SemesterFilter>>;
  /** Filter by the object’s `id` field. */
  id?: InputMaybe<IntFilter>;
  /** Negates the expression. */
  not?: InputMaybe<SemesterFilter>;
  /** Checks for any expressions in this list. */
  or?: InputMaybe<Array<SemesterFilter>>;
  /** Filter by the object’s `season` field. */
  season?: InputMaybe<SeasonEnumFilter>;
  /** Filter by the object’s `year` field. */
  year?: InputMaybe<IntFilter>;
};

/** An input for mutations affecting `Semester` */
export type SemesterInput = {
  id?: InputMaybe<Scalars['Int']>;
  season: SeasonEnum;
  year: Scalars['Int'];
};

/** Represents an update to a `Semester`. Fields that are set will be updated. */
export type SemesterPatch = {
  id?: InputMaybe<Scalars['Int']>;
  season?: InputMaybe<SeasonEnum>;
  year?: InputMaybe<Scalars['Int']>;
};

/** A connection to a list of `Semester` values. */
export type SemestersConnection = {
  __typename?: 'SemestersConnection';
  /** A list of edges which contains the `Semester` and cursor to aid in pagination. */
  edges: Array<SemestersEdge>;
  /** A list of `Semester` objects. */
  nodes: Array<Maybe<Semester>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** The count of *all* `Semester` you could get from the connection. */
  totalCount: Scalars['Int'];
};

/** A `Semester` edge in the connection. */
export type SemestersEdge = {
  __typename?: 'SemestersEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']>;
  /** The `Semester` at the end of the edge. */
  node?: Maybe<Semester>;
};

/** Methods to use when ordering `Semester`. */
export enum SemestersOrderBy {
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  Natural = 'NATURAL',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  SeasonAsc = 'SEASON_ASC',
  SeasonDesc = 'SEASON_DESC',
  YearAsc = 'YEAR_ASC',
  YearDesc = 'YEAR_DESC'
}

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
  sonarrId: Scalars['Int'];
  sonarrSlug: Scalars['String'];
  tvdbid: Scalars['Int'];
};

/** Represents an update to a `SonarrSery`. Fields that are set will be updated. */
export type SonarrSeryPatch = {
  id?: InputMaybe<Scalars['Int']>;
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
  /** Reads a single `Semester` that is related to this `AnimeMetadatum`. */
  semesterBySemester?: Maybe<Semester>;
  /** Reads a single `SonarrSery` that is related to this `AnimeMetadatum`. */
  sonarrSeryBySonarrSeries?: Maybe<SonarrSery>;
};


/** The output of our update `AnimeMetadatum` mutation. */
export type UpdateAnimeMetadatumPayloadAnimeMetadatumEdgeArgs = {
  orderBy?: InputMaybe<Array<AnimeMetadataOrderBy>>;
};

/** All input for the `updateSemesterById` mutation. */
export type UpdateSemesterByIdInput = {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']>;
  id: Scalars['Int'];
  /** An object where the defined keys will be set on the `Semester` being updated. */
  semesterPatch: SemesterPatch;
};

/** All input for the `updateSemester` mutation. */
export type UpdateSemesterInput = {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** The globally unique `ID` which will identify a single `Semester` to be updated. */
  nodeId: Scalars['ID'];
  /** An object where the defined keys will be set on the `Semester` being updated. */
  semesterPatch: SemesterPatch;
};

/** The output of our update `Semester` mutation. */
export type UpdateSemesterPayload = {
  __typename?: 'UpdateSemesterPayload';
  /**
   * The exact same `clientMutationId` that was provided in the mutation input,
   * unchanged and unused. May be used by a client to track mutations.
   */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Our root query field type. Allows us to run any query from our mutation payload. */
  query?: Maybe<Query>;
  /** The `Semester` that was updated by this mutation. */
  semester?: Maybe<Semester>;
  /** An edge for our `Semester`. May be used by Relay 1. */
  semesterEdge?: Maybe<SemestersEdge>;
};


/** The output of our update `Semester` mutation. */
export type UpdateSemesterPayloadSemesterEdgeArgs = {
  orderBy?: InputMaybe<Array<SemestersOrderBy>>;
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

export type GetAnimeListQueryVariables = Exact<{
  count?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<AnimeMetadataOrderBy> | AnimeMetadataOrderBy>;
  filter?: InputMaybe<AnimeMetadatumFilter>;
}>;


export type GetAnimeListQuery = { __typename?: 'Query', allAnimeMetadata?: { __typename?: 'AnimeMetadataConnection', totalCount: number, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean }, edges: Array<{ __typename?: 'AnimeMetadataEdge', cursor?: any | null | undefined, node?: { __typename?: 'AnimeMetadatum', bamgumiId?: number | null | undefined, bilibiliMainlandSsid?: number | null | undefined, bilibiliThmSsid?: number | null | undefined, jellyfinSeasonId?: string | null | undefined, mikanAnimeId?: number | null | undefined, nodeId: string, sonarrSeason?: number | null | undefined, uniformName: string, semesterBySemester?: { __typename?: 'Semester', season: SeasonEnum, year: number } | null | undefined, sonarrSeryBySonarrSeries?: { __typename?: 'SonarrSery', sonarrId: number, sonarrSlug: string, tvdbid: number } | null | undefined } | null | undefined }> } | null | undefined };


export const GetAnimeListDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetAnimeList"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"count"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"offset"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orderBy"}},"type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AnimeMetadataOrderBy"}}}},"defaultValue":{"kind":"ListValue","values":[]}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"AnimeMetadatumFilter"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"allAnimeMetadata"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"count"}}},{"kind":"Argument","name":{"kind":"Name","value":"offset"},"value":{"kind":"Variable","name":{"kind":"Name","value":"offset"}}},{"kind":"Argument","name":{"kind":"Name","value":"orderBy"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orderBy"}}},{"kind":"Argument","name":{"kind":"Name","value":"condition"},"value":{"kind":"ObjectValue","fields":[]}},{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filter"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cursor"}},{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"bamgumiId"}},{"kind":"Field","name":{"kind":"Name","value":"bilibiliMainlandSsid"}},{"kind":"Field","name":{"kind":"Name","value":"bilibiliThmSsid"}},{"kind":"Field","name":{"kind":"Name","value":"jellyfinSeasonId"}},{"kind":"Field","name":{"kind":"Name","value":"mikanAnimeId"}},{"kind":"Field","name":{"kind":"Name","value":"nodeId"}},{"kind":"Field","name":{"kind":"Name","value":"semesterBySemester"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"season"}},{"kind":"Field","name":{"kind":"Name","value":"year"}}]}},{"kind":"Field","name":{"kind":"Name","value":"sonarrSeason"}},{"kind":"Field","name":{"kind":"Name","value":"sonarrSeryBySonarrSeries"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sonarrId"}},{"kind":"Field","name":{"kind":"Name","value":"sonarrSlug"}},{"kind":"Field","name":{"kind":"Name","value":"tvdbid"}}]}},{"kind":"Field","name":{"kind":"Name","value":"uniformName"}}]}}]}}]}}]}}]} as unknown as DocumentNode<GetAnimeListQuery, GetAnimeListQueryVariables>;
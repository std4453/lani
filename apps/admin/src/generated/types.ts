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

/** All input for the create `DownloadJob` mutation. */
export type CreateDownloadJobInput = {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** The `DownloadJob` to be created by this mutation. */
  downloadJob: DownloadJobInput;
};

/** The output of our create `DownloadJob` mutation. */
export type CreateDownloadJobPayload = {
  __typename?: 'CreateDownloadJobPayload';
  /**
   * The exact same `clientMutationId` that was provided in the mutation input,
   * unchanged and unused. May be used by a client to track mutations.
   */
  clientMutationId?: Maybe<Scalars['String']>;
  /** The `DownloadJob` that was created by this mutation. */
  downloadJob?: Maybe<DownloadJob>;
  /** An edge for our `DownloadJob`. May be used by Relay 1. */
  downloadJobEdge?: Maybe<DownloadJobsEdge>;
  /** Reads a single `Episode` that is related to this `DownloadJob`. */
  episodeByEpisodeId?: Maybe<Episode>;
  /** Our root query field type. Allows us to run any query from our mutation payload. */
  query?: Maybe<Query>;
};


/** The output of our create `DownloadJob` mutation. */
export type CreateDownloadJobPayloadDownloadJobEdgeArgs = {
  orderBy?: InputMaybe<Array<DownloadJobsOrderBy>>;
};

/** All input for the create `DownloadSource` mutation. */
export type CreateDownloadSourceInput = {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** The `DownloadSource` to be created by this mutation. */
  downloadSource: DownloadSourceInput;
};

/** The output of our create `DownloadSource` mutation. */
export type CreateDownloadSourcePayload = {
  __typename?: 'CreateDownloadSourcePayload';
  /**
   * The exact same `clientMutationId` that was provided in the mutation input,
   * unchanged and unused. May be used by a client to track mutations.
   */
  clientMutationId?: Maybe<Scalars['String']>;
  /** The `DownloadSource` that was created by this mutation. */
  downloadSource?: Maybe<DownloadSource>;
  /** An edge for our `DownloadSource`. May be used by Relay 1. */
  downloadSourceEdge?: Maybe<DownloadSourcesEdge>;
  /** Our root query field type. Allows us to run any query from our mutation payload. */
  query?: Maybe<Query>;
  /** Reads a single `Season` that is related to this `DownloadSource`. */
  seasonBySeasonId?: Maybe<Season>;
};


/** The output of our create `DownloadSource` mutation. */
export type CreateDownloadSourcePayloadDownloadSourceEdgeArgs = {
  orderBy?: InputMaybe<Array<DownloadSourcesOrderBy>>;
};

/** All input for the create `Episode` mutation. */
export type CreateEpisodeInput = {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** The `Episode` to be created by this mutation. */
  episode: EpisodeInput;
};

/** The output of our create `Episode` mutation. */
export type CreateEpisodePayload = {
  __typename?: 'CreateEpisodePayload';
  /**
   * The exact same `clientMutationId` that was provided in the mutation input,
   * unchanged and unused. May be used by a client to track mutations.
   */
  clientMutationId?: Maybe<Scalars['String']>;
  /** The `Episode` that was created by this mutation. */
  episode?: Maybe<Episode>;
  /** An edge for our `Episode`. May be used by Relay 1. */
  episodeEdge?: Maybe<EpisodesEdge>;
  /** Our root query field type. Allows us to run any query from our mutation payload. */
  query?: Maybe<Query>;
  /** Reads a single `Season` that is related to this `Episode`. */
  seasonBySeasonId?: Maybe<Season>;
};


/** The output of our create `Episode` mutation. */
export type CreateEpisodePayloadEpisodeEdgeArgs = {
  orderBy?: InputMaybe<Array<EpisodesOrderBy>>;
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

/** All input for the create `JellyfinFolder` mutation. */
export type CreateJellyfinFolderInput = {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** The `JellyfinFolder` to be created by this mutation. */
  jellyfinFolder: JellyfinFolderInput;
};

/** The output of our create `JellyfinFolder` mutation. */
export type CreateJellyfinFolderPayload = {
  __typename?: 'CreateJellyfinFolderPayload';
  /**
   * The exact same `clientMutationId` that was provided in the mutation input,
   * unchanged and unused. May be used by a client to track mutations.
   */
  clientMutationId?: Maybe<Scalars['String']>;
  /** The `JellyfinFolder` that was created by this mutation. */
  jellyfinFolder?: Maybe<JellyfinFolder>;
  /** An edge for our `JellyfinFolder`. May be used by Relay 1. */
  jellyfinFolderEdge?: Maybe<JellyfinFoldersEdge>;
  /** Our root query field type. Allows us to run any query from our mutation payload. */
  query?: Maybe<Query>;
};


/** The output of our create `JellyfinFolder` mutation. */
export type CreateJellyfinFolderPayloadJellyfinFolderEdgeArgs = {
  orderBy?: InputMaybe<Array<JellyfinFoldersOrderBy>>;
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

/** All input for the create `Torrent` mutation. */
export type CreateTorrentInput = {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** The `Torrent` to be created by this mutation. */
  torrent: TorrentInput;
};

/** The output of our create `Torrent` mutation. */
export type CreateTorrentPayload = {
  __typename?: 'CreateTorrentPayload';
  /**
   * The exact same `clientMutationId` that was provided in the mutation input,
   * unchanged and unused. May be used by a client to track mutations.
   */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Our root query field type. Allows us to run any query from our mutation payload. */
  query?: Maybe<Query>;
  /** The `Torrent` that was created by this mutation. */
  torrent?: Maybe<Torrent>;
  /** An edge for our `Torrent`. May be used by Relay 1. */
  torrentEdge?: Maybe<TorrentsEdge>;
};


/** The output of our create `Torrent` mutation. */
export type CreateTorrentPayloadTorrentEdgeArgs = {
  orderBy?: InputMaybe<Array<TorrentsOrderBy>>;
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

/** All input for the `deleteDownloadJobById` mutation. */
export type DeleteDownloadJobByIdInput = {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']>;
  id: Scalars['Int'];
};

/** All input for the `deleteDownloadJob` mutation. */
export type DeleteDownloadJobInput = {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** The globally unique `ID` which will identify a single `DownloadJob` to be deleted. */
  nodeId: Scalars['ID'];
};

/** The output of our delete `DownloadJob` mutation. */
export type DeleteDownloadJobPayload = {
  __typename?: 'DeleteDownloadJobPayload';
  /**
   * The exact same `clientMutationId` that was provided in the mutation input,
   * unchanged and unused. May be used by a client to track mutations.
   */
  clientMutationId?: Maybe<Scalars['String']>;
  deletedDownloadJobId?: Maybe<Scalars['ID']>;
  /** The `DownloadJob` that was deleted by this mutation. */
  downloadJob?: Maybe<DownloadJob>;
  /** An edge for our `DownloadJob`. May be used by Relay 1. */
  downloadJobEdge?: Maybe<DownloadJobsEdge>;
  /** Reads a single `Episode` that is related to this `DownloadJob`. */
  episodeByEpisodeId?: Maybe<Episode>;
  /** Our root query field type. Allows us to run any query from our mutation payload. */
  query?: Maybe<Query>;
};


/** The output of our delete `DownloadJob` mutation. */
export type DeleteDownloadJobPayloadDownloadJobEdgeArgs = {
  orderBy?: InputMaybe<Array<DownloadJobsOrderBy>>;
};

/** All input for the `deleteDownloadSourceById` mutation. */
export type DeleteDownloadSourceByIdInput = {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']>;
  id: Scalars['Int'];
};

/** All input for the `deleteDownloadSourceByPattern` mutation. */
export type DeleteDownloadSourceByPatternInput = {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']>;
  pattern: Scalars['String'];
};

/** All input for the `deleteDownloadSource` mutation. */
export type DeleteDownloadSourceInput = {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** The globally unique `ID` which will identify a single `DownloadSource` to be deleted. */
  nodeId: Scalars['ID'];
};

/** The output of our delete `DownloadSource` mutation. */
export type DeleteDownloadSourcePayload = {
  __typename?: 'DeleteDownloadSourcePayload';
  /**
   * The exact same `clientMutationId` that was provided in the mutation input,
   * unchanged and unused. May be used by a client to track mutations.
   */
  clientMutationId?: Maybe<Scalars['String']>;
  deletedDownloadSourceId?: Maybe<Scalars['ID']>;
  /** The `DownloadSource` that was deleted by this mutation. */
  downloadSource?: Maybe<DownloadSource>;
  /** An edge for our `DownloadSource`. May be used by Relay 1. */
  downloadSourceEdge?: Maybe<DownloadSourcesEdge>;
  /** Our root query field type. Allows us to run any query from our mutation payload. */
  query?: Maybe<Query>;
  /** Reads a single `Season` that is related to this `DownloadSource`. */
  seasonBySeasonId?: Maybe<Season>;
};


/** The output of our delete `DownloadSource` mutation. */
export type DeleteDownloadSourcePayloadDownloadSourceEdgeArgs = {
  orderBy?: InputMaybe<Array<DownloadSourcesOrderBy>>;
};

/** All input for the `deleteEpisodeById` mutation. */
export type DeleteEpisodeByIdInput = {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']>;
  id: Scalars['Int'];
};

/** All input for the `deleteEpisodeBySeasonIdAndIndex` mutation. */
export type DeleteEpisodeBySeasonIdAndIndexInput = {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']>;
  index: Scalars['Int'];
  seasonId: Scalars['Int'];
};

/** All input for the `deleteEpisode` mutation. */
export type DeleteEpisodeInput = {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** The globally unique `ID` which will identify a single `Episode` to be deleted. */
  nodeId: Scalars['ID'];
};

/** The output of our delete `Episode` mutation. */
export type DeleteEpisodePayload = {
  __typename?: 'DeleteEpisodePayload';
  /**
   * The exact same `clientMutationId` that was provided in the mutation input,
   * unchanged and unused. May be used by a client to track mutations.
   */
  clientMutationId?: Maybe<Scalars['String']>;
  deletedEpisodeId?: Maybe<Scalars['ID']>;
  /** The `Episode` that was deleted by this mutation. */
  episode?: Maybe<Episode>;
  /** An edge for our `Episode`. May be used by Relay 1. */
  episodeEdge?: Maybe<EpisodesEdge>;
  /** Our root query field type. Allows us to run any query from our mutation payload. */
  query?: Maybe<Query>;
  /** Reads a single `Season` that is related to this `Episode`. */
  seasonBySeasonId?: Maybe<Season>;
};


/** The output of our delete `Episode` mutation. */
export type DeleteEpisodePayloadEpisodeEdgeArgs = {
  orderBy?: InputMaybe<Array<EpisodesOrderBy>>;
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

/** All input for the `deleteJellyfinFolderById` mutation. */
export type DeleteJellyfinFolderByIdInput = {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']>;
  id: Scalars['Int'];
};

/** All input for the `deleteJellyfinFolderByJellyfinId` mutation. */
export type DeleteJellyfinFolderByJellyfinIdInput = {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']>;
  jellyfinId: Scalars['String'];
};

/** All input for the `deleteJellyfinFolder` mutation. */
export type DeleteJellyfinFolderInput = {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** The globally unique `ID` which will identify a single `JellyfinFolder` to be deleted. */
  nodeId: Scalars['ID'];
};

/** The output of our delete `JellyfinFolder` mutation. */
export type DeleteJellyfinFolderPayload = {
  __typename?: 'DeleteJellyfinFolderPayload';
  /**
   * The exact same `clientMutationId` that was provided in the mutation input,
   * unchanged and unused. May be used by a client to track mutations.
   */
  clientMutationId?: Maybe<Scalars['String']>;
  deletedJellyfinFolderId?: Maybe<Scalars['ID']>;
  /** The `JellyfinFolder` that was deleted by this mutation. */
  jellyfinFolder?: Maybe<JellyfinFolder>;
  /** An edge for our `JellyfinFolder`. May be used by Relay 1. */
  jellyfinFolderEdge?: Maybe<JellyfinFoldersEdge>;
  /** Our root query field type. Allows us to run any query from our mutation payload. */
  query?: Maybe<Query>;
};


/** The output of our delete `JellyfinFolder` mutation. */
export type DeleteJellyfinFolderPayloadJellyfinFolderEdgeArgs = {
  orderBy?: InputMaybe<Array<JellyfinFoldersOrderBy>>;
};

/** All input for the `deleteSeasonById` mutation. */
export type DeleteSeasonByIdInput = {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']>;
  id: Scalars['Int'];
};

/** All input for the `deleteSeasonByTitle` mutation. */
export type DeleteSeasonByTitleInput = {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']>;
  title: Scalars['String'];
};

/** All input for the `deleteSeason` mutation. */
export type DeleteSeasonInput = {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** The globally unique `ID` which will identify a single `Season` to be deleted. */
  nodeId: Scalars['ID'];
};

/** The output of our delete `Season` mutation. */
export type DeleteSeasonPayload = {
  __typename?: 'DeleteSeasonPayload';
  /**
   * The exact same `clientMutationId` that was provided in the mutation input,
   * unchanged and unused. May be used by a client to track mutations.
   */
  clientMutationId?: Maybe<Scalars['String']>;
  deletedSeasonId?: Maybe<Scalars['ID']>;
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
  /** The `Season` that was deleted by this mutation. */
  season?: Maybe<Season>;
  /** An edge for our `Season`. May be used by Relay 1. */
  seasonEdge?: Maybe<SeasonsEdge>;
};


/** The output of our delete `Season` mutation. */
export type DeleteSeasonPayloadSeasonEdgeArgs = {
  orderBy?: InputMaybe<Array<SeasonsOrderBy>>;
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
  /** The `Torrent` that was deleted by this mutation. */
  torrent?: Maybe<Torrent>;
  /** An edge for our `Torrent`. May be used by Relay 1. */
  torrentEdge?: Maybe<TorrentsEdge>;
};


/** The output of our delete `Torrent` mutation. */
export type DeleteTorrentPayloadTorrentEdgeArgs = {
  orderBy?: InputMaybe<Array<TorrentsOrderBy>>;
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

/** An input for mutations affecting `DownloadJob` */
export type DownloadJobInput = {
  cancelledAt?: InputMaybe<Scalars['Datetime']>;
  createdAt?: InputMaybe<Scalars['Datetime']>;
  /**
   * Only available after torrent finished downloading.
   * This is the save_path from qbt, which might be a directory.
   * If job is started after this step, this field will also be null.
   */
  downloadPath?: InputMaybe<Scalars['String']>;
  episodeId: Scalars['Int'];
  failedAt?: InputMaybe<Scalars['Datetime']>;
  failedReason?: InputMaybe<Scalars['String']>;
  /**
   * Available after file is imported (hard-linked) (and torrent is deleted from qbt).
   * The value is path to the video file, with the extension.
   */
  filePath?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['Int']>;
  importPath?: InputMaybe<Scalars['String']>;
  isCancelled?: InputMaybe<Scalars['Boolean']>;
  isFailed?: InputMaybe<Scalars['Boolean']>;
  jellyfinEpisodeId?: InputMaybe<Scalars['String']>;
  nfoPath?: InputMaybe<Scalars['String']>;
  qbtLastSync?: InputMaybe<Scalars['Datetime']>;
  /**
   * Available as soon as torrent has been submitted to qbt.
   * This hash is used to query qbt, and might differ from torrents.hash
   * If job is started after this step, this field will be null.
   */
  qbtTorrentHash?: InputMaybe<Scalars['String']>;
  status: DownloadStatus;
  torrentLink?: InputMaybe<Scalars['String']>;
};

/** Represents an update to a `DownloadJob`. Fields that are set will be updated. */
export type DownloadJobPatch = {
  cancelledAt?: InputMaybe<Scalars['Datetime']>;
  createdAt?: InputMaybe<Scalars['Datetime']>;
  /**
   * Only available after torrent finished downloading.
   * This is the save_path from qbt, which might be a directory.
   * If job is started after this step, this field will also be null.
   */
  downloadPath?: InputMaybe<Scalars['String']>;
  episodeId?: InputMaybe<Scalars['Int']>;
  failedAt?: InputMaybe<Scalars['Datetime']>;
  failedReason?: InputMaybe<Scalars['String']>;
  /**
   * Available after file is imported (hard-linked) (and torrent is deleted from qbt).
   * The value is path to the video file, with the extension.
   */
  filePath?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['Int']>;
  importPath?: InputMaybe<Scalars['String']>;
  isCancelled?: InputMaybe<Scalars['Boolean']>;
  isFailed?: InputMaybe<Scalars['Boolean']>;
  jellyfinEpisodeId?: InputMaybe<Scalars['String']>;
  nfoPath?: InputMaybe<Scalars['String']>;
  qbtLastSync?: InputMaybe<Scalars['Datetime']>;
  /**
   * Available as soon as torrent has been submitted to qbt.
   * This hash is used to query qbt, and might differ from torrents.hash
   * If job is started after this step, this field will be null.
   */
  qbtTorrentHash?: InputMaybe<Scalars['String']>;
  status?: InputMaybe<DownloadStatus>;
  torrentLink?: InputMaybe<Scalars['String']>;
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
  archivedAt?: Maybe<Scalars['Datetime']>;
  createdAt: Scalars['Datetime'];
  groupId: Scalars['String'];
  id: Scalars['Int'];
  isArchived: Scalars['Boolean'];
  isDisabled: Scalars['Boolean'];
  /** A globally unique identifier. Can be used in various places throughout the system to identify this single value. */
  nodeId: Scalars['ID'];
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
  /** Checks for equality with the object’s `archivedAt` field. */
  archivedAt?: InputMaybe<Scalars['Datetime']>;
  /** Checks for equality with the object’s `createdAt` field. */
  createdAt?: InputMaybe<Scalars['Datetime']>;
  /** Checks for equality with the object’s `groupId` field. */
  groupId?: InputMaybe<Scalars['String']>;
  /** Checks for equality with the object’s `id` field. */
  id?: InputMaybe<Scalars['Int']>;
  /** Checks for equality with the object’s `isArchived` field. */
  isArchived?: InputMaybe<Scalars['Boolean']>;
  /** Checks for equality with the object’s `isDisabled` field. */
  isDisabled?: InputMaybe<Scalars['Boolean']>;
  /** Checks for equality with the object’s `pattern` field. */
  pattern?: InputMaybe<Scalars['String']>;
  /** Checks for equality with the object’s `seasonId` field. */
  seasonId?: InputMaybe<Scalars['Int']>;
};

/** A filter to be used against `DownloadSource` object types. All fields are combined with a logical ‘and.’ */
export type DownloadSourceFilter = {
  /** Checks for all expressions in this list. */
  and?: InputMaybe<Array<DownloadSourceFilter>>;
  /** Filter by the object’s `archivedAt` field. */
  archivedAt?: InputMaybe<DatetimeFilter>;
  /** Filter by the object’s `createdAt` field. */
  createdAt?: InputMaybe<DatetimeFilter>;
  /** Filter by the object’s `groupId` field. */
  groupId?: InputMaybe<StringFilter>;
  /** Filter by the object’s `id` field. */
  id?: InputMaybe<IntFilter>;
  /** Filter by the object’s `isArchived` field. */
  isArchived?: InputMaybe<BooleanFilter>;
  /** Filter by the object’s `isDisabled` field. */
  isDisabled?: InputMaybe<BooleanFilter>;
  /** Negates the expression. */
  not?: InputMaybe<DownloadSourceFilter>;
  /** Checks for any expressions in this list. */
  or?: InputMaybe<Array<DownloadSourceFilter>>;
  /** Filter by the object’s `pattern` field. */
  pattern?: InputMaybe<StringFilter>;
  /** Filter by the object’s `seasonId` field. */
  seasonId?: InputMaybe<IntFilter>;
};

/** An input for mutations affecting `DownloadSource` */
export type DownloadSourceInput = {
  archivedAt?: InputMaybe<Scalars['Datetime']>;
  createdAt?: InputMaybe<Scalars['Datetime']>;
  groupId?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['Int']>;
  isArchived?: InputMaybe<Scalars['Boolean']>;
  isDisabled?: InputMaybe<Scalars['Boolean']>;
  pattern?: InputMaybe<Scalars['String']>;
  seasonId: Scalars['Int'];
};

/** Represents an update to a `DownloadSource`. Fields that are set will be updated. */
export type DownloadSourcePatch = {
  archivedAt?: InputMaybe<Scalars['Datetime']>;
  createdAt?: InputMaybe<Scalars['Datetime']>;
  groupId?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['Int']>;
  isArchived?: InputMaybe<Scalars['Boolean']>;
  isDisabled?: InputMaybe<Scalars['Boolean']>;
  pattern?: InputMaybe<Scalars['String']>;
  seasonId?: InputMaybe<Scalars['Int']>;
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
  pattern: Scalars['String'];
};

/** Methods to use when ordering `DownloadSource`. */
export enum DownloadSourcesOrderBy {
  ArchivedAtAsc = 'ARCHIVED_AT_ASC',
  ArchivedAtDesc = 'ARCHIVED_AT_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
  GroupIdAsc = 'GROUP_ID_ASC',
  GroupIdDesc = 'GROUP_ID_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  IsArchivedAsc = 'IS_ARCHIVED_ASC',
  IsArchivedDesc = 'IS_ARCHIVED_DESC',
  IsDisabledAsc = 'IS_DISABLED_ASC',
  IsDisabledDesc = 'IS_DISABLED_DESC',
  Natural = 'NATURAL',
  PatternAsc = 'PATTERN_ASC',
  PatternDesc = 'PATTERN_DESC',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
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
  /** Filter by the object’s `id` field. */
  id?: InputMaybe<IntFilter>;
  /** Filter by the object’s `index` field. */
  index?: InputMaybe<IntFilter>;
  /** Filter by the object’s `jellyfinEpisodeId` field. */
  jellyfinEpisodeId?: InputMaybe<StringFilter>;
  /** Negates the expression. */
  not?: InputMaybe<EpisodeFilter>;
  /** Checks for any expressions in this list. */
  or?: InputMaybe<Array<EpisodeFilter>>;
  /** Filter by the object’s `seasonId` field. */
  seasonId?: InputMaybe<IntFilter>;
  /** Filter by the object’s `title` field. */
  title?: InputMaybe<StringFilter>;
};

/** An input for mutations affecting `Episode` */
export type EpisodeInput = {
  airTime?: InputMaybe<Scalars['Datetime']>;
  createdAt?: InputMaybe<Scalars['Datetime']>;
  description?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['Int']>;
  index: Scalars['Int'];
  jellyfinEpisodeId?: InputMaybe<Scalars['String']>;
  seasonId: Scalars['Int'];
  title?: InputMaybe<Scalars['String']>;
};

/** Represents an update to a `Episode`. Fields that are set will be updated. */
export type EpisodePatch = {
  airTime?: InputMaybe<Scalars['Datetime']>;
  createdAt?: InputMaybe<Scalars['Datetime']>;
  description?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['Int']>;
  index?: InputMaybe<Scalars['Int']>;
  jellyfinEpisodeId?: InputMaybe<Scalars['String']>;
  seasonId?: InputMaybe<Scalars['Int']>;
  title?: InputMaybe<Scalars['String']>;
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
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  IndexAsc = 'INDEX_ASC',
  IndexDesc = 'INDEX_DESC',
  JellyfinEpisodeIdAsc = 'JELLYFIN_EPISODE_ID_ASC',
  JellyfinEpisodeIdDesc = 'JELLYFIN_EPISODE_ID_DESC',
  Natural = 'NATURAL',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
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
  cosPath?: Maybe<Scalars['String']>;
  downloadPath?: Maybe<Scalars['String']>;
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
  includeArchived?: InputMaybe<IncludeArchivedOption>;
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
  includeArchived?: InputMaybe<IncludeArchivedOption>;
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
  includeArchived?: InputMaybe<IncludeArchivedOption>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<SeasonsOrderBy>>;
};

/** A condition to be used against `Image` object types. All fields are tested for equality and combined with a logical ‘and.’ */
export type ImageCondition = {
  /** Checks for equality with the object’s `cosPath` field. */
  cosPath?: InputMaybe<Scalars['String']>;
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
  /** Filter by the object’s `id` field. */
  id?: InputMaybe<IntFilter>;
  /** Negates the expression. */
  not?: InputMaybe<ImageFilter>;
  /** Checks for any expressions in this list. */
  or?: InputMaybe<Array<ImageFilter>>;
  /** Filter by the object’s `sourceUrl` field. */
  sourceUrl?: InputMaybe<StringFilter>;
};

/** An input for mutations affecting `Image` */
export type ImageInput = {
  cosPath?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['Int']>;
  sourceUrl: Scalars['String'];
};

/** Represents an update to a `Image`. Fields that are set will be updated. */
export type ImagePatch = {
  cosPath?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['Int']>;
  sourceUrl?: InputMaybe<Scalars['String']>;
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
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  Natural = 'NATURAL',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  SourceUrlAsc = 'SOURCE_URL_ASC',
  SourceUrlDesc = 'SOURCE_URL_DESC'
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

export type JellyfinFolder = Node & {
  __typename?: 'JellyfinFolder';
  id: Scalars['Int'];
  jellyfinId: Scalars['String'];
  location: Scalars['String'];
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
  includeArchived?: InputMaybe<IncludeArchivedOption>;
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
};

/** An input for mutations affecting `JellyfinFolder` */
export type JellyfinFolderInput = {
  id?: InputMaybe<Scalars['Int']>;
  jellyfinId: Scalars['String'];
  location: Scalars['String'];
  name: Scalars['String'];
};

/** Represents an update to a `JellyfinFolder`. Fields that are set will be updated. */
export type JellyfinFolderPatch = {
  id?: InputMaybe<Scalars['Int']>;
  jellyfinId?: InputMaybe<Scalars['String']>;
  location?: InputMaybe<Scalars['String']>;
  name?: InputMaybe<Scalars['String']>;
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
  JellyfinIdAsc = 'JELLYFIN_ID_ASC',
  JellyfinIdDesc = 'JELLYFIN_ID_DESC',
  LocationAsc = 'LOCATION_ASC',
  LocationDesc = 'LOCATION_DESC',
  NameAsc = 'NAME_ASC',
  NameDesc = 'NAME_DESC',
  Natural = 'NATURAL',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC'
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
  /** Creates a single `DownloadJob`. */
  createDownloadJob?: Maybe<CreateDownloadJobPayload>;
  /** Creates a single `DownloadSource`. */
  createDownloadSource?: Maybe<CreateDownloadSourcePayload>;
  /** Creates a single `Episode`. */
  createEpisode?: Maybe<CreateEpisodePayload>;
  /** Creates a single `Image`. */
  createImage?: Maybe<CreateImagePayload>;
  /** Creates a single `JellyfinFolder`. */
  createJellyfinFolder?: Maybe<CreateJellyfinFolderPayload>;
  /** Creates a single `Season`. */
  createSeason?: Maybe<CreateSeasonPayload>;
  /** Creates a single `Torrent`. */
  createTorrent?: Maybe<CreateTorrentPayload>;
  /** Deletes a single `DownloadJob` using its globally unique id. */
  deleteDownloadJob?: Maybe<DeleteDownloadJobPayload>;
  /** Deletes a single `DownloadJob` using a unique key. */
  deleteDownloadJobById?: Maybe<DeleteDownloadJobPayload>;
  /** Deletes a single `DownloadSource` using its globally unique id. */
  deleteDownloadSource?: Maybe<DeleteDownloadSourcePayload>;
  /** Deletes a single `DownloadSource` using a unique key. */
  deleteDownloadSourceById?: Maybe<DeleteDownloadSourcePayload>;
  /** Deletes a single `DownloadSource` using a unique key. */
  deleteDownloadSourceByPattern?: Maybe<DeleteDownloadSourcePayload>;
  /** Deletes a single `Episode` using its globally unique id. */
  deleteEpisode?: Maybe<DeleteEpisodePayload>;
  /** Deletes a single `Episode` using a unique key. */
  deleteEpisodeById?: Maybe<DeleteEpisodePayload>;
  /** Deletes a single `Episode` using a unique key. */
  deleteEpisodeBySeasonIdAndIndex?: Maybe<DeleteEpisodePayload>;
  /** Deletes a single `Image` using its globally unique id. */
  deleteImage?: Maybe<DeleteImagePayload>;
  /** Deletes a single `Image` using a unique key. */
  deleteImageById?: Maybe<DeleteImagePayload>;
  /** Deletes a single `Image` using a unique key. */
  deleteImageBySourceUrl?: Maybe<DeleteImagePayload>;
  /** Deletes a single `JellyfinFolder` using its globally unique id. */
  deleteJellyfinFolder?: Maybe<DeleteJellyfinFolderPayload>;
  /** Deletes a single `JellyfinFolder` using a unique key. */
  deleteJellyfinFolderById?: Maybe<DeleteJellyfinFolderPayload>;
  /** Deletes a single `JellyfinFolder` using a unique key. */
  deleteJellyfinFolderByJellyfinId?: Maybe<DeleteJellyfinFolderPayload>;
  /** Deletes a single `Season` using its globally unique id. */
  deleteSeason?: Maybe<DeleteSeasonPayload>;
  /** Deletes a single `Season` using a unique key. */
  deleteSeasonById?: Maybe<DeleteSeasonPayload>;
  /** Deletes a single `Season` using a unique key. */
  deleteSeasonByTitle?: Maybe<DeleteSeasonPayload>;
  /** Deletes a single `Torrent` using its globally unique id. */
  deleteTorrent?: Maybe<DeleteTorrentPayload>;
  /** Deletes a single `Torrent` using a unique key. */
  deleteTorrentByHash?: Maybe<DeleteTorrentPayload>;
  /** Deletes a single `Torrent` using a unique key. */
  deleteTorrentById?: Maybe<DeleteTorrentPayload>;
  downloadTorrentForEpisode: Scalars['Int'];
  refreshAllDownloadStatus: Scalars['Int'];
  refreshAllPlayerWaitingStatus: Scalars['Int'];
  retryJobStep: Scalars['ID'];
  syncEpisodeData: Scalars['ID'];
  syncJellyfinFolders: Scalars['ID'];
  syncMetadata: Scalars['ID'];
  /** Returns newly added torrent count */
  syncMikan: Scalars['Int'];
  /** Updates a single `DownloadJob` using its globally unique id and a patch. */
  updateDownloadJob?: Maybe<UpdateDownloadJobPayload>;
  /** Updates a single `DownloadJob` using a unique key and a patch. */
  updateDownloadJobById?: Maybe<UpdateDownloadJobPayload>;
  /** Updates a single `DownloadSource` using its globally unique id and a patch. */
  updateDownloadSource?: Maybe<UpdateDownloadSourcePayload>;
  /** Updates a single `DownloadSource` using a unique key and a patch. */
  updateDownloadSourceById?: Maybe<UpdateDownloadSourcePayload>;
  /** Updates a single `DownloadSource` using a unique key and a patch. */
  updateDownloadSourceByPattern?: Maybe<UpdateDownloadSourcePayload>;
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
  /** Updates a single `Torrent` using its globally unique id and a patch. */
  updateTorrent?: Maybe<UpdateTorrentPayload>;
  /** Updates a single `Torrent` using a unique key and a patch. */
  updateTorrentByHash?: Maybe<UpdateTorrentPayload>;
  /** Updates a single `Torrent` using a unique key and a patch. */
  updateTorrentById?: Maybe<UpdateTorrentPayload>;
  writeMetadata: Scalars['ID'];
};


export type MutationCreateDownloadJobArgs = {
  input: CreateDownloadJobInput;
};


export type MutationCreateDownloadSourceArgs = {
  input: CreateDownloadSourceInput;
};


export type MutationCreateEpisodeArgs = {
  input: CreateEpisodeInput;
};


export type MutationCreateImageArgs = {
  input: CreateImageInput;
};


export type MutationCreateJellyfinFolderArgs = {
  input: CreateJellyfinFolderInput;
};


export type MutationCreateSeasonArgs = {
  input: CreateSeasonInput;
};


export type MutationCreateTorrentArgs = {
  input: CreateTorrentInput;
};


export type MutationDeleteDownloadJobArgs = {
  input: DeleteDownloadJobInput;
};


export type MutationDeleteDownloadJobByIdArgs = {
  input: DeleteDownloadJobByIdInput;
};


export type MutationDeleteDownloadSourceArgs = {
  input: DeleteDownloadSourceInput;
};


export type MutationDeleteDownloadSourceByIdArgs = {
  input: DeleteDownloadSourceByIdInput;
};


export type MutationDeleteDownloadSourceByPatternArgs = {
  input: DeleteDownloadSourceByPatternInput;
};


export type MutationDeleteEpisodeArgs = {
  input: DeleteEpisodeInput;
};


export type MutationDeleteEpisodeByIdArgs = {
  input: DeleteEpisodeByIdInput;
};


export type MutationDeleteEpisodeBySeasonIdAndIndexArgs = {
  input: DeleteEpisodeBySeasonIdAndIndexInput;
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


export type MutationDeleteJellyfinFolderArgs = {
  input: DeleteJellyfinFolderInput;
};


export type MutationDeleteJellyfinFolderByIdArgs = {
  input: DeleteJellyfinFolderByIdInput;
};


export type MutationDeleteJellyfinFolderByJellyfinIdArgs = {
  input: DeleteJellyfinFolderByJellyfinIdInput;
};


export type MutationDeleteSeasonArgs = {
  input: DeleteSeasonInput;
};


export type MutationDeleteSeasonByIdArgs = {
  input: DeleteSeasonByIdInput;
};


export type MutationDeleteSeasonByTitleArgs = {
  input: DeleteSeasonByTitleInput;
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


export type MutationDownloadTorrentForEpisodeArgs = {
  episodeId: Scalars['Int'];
  torrentLink: Scalars['String'];
};


export type MutationRetryJobStepArgs = {
  jobId: Scalars['Int'];
};


export type MutationSyncEpisodeDataArgs = {
  forced?: InputMaybe<Scalars['Boolean']>;
  seasonId: Scalars['Int'];
};


export type MutationSyncMetadataArgs = {
  seasonId: Scalars['Int'];
};


export type MutationUpdateDownloadJobArgs = {
  input: UpdateDownloadJobInput;
};


export type MutationUpdateDownloadJobByIdArgs = {
  input: UpdateDownloadJobByIdInput;
};


export type MutationUpdateDownloadSourceArgs = {
  input: UpdateDownloadSourceInput;
};


export type MutationUpdateDownloadSourceByIdArgs = {
  input: UpdateDownloadSourceByIdInput;
};


export type MutationUpdateDownloadSourceByPatternArgs = {
  input: UpdateDownloadSourceByPatternInput;
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


export type MutationUpdateTorrentArgs = {
  input: UpdateTorrentInput;
};


export type MutationUpdateTorrentByHashArgs = {
  input: UpdateTorrentByHashInput;
};


export type MutationUpdateTorrentByIdArgs = {
  input: UpdateTorrentByIdInput;
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
  /** Reads a single `DownloadJob` using its globally unique `ID`. */
  downloadJob?: Maybe<DownloadJob>;
  downloadJobById?: Maybe<DownloadJob>;
  /** Reads a single `DownloadSource` using its globally unique `ID`. */
  downloadSource?: Maybe<DownloadSource>;
  downloadSourceById?: Maybe<DownloadSource>;
  downloadSourceByPattern?: Maybe<DownloadSource>;
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
  includeArchived?: InputMaybe<IncludeArchivedOption>;
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
  includeArchived?: InputMaybe<IncludeArchivedOption>;
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
  archivedAt?: Maybe<Scalars['Datetime']>;
  bangumiId: Scalars['String'];
  bannerImageId?: Maybe<Scalars['Int']>;
  bilibiliMainlandId: Scalars['String'];
  bilibiliThmId: Scalars['String'];
  createdAt: Scalars['Datetime'];
  description: Scalars['String'];
  /** Reads and enables pagination through a set of `DownloadSource`. */
  downloadSourcesBySeasonId: DownloadSourcesConnection;
  /** Reads and enables pagination through a set of `Episode`. */
  episodesBySeasonId: EpisodesConnection;
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
  isArchived: Scalars['Boolean'];
  isMonitoring: Scalars['Boolean'];
  /** Reads a single `JellyfinFolder` that is related to this `Season`. */
  jellyfinFolderByJellyfinFolderId?: Maybe<JellyfinFolder>;
  jellyfinFolderId?: Maybe<Scalars['Int']>;
  jellyfinId: Scalars['String'];
  mikanAnimeId: Scalars['String'];
  /** A globally unique identifier. Can be used in various places throughout the system to identify this single value. */
  nodeId: Scalars['ID'];
  posterImageId?: Maybe<Scalars['Int']>;
  seasonRoot?: Maybe<Scalars['String']>;
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
  includeArchived?: InputMaybe<IncludeArchivedOption>;
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
  /** Checks for equality with the object’s `archivedAt` field. */
  archivedAt?: InputMaybe<Scalars['Datetime']>;
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
  /** Checks for equality with the object’s `episodesSource` field. */
  episodesSource?: InputMaybe<MetadataSource>;
  /** Checks for equality with the object’s `fanartImageId` field. */
  fanartImageId?: InputMaybe<Scalars['Int']>;
  /** Checks for equality with the object’s `id` field. */
  id?: InputMaybe<Scalars['Int']>;
  /** Checks for equality with the object’s `infoSource` field. */
  infoSource?: InputMaybe<MetadataSource>;
  /** Checks for equality with the object’s `isArchived` field. */
  isArchived?: InputMaybe<Scalars['Boolean']>;
  /** Checks for equality with the object’s `isMonitoring` field. */
  isMonitoring?: InputMaybe<Scalars['Boolean']>;
  /** Checks for equality with the object’s `jellyfinFolderId` field. */
  jellyfinFolderId?: InputMaybe<Scalars['Int']>;
  /** Checks for equality with the object’s `jellyfinId` field. */
  jellyfinId?: InputMaybe<Scalars['String']>;
  /** Checks for equality with the object’s `mikanAnimeId` field. */
  mikanAnimeId?: InputMaybe<Scalars['String']>;
  /** Checks for equality with the object’s `posterImageId` field. */
  posterImageId?: InputMaybe<Scalars['Int']>;
  /** Checks for equality with the object’s `seasonRoot` field. */
  seasonRoot?: InputMaybe<Scalars['String']>;
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
  /** Filter by the object’s `archivedAt` field. */
  archivedAt?: InputMaybe<DatetimeFilter>;
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
  /** Filter by the object’s `episodesSource` field. */
  episodesSource?: InputMaybe<MetadataSourceFilter>;
  /** Filter by the object’s `fanartImageId` field. */
  fanartImageId?: InputMaybe<IntFilter>;
  /** Filter by the object’s `id` field. */
  id?: InputMaybe<IntFilter>;
  /** Filter by the object’s `infoSource` field. */
  infoSource?: InputMaybe<MetadataSourceFilter>;
  /** Filter by the object’s `isArchived` field. */
  isArchived?: InputMaybe<BooleanFilter>;
  /** Filter by the object’s `isMonitoring` field. */
  isMonitoring?: InputMaybe<BooleanFilter>;
  /** Filter by the object’s `jellyfinFolderId` field. */
  jellyfinFolderId?: InputMaybe<IntFilter>;
  /** Filter by the object’s `jellyfinId` field. */
  jellyfinId?: InputMaybe<StringFilter>;
  /** Filter by the object’s `mikanAnimeId` field. */
  mikanAnimeId?: InputMaybe<StringFilter>;
  /** Negates the expression. */
  not?: InputMaybe<SeasonFilter>;
  /** Checks for any expressions in this list. */
  or?: InputMaybe<Array<SeasonFilter>>;
  /** Filter by the object’s `posterImageId` field. */
  posterImageId?: InputMaybe<IntFilter>;
  /** Filter by the object’s `seasonRoot` field. */
  seasonRoot?: InputMaybe<StringFilter>;
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
  archivedAt?: InputMaybe<Scalars['Datetime']>;
  bangumiId?: InputMaybe<Scalars['String']>;
  bannerImageId?: InputMaybe<Scalars['Int']>;
  bilibiliMainlandId?: InputMaybe<Scalars['String']>;
  bilibiliThmId?: InputMaybe<Scalars['String']>;
  createdAt?: InputMaybe<Scalars['Datetime']>;
  description?: InputMaybe<Scalars['String']>;
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
  isArchived?: InputMaybe<Scalars['Boolean']>;
  isMonitoring?: InputMaybe<Scalars['Boolean']>;
  jellyfinFolderId?: InputMaybe<Scalars['Int']>;
  jellyfinId?: InputMaybe<Scalars['String']>;
  mikanAnimeId?: InputMaybe<Scalars['String']>;
  posterImageId?: InputMaybe<Scalars['Int']>;
  seasonRoot?: InputMaybe<Scalars['String']>;
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

/** Represents an update to a `Season`. Fields that are set will be updated. */
export type SeasonPatch = {
  /** hh:mm air time, or null if unknown, hour can be up to 48, timezone always GMT+8 */
  airTime?: InputMaybe<Scalars['String']>;
  archivedAt?: InputMaybe<Scalars['Datetime']>;
  bangumiId?: InputMaybe<Scalars['String']>;
  bannerImageId?: InputMaybe<Scalars['Int']>;
  bilibiliMainlandId?: InputMaybe<Scalars['String']>;
  bilibiliThmId?: InputMaybe<Scalars['String']>;
  createdAt?: InputMaybe<Scalars['Datetime']>;
  description?: InputMaybe<Scalars['String']>;
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
  isArchived?: InputMaybe<Scalars['Boolean']>;
  isMonitoring?: InputMaybe<Scalars['Boolean']>;
  jellyfinFolderId?: InputMaybe<Scalars['Int']>;
  jellyfinId?: InputMaybe<Scalars['String']>;
  mikanAnimeId?: InputMaybe<Scalars['String']>;
  posterImageId?: InputMaybe<Scalars['Int']>;
  seasonRoot?: InputMaybe<Scalars['String']>;
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
  ArchivedAtAsc = 'ARCHIVED_AT_ASC',
  ArchivedAtDesc = 'ARCHIVED_AT_DESC',
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
  EpisodesSourceAsc = 'EPISODES_SOURCE_ASC',
  EpisodesSourceDesc = 'EPISODES_SOURCE_DESC',
  FanartImageIdAsc = 'FANART_IMAGE_ID_ASC',
  FanartImageIdDesc = 'FANART_IMAGE_ID_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  InfoSourceAsc = 'INFO_SOURCE_ASC',
  InfoSourceDesc = 'INFO_SOURCE_DESC',
  IsArchivedAsc = 'IS_ARCHIVED_ASC',
  IsArchivedDesc = 'IS_ARCHIVED_DESC',
  IsMonitoringAsc = 'IS_MONITORING_ASC',
  IsMonitoringDesc = 'IS_MONITORING_DESC',
  JellyfinFolderIdAsc = 'JELLYFIN_FOLDER_ID_ASC',
  JellyfinFolderIdDesc = 'JELLYFIN_FOLDER_ID_DESC',
  JellyfinIdAsc = 'JELLYFIN_ID_ASC',
  JellyfinIdDesc = 'JELLYFIN_ID_DESC',
  MikanAnimeIdAsc = 'MIKAN_ANIME_ID_ASC',
  MikanAnimeIdDesc = 'MIKAN_ANIME_ID_DESC',
  Natural = 'NATURAL',
  PosterImageIdAsc = 'POSTER_IMAGE_ID_ASC',
  PosterImageIdDesc = 'POSTER_IMAGE_ID_DESC',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  SeasonRootAsc = 'SEASON_ROOT_ASC',
  SeasonRootDesc = 'SEASON_ROOT_DESC',
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
  hash: Scalars['String'];
  id: Scalars['Int'];
  /** A globally unique identifier. Can be used in various places throughout the system to identify this single value. */
  nodeId: Scalars['ID'];
  publishDate: Scalars['Datetime'];
  size: Scalars['BigInt'];
  title: Scalars['String'];
  /** Link used to download */
  torrentLink: Scalars['String'];
};

/** A condition to be used against `Torrent` object types. All fields are tested for equality and combined with a logical ‘and.’ */
export type TorrentCondition = {
  /** Checks for equality with the object’s `createdAt` field. */
  createdAt?: InputMaybe<Scalars['Datetime']>;
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

/** A filter to be used against `Torrent` object types. All fields are combined with a logical ‘and.’ */
export type TorrentFilter = {
  /** Checks for all expressions in this list. */
  and?: InputMaybe<Array<TorrentFilter>>;
  /** Filter by the object’s `createdAt` field. */
  createdAt?: InputMaybe<DatetimeFilter>;
  /** Filter by the object’s `hash` field. */
  hash?: InputMaybe<StringFilter>;
  /** Filter by the object’s `id` field. */
  id?: InputMaybe<IntFilter>;
  /** Negates the expression. */
  not?: InputMaybe<TorrentFilter>;
  /** Checks for any expressions in this list. */
  or?: InputMaybe<Array<TorrentFilter>>;
  /** Filter by the object’s `publishDate` field. */
  publishDate?: InputMaybe<DatetimeFilter>;
  /** Filter by the object’s `size` field. */
  size?: InputMaybe<BigIntFilter>;
  /** Filter by the object’s `title` field. */
  title?: InputMaybe<StringFilter>;
  /** Filter by the object’s `torrentLink` field. */
  torrentLink?: InputMaybe<StringFilter>;
};

/** An input for mutations affecting `Torrent` */
export type TorrentInput = {
  createdAt?: InputMaybe<Scalars['Datetime']>;
  hash: Scalars['String'];
  id?: InputMaybe<Scalars['Int']>;
  publishDate: Scalars['Datetime'];
  size: Scalars['BigInt'];
  title: Scalars['String'];
  /** Link used to download */
  torrentLink: Scalars['String'];
};

/** Represents an update to a `Torrent`. Fields that are set will be updated. */
export type TorrentPatch = {
  createdAt?: InputMaybe<Scalars['Datetime']>;
  hash?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['Int']>;
  publishDate?: InputMaybe<Scalars['Datetime']>;
  size?: InputMaybe<Scalars['BigInt']>;
  title?: InputMaybe<Scalars['String']>;
  /** Link used to download */
  torrentLink?: InputMaybe<Scalars['String']>;
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

/** All input for the `updateDownloadJobById` mutation. */
export type UpdateDownloadJobByIdInput = {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** An object where the defined keys will be set on the `DownloadJob` being updated. */
  downloadJobPatch: DownloadJobPatch;
  id: Scalars['Int'];
};

/** All input for the `updateDownloadJob` mutation. */
export type UpdateDownloadJobInput = {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** An object where the defined keys will be set on the `DownloadJob` being updated. */
  downloadJobPatch: DownloadJobPatch;
  /** The globally unique `ID` which will identify a single `DownloadJob` to be updated. */
  nodeId: Scalars['ID'];
};

/** The output of our update `DownloadJob` mutation. */
export type UpdateDownloadJobPayload = {
  __typename?: 'UpdateDownloadJobPayload';
  /**
   * The exact same `clientMutationId` that was provided in the mutation input,
   * unchanged and unused. May be used by a client to track mutations.
   */
  clientMutationId?: Maybe<Scalars['String']>;
  /** The `DownloadJob` that was updated by this mutation. */
  downloadJob?: Maybe<DownloadJob>;
  /** An edge for our `DownloadJob`. May be used by Relay 1. */
  downloadJobEdge?: Maybe<DownloadJobsEdge>;
  /** Reads a single `Episode` that is related to this `DownloadJob`. */
  episodeByEpisodeId?: Maybe<Episode>;
  /** Our root query field type. Allows us to run any query from our mutation payload. */
  query?: Maybe<Query>;
};


/** The output of our update `DownloadJob` mutation. */
export type UpdateDownloadJobPayloadDownloadJobEdgeArgs = {
  orderBy?: InputMaybe<Array<DownloadJobsOrderBy>>;
};

/** All input for the `updateDownloadSourceById` mutation. */
export type UpdateDownloadSourceByIdInput = {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** An object where the defined keys will be set on the `DownloadSource` being updated. */
  downloadSourcePatch: DownloadSourcePatch;
  id: Scalars['Int'];
};

/** All input for the `updateDownloadSourceByPattern` mutation. */
export type UpdateDownloadSourceByPatternInput = {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** An object where the defined keys will be set on the `DownloadSource` being updated. */
  downloadSourcePatch: DownloadSourcePatch;
  pattern: Scalars['String'];
};

/** All input for the `updateDownloadSource` mutation. */
export type UpdateDownloadSourceInput = {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** An object where the defined keys will be set on the `DownloadSource` being updated. */
  downloadSourcePatch: DownloadSourcePatch;
  /** The globally unique `ID` which will identify a single `DownloadSource` to be updated. */
  nodeId: Scalars['ID'];
};

/** The output of our update `DownloadSource` mutation. */
export type UpdateDownloadSourcePayload = {
  __typename?: 'UpdateDownloadSourcePayload';
  /**
   * The exact same `clientMutationId` that was provided in the mutation input,
   * unchanged and unused. May be used by a client to track mutations.
   */
  clientMutationId?: Maybe<Scalars['String']>;
  /** The `DownloadSource` that was updated by this mutation. */
  downloadSource?: Maybe<DownloadSource>;
  /** An edge for our `DownloadSource`. May be used by Relay 1. */
  downloadSourceEdge?: Maybe<DownloadSourcesEdge>;
  /** Our root query field type. Allows us to run any query from our mutation payload. */
  query?: Maybe<Query>;
  /** Reads a single `Season` that is related to this `DownloadSource`. */
  seasonBySeasonId?: Maybe<Season>;
};


/** The output of our update `DownloadSource` mutation. */
export type UpdateDownloadSourcePayloadDownloadSourceEdgeArgs = {
  orderBy?: InputMaybe<Array<DownloadSourcesOrderBy>>;
};

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

/** All input for the `updateTorrentByHash` mutation. */
export type UpdateTorrentByHashInput = {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']>;
  hash: Scalars['String'];
  /** An object where the defined keys will be set on the `Torrent` being updated. */
  torrentPatch: TorrentPatch;
};

/** All input for the `updateTorrentById` mutation. */
export type UpdateTorrentByIdInput = {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']>;
  id: Scalars['Int'];
  /** An object where the defined keys will be set on the `Torrent` being updated. */
  torrentPatch: TorrentPatch;
};

/** All input for the `updateTorrent` mutation. */
export type UpdateTorrentInput = {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** The globally unique `ID` which will identify a single `Torrent` to be updated. */
  nodeId: Scalars['ID'];
  /** An object where the defined keys will be set on the `Torrent` being updated. */
  torrentPatch: TorrentPatch;
};

/** The output of our update `Torrent` mutation. */
export type UpdateTorrentPayload = {
  __typename?: 'UpdateTorrentPayload';
  /**
   * The exact same `clientMutationId` that was provided in the mutation input,
   * unchanged and unused. May be used by a client to track mutations.
   */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Our root query field type. Allows us to run any query from our mutation payload. */
  query?: Maybe<Query>;
  /** The `Torrent` that was updated by this mutation. */
  torrent?: Maybe<Torrent>;
  /** An edge for our `Torrent`. May be used by Relay 1. */
  torrentEdge?: Maybe<TorrentsEdge>;
};


/** The output of our update `Torrent` mutation. */
export type UpdateTorrentPayloadTorrentEdgeArgs = {
  orderBy?: InputMaybe<Array<TorrentsOrderBy>>;
};

export type GetEpisodeByIdQueryVariables = Exact<{
  episodeByIdId: Scalars['Int'];
}>;


export type GetEpisodeByIdQuery = { __typename?: 'Query', episodeById?: { __typename?: 'Episode', airTime?: any | null, createdAt: any, description: string, id: number, index: number, jellyfinEpisodeId?: string | null, title: string, downloadJobsByEpisodeId: { __typename?: 'DownloadJobsConnection', edges: Array<{ __typename?: 'DownloadJobsEdge', node?: { __typename?: 'DownloadJob', createdAt: any, downloadPath?: string | null, failedAt?: any | null, failedReason: string, filePath?: string | null, id: number, importPath?: string | null, isFailed: boolean, nfoPath?: string | null, qbtTorrentHash?: string | null, qbtLastSync?: any | null, status: DownloadStatus, torrentLink?: string | null, jellyfinEpisodeId?: string | null } | null }> }, seasonBySeasonId?: { __typename?: 'Season', id: number, title: string } | null } | null };

export type SearchTorrentQueryVariables = Exact<{
  keyword: Scalars['String'];
  first: Scalars['Int'];
}>;


export type SearchTorrentQuery = { __typename?: 'Query', allTorrents?: { __typename?: 'TorrentsConnection', edges: Array<{ __typename?: 'TorrentsEdge', node?: { __typename?: 'Torrent', id: number, publishDate: any, size: any, title: string, torrentLink: string } | null }> } | null };

export type ListSeasonsQueryVariables = Exact<{
  offset?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<SeasonsOrderBy> | SeasonsOrderBy>;
  filter?: InputMaybe<SeasonFilter>;
  now: Scalars['Datetime'];
}>;


export type ListSeasonsQuery = { __typename?: 'Query', allSeasons?: { __typename?: 'SeasonsConnection', totalCount: number, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean }, edges: Array<{ __typename?: 'SeasonsEdge', cursor?: any | null, node?: { __typename?: 'Season', bangumiId: string, airTime: string, weekday?: number | null, mikanAnimeId: string, isMonitoring: boolean, title: string, id: number, yearAndSemester: string, tvdbId: string, tvdbSeason?: number | null, bilibiliThmId: string, bilibiliMainlandId: string, jellyfinId: string, jellyfinFolderByJellyfinFolderId?: { __typename?: 'JellyfinFolder', name: string } | null, allEpisodes: { __typename?: 'EpisodesConnection', totalCount: number }, airedEpisodes: { __typename?: 'EpisodesConnection', totalCount: number }, availableEpisodes: { __typename?: 'EpisodesConnection', totalCount: number } } | null }> } | null };

export type CreateSeasonMutationVariables = Exact<{
  season: SeasonInput;
}>;


export type CreateSeasonMutation = { __typename?: 'Mutation', createSeason?: { __typename?: 'CreateSeasonPayload', season?: { __typename?: 'Season', id: number } | null } | null };

export type SearchBangumiQueryVariables = Exact<{
  keywords: Scalars['String'];
}>;


export type SearchBangumiQuery = { __typename?: 'Query', searchBangumi: Array<{ __typename?: 'SearchBangumiSeason', added: boolean, airDate?: string | null, id: string, image?: string | null, name: string }> };

export type GetMetadataPageOptionsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetMetadataPageOptionsQuery = { __typename?: 'Query', getAvailableSemesters: Array<string>, allJellyfinFolders?: { __typename?: 'JellyfinFoldersConnection', edges: Array<{ __typename?: 'JellyfinFoldersEdge', node?: { __typename?: 'JellyfinFolder', id: number, name: string } | null }> } | null };

export type DisplayImageFieldsFragment = { __typename?: 'Image', id: number, downloadPath?: string | null };

export type GetSeasonByIdAllQueryVariables = Exact<{
  id: Scalars['Int'];
}>;


export type GetSeasonByIdAllQuery = { __typename?: 'Query', seasonById?: { __typename?: 'Season', id: number, infoSource: MetadataSource, isMonitoring: boolean, jellyfinId: string, mikanAnimeId: string, jellyfinFolderId?: number | null, tags: Array<string | null>, title: string, tvdbId: string, tvdbSeason?: number | null, weekday?: number | null, yearAndSemester: string, airTime: string, bangumiId: string, bilibiliMainlandId: string, bilibiliThmId: string, createdAt: any, description: string, isArchived: boolean, episodesSource: MetadataSource, episodesBySeasonId: { __typename?: 'EpisodesConnection', edges: Array<{ __typename?: 'EpisodesEdge', node?: { __typename?: 'Episode', airTime?: any | null, id: number, index: number, jellyfinEpisodeId?: string | null, title: string, downloadJobsByEpisodeId: { __typename?: 'DownloadJobsConnection', totalCount: number, edges: Array<{ __typename?: 'DownloadJobsEdge', node?: { __typename?: 'DownloadJob', status: DownloadStatus, isFailed: boolean } | null }> } } | null }> }, downloadSourcesBySeasonId: { __typename?: 'DownloadSourcesConnection', edges: Array<{ __typename?: 'DownloadSourcesEdge', node?: { __typename?: 'DownloadSource', id: number, pattern: string } | null }> }, poster?: { __typename?: 'Image', id: number, downloadPath?: string | null } | null, banner?: { __typename?: 'Image', id: number, downloadPath?: string | null } | null, fanart?: { __typename?: 'Image', id: number, downloadPath?: string | null } | null } | null };

export type GetSeasonByIdConfigOnlyQueryVariables = Exact<{
  id: Scalars['Int'];
}>;


export type GetSeasonByIdConfigOnlyQuery = { __typename?: 'Query', seasonById?: { __typename?: 'Season', id: number, infoSource: MetadataSource, isMonitoring: boolean, jellyfinId: string, mikanAnimeId: string, jellyfinFolderId?: number | null, tags: Array<string | null>, title: string, tvdbId: string, tvdbSeason?: number | null, weekday?: number | null, yearAndSemester: string, airTime: string, bangumiId: string, bilibiliMainlandId: string, bilibiliThmId: string, createdAt: any, description: string, isArchived: boolean, episodesSource: MetadataSource, downloadSourcesBySeasonId: { __typename?: 'DownloadSourcesConnection', edges: Array<{ __typename?: 'DownloadSourcesEdge', node?: { __typename?: 'DownloadSource', id: number, pattern: string } | null }> }, poster?: { __typename?: 'Image', id: number, downloadPath?: string | null } | null, banner?: { __typename?: 'Image', id: number, downloadPath?: string | null } | null, fanart?: { __typename?: 'Image', id: number, downloadPath?: string | null } | null } | null };

export type GetSeasonByIdEpisodesOnlyQueryVariables = Exact<{
  id: Scalars['Int'];
}>;


export type GetSeasonByIdEpisodesOnlyQuery = { __typename?: 'Query', seasonById?: { __typename?: 'Season', episodesBySeasonId: { __typename?: 'EpisodesConnection', edges: Array<{ __typename?: 'EpisodesEdge', node?: { __typename?: 'Episode', airTime?: any | null, id: number, index: number, jellyfinEpisodeId?: string | null, title: string, downloadJobsByEpisodeId: { __typename?: 'DownloadJobsConnection', totalCount: number, edges: Array<{ __typename?: 'DownloadJobsEdge', node?: { __typename?: 'DownloadJob', status: DownloadStatus, isFailed: boolean } | null }> } } | null }> } } | null };

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

export type TorrentFieldsFragment = { __typename?: 'Torrent', id: number, publishDate: any, size: any, title: string, torrentLink: string };

export type ListTorrentsQueryVariables = Exact<{
  offset?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<TorrentsOrderBy> | TorrentsOrderBy>;
  filter?: InputMaybe<TorrentFilter>;
}>;


export type ListTorrentsQuery = { __typename?: 'Query', allTorrents?: { __typename?: 'TorrentsConnection', totalCount: number, edges: Array<{ __typename?: 'TorrentsEdge', cursor?: any | null, node?: { __typename?: 'Torrent', id: number, publishDate: any, size: any, title: string, torrentLink: string } | null }>, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean } } | null };

export type UpdateDownloadSourceByIdMutationVariables = Exact<{
  id: Scalars['Int'];
  downloadSourcePatch: DownloadSourcePatch;
}>;


export type UpdateDownloadSourceByIdMutation = { __typename?: 'Mutation', updateDownloadSourceById?: { __typename: 'UpdateDownloadSourcePayload' } | null };

export type CreateDownloadSourceMutationVariables = Exact<{
  downloadSource: DownloadSourceInput;
}>;


export type CreateDownloadSourceMutation = { __typename?: 'Mutation', createDownloadSource?: { __typename: 'CreateDownloadSourcePayload' } | null };

export type ListDownloadSourcesQueryVariables = Exact<{
  condition?: InputMaybe<DownloadSourceCondition>;
}>;


export type ListDownloadSourcesQuery = { __typename?: 'Query', allDownloadSources?: { __typename?: 'DownloadSourcesConnection', edges: Array<{ __typename?: 'DownloadSourcesEdge', node?: { __typename?: 'DownloadSource', isDisabled: boolean, groupId: string, pattern: string, id: number } | null }> } | null };

export type DeleteDownloadConfigByIdMutationVariables = Exact<{
  id: Scalars['Int'];
}>;


export type DeleteDownloadConfigByIdMutation = { __typename?: 'Mutation', updateDownloadSourceById?: { __typename: 'UpdateDownloadSourcePayload' } | null };

export type DeleteSeasonByIdMutationVariables = Exact<{
  id: Scalars['Int'];
}>;


export type DeleteSeasonByIdMutation = { __typename?: 'Mutation', updateSeasonById?: { __typename: 'UpdateSeasonPayload' } | null };

export type GetDownloadSourceByIdQueryVariables = Exact<{
  downloadSourceByIdId: Scalars['Int'];
}>;


export type GetDownloadSourceByIdQuery = { __typename?: 'Query', downloadSourceById?: { __typename?: 'DownloadSource', isArchived: boolean, id: number, groupId: string, isDisabled: boolean, pattern: string } | null };

export const DisplayImageFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"displayImageFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Image"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"downloadPath"}}]}}]} as unknown as DocumentNode<DisplayImageFieldsFragment, unknown>;
export const TorrentFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"torrentFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Torrent"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"publishDate"}},{"kind":"Field","name":{"kind":"Name","value":"size"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"torrentLink"}}]}}]} as unknown as DocumentNode<TorrentFieldsFragment, unknown>;
export const GetEpisodeByIdDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetEpisodeById"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"episodeByIdId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"episodeById"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"episodeByIdId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"airTime"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"downloadJobsByEpisodeId"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orderBy"},"value":{"kind":"EnumValue","value":"ID_DESC"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"downloadPath"}},{"kind":"Field","name":{"kind":"Name","value":"failedAt"}},{"kind":"Field","name":{"kind":"Name","value":"failedReason"}},{"kind":"Field","name":{"kind":"Name","value":"filePath"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"importPath"}},{"kind":"Field","name":{"kind":"Name","value":"isFailed"}},{"kind":"Field","name":{"kind":"Name","value":"nfoPath"}},{"kind":"Field","name":{"kind":"Name","value":"qbtTorrentHash"}},{"kind":"Field","name":{"kind":"Name","value":"qbtLastSync"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"torrentLink"}},{"kind":"Field","name":{"kind":"Name","value":"jellyfinEpisodeId"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"index"}},{"kind":"Field","name":{"kind":"Name","value":"jellyfinEpisodeId"}},{"kind":"Field","name":{"kind":"Name","value":"seasonBySeasonId"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}}]}},{"kind":"Field","name":{"kind":"Name","value":"title"}}]}}]}}]} as unknown as DocumentNode<GetEpisodeByIdQuery, GetEpisodeByIdQueryVariables>;
export const SearchTorrentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SearchTorrent"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"keyword"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"allTorrents"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"title"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"includesInsensitive"},"value":{"kind":"Variable","name":{"kind":"Name","value":"keyword"}}}]}}]}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"orderBy"},"value":{"kind":"EnumValue","value":"PUBLISH_DATE_DESC"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"torrentFields"}}]}}]}}]}}]}},...TorrentFieldsFragmentDoc.definitions]} as unknown as DocumentNode<SearchTorrentQuery, SearchTorrentQueryVariables>;
export const ListSeasonsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ListSeasons"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"offset"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orderBy"}},"type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SeasonsOrderBy"}}}},"defaultValue":{"kind":"ListValue","values":[]}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"SeasonFilter"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"now"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Datetime"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"allSeasons"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"offset"},"value":{"kind":"Variable","name":{"kind":"Name","value":"offset"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"orderBy"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orderBy"}}},{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filter"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"bangumiId"}},{"kind":"Field","name":{"kind":"Name","value":"airTime"}},{"kind":"Field","name":{"kind":"Name","value":"weekday"}},{"kind":"Field","name":{"kind":"Name","value":"mikanAnimeId"}},{"kind":"Field","name":{"kind":"Name","value":"isMonitoring"}},{"kind":"Field","name":{"kind":"Name","value":"jellyfinFolderByJellyfinFolderId"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"yearAndSemester"}},{"kind":"Field","name":{"kind":"Name","value":"tvdbId"}},{"kind":"Field","name":{"kind":"Name","value":"tvdbSeason"}},{"kind":"Field","name":{"kind":"Name","value":"bilibiliThmId"}},{"kind":"Field","name":{"kind":"Name","value":"bilibiliMainlandId"}},{"kind":"Field","name":{"kind":"Name","value":"jellyfinId"}},{"kind":"Field","alias":{"kind":"Name","value":"allEpisodes"},"name":{"kind":"Name","value":"episodesBySeasonId"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"airedEpisodes"},"name":{"kind":"Name","value":"episodesBySeasonId"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"airTime"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"lessThanOrEqualTo"},"value":{"kind":"Variable","name":{"kind":"Name","value":"now"}}}]}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"availableEpisodes"},"name":{"kind":"Name","value":"episodesBySeasonId"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"jellyfinEpisodeId"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"isNull"},"value":{"kind":"BooleanValue","value":false}}]}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"cursor"}}]}}]}}]}}]} as unknown as DocumentNode<ListSeasonsQuery, ListSeasonsQueryVariables>;
export const CreateSeasonDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateSeason"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"season"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SeasonInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createSeason"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"season"},"value":{"kind":"Variable","name":{"kind":"Name","value":"season"}}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"season"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]}}]} as unknown as DocumentNode<CreateSeasonMutation, CreateSeasonMutationVariables>;
export const SearchBangumiDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SearchBangumi"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"keywords"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"searchBangumi"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"keywords"},"value":{"kind":"Variable","name":{"kind":"Name","value":"keywords"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"added"}},{"kind":"Field","name":{"kind":"Name","value":"airDate"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"image"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<SearchBangumiQuery, SearchBangumiQueryVariables>;
export const GetMetadataPageOptionsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetMetadataPageOptions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getAvailableSemesters"}},{"kind":"Field","name":{"kind":"Name","value":"allJellyfinFolders"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]}}]} as unknown as DocumentNode<GetMetadataPageOptionsQuery, GetMetadataPageOptionsQueryVariables>;
export const GetSeasonByIdAllDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetSeasonByIdAll"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"seasonById"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"infoSource"}},{"kind":"Field","name":{"kind":"Name","value":"isMonitoring"}},{"kind":"Field","name":{"kind":"Name","value":"jellyfinId"}},{"kind":"Field","name":{"kind":"Name","value":"mikanAnimeId"}},{"kind":"Field","name":{"kind":"Name","value":"jellyfinFolderId"}},{"kind":"Field","name":{"kind":"Name","value":"tags"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"tvdbId"}},{"kind":"Field","name":{"kind":"Name","value":"tvdbSeason"}},{"kind":"Field","name":{"kind":"Name","value":"weekday"}},{"kind":"Field","name":{"kind":"Name","value":"yearAndSemester"}},{"kind":"Field","name":{"kind":"Name","value":"airTime"}},{"kind":"Field","name":{"kind":"Name","value":"bangumiId"}},{"kind":"Field","name":{"kind":"Name","value":"bilibiliMainlandId"}},{"kind":"Field","name":{"kind":"Name","value":"bilibiliThmId"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"isArchived"}},{"kind":"Field","name":{"kind":"Name","value":"episodesBySeasonId"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orderBy"},"value":{"kind":"EnumValue","value":"INDEX_ASC"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"airTime"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"index"}},{"kind":"Field","name":{"kind":"Name","value":"jellyfinEpisodeId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"downloadJobsByEpisodeId"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"1"}},{"kind":"Argument","name":{"kind":"Name","value":"orderBy"},"value":{"kind":"EnumValue","value":"CREATED_AT_DESC"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"isFailed"}}]}}]}}]}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"episodesSource"}},{"kind":"Field","name":{"kind":"Name","value":"downloadSourcesBySeasonId"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"pattern"}}]}}]}}]}},{"kind":"Field","alias":{"kind":"Name","value":"poster"},"name":{"kind":"Name","value":"imageByPosterImageId"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"displayImageFields"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"banner"},"name":{"kind":"Name","value":"imageByBannerImageId"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"displayImageFields"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"fanart"},"name":{"kind":"Name","value":"imageByFanartImageId"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"displayImageFields"}}]}}]}}]}},...DisplayImageFieldsFragmentDoc.definitions]} as unknown as DocumentNode<GetSeasonByIdAllQuery, GetSeasonByIdAllQueryVariables>;
export const GetSeasonByIdConfigOnlyDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetSeasonByIdConfigOnly"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"seasonById"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"infoSource"}},{"kind":"Field","name":{"kind":"Name","value":"isMonitoring"}},{"kind":"Field","name":{"kind":"Name","value":"jellyfinId"}},{"kind":"Field","name":{"kind":"Name","value":"mikanAnimeId"}},{"kind":"Field","name":{"kind":"Name","value":"jellyfinFolderId"}},{"kind":"Field","name":{"kind":"Name","value":"tags"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"tvdbId"}},{"kind":"Field","name":{"kind":"Name","value":"tvdbSeason"}},{"kind":"Field","name":{"kind":"Name","value":"weekday"}},{"kind":"Field","name":{"kind":"Name","value":"yearAndSemester"}},{"kind":"Field","name":{"kind":"Name","value":"airTime"}},{"kind":"Field","name":{"kind":"Name","value":"bangumiId"}},{"kind":"Field","name":{"kind":"Name","value":"bilibiliMainlandId"}},{"kind":"Field","name":{"kind":"Name","value":"bilibiliThmId"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"isArchived"}},{"kind":"Field","name":{"kind":"Name","value":"episodesSource"}},{"kind":"Field","name":{"kind":"Name","value":"downloadSourcesBySeasonId"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"pattern"}}]}}]}}]}},{"kind":"Field","alias":{"kind":"Name","value":"poster"},"name":{"kind":"Name","value":"imageByPosterImageId"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"downloadPath"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"banner"},"name":{"kind":"Name","value":"imageByBannerImageId"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"downloadPath"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"fanart"},"name":{"kind":"Name","value":"imageByFanartImageId"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"downloadPath"}}]}}]}}]}}]} as unknown as DocumentNode<GetSeasonByIdConfigOnlyQuery, GetSeasonByIdConfigOnlyQueryVariables>;
export const GetSeasonByIdEpisodesOnlyDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetSeasonByIdEpisodesOnly"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"seasonById"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"episodesBySeasonId"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orderBy"},"value":{"kind":"EnumValue","value":"INDEX_ASC"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"airTime"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"index"}},{"kind":"Field","name":{"kind":"Name","value":"jellyfinEpisodeId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"downloadJobsByEpisodeId"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"1"}},{"kind":"Argument","name":{"kind":"Name","value":"orderBy"},"value":{"kind":"EnumValue","value":"CREATED_AT_DESC"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"isFailed"}}]}}]}}]}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<GetSeasonByIdEpisodesOnlyQuery, GetSeasonByIdEpisodesOnlyQueryVariables>;
export const UpdateSeasonByIdDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateSeasonById"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"seasonPatch"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SeasonPatch"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateSeasonById"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"seasonPatch"},"value":{"kind":"Variable","name":{"kind":"Name","value":"seasonPatch"}}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}}]}}]}}]} as unknown as DocumentNode<UpdateSeasonByIdMutation, UpdateSeasonByIdMutationVariables>;
export const GetSeasonByTitleDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetSeasonByTitle"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"title"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"seasonByTitle"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"title"},"value":{"kind":"Variable","name":{"kind":"Name","value":"title"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<GetSeasonByTitleQuery, GetSeasonByTitleQueryVariables>;
export const UpdateSeasonDownloadSourcesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateSeasonDownloadSources"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateSeasonDownloadSourcesInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateSeasonDownloadSources"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}]}]}}]} as unknown as DocumentNode<UpdateSeasonDownloadSourcesMutation, UpdateSeasonDownloadSourcesMutationVariables>;
export const GetDownloadSourceByPatternDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetDownloadSourceByPattern"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"pattern"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"downloadSourceByPattern"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"pattern"},"value":{"kind":"Variable","name":{"kind":"Name","value":"pattern"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<GetDownloadSourceByPatternQuery, GetDownloadSourceByPatternQueryVariables>;
export const SyncMetadataDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SyncMetadata"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"seasonId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"syncMetadata"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"seasonId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"seasonId"}}}]}]}}]} as unknown as DocumentNode<SyncMetadataMutation, SyncMetadataMutationVariables>;
export const SyncEpisodeDataDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SyncEpisodeData"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"seasonId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"syncEpisodeData"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"seasonId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"seasonId"}}}]}]}}]} as unknown as DocumentNode<SyncEpisodeDataMutation, SyncEpisodeDataMutationVariables>;
export const DownloadTorrentForEpisodeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DownloadTorrentForEpisode"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"episodeId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"torrentLink"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"downloadTorrentForEpisode"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"episodeId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"episodeId"}}},{"kind":"Argument","name":{"kind":"Name","value":"torrentLink"},"value":{"kind":"Variable","name":{"kind":"Name","value":"torrentLink"}}}]}]}}]} as unknown as DocumentNode<DownloadTorrentForEpisodeMutation, DownloadTorrentForEpisodeMutationVariables>;
export const AllJellyfinFoldersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AllJellyfinFolders"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"allJellyfinFolders"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"location"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]}}]} as unknown as DocumentNode<AllJellyfinFoldersQuery, AllJellyfinFoldersQueryVariables>;
export const ListTorrentsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ListTorrents"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"offset"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orderBy"}},"type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"TorrentsOrderBy"}}}},"defaultValue":{"kind":"ListValue","values":[]}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"TorrentFilter"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"allTorrents"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"offset"},"value":{"kind":"Variable","name":{"kind":"Name","value":"offset"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"orderBy"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orderBy"}}},{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filter"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"torrentFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"cursor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalCount"}}]}}]}},...TorrentFieldsFragmentDoc.definitions]} as unknown as DocumentNode<ListTorrentsQuery, ListTorrentsQueryVariables>;
export const UpdateDownloadSourceByIdDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateDownloadSourceById"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"downloadSourcePatch"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"DownloadSourcePatch"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateDownloadSourceById"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"downloadSourcePatch"},"value":{"kind":"Variable","name":{"kind":"Name","value":"downloadSourcePatch"}}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}}]}}]}}]} as unknown as DocumentNode<UpdateDownloadSourceByIdMutation, UpdateDownloadSourceByIdMutationVariables>;
export const CreateDownloadSourceDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateDownloadSource"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"downloadSource"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"DownloadSourceInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createDownloadSource"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"downloadSource"},"value":{"kind":"Variable","name":{"kind":"Name","value":"downloadSource"}}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}}]}}]}}]} as unknown as DocumentNode<CreateDownloadSourceMutation, CreateDownloadSourceMutationVariables>;
export const ListDownloadSourcesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ListDownloadSources"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"condition"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"DownloadSourceCondition"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"allDownloadSources"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"condition"},"value":{"kind":"Variable","name":{"kind":"Name","value":"condition"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"isDisabled"}},{"kind":"Field","name":{"kind":"Name","value":"groupId"}},{"kind":"Field","name":{"kind":"Name","value":"pattern"}},{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]}}]}}]} as unknown as DocumentNode<ListDownloadSourcesQuery, ListDownloadSourcesQueryVariables>;
export const DeleteDownloadConfigByIdDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteDownloadConfigById"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateDownloadSourceById"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"downloadSourcePatch"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"isArchived"},"value":{"kind":"BooleanValue","value":true}}]}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}}]}}]}}]} as unknown as DocumentNode<DeleteDownloadConfigByIdMutation, DeleteDownloadConfigByIdMutationVariables>;
export const DeleteSeasonByIdDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteSeasonById"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateSeasonById"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"seasonPatch"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"isArchived"},"value":{"kind":"BooleanValue","value":true}}]}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}}]}}]}}]} as unknown as DocumentNode<DeleteSeasonByIdMutation, DeleteSeasonByIdMutationVariables>;
export const GetDownloadSourceByIdDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetDownloadSourceById"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"downloadSourceByIdId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"downloadSourceById"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"downloadSourceByIdId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"isArchived"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"groupId"}},{"kind":"Field","name":{"kind":"Name","value":"isDisabled"}},{"kind":"Field","name":{"kind":"Name","value":"pattern"}}]}}]}}]} as unknown as DocumentNode<GetDownloadSourceByIdQuery, GetDownloadSourceByIdQueryVariables>;
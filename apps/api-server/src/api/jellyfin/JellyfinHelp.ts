import {
  BaseItemKind,
  BaseItemDto,
  CancelablePromise,
  ImageType,
  ItemFields,
  ItemFilter,
  ItemsService,
  LocationType,
  MetadataRefreshMode,
  OpenAPI,
  SeriesStatus,
  SortOrder,
  VideoType,
} from './generated';
import { request as __request } from './generated/core/request';

// OpenAPI生成的API不好用，包一层
export class JellyfinHelp {
  public static async getItem({
    itemId,
    userId,
  }: {
    itemId: string;
    userId: string;
  }): Promise<BaseItemDto> {
    // 10.8 尚不支持 GET /Items/{itemId}，按 ID 查询兼容新旧版本。
    const { Items } = await this.getItems({
      userId,
      ids: [itemId],
      fields: [
        ItemFields.PATH,
        ItemFields.MEDIA_SOURCES,
        ItemFields.MEDIA_STREAMS,
      ],
      limit: 1,
    });
    const item = Items?.[0];
    if (!item) throw new Error('Jellyfin 媒体条目不存在');
    return item;
  }

  public static getItems({
    userId,
    maxOfficialRating,
    hasThemeSong,
    hasThemeVideo,
    hasSubtitles,
    hasSpecialFeature,
    hasTrailer,
    adjacentTo,
    parentIndexNumber,
    hasParentalRating,
    isHd,
    is4K,
    locationTypes,
    excludeLocationTypes,
    isMissing,
    isUnaired,
    minCommunityRating,
    minCriticRating,
    minPremiereDate,
    minDateLastSaved,
    minDateLastSavedForUser,
    maxPremiereDate,
    hasOverview,
    hasImdbId,
    hasTmdbId,
    hasTvdbId,
    isMovie,
    isSeries,
    isNews,
    isKids,
    isSports,
    excludeItemIds,
    startIndex,
    limit,
    recursive,
    searchTerm,
    sortOrder,
    parentId,
    fields,
    excludeItemTypes,
    includeItemTypes,
    filters,
    isFavorite,
    mediaTypes,
    imageTypes,
    sortBy,
    isPlayed,
    genres,
    officialRatings,
    tags,
    years,
    enableUserData,
    imageTypeLimit,
    enableImageTypes,
    person,
    personIds,
    personTypes,
    studios,
    artists,
    excludeArtistIds,
    artistIds,
    albumArtistIds,
    contributingArtistIds,
    albums,
    albumIds,
    ids,
    videoTypes,
    minOfficialRating,
    isLocked,
    isPlaceHolder,
    hasOfficialRating,
    collapseBoxSetItems,
    minWidth,
    minHeight,
    maxWidth,
    maxHeight,
    is3D,
    seriesStatus,
    nameStartsWithOrGreater,
    nameStartsWith,
    nameLessThan,
    studioIds,
    genreIds,
    enableTotalRecordCount,
    enableImages,
  }: {
    userId: string;
    maxOfficialRating?: string;
    hasThemeSong?: boolean;
    hasThemeVideo?: boolean;
    hasSubtitles?: boolean;
    hasSpecialFeature?: boolean;
    hasTrailer?: boolean;
    adjacentTo?: string;
    parentIndexNumber?: number;
    hasParentalRating?: boolean;
    isHd?: boolean;
    is4K?: boolean;
    locationTypes?: Array<LocationType>;
    excludeLocationTypes?: Array<LocationType>;
    isMissing?: boolean;
    isUnaired?: boolean;
    minCommunityRating?: number;
    minCriticRating?: number;
    minPremiereDate?: string;
    minDateLastSaved?: string;
    minDateLastSavedForUser?: string;
    maxPremiereDate?: string;
    hasOverview?: boolean;
    hasImdbId?: boolean;
    hasTmdbId?: boolean;
    hasTvdbId?: boolean;
    isMovie?: boolean;
    isSeries?: boolean;
    isNews?: boolean;
    isKids?: boolean;
    isSports?: boolean;
    excludeItemIds?: Array<string>;
    startIndex?: number;
    limit?: number;
    recursive?: boolean;
    searchTerm?: string;
    sortOrder?: Array<SortOrder>;
    parentId?: string;
    fields?: Array<ItemFields>;
    excludeItemTypes?: Array<BaseItemKind>;
    includeItemTypes?: Array<BaseItemKind>;
    filters?: Array<ItemFilter>;
    isFavorite?: boolean;
    mediaTypes?: Array<string>;
    imageTypes?: Array<ImageType>;
    sortBy?: Array<string>;
    isPlayed?: boolean;
    genres?: Array<string>;
    officialRatings?: Array<string>;
    tags?: Array<string>;
    years?: Array<number>;
    enableUserData?: boolean;
    imageTypeLimit?: number;
    enableImageTypes?: Array<ImageType>;
    person?: string;
    personIds?: Array<string>;
    personTypes?: Array<string>;
    studios?: Array<string>;
    artists?: Array<string>;
    excludeArtistIds?: Array<string>;
    artistIds?: Array<string>;
    albumArtistIds?: Array<string>;
    contributingArtistIds?: Array<string>;
    albums?: Array<string>;
    albumIds?: Array<string>;
    ids?: Array<string>;
    videoTypes?: Array<VideoType>;
    minOfficialRating?: string;
    isLocked?: boolean;
    isPlaceHolder?: boolean;
    hasOfficialRating?: boolean;
    collapseBoxSetItems?: boolean;
    minWidth?: number;
    minHeight?: number;
    maxWidth?: number;
    maxHeight?: number;
    is3D?: boolean;
    seriesStatus?: Array<SeriesStatus>;
    nameStartsWithOrGreater?: string;
    nameStartsWith?: string;
    nameLessThan?: string;
    studioIds?: Array<string>;
    genreIds?: Array<string>;
    enableTotalRecordCount?: boolean;
    enableImages?: boolean;
  }): ReturnType<typeof ItemsService['getItems']> {
    return ItemsService.getItems(
      userId,
      maxOfficialRating,
      hasThemeSong,
      hasThemeVideo,
      hasSubtitles,
      hasSpecialFeature,
      hasTrailer,
      adjacentTo,
      parentIndexNumber,
      hasParentalRating,
      isHd,
      is4K,
      locationTypes,
      excludeLocationTypes,
      isMissing,
      isUnaired,
      minCommunityRating,
      minCriticRating,
      minPremiereDate,
      minDateLastSaved,
      minDateLastSavedForUser,
      maxPremiereDate,
      hasOverview,
      hasImdbId,
      hasTmdbId,
      hasTvdbId,
      isMovie,
      isSeries,
      isNews,
      isKids,
      isSports,
      excludeItemIds,
      startIndex,
      limit,
      recursive,
      searchTerm,
      sortOrder,
      parentId,
      fields,
      excludeItemTypes,
      includeItemTypes,
      filters,
      isFavorite,
      mediaTypes,
      imageTypes,
      sortBy,
      isPlayed,
      genres,
      officialRatings,
      tags,
      years,
      enableUserData,
      imageTypeLimit,
      enableImageTypes,
      person,
      personIds,
      personTypes,
      studios,
      artists,
      excludeArtistIds,
      artistIds,
      albumArtistIds,
      contributingArtistIds,
      albums,
      albumIds,
      ids,
      videoTypes,
      minOfficialRating,
      isLocked,
      isPlaceHolder,
      hasOfficialRating,
      collapseBoxSetItems,
      minWidth,
      minHeight,
      maxWidth,
      maxHeight,
      is3D,
      seriesStatus,
      nameStartsWithOrGreater,
      nameStartsWith,
      nameLessThan,
      studioIds,
      genreIds,
      enableTotalRecordCount,
      enableImages,
    );
  }

  public static refreshItem({
    itemId,
    metadataRefreshMode,
    imageRefreshMode,
    replaceAllMetadata,
    replaceAllImages,
  }: {
    itemId: string;
    metadataRefreshMode?: MetadataRefreshMode;
    imageRefreshMode?: MetadataRefreshMode;
    replaceAllMetadata?: boolean;
    replaceAllImages?: boolean;
  }): CancelablePromise<void> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/Items/{itemId}/Refresh',
      path: {
        itemId: itemId,
      },
      query: {
        metadataRefreshMode: metadataRefreshMode,
        imageRefreshMode: imageRefreshMode,
        replaceAllMetadata: replaceAllMetadata,
        replaceAllImages: replaceAllImages,
      },
      errors: {
        401: `Unauthorized`,
        403: `Forbidden`,
        404: `Item to refresh not found.`,
      },
    });
  }
}

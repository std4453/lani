import {
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
} from '@/api/jellyfin';
import { request as __request } from '@/api/jellyfin/core/request';
import dayjs from 'dayjs';

// 这OpenAPI生成的破API突出一个难用，包一层
export class JellyfinHelp {
  public static getItemsByUserId({
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
    maxOfficialRating?: string | null;
    hasThemeSong?: boolean | null;
    hasThemeVideo?: boolean | null;
    hasSubtitles?: boolean | null;
    hasSpecialFeature?: boolean | null;
    hasTrailer?: boolean | null;
    adjacentTo?: string | null;
    parentIndexNumber?: number | null;
    hasParentalRating?: boolean | null;
    isHd?: boolean | null;
    is4K?: boolean | null;
    locationTypes?: Array<LocationType> | null;
    excludeLocationTypes?: Array<LocationType> | null;
    isMissing?: boolean | null;
    isUnaired?: boolean | null;
    minCommunityRating?: number | null;
    minCriticRating?: number | null;
    minPremiereDate?: string | null;
    minDateLastSaved?: string | null;
    minDateLastSavedForUser?: string | null;
    maxPremiereDate?: string | null;
    hasOverview?: boolean | null;
    hasImdbId?: boolean | null;
    hasTmdbId?: boolean | null;
    hasTvdbId?: boolean | null;
    excludeItemIds?: Array<string> | null;
    startIndex?: number | null;
    limit?: number | null;
    recursive?: boolean | null;
    searchTerm?: string | null;
    sortOrder?: Array<SortOrder> | null;
    parentId?: string | null;
    fields?: Array<ItemFields> | null;
    excludeItemTypes?: Array<string> | null;
    includeItemTypes?: Array<string> | null;
    filters?: Array<ItemFilter> | null;
    isFavorite?: boolean | null;
    mediaTypes?: Array<string> | null;
    imageTypes?: Array<ImageType> | null;
    sortBy?: Array<string> | null;
    isPlayed?: boolean | null;
    genres?: Array<string> | null;
    officialRatings?: Array<string> | null;
    tags?: Array<string> | null;
    years?: Array<number> | null;
    enableUserData?: boolean | null;
    imageTypeLimit?: number | null;
    enableImageTypes?: Array<ImageType> | null;
    person?: string | null;
    personIds?: Array<string> | null;
    personTypes?: Array<string> | null;
    studios?: Array<string> | null;
    artists?: Array<string> | null;
    excludeArtistIds?: Array<string> | null;
    artistIds?: Array<string> | null;
    albumArtistIds?: Array<string> | null;
    contributingArtistIds?: Array<string> | null;
    albums?: Array<string> | null;
    albumIds?: Array<string> | null;
    ids?: Array<string> | null;
    videoTypes?: Array<VideoType> | null;
    minOfficialRating?: string | null;
    isLocked?: boolean | null;
    isPlaceHolder?: boolean | null;
    hasOfficialRating?: boolean | null;
    collapseBoxSetItems?: boolean | null;
    minWidth?: number | null;
    minHeight?: number | null;
    maxWidth?: number | null;
    maxHeight?: number | null;
    is3D?: boolean | null;
    seriesStatus?: Array<SeriesStatus> | null;
    nameStartsWithOrGreater?: string | null;
    nameStartsWith?: string | null;
    nameLessThan?: string | null;
    studioIds?: Array<string> | null;
    genreIds?: Array<string> | null;
    enableTotalRecordCount?: boolean;
    enableImages?: boolean | null;
  }): ReturnType<typeof ItemsService['getItemsByUserId']> {
    return ItemsService.getItemsByUserId(
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
    recursive,
  }: {
    itemId: string;
    metadataRefreshMode?: MetadataRefreshMode;
    imageRefreshMode?: MetadataRefreshMode;
    replaceAllMetadata?: boolean;
    replaceAllImages?: boolean;
    recursive?: boolean;
  }): CancelablePromise<void> {
    console.debug(
      dayjs().format('YYYY-MM-DD HH:mm:ss'),
      'JellyfinHelp.RefreshItem',
      itemId,
    );
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
        recursive: recursive,
      },
      errors: {
        401: `Unauthorized`,
        403: `Forbidden`,
        404: `Item to refresh not found.`,
      },
    });
  }
}

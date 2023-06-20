/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BaseItemDtoQueryResult } from '../models/BaseItemDtoQueryResult';
import type { ImageType } from '../models/ImageType';
import type { ItemFields } from '../models/ItemFields';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class TvShowsService {

  /**
   * Gets episodes for a tv season.
   * @param seriesId The series id.
   * @param userId The user id.
   * @param fields Optional. Specify additional fields of information to return in the output. This allows multiple, comma delimited. Options: Budget, Chapters, DateCreated, Genres, HomePageUrl, IndexOptions, MediaStreams, Overview, ParentId, Path, People, ProviderIds, PrimaryImageAspectRatio, Revenue, SortName, Studios, Taglines, TrailerUrls.
   * @param season Optional filter by season number.
   * @param seasonId Optional. Filter by season id.
   * @param isMissing Optional. Filter by items that are missing episodes or not.
   * @param adjacentTo Optional. Return items that are siblings of a supplied item.
   * @param startItemId Optional. Skip through the list until a given item is found.
   * @param startIndex Optional. The record index to start at. All items with a lower index will be dropped from the results.
   * @param limit Optional. The maximum number of records to return.
   * @param enableImages Optional, include image information in output.
   * @param imageTypeLimit Optional, the max number of images to return, per image type.
   * @param enableImageTypes Optional. The image types to include in the output.
   * @param enableUserData Optional. Include user data.
   * @param sortBy Optional. Specify one or more sort orders, comma delimited. Options: Album, AlbumArtist, Artist, Budget, CommunityRating, CriticRating, DateCreated, DatePlayed, PlayCount, PremiereDate, ProductionYear, SortName, Random, Revenue, Runtime.
   * @returns BaseItemDtoQueryResult Success
   * @throws ApiError
   */
  public static getEpisodes(
    seriesId: string,
    userId?: string,
    fields?: Array<ItemFields>,
    season?: number,
    seasonId?: string,
    isMissing?: boolean,
    adjacentTo?: string,
    startItemId?: string,
    startIndex?: number,
    limit?: number,
    enableImages?: boolean,
    imageTypeLimit?: number,
    enableImageTypes?: Array<ImageType>,
    enableUserData?: boolean,
    sortBy?: string,
  ): CancelablePromise<BaseItemDtoQueryResult> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/Shows/{seriesId}/Episodes',
      path: {
        'seriesId': seriesId,
      },
      query: {
        'userId': userId,
        'fields': fields,
        'season': season,
        'seasonId': seasonId,
        'isMissing': isMissing,
        'adjacentTo': adjacentTo,
        'startItemId': startItemId,
        'startIndex': startIndex,
        'limit': limit,
        'enableImages': enableImages,
        'imageTypeLimit': imageTypeLimit,
        'enableImageTypes': enableImageTypes,
        'enableUserData': enableUserData,
        'sortBy': sortBy,
      },
      errors: {
        401: `Unauthorized`,
        403: `Forbidden`,
        404: `Not Found`,
      },
    });
  }

  /**
   * Gets seasons for a tv series.
   * @param seriesId The series id.
   * @param userId The user id.
   * @param fields Optional. Specify additional fields of information to return in the output. This allows multiple, comma delimited. Options: Budget, Chapters, DateCreated, Genres, HomePageUrl, IndexOptions, MediaStreams, Overview, ParentId, Path, People, ProviderIds, PrimaryImageAspectRatio, Revenue, SortName, Studios, Taglines, TrailerUrls.
   * @param isSpecialSeason Optional. Filter by special season.
   * @param isMissing Optional. Filter by items that are missing episodes or not.
   * @param adjacentTo Optional. Return items that are siblings of a supplied item.
   * @param enableImages Optional. Include image information in output.
   * @param imageTypeLimit Optional. The max number of images to return, per image type.
   * @param enableImageTypes Optional. The image types to include in the output.
   * @param enableUserData Optional. Include user data.
   * @returns BaseItemDtoQueryResult Success
   * @throws ApiError
   */
  public static getSeasons(
    seriesId: string,
    userId?: string,
    fields?: Array<ItemFields>,
    isSpecialSeason?: boolean,
    isMissing?: boolean,
    adjacentTo?: string,
    enableImages?: boolean,
    imageTypeLimit?: number,
    enableImageTypes?: Array<ImageType>,
    enableUserData?: boolean,
  ): CancelablePromise<BaseItemDtoQueryResult> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/Shows/{seriesId}/Seasons',
      path: {
        'seriesId': seriesId,
      },
      query: {
        'userId': userId,
        'fields': fields,
        'isSpecialSeason': isSpecialSeason,
        'isMissing': isMissing,
        'adjacentTo': adjacentTo,
        'enableImages': enableImages,
        'imageTypeLimit': imageTypeLimit,
        'enableImageTypes': enableImageTypes,
        'enableUserData': enableUserData,
      },
      errors: {
        401: `Unauthorized`,
        403: `Forbidden`,
        404: `Not Found`,
      },
    });
  }

  /**
   * Gets a list of next up episodes.
   * @param userId The user id of the user to get the next up episodes for.
   * @param startIndex Optional. The record index to start at. All items with a lower index will be dropped from the results.
   * @param limit Optional. The maximum number of records to return.
   * @param fields Optional. Specify additional fields of information to return in the output.
   * @param seriesId Optional. Filter by series id.
   * @param parentId Optional. Specify this to localize the search to a specific item or folder. Omit to use the root.
   * @param enableImages Optional. Include image information in output.
   * @param imageTypeLimit Optional. The max number of images to return, per image type.
   * @param enableImageTypes Optional. The image types to include in the output.
   * @param enableUserData Optional. Include user data.
   * @param nextUpDateCutoff Optional. Starting date of shows to show in Next Up section.
   * @param enableTotalRecordCount Whether to enable the total records count. Defaults to true.
   * @param disableFirstEpisode Whether to disable sending the first episode in a series as next up.
   * @param enableRewatching Whether to include watched episode in next up results.
   * @returns BaseItemDtoQueryResult Success
   * @throws ApiError
   */
  public static getNextUp(
    userId?: string,
    startIndex?: number,
    limit?: number,
    fields?: Array<ItemFields>,
    seriesId?: string,
    parentId?: string,
    enableImages?: boolean,
    imageTypeLimit?: number,
    enableImageTypes?: Array<ImageType>,
    enableUserData?: boolean,
    nextUpDateCutoff?: string,
    enableTotalRecordCount: boolean = true,
    disableFirstEpisode: boolean = false,
    enableRewatching: boolean = false,
  ): CancelablePromise<BaseItemDtoQueryResult> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/Shows/NextUp',
      query: {
        'userId': userId,
        'startIndex': startIndex,
        'limit': limit,
        'fields': fields,
        'seriesId': seriesId,
        'parentId': parentId,
        'enableImages': enableImages,
        'imageTypeLimit': imageTypeLimit,
        'enableImageTypes': enableImageTypes,
        'enableUserData': enableUserData,
        'nextUpDateCutoff': nextUpDateCutoff,
        'enableTotalRecordCount': enableTotalRecordCount,
        'disableFirstEpisode': disableFirstEpisode,
        'enableRewatching': enableRewatching,
      },
      errors: {
        401: `Unauthorized`,
        403: `Forbidden`,
      },
    });
  }

  /**
   * Gets a list of upcoming episodes.
   * @param userId The user id of the user to get the upcoming episodes for.
   * @param startIndex Optional. The record index to start at. All items with a lower index will be dropped from the results.
   * @param limit Optional. The maximum number of records to return.
   * @param fields Optional. Specify additional fields of information to return in the output.
   * @param parentId Optional. Specify this to localize the search to a specific item or folder. Omit to use the root.
   * @param enableImages Optional. Include image information in output.
   * @param imageTypeLimit Optional. The max number of images to return, per image type.
   * @param enableImageTypes Optional. The image types to include in the output.
   * @param enableUserData Optional. Include user data.
   * @returns BaseItemDtoQueryResult Success
   * @throws ApiError
   */
  public static getUpcomingEpisodes(
    userId?: string,
    startIndex?: number,
    limit?: number,
    fields?: Array<ItemFields>,
    parentId?: string,
    enableImages?: boolean,
    imageTypeLimit?: number,
    enableImageTypes?: Array<ImageType>,
    enableUserData?: boolean,
  ): CancelablePromise<BaseItemDtoQueryResult> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/Shows/Upcoming',
      query: {
        'userId': userId,
        'startIndex': startIndex,
        'limit': limit,
        'fields': fields,
        'parentId': parentId,
        'enableImages': enableImages,
        'imageTypeLimit': imageTypeLimit,
        'enableImageTypes': enableImageTypes,
        'enableUserData': enableUserData,
      },
      errors: {
        401: `Unauthorized`,
        403: `Forbidden`,
      },
    });
  }

}
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BaseItemDto } from '../models/BaseItemDto';
import type { BaseItemDtoQueryResult } from '../models/BaseItemDtoQueryResult';
import type { BaseItemKind } from '../models/BaseItemKind';
import type { ImageType } from '../models/ImageType';
import type { ItemFields } from '../models/ItemFields';
import type { SortOrder } from '../models/SortOrder';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class MusicGenresService {

  /**
   * @deprecated
   * Gets all music genres from a given item, folder, or the entire library.
   * @param startIndex Optional. The record index to start at. All items with a lower index will be dropped from the results.
   * @param limit Optional. The maximum number of records to return.
   * @param searchTerm The search term.
   * @param parentId Specify this to localize the search to a specific item or folder. Omit to use the root.
   * @param fields Optional. Specify additional fields of information to return in the output.
   * @param excludeItemTypes Optional. If specified, results will be filtered out based on item type. This allows multiple, comma delimited.
   * @param includeItemTypes Optional. If specified, results will be filtered in based on item type. This allows multiple, comma delimited.
   * @param isFavorite Optional filter by items that are marked as favorite, or not.
   * @param imageTypeLimit Optional, the max number of images to return, per image type.
   * @param enableImageTypes Optional. The image types to include in the output.
   * @param userId User id.
   * @param nameStartsWithOrGreater Optional filter by items whose name is sorted equally or greater than a given input string.
   * @param nameStartsWith Optional filter by items whose name is sorted equally than a given input string.
   * @param nameLessThan Optional filter by items whose name is equally or lesser than a given input string.
   * @param sortBy Optional. Specify one or more sort orders, comma delimited.
   * @param sortOrder Sort Order - Ascending,Descending.
   * @param enableImages Optional, include image information in output.
   * @param enableTotalRecordCount Optional. Include total record count.
   * @returns BaseItemDtoQueryResult Music genres returned.
   * @throws ApiError
   */
  public static getMusicGenres(
    startIndex?: number,
    limit?: number,
    searchTerm?: string,
    parentId?: string,
    fields?: Array<ItemFields>,
    excludeItemTypes?: Array<BaseItemKind>,
    includeItemTypes?: Array<BaseItemKind>,
    isFavorite?: boolean,
    imageTypeLimit?: number,
    enableImageTypes?: Array<ImageType>,
    userId?: string,
    nameStartsWithOrGreater?: string,
    nameStartsWith?: string,
    nameLessThan?: string,
    sortBy?: Array<string>,
    sortOrder?: Array<SortOrder>,
    enableImages: boolean = true,
    enableTotalRecordCount: boolean = true,
  ): CancelablePromise<BaseItemDtoQueryResult> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/MusicGenres',
      query: {
        'startIndex': startIndex,
        'limit': limit,
        'searchTerm': searchTerm,
        'parentId': parentId,
        'fields': fields,
        'excludeItemTypes': excludeItemTypes,
        'includeItemTypes': includeItemTypes,
        'isFavorite': isFavorite,
        'imageTypeLimit': imageTypeLimit,
        'enableImageTypes': enableImageTypes,
        'userId': userId,
        'nameStartsWithOrGreater': nameStartsWithOrGreater,
        'nameStartsWith': nameStartsWith,
        'nameLessThan': nameLessThan,
        'sortBy': sortBy,
        'sortOrder': sortOrder,
        'enableImages': enableImages,
        'enableTotalRecordCount': enableTotalRecordCount,
      },
      errors: {
        401: `Unauthorized`,
        403: `Forbidden`,
      },
    });
  }

  /**
   * Gets a music genre, by name.
   * @param genreName The genre name.
   * @param userId Optional. Filter by user id, and attach user data.
   * @returns BaseItemDto Success
   * @throws ApiError
   */
  public static getMusicGenre(
    genreName: string,
    userId?: string,
  ): CancelablePromise<BaseItemDto> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/MusicGenres/{genreName}',
      path: {
        'genreName': genreName,
      },
      query: {
        'userId': userId,
      },
      errors: {
        401: `Unauthorized`,
        403: `Forbidden`,
      },
    });
  }

}
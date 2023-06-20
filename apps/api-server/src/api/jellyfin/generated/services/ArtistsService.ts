/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BaseItemDto } from '../models/BaseItemDto';
import type { BaseItemDtoQueryResult } from '../models/BaseItemDtoQueryResult';
import type { BaseItemKind } from '../models/BaseItemKind';
import type { ImageType } from '../models/ImageType';
import type { ItemFields } from '../models/ItemFields';
import type { ItemFilter } from '../models/ItemFilter';
import type { SortOrder } from '../models/SortOrder';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class ArtistsService {

  /**
   * Gets all artists from a given item, folder, or the entire library.
   * @param minCommunityRating Optional filter by minimum community rating.
   * @param startIndex Optional. The record index to start at. All items with a lower index will be dropped from the results.
   * @param limit Optional. The maximum number of records to return.
   * @param searchTerm Optional. Search term.
   * @param parentId Specify this to localize the search to a specific item or folder. Omit to use the root.
   * @param fields Optional. Specify additional fields of information to return in the output.
   * @param excludeItemTypes Optional. If specified, results will be filtered out based on item type. This allows multiple, comma delimited.
   * @param includeItemTypes Optional. If specified, results will be filtered based on item type. This allows multiple, comma delimited.
   * @param filters Optional. Specify additional filters to apply.
   * @param isFavorite Optional filter by items that are marked as favorite, or not.
   * @param mediaTypes Optional filter by MediaType. Allows multiple, comma delimited.
   * @param genres Optional. If specified, results will be filtered based on genre. This allows multiple, pipe delimited.
   * @param genreIds Optional. If specified, results will be filtered based on genre id. This allows multiple, pipe delimited.
   * @param officialRatings Optional. If specified, results will be filtered based on OfficialRating. This allows multiple, pipe delimited.
   * @param tags Optional. If specified, results will be filtered based on tag. This allows multiple, pipe delimited.
   * @param years Optional. If specified, results will be filtered based on production year. This allows multiple, comma delimited.
   * @param enableUserData Optional, include user data.
   * @param imageTypeLimit Optional, the max number of images to return, per image type.
   * @param enableImageTypes Optional. The image types to include in the output.
   * @param person Optional. If specified, results will be filtered to include only those containing the specified person.
   * @param personIds Optional. If specified, results will be filtered to include only those containing the specified person ids.
   * @param personTypes Optional. If specified, along with Person, results will be filtered to include only those containing the specified person and PersonType. Allows multiple, comma-delimited.
   * @param studios Optional. If specified, results will be filtered based on studio. This allows multiple, pipe delimited.
   * @param studioIds Optional. If specified, results will be filtered based on studio id. This allows multiple, pipe delimited.
   * @param userId User id.
   * @param nameStartsWithOrGreater Optional filter by items whose name is sorted equally or greater than a given input string.
   * @param nameStartsWith Optional filter by items whose name is sorted equally than a given input string.
   * @param nameLessThan Optional filter by items whose name is equally or lesser than a given input string.
   * @param sortBy Optional. Specify one or more sort orders, comma delimited.
   * @param sortOrder Sort Order - Ascending,Descending.
   * @param enableImages Optional, include image information in output.
   * @param enableTotalRecordCount Total record count.
   * @returns BaseItemDtoQueryResult Artists returned.
   * @throws ApiError
   */
  public static getArtists(
    minCommunityRating?: number,
    startIndex?: number,
    limit?: number,
    searchTerm?: string,
    parentId?: string,
    fields?: Array<ItemFields>,
    excludeItemTypes?: Array<BaseItemKind>,
    includeItemTypes?: Array<BaseItemKind>,
    filters?: Array<ItemFilter>,
    isFavorite?: boolean,
    mediaTypes?: Array<string>,
    genres?: Array<string>,
    genreIds?: Array<string>,
    officialRatings?: Array<string>,
    tags?: Array<string>,
    years?: Array<number>,
    enableUserData?: boolean,
    imageTypeLimit?: number,
    enableImageTypes?: Array<ImageType>,
    person?: string,
    personIds?: Array<string>,
    personTypes?: Array<string>,
    studios?: Array<string>,
    studioIds?: Array<string>,
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
      url: '/Artists',
      query: {
        'minCommunityRating': minCommunityRating,
        'startIndex': startIndex,
        'limit': limit,
        'searchTerm': searchTerm,
        'parentId': parentId,
        'fields': fields,
        'excludeItemTypes': excludeItemTypes,
        'includeItemTypes': includeItemTypes,
        'filters': filters,
        'isFavorite': isFavorite,
        'mediaTypes': mediaTypes,
        'genres': genres,
        'genreIds': genreIds,
        'officialRatings': officialRatings,
        'tags': tags,
        'years': years,
        'enableUserData': enableUserData,
        'imageTypeLimit': imageTypeLimit,
        'enableImageTypes': enableImageTypes,
        'person': person,
        'personIds': personIds,
        'personTypes': personTypes,
        'studios': studios,
        'studioIds': studioIds,
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
   * Gets an artist by name.
   * @param name Studio name.
   * @param userId Optional. Filter by user id, and attach user data.
   * @returns BaseItemDto Artist returned.
   * @throws ApiError
   */
  public static getArtistByName(
    name: string,
    userId?: string,
  ): CancelablePromise<BaseItemDto> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/Artists/{name}',
      path: {
        'name': name,
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

  /**
   * Gets all album artists from a given item, folder, or the entire library.
   * @param minCommunityRating Optional filter by minimum community rating.
   * @param startIndex Optional. The record index to start at. All items with a lower index will be dropped from the results.
   * @param limit Optional. The maximum number of records to return.
   * @param searchTerm Optional. Search term.
   * @param parentId Specify this to localize the search to a specific item or folder. Omit to use the root.
   * @param fields Optional. Specify additional fields of information to return in the output.
   * @param excludeItemTypes Optional. If specified, results will be filtered out based on item type. This allows multiple, comma delimited.
   * @param includeItemTypes Optional. If specified, results will be filtered based on item type. This allows multiple, comma delimited.
   * @param filters Optional. Specify additional filters to apply.
   * @param isFavorite Optional filter by items that are marked as favorite, or not.
   * @param mediaTypes Optional filter by MediaType. Allows multiple, comma delimited.
   * @param genres Optional. If specified, results will be filtered based on genre. This allows multiple, pipe delimited.
   * @param genreIds Optional. If specified, results will be filtered based on genre id. This allows multiple, pipe delimited.
   * @param officialRatings Optional. If specified, results will be filtered based on OfficialRating. This allows multiple, pipe delimited.
   * @param tags Optional. If specified, results will be filtered based on tag. This allows multiple, pipe delimited.
   * @param years Optional. If specified, results will be filtered based on production year. This allows multiple, comma delimited.
   * @param enableUserData Optional, include user data.
   * @param imageTypeLimit Optional, the max number of images to return, per image type.
   * @param enableImageTypes Optional. The image types to include in the output.
   * @param person Optional. If specified, results will be filtered to include only those containing the specified person.
   * @param personIds Optional. If specified, results will be filtered to include only those containing the specified person ids.
   * @param personTypes Optional. If specified, along with Person, results will be filtered to include only those containing the specified person and PersonType. Allows multiple, comma-delimited.
   * @param studios Optional. If specified, results will be filtered based on studio. This allows multiple, pipe delimited.
   * @param studioIds Optional. If specified, results will be filtered based on studio id. This allows multiple, pipe delimited.
   * @param userId User id.
   * @param nameStartsWithOrGreater Optional filter by items whose name is sorted equally or greater than a given input string.
   * @param nameStartsWith Optional filter by items whose name is sorted equally than a given input string.
   * @param nameLessThan Optional filter by items whose name is equally or lesser than a given input string.
   * @param sortBy Optional. Specify one or more sort orders, comma delimited.
   * @param sortOrder Sort Order - Ascending,Descending.
   * @param enableImages Optional, include image information in output.
   * @param enableTotalRecordCount Total record count.
   * @returns BaseItemDtoQueryResult Album artists returned.
   * @throws ApiError
   */
  public static getAlbumArtists(
    minCommunityRating?: number,
    startIndex?: number,
    limit?: number,
    searchTerm?: string,
    parentId?: string,
    fields?: Array<ItemFields>,
    excludeItemTypes?: Array<BaseItemKind>,
    includeItemTypes?: Array<BaseItemKind>,
    filters?: Array<ItemFilter>,
    isFavorite?: boolean,
    mediaTypes?: Array<string>,
    genres?: Array<string>,
    genreIds?: Array<string>,
    officialRatings?: Array<string>,
    tags?: Array<string>,
    years?: Array<number>,
    enableUserData?: boolean,
    imageTypeLimit?: number,
    enableImageTypes?: Array<ImageType>,
    person?: string,
    personIds?: Array<string>,
    personTypes?: Array<string>,
    studios?: Array<string>,
    studioIds?: Array<string>,
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
      url: '/Artists/AlbumArtists',
      query: {
        'minCommunityRating': minCommunityRating,
        'startIndex': startIndex,
        'limit': limit,
        'searchTerm': searchTerm,
        'parentId': parentId,
        'fields': fields,
        'excludeItemTypes': excludeItemTypes,
        'includeItemTypes': includeItemTypes,
        'filters': filters,
        'isFavorite': isFavorite,
        'mediaTypes': mediaTypes,
        'genres': genres,
        'genreIds': genreIds,
        'officialRatings': officialRatings,
        'tags': tags,
        'years': years,
        'enableUserData': enableUserData,
        'imageTypeLimit': imageTypeLimit,
        'enableImageTypes': enableImageTypes,
        'person': person,
        'personIds': personIds,
        'personTypes': personTypes,
        'studios': studios,
        'studioIds': studioIds,
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

}
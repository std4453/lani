/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BaseItemDto } from '../models/BaseItemDto';
import type { BaseItemDtoQueryResult } from '../models/BaseItemDtoQueryResult';
import type { ImageType } from '../models/ImageType';
import type { ItemFields } from '../models/ItemFields';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class GenresService {

    /**
     * Gets all genres from a given item, folder, or the entire library.
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
     * @param enableImages Optional, include image information in output.
     * @param enableTotalRecordCount Optional. Include total record count.
     * @returns BaseItemDtoQueryResult Genres returned.
     * @throws ApiError
     */
    public static getGenres(
        startIndex?: number | null,
        limit?: number | null,
        searchTerm?: string | null,
        parentId?: string | null,
        fields?: Array<ItemFields> | null,
        excludeItemTypes?: Array<string> | null,
        includeItemTypes?: Array<string> | null,
        isFavorite?: boolean | null,
        imageTypeLimit?: number | null,
        enableImageTypes?: Array<ImageType> | null,
        userId?: string | null,
        nameStartsWithOrGreater?: string | null,
        nameStartsWith?: string | null,
        nameLessThan?: string | null,
        enableImages: boolean | null = true,
        enableTotalRecordCount: boolean = true,
    ): CancelablePromise<BaseItemDtoQueryResult> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Genres',
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
     * Gets a genre, by name.
     * @param genreName The genre name.
     * @param userId The user id.
     * @returns BaseItemDto Genres returned.
     * @throws ApiError
     */
    public static getGenre(
        genreName: string,
        userId?: string | null,
    ): CancelablePromise<BaseItemDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Genres/{genreName}',
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
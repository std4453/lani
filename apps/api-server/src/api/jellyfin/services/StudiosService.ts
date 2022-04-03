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

export class StudiosService {

    /**
     * Gets all studios from a given item, folder, or the entire library.
     * @param startIndex Optional. The record index to start at. All items with a lower index will be dropped from the results.
     * @param limit Optional. The maximum number of records to return.
     * @param searchTerm Optional. Search term.
     * @param parentId Specify this to localize the search to a specific item or folder. Omit to use the root.
     * @param fields Optional. Specify additional fields of information to return in the output.
     * @param excludeItemTypes Optional. If specified, results will be filtered out based on item type. This allows multiple, comma delimited.
     * @param includeItemTypes Optional. If specified, results will be filtered based on item type. This allows multiple, comma delimited.
     * @param isFavorite Optional filter by items that are marked as favorite, or not.
     * @param enableUserData Optional, include user data.
     * @param imageTypeLimit Optional, the max number of images to return, per image type.
     * @param enableImageTypes Optional. The image types to include in the output.
     * @param userId User id.
     * @param nameStartsWithOrGreater Optional filter by items whose name is sorted equally or greater than a given input string.
     * @param nameStartsWith Optional filter by items whose name is sorted equally than a given input string.
     * @param nameLessThan Optional filter by items whose name is equally or lesser than a given input string.
     * @param enableImages Optional, include image information in output.
     * @param enableTotalRecordCount Total record count.
     * @returns BaseItemDtoQueryResult Studios returned.
     * @throws ApiError
     */
    public static getStudios(
        startIndex?: number | null,
        limit?: number | null,
        searchTerm?: string | null,
        parentId?: string | null,
        fields?: Array<ItemFields> | null,
        excludeItemTypes?: Array<string> | null,
        includeItemTypes?: Array<string> | null,
        isFavorite?: boolean | null,
        enableUserData?: boolean | null,
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
            url: '/Studios',
            query: {
                'startIndex': startIndex,
                'limit': limit,
                'searchTerm': searchTerm,
                'parentId': parentId,
                'fields': fields,
                'excludeItemTypes': excludeItemTypes,
                'includeItemTypes': includeItemTypes,
                'isFavorite': isFavorite,
                'enableUserData': enableUserData,
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
     * Gets a studio by name.
     * @param name Studio name.
     * @param userId Optional. Filter by user id, and attach user data.
     * @returns BaseItemDto Studio returned.
     * @throws ApiError
     */
    public static getStudio(
        name: string,
        userId?: string | null,
    ): CancelablePromise<BaseItemDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Studios/{name}',
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

}
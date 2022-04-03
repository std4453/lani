/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BaseItemDto } from '../models/BaseItemDto';
import type { BaseItemDtoQueryResult } from '../models/BaseItemDtoQueryResult';
import type { ImageType } from '../models/ImageType';
import type { ItemFields } from '../models/ItemFields';
import type { SortOrder } from '../models/SortOrder';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class YearsService {

    /**
     * Get years.
     * @param startIndex Skips over a given number of items within the results. Use for paging.
     * @param limit Optional. The maximum number of records to return.
     * @param sortOrder Sort Order - Ascending,Descending.
     * @param parentId Specify this to localize the search to a specific item or folder. Omit to use the root.
     * @param fields Optional. Specify additional fields of information to return in the output.
     * @param excludeItemTypes Optional. If specified, results will be excluded based on item type. This allows multiple, comma delimited.
     * @param includeItemTypes Optional. If specified, results will be included based on item type. This allows multiple, comma delimited.
     * @param mediaTypes Optional. Filter by MediaType. Allows multiple, comma delimited.
     * @param sortBy Optional. Specify one or more sort orders, comma delimited. Options: Album, AlbumArtist, Artist, Budget, CommunityRating, CriticRating, DateCreated, DatePlayed, PlayCount, PremiereDate, ProductionYear, SortName, Random, Revenue, Runtime.
     * @param enableUserData Optional. Include user data.
     * @param imageTypeLimit Optional. The max number of images to return, per image type.
     * @param enableImageTypes Optional. The image types to include in the output.
     * @param userId User Id.
     * @param recursive Search recursively.
     * @param enableImages Optional. Include image information in output.
     * @returns BaseItemDtoQueryResult Year query returned.
     * @throws ApiError
     */
    public static getYears(
        startIndex?: number | null,
        limit?: number | null,
        sortOrder?: Array<SortOrder> | null,
        parentId?: string | null,
        fields?: Array<ItemFields> | null,
        excludeItemTypes?: Array<string> | null,
        includeItemTypes?: Array<string> | null,
        mediaTypes?: Array<string> | null,
        sortBy?: Array<string> | null,
        enableUserData?: boolean | null,
        imageTypeLimit?: number | null,
        enableImageTypes?: Array<ImageType> | null,
        userId?: string | null,
        recursive: boolean = true,
        enableImages: boolean | null = true,
    ): CancelablePromise<BaseItemDtoQueryResult> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Years',
            query: {
                'startIndex': startIndex,
                'limit': limit,
                'sortOrder': sortOrder,
                'parentId': parentId,
                'fields': fields,
                'excludeItemTypes': excludeItemTypes,
                'includeItemTypes': includeItemTypes,
                'mediaTypes': mediaTypes,
                'sortBy': sortBy,
                'enableUserData': enableUserData,
                'imageTypeLimit': imageTypeLimit,
                'enableImageTypes': enableImageTypes,
                'userId': userId,
                'recursive': recursive,
                'enableImages': enableImages,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Gets a year.
     * @param year The year.
     * @param userId Optional. Filter by user id, and attach user data.
     * @returns BaseItemDto Year returned.
     * @throws ApiError
     */
    public static getYear(
        year: number,
        userId?: string | null,
    ): CancelablePromise<BaseItemDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Years/{year}',
            path: {
                'year': year,
            },
            query: {
                'userId': userId,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Year not found.`,
            },
        });
    }

}
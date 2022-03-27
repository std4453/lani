/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { QueryFilters } from '../models/QueryFilters';
import type { QueryFiltersLegacy } from '../models/QueryFiltersLegacy';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class FilterService {

    /**
     * Gets legacy query filters.
     * @param userId Optional. User id.
     * @param parentId Optional. Parent id.
     * @param includeItemTypes Optional. If specified, results will be filtered based on item type. This allows multiple, comma delimited.
     * @param mediaTypes Optional. Filter by MediaType. Allows multiple, comma delimited.
     * @returns QueryFiltersLegacy Legacy filters retrieved.
     * @throws ApiError
     */
    public static getQueryFiltersLegacy(
        userId?: string | null,
        parentId?: string | null,
        includeItemTypes?: Array<string> | null,
        mediaTypes?: Array<string> | null,
    ): CancelablePromise<QueryFiltersLegacy> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Items/Filters',
            query: {
                'userId': userId,
                'parentId': parentId,
                'includeItemTypes': includeItemTypes,
                'mediaTypes': mediaTypes,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Gets query filters.
     * @param userId Optional. User id.
     * @param parentId Optional. Specify this to localize the search to a specific item or folder. Omit to use the root.
     * @param includeItemTypes Optional. If specified, results will be filtered based on item type. This allows multiple, comma delimited.
     * @param isAiring Optional. Is item airing.
     * @param isMovie Optional. Is item movie.
     * @param isSports Optional. Is item sports.
     * @param isKids Optional. Is item kids.
     * @param isNews Optional. Is item news.
     * @param isSeries Optional. Is item series.
     * @param recursive Optional. Search recursive.
     * @returns QueryFilters Filters retrieved.
     * @throws ApiError
     */
    public static getQueryFilters(
        userId?: string | null,
        parentId?: string | null,
        includeItemTypes?: Array<string> | null,
        isAiring?: boolean | null,
        isMovie?: boolean | null,
        isSports?: boolean | null,
        isKids?: boolean | null,
        isNews?: boolean | null,
        isSeries?: boolean | null,
        recursive?: boolean | null,
    ): CancelablePromise<QueryFilters> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Items/Filters2',
            query: {
                'userId': userId,
                'parentId': parentId,
                'includeItemTypes': includeItemTypes,
                'isAiring': isAiring,
                'isMovie': isMovie,
                'isSports': isSports,
                'isKids': isKids,
                'isNews': isNews,
                'isSeries': isSeries,
                'recursive': recursive,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

}
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ItemFields } from '../models/ItemFields';
import type { RecommendationDto } from '../models/RecommendationDto';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class MoviesService {

    /**
     * Gets movie recommendations.
     * @param userId Optional. Filter by user id, and attach user data.
     * @param parentId Specify this to localize the search to a specific item or folder. Omit to use the root.
     * @param fields Optional. The fields to return.
     * @param categoryLimit The max number of categories to return.
     * @param itemLimit The max number of items to return per category.
     * @returns RecommendationDto Movie recommendations returned.
     * @throws ApiError
     */
    public static getMovieRecommendations(
        userId?: string | null,
        parentId?: string | null,
        fields?: Array<ItemFields> | null,
        categoryLimit: number = 5,
        itemLimit: number = 8,
    ): CancelablePromise<Array<RecommendationDto>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Movies/Recommendations',
            query: {
                'userId': userId,
                'parentId': parentId,
                'fields': fields,
                'categoryLimit': categoryLimit,
                'itemLimit': itemLimit,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

}
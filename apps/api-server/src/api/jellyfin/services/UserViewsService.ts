/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BaseItemDtoQueryResult } from '../models/BaseItemDtoQueryResult';
import type { SpecialViewOptionDto } from '../models/SpecialViewOptionDto';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class UserViewsService {

    /**
     * Get user view grouping options.
     * @param userId User id.
     * @returns SpecialViewOptionDto User view grouping options returned.
     * @throws ApiError
     */
    public static getGroupingOptions(
        userId: string,
    ): CancelablePromise<Array<SpecialViewOptionDto>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Users/{userId}/GroupingOptions',
            path: {
                'userId': userId,
            },
            errors: {
                404: `User not found.`,
            },
        });
    }

    /**
     * Get user views.
     * @param userId User id.
     * @param includeExternalContent Whether or not to include external views such as channels or live tv.
     * @param presetViews Preset views.
     * @param includeHidden Whether or not to include hidden content.
     * @returns BaseItemDtoQueryResult User views returned.
     * @throws ApiError
     */
    public static getUserViews(
        userId: string,
        includeExternalContent?: boolean | null,
        presetViews?: Array<string> | null,
        includeHidden: boolean = false,
    ): CancelablePromise<BaseItemDtoQueryResult> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Users/{userId}/Views',
            path: {
                'userId': userId,
            },
            query: {
                'includeExternalContent': includeExternalContent,
                'presetViews': presetViews,
                'includeHidden': includeHidden,
            },
        });
    }

}
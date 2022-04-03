/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BaseItemDtoQueryResult } from '../models/BaseItemDtoQueryResult';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class SuggestionsService {

    /**
     * Gets suggestions.
     * @param userId The user id.
     * @param mediaType The media types.
     * @param type The type.
     * @param startIndex Optional. The start index.
     * @param limit Optional. The limit.
     * @param enableTotalRecordCount Whether to enable the total record count.
     * @returns BaseItemDtoQueryResult Suggestions returned.
     * @throws ApiError
     */
    public static getSuggestions(
        userId: string,
        mediaType?: Array<string> | null,
        type?: Array<string> | null,
        startIndex?: number | null,
        limit?: number | null,
        enableTotalRecordCount: boolean = false,
    ): CancelablePromise<BaseItemDtoQueryResult> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Users/{userId}/Suggestions',
            path: {
                'userId': userId,
            },
            query: {
                'mediaType': mediaType,
                'type': type,
                'startIndex': startIndex,
                'limit': limit,
                'enableTotalRecordCount': enableTotalRecordCount,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

}
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ActivityLogEntryQueryResult } from '../models/ActivityLogEntryQueryResult';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class ActivityLogService {

    /**
     * Gets activity log entries.
     * @param startIndex Optional. The record index to start at. All items with a lower index will be dropped from the results.
     * @param limit Optional. The maximum number of records to return.
     * @param minDate Optional. The minimum date. Format = ISO.
     * @param hasUserId Optional. Filter log entries if it has user id, or not.
     * @returns ActivityLogEntryQueryResult Activity log returned.
     * @throws ApiError
     */
    public static getLogEntries(
        startIndex?: number | null,
        limit?: number | null,
        minDate?: string | null,
        hasUserId?: boolean | null,
    ): CancelablePromise<ActivityLogEntryQueryResult> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/System/ActivityLog/Entries',
            query: {
                'startIndex': startIndex,
                'limit': limit,
                'minDate': minDate,
                'hasUserId': hasUserId,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

}
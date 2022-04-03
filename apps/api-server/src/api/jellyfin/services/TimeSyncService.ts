/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { UtcTimeResponse } from '../models/UtcTimeResponse';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class TimeSyncService {

    /**
     * Gets the current UTC time.
     * @returns UtcTimeResponse Time returned.
     * @throws ApiError
     */
    public static getUtcTime(): CancelablePromise<UtcTimeResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/GetUtcTime',
        });
    }

}
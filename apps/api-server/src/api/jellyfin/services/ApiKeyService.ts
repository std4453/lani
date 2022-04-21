/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AuthenticationInfoQueryResult } from '../models/AuthenticationInfoQueryResult';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class ApiKeyService {

    /**
     * Get all keys.
     * @returns AuthenticationInfoQueryResult Api keys retrieved.
     * @throws ApiError
     */
    public static getKeys(): CancelablePromise<AuthenticationInfoQueryResult> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Auth/Keys',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Create a new api key.
     * @param app Name of the app using the authentication key.
     * @returns void
     * @throws ApiError
     */
    public static createKey(
        app: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/Auth/Keys',
            query: {
                'app': app,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Remove an api key.
     * @param key The access token to delete.
     * @returns void
     * @throws ApiError
     */
    public static revokeKey(
        key: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/Auth/Keys/{key}',
            path: {
                'key': key,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

}
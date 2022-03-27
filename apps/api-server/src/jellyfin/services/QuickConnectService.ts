/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { QuickConnectResult } from '../models/QuickConnectResult';
import type { QuickConnectState } from '../models/QuickConnectState';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class QuickConnectService {

    /**
     * Temporarily activates quick connect for five minutes.
     * @returns void
     * @throws ApiError
     */
    public static activate(): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/QuickConnect/Activate',
            errors: {
                401: `Unauthorized`,
                403: `Quick connect is unavailable on this server.`,
            },
        });
    }

    /**
     * Authorizes a pending quick connect request.
     * @param code Quick connect code to authorize.
     * @returns boolean Quick connect result authorized successfully.
     * @throws ApiError
     */
    public static authorize(
        code: string,
    ): CancelablePromise<boolean> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/QuickConnect/Authorize',
            query: {
                'code': code,
            },
            errors: {
                401: `Unauthorized`,
                403: `Unknown user id.`,
            },
        });
    }

    /**
     * Enables or disables quick connect.
     * @param status New MediaBrowser.Model.QuickConnect.QuickConnectState.
     * @returns void
     * @throws ApiError
     */
    public static available(
        status?: QuickConnectState,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/QuickConnect/Available',
            query: {
                'status': status,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Attempts to retrieve authentication information.
     * @param secret Secret previously returned from the Initiate endpoint.
     * @returns QuickConnectResult Quick connect result returned.
     * @throws ApiError
     */
    public static connect(
        secret: string,
    ): CancelablePromise<QuickConnectResult> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/QuickConnect/Connect',
            query: {
                'secret': secret,
            },
            errors: {
                404: `Unknown quick connect secret.`,
            },
        });
    }

    /**
     * Deauthorize all quick connect devices for the current user.
     * @returns number All quick connect devices were deleted.
     * @throws ApiError
     */
    public static deauthorize(): CancelablePromise<number> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/QuickConnect/Deauthorize',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Initiate a new quick connect request.
     * @returns QuickConnectResult Quick connect request successfully created.
     * @throws ApiError
     */
    public static initiate(): CancelablePromise<QuickConnectResult> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/QuickConnect/Initiate',
            errors: {
                401: `Quick connect is not active on this server.`,
            },
        });
    }

    /**
     * Gets the current quick connect state.
     * @returns QuickConnectState Quick connect state returned.
     * @throws ApiError
     */
    public static getStatus(): CancelablePromise<QuickConnectState> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/QuickConnect/Status',
        });
    }

}
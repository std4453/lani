/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DisplayPreferencesDto } from '../models/DisplayPreferencesDto';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class DisplayPreferencesService {

    /**
     * Get Display Preferences.
     * @param displayPreferencesId Display preferences id.
     * @param userId User id.
     * @param client Client.
     * @returns DisplayPreferencesDto Display preferences retrieved.
     * @throws ApiError
     */
    public static getDisplayPreferences(
        displayPreferencesId: string,
        userId: string,
        client: string,
    ): CancelablePromise<DisplayPreferencesDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/DisplayPreferences/{displayPreferencesId}',
            path: {
                'displayPreferencesId': displayPreferencesId,
            },
            query: {
                'userId': userId,
                'client': client,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Update Display Preferences.
     * @param displayPreferencesId Display preferences id.
     * @param userId User Id.
     * @param client Client.
     * @param requestBody New Display Preferences object.
     * @returns void
     * @throws ApiError
     */
    public static updateDisplayPreferences(
        displayPreferencesId: string,
        userId: string,
        client: string,
        requestBody: DisplayPreferencesDto,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/DisplayPreferences/{displayPreferencesId}',
            path: {
                'displayPreferencesId': displayPreferencesId,
            },
            query: {
                'userId': userId,
                'client': client,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

}
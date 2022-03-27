/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DeviceProfile } from '../models/DeviceProfile';
import type { DeviceProfileInfo } from '../models/DeviceProfileInfo';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class DlnaService {

    /**
     * Get profile infos.
     * @returns DeviceProfileInfo Device profile infos returned.
     * @throws ApiError
     */
    public static getProfileInfos(): CancelablePromise<Array<DeviceProfileInfo>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Dlna/ProfileInfos',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Creates a profile.
     * @param requestBody Device profile.
     * @returns void
     * @throws ApiError
     */
    public static createProfile(
        requestBody?: DeviceProfile | null,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/Dlna/Profiles',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Gets a single profile.
     * @param profileId Profile Id.
     * @returns DeviceProfile Device profile returned.
     * @throws ApiError
     */
    public static getProfile(
        profileId: string,
    ): CancelablePromise<DeviceProfile> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Dlna/Profiles/{profileId}',
            path: {
                'profileId': profileId,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Device profile not found.`,
            },
        });
    }

    /**
     * Deletes a profile.
     * @param profileId Profile id.
     * @returns void
     * @throws ApiError
     */
    public static deleteProfile(
        profileId: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/Dlna/Profiles/{profileId}',
            path: {
                'profileId': profileId,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Device profile not found.`,
            },
        });
    }

    /**
     * Updates a profile.
     * @param profileId Profile id.
     * @param requestBody Device profile.
     * @returns void
     * @throws ApiError
     */
    public static updateProfile(
        profileId: string,
        requestBody?: DeviceProfile | null,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/Dlna/Profiles/{profileId}',
            path: {
                'profileId': profileId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Device profile not found.`,
            },
        });
    }

    /**
     * Gets the default profile.
     * @returns DeviceProfile Default device profile returned.
     * @throws ApiError
     */
    public static getDefaultProfile(): CancelablePromise<DeviceProfile> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Dlna/Profiles/Default',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

}
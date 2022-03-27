/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DeviceInfo } from '../models/DeviceInfo';
import type { DeviceInfoQueryResult } from '../models/DeviceInfoQueryResult';
import type { DeviceOptions } from '../models/DeviceOptions';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class DevicesService {

    /**
     * Get Devices.
     * @param supportsSync Gets or sets a value indicating whether [supports synchronize].
     * @param userId Gets or sets the user identifier.
     * @returns DeviceInfoQueryResult Devices retrieved.
     * @throws ApiError
     */
    public static getDevices(
        supportsSync?: boolean | null,
        userId?: string | null,
    ): CancelablePromise<DeviceInfoQueryResult> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Devices',
            query: {
                'supportsSync': supportsSync,
                'userId': userId,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Deletes a device.
     * @param id Device Id.
     * @returns void
     * @throws ApiError
     */
    public static deleteDevice(
        id: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/Devices',
            query: {
                'id': id,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Device not found.`,
            },
        });
    }

    /**
     * Get info for a device.
     * @param id Device Id.
     * @returns DeviceInfo Device info retrieved.
     * @throws ApiError
     */
    public static getDeviceInfo(
        id: string,
    ): CancelablePromise<DeviceInfo> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Devices/Info',
            query: {
                'id': id,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Device not found.`,
            },
        });
    }

    /**
     * Get options for a device.
     * @param id Device Id.
     * @returns DeviceOptions Device options retrieved.
     * @throws ApiError
     */
    public static getDeviceOptions(
        id: string,
    ): CancelablePromise<DeviceOptions> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Devices/Options',
            query: {
                'id': id,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Device not found.`,
            },
        });
    }

    /**
     * Update device options.
     * @param id Device Id.
     * @param requestBody Device Options.
     * @returns void
     * @throws ApiError
     */
    public static updateDeviceOptions(
        id: string,
        requestBody: DeviceOptions,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/Devices/Options',
            query: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Device not found.`,
            },
        });
    }

}
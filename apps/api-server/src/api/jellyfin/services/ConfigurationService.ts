/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { MediaEncoderPathDto } from '../models/MediaEncoderPathDto';
import type { MetadataOptions } from '../models/MetadataOptions';
import type { ServerConfiguration } from '../models/ServerConfiguration';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class ConfigurationService {

    /**
     * Gets application configuration.
     * @returns ServerConfiguration Application configuration returned.
     * @throws ApiError
     */
    public static getConfiguration(): CancelablePromise<ServerConfiguration> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/System/Configuration',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Updates application configuration.
     * @param requestBody Configuration.
     * @returns void
     * @throws ApiError
     */
    public static updateConfiguration(
        requestBody: ServerConfiguration,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/System/Configuration',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Gets a named configuration.
     * @param key Configuration key.
     * @returns binary Configuration returned.
     * @throws ApiError
     */
    public static getNamedConfiguration(
        key: string,
    ): CancelablePromise<Blob> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/System/Configuration/{key}',
            path: {
                'key': key,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Updates named configuration.
     * @param key Configuration key.
     * @returns void
     * @throws ApiError
     */
    public static updateNamedConfiguration(
        key: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/System/Configuration/{key}',
            path: {
                'key': key,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Gets a default MetadataOptions object.
     * @returns MetadataOptions Metadata options returned.
     * @throws ApiError
     */
    public static getDefaultMetadataOptions(): CancelablePromise<MetadataOptions> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/System/Configuration/MetadataOptions/Default',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Updates the path to the media encoder.
     * @param requestBody Media encoder path form body.
     * @returns void
     * @throws ApiError
     */
    public static updateMediaEncoderPath(
        requestBody: MediaEncoderPathDto,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/System/MediaEncoder/Path',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

}
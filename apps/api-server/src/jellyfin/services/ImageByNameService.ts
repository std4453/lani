/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ImageByNameInfo } from '../models/ImageByNameInfo';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class ImageByNameService {

    /**
     * Get all general images.
     * @returns ImageByNameInfo Retrieved list of images.
     * @throws ApiError
     */
    public static getGeneralImages(): CancelablePromise<Array<ImageByNameInfo>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Images/General',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Get General Image.
     * @param name The name of the image.
     * @param type Image Type (primary, backdrop, logo, etc).
     * @returns binary Image stream retrieved.
     * @throws ApiError
     */
    public static getGeneralImage(
        name: string,
        type: string,
    ): CancelablePromise<Blob> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Images/General/{name}/{type}',
            path: {
                'name': name,
                'type': type,
            },
            errors: {
                404: `Image not found.`,
            },
        });
    }

    /**
     * Get all media info images.
     * @returns ImageByNameInfo Image list retrieved.
     * @throws ApiError
     */
    public static getMediaInfoImages(): CancelablePromise<Array<ImageByNameInfo>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Images/MediaInfo',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Get media info image.
     * @param theme The theme to get the image from.
     * @param name The name of the image.
     * @returns binary Image stream retrieved.
     * @throws ApiError
     */
    public static getMediaInfoImage(
        theme: string,
        name: string,
    ): CancelablePromise<Blob> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Images/MediaInfo/{theme}/{name}',
            path: {
                'theme': theme,
                'name': name,
            },
            errors: {
                404: `Image not found.`,
            },
        });
    }

    /**
     * Get all general images.
     * @returns ImageByNameInfo Retrieved list of images.
     * @throws ApiError
     */
    public static getRatingImages(): CancelablePromise<Array<ImageByNameInfo>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Images/Ratings',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Get rating image.
     * @param theme The theme to get the image from.
     * @param name The name of the image.
     * @returns binary Image stream retrieved.
     * @throws ApiError
     */
    public static getRatingImage(
        theme: string,
        name: string,
    ): CancelablePromise<Blob> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Images/Ratings/{theme}/{name}',
            path: {
                'theme': theme,
                'name': name,
            },
            errors: {
                404: `Image not found.`,
            },
        });
    }

}
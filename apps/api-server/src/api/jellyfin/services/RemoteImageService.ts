/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ImageProviderInfo } from '../models/ImageProviderInfo';
import type { ImageType } from '../models/ImageType';
import type { RemoteImageResult } from '../models/RemoteImageResult';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class RemoteImageService {

    /**
     * Gets available remote images for an item.
     * @param itemId Item Id.
     * @param type The image type.
     * @param startIndex Optional. The record index to start at. All items with a lower index will be dropped from the results.
     * @param limit Optional. The maximum number of records to return.
     * @param providerName Optional. The image provider to use.
     * @param includeAllLanguages Optional. Include all languages.
     * @returns RemoteImageResult Remote Images returned.
     * @throws ApiError
     */
    public static getRemoteImages(
        itemId: string,
        type?: ImageType | null,
        startIndex?: number | null,
        limit?: number | null,
        providerName?: string | null,
        includeAllLanguages: boolean = false,
    ): CancelablePromise<RemoteImageResult> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Items/{itemId}/RemoteImages',
            path: {
                'itemId': itemId,
            },
            query: {
                'type': type,
                'startIndex': startIndex,
                'limit': limit,
                'providerName': providerName,
                'includeAllLanguages': includeAllLanguages,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Item not found.`,
            },
        });
    }

    /**
     * Downloads a remote image for an item.
     * @param itemId Item Id.
     * @param type The image type.
     * @param imageUrl The image url.
     * @returns void
     * @throws ApiError
     */
    public static downloadRemoteImage(
        itemId: string,
        type: ImageType,
        imageUrl?: string | null,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/Items/{itemId}/RemoteImages/Download',
            path: {
                'itemId': itemId,
            },
            query: {
                'type': type,
                'imageUrl': imageUrl,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Remote image not found.`,
            },
        });
    }

    /**
     * Gets available remote image providers for an item.
     * @param itemId Item Id.
     * @returns ImageProviderInfo Returned remote image providers.
     * @throws ApiError
     */
    public static getRemoteImageProviders(
        itemId: string,
    ): CancelablePromise<Array<ImageProviderInfo>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Items/{itemId}/RemoteImages/Providers',
            path: {
                'itemId': itemId,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Item not found.`,
            },
        });
    }

}
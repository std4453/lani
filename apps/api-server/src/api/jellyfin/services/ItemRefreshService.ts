/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { MetadataRefreshMode } from '../models/MetadataRefreshMode';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class ItemRefreshService {

    /**
     * Refreshes metadata for an item.
     * @param itemId Item id.
     * @param metadataRefreshMode (Optional) Specifies the metadata refresh mode.
     * @param imageRefreshMode (Optional) Specifies the image refresh mode.
     * @param replaceAllMetadata (Optional) Determines if metadata should be replaced. Only applicable if mode is FullRefresh.
     * @param replaceAllImages (Optional) Determines if images should be replaced. Only applicable if mode is FullRefresh.
     * @returns void
     * @throws ApiError
     */
    public static post(
        itemId: string,
        metadataRefreshMode?: MetadataRefreshMode,
        imageRefreshMode?: MetadataRefreshMode,
        replaceAllMetadata: boolean = false,
        replaceAllImages: boolean = false,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/Items/{itemId}/Refresh',
            path: {
                'itemId': itemId,
            },
            query: {
                'metadataRefreshMode': metadataRefreshMode,
                'imageRefreshMode': imageRefreshMode,
                'replaceAllMetadata': replaceAllMetadata,
                'replaceAllImages': replaceAllImages,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Item to refresh not found.`,
            },
        });
    }

}
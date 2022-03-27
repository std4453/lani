/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BaseItemDto } from '../models/BaseItemDto';
import type { MetadataEditorInfo } from '../models/MetadataEditorInfo';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class ItemUpdateService {

    /**
     * Updates an item.
     * @param itemId The item id.
     * @param requestBody The new item properties.
     * @returns void
     * @throws ApiError
     */
    public static updateItem(
        itemId: string,
        requestBody: BaseItemDto,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/Items/{itemId}',
            path: {
                'itemId': itemId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Item not found.`,
            },
        });
    }

    /**
     * Updates an item's content type.
     * @param itemId The item id.
     * @param contentType The content type of the item.
     * @returns void
     * @throws ApiError
     */
    public static updateItemContentType(
        itemId: string,
        contentType?: string | null,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/Items/{itemId}/ContentType',
            path: {
                'itemId': itemId,
            },
            query: {
                'contentType': contentType,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Item not found.`,
            },
        });
    }

    /**
     * Gets metadata editor info for an item.
     * @param itemId The item id.
     * @returns MetadataEditorInfo Item metadata editor returned.
     * @throws ApiError
     */
    public static getMetadataEditorInfo(
        itemId: string,
    ): CancelablePromise<MetadataEditorInfo> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Items/{itemId}/MetadataEditor',
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
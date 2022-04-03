/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CollectionCreationResult } from '../models/CollectionCreationResult';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class CollectionService {

    /**
     * Creates a new collection.
     * @param name The name of the collection.
     * @param ids Item Ids to add to the collection.
     * @param parentId Optional. Create the collection within a specific folder.
     * @param isLocked Whether or not to lock the new collection.
     * @returns CollectionCreationResult Collection created.
     * @throws ApiError
     */
    public static createCollection(
        name?: string | null,
        ids?: Array<string> | null,
        parentId?: string | null,
        isLocked: boolean = false,
    ): CancelablePromise<CollectionCreationResult> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/Collections',
            query: {
                'name': name,
                'ids': ids,
                'parentId': parentId,
                'isLocked': isLocked,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Adds items to a collection.
     * @param collectionId The collection id.
     * @param ids Item ids, comma delimited.
     * @returns void
     * @throws ApiError
     */
    public static addToCollection(
        collectionId: string,
        ids: Array<string>,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/Collections/{collectionId}/Items',
            path: {
                'collectionId': collectionId,
            },
            query: {
                'ids': ids,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Removes items from a collection.
     * @param collectionId The collection id.
     * @param ids Item ids, comma delimited.
     * @returns void
     * @throws ApiError
     */
    public static removeFromCollection(
        collectionId: string,
        ids: Array<string>,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/Collections/{collectionId}/Items',
            path: {
                'collectionId': collectionId,
            },
            query: {
                'ids': ids,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

}
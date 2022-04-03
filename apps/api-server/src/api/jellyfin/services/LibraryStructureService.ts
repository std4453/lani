/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AddVirtualFolderDto } from '../models/AddVirtualFolderDto';
import type { CollectionTypeOptions } from '../models/CollectionTypeOptions';
import type { MediaPathDto } from '../models/MediaPathDto';
import type { UpdateLibraryOptionsDto } from '../models/UpdateLibraryOptionsDto';
import type { UpdateMediaPathRequestDto } from '../models/UpdateMediaPathRequestDto';
import type { VirtualFolderInfo } from '../models/VirtualFolderInfo';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class LibraryStructureService {

    /**
     * Gets all virtual folders.
     * @returns VirtualFolderInfo Virtual folders retrieved.
     * @throws ApiError
     */
    public static getVirtualFolders(): CancelablePromise<Array<VirtualFolderInfo>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Library/VirtualFolders',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Adds a virtual folder.
     * @param name The name of the virtual folder.
     * @param collectionType The type of the collection.
     * @param paths The paths of the virtual folder.
     * @param refreshLibrary Whether to refresh the library.
     * @param requestBody The library options.
     * @returns void
     * @throws ApiError
     */
    public static addVirtualFolder(
        name?: string | null,
        collectionType?: CollectionTypeOptions | null,
        paths?: Array<string> | null,
        refreshLibrary: boolean = false,
        requestBody?: AddVirtualFolderDto | null,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/Library/VirtualFolders',
            query: {
                'name': name,
                'collectionType': collectionType,
                'paths': paths,
                'refreshLibrary': refreshLibrary,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Removes a virtual folder.
     * @param name The name of the folder.
     * @param refreshLibrary Whether to refresh the library.
     * @returns void
     * @throws ApiError
     */
    public static removeVirtualFolder(
        name?: string | null,
        refreshLibrary: boolean = false,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/Library/VirtualFolders',
            query: {
                'name': name,
                'refreshLibrary': refreshLibrary,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Update library options.
     * @param requestBody The library name and options.
     * @returns void
     * @throws ApiError
     */
    public static updateLibraryOptions(
        requestBody?: UpdateLibraryOptionsDto | null,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/Library/VirtualFolders/LibraryOptions',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Renames a virtual folder.
     * @param name The name of the virtual folder.
     * @param newName The new name.
     * @param refreshLibrary Whether to refresh the library.
     * @returns void
     * @throws ApiError
     */
    public static renameVirtualFolder(
        name?: string | null,
        newName?: string | null,
        refreshLibrary: boolean = false,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/Library/VirtualFolders/Name',
            query: {
                'name': name,
                'newName': newName,
                'refreshLibrary': refreshLibrary,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Library doesn't exist.`,
                409: `Library already exists.`,
            },
        });
    }

    /**
     * Add a media path to a library.
     * @param requestBody The media path dto.
     * @param refreshLibrary Whether to refresh the library.
     * @returns void
     * @throws ApiError
     */
    public static addMediaPath(
        requestBody: MediaPathDto,
        refreshLibrary: boolean = false,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/Library/VirtualFolders/Paths',
            query: {
                'refreshLibrary': refreshLibrary,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Remove a media path.
     * @param name The name of the library.
     * @param path The path to remove.
     * @param refreshLibrary Whether to refresh the library.
     * @returns void
     * @throws ApiError
     */
    public static removeMediaPath(
        name?: string | null,
        path?: string | null,
        refreshLibrary: boolean = false,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/Library/VirtualFolders/Paths',
            query: {
                'name': name,
                'path': path,
                'refreshLibrary': refreshLibrary,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Updates a media path.
     * @param requestBody The name of the library and path infos.
     * @returns void
     * @throws ApiError
     */
    public static updateMediaPath(
        requestBody: UpdateMediaPathRequestDto,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/Library/VirtualFolders/Paths/Update',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

}
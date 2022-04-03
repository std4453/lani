/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DefaultDirectoryBrowserInfoDto } from '../models/DefaultDirectoryBrowserInfoDto';
import type { FileSystemEntryInfo } from '../models/FileSystemEntryInfo';
import type { ValidatePathDto } from '../models/ValidatePathDto';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class EnvironmentService {

    /**
     * Get Default directory browser.
     * @returns DefaultDirectoryBrowserInfoDto Default directory browser returned.
     * @throws ApiError
     */
    public static getDefaultDirectoryBrowser(): CancelablePromise<DefaultDirectoryBrowserInfoDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Environment/DefaultDirectoryBrowser',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Gets the contents of a given directory in the file system.
     * @param path The path.
     * @param includeFiles An optional filter to include or exclude files from the results. true/false.
     * @param includeDirectories An optional filter to include or exclude folders from the results. true/false.
     * @returns FileSystemEntryInfo Directory contents returned.
     * @throws ApiError
     */
    public static getDirectoryContents(
        path: string,
        includeFiles: boolean = false,
        includeDirectories: boolean = false,
    ): CancelablePromise<Array<FileSystemEntryInfo>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Environment/DirectoryContents',
            query: {
                'path': path,
                'includeFiles': includeFiles,
                'includeDirectories': includeDirectories,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Gets available drives from the server's file system.
     * @returns FileSystemEntryInfo List of entries returned.
     * @throws ApiError
     */
    public static getDrives(): CancelablePromise<Array<FileSystemEntryInfo>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Environment/Drives',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * @deprecated
     * Gets network paths.
     * @returns FileSystemEntryInfo Empty array returned.
     * @throws ApiError
     */
    public static getNetworkShares(): CancelablePromise<Array<FileSystemEntryInfo>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Environment/NetworkShares',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Gets the parent path of a given path.
     * @param path The path.
     * @returns string Success
     * @throws ApiError
     */
    public static getParentPath(
        path: string,
    ): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Environment/ParentPath',
            query: {
                'path': path,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Validates path.
     * @param requestBody Validate request object.
     * @returns void
     * @throws ApiError
     */
    public static validatePath(
        requestBody: ValidatePathDto,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/Environment/ValidatePath',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Path not found.`,
            },
        });
    }

}
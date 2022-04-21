/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PackageInfo } from '../models/PackageInfo';
import type { RepositoryInfo } from '../models/RepositoryInfo';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class PackageService {

    /**
     * Gets available packages.
     * @returns PackageInfo Available packages returned.
     * @throws ApiError
     */
    public static getPackages(): CancelablePromise<Array<PackageInfo>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Packages',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Gets a package by name or assembly GUID.
     * @param name The name of the package.
     * @param assemblyGuid The GUID of the associated assembly.
     * @returns PackageInfo Package retrieved.
     * @throws ApiError
     */
    public static getPackageInfo(
        name: string,
        assemblyGuid?: string | null,
    ): CancelablePromise<PackageInfo> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Packages/{name}',
            path: {
                'name': name,
            },
            query: {
                'assemblyGuid': assemblyGuid,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Installs a package.
     * @param name Package name.
     * @param assemblyGuid GUID of the associated assembly.
     * @param version Optional version. Defaults to latest version.
     * @param repositoryUrl Optional. Specify the repository to install from.
     * @returns void
     * @throws ApiError
     */
    public static installPackage(
        name: string,
        assemblyGuid?: string | null,
        version?: string | null,
        repositoryUrl?: string | null,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/Packages/Installed/{name}',
            path: {
                'name': name,
            },
            query: {
                'assemblyGuid': assemblyGuid,
                'version': version,
                'repositoryUrl': repositoryUrl,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Package not found.`,
            },
        });
    }

    /**
     * Cancels a package installation.
     * @param packageId Installation Id.
     * @returns void
     * @throws ApiError
     */
    public static cancelPackageInstallation(
        packageId: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/Packages/Installing/{packageId}',
            path: {
                'packageId': packageId,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Gets all package repositories.
     * @returns RepositoryInfo Package repositories returned.
     * @throws ApiError
     */
    public static getRepositories(): CancelablePromise<Array<RepositoryInfo>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Repositories',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Sets the enabled and existing package repositories.
     * @param requestBody The list of package repositories.
     * @returns void
     * @throws ApiError
     */
    public static setRepositories(
        requestBody: Array<RepositoryInfo>,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/Repositories',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

}
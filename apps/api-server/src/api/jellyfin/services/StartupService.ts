/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { StartupConfigurationDto } from '../models/StartupConfigurationDto';
import type { StartupRemoteAccessDto } from '../models/StartupRemoteAccessDto';
import type { StartupUserDto } from '../models/StartupUserDto';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class StartupService {

    /**
     * Completes the startup wizard.
     * @returns void
     * @throws ApiError
     */
    public static completeWizard(): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/Startup/Complete',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Gets the initial startup wizard configuration.
     * @returns StartupConfigurationDto Initial startup wizard configuration retrieved.
     * @throws ApiError
     */
    public static getStartupConfiguration(): CancelablePromise<StartupConfigurationDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Startup/Configuration',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Sets the initial startup wizard configuration.
     * @param requestBody The updated startup configuration.
     * @returns void
     * @throws ApiError
     */
    public static updateInitialConfiguration(
        requestBody: StartupConfigurationDto,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/Startup/Configuration',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Gets the first user.
     * @returns StartupUserDto Initial user retrieved.
     * @throws ApiError
     */
    public static getFirstUser2(): CancelablePromise<StartupUserDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Startup/FirstUser',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Sets remote access and UPnP.
     * @param requestBody The startup remote access dto.
     * @returns void
     * @throws ApiError
     */
    public static setRemoteAccess(
        requestBody: StartupRemoteAccessDto,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/Startup/RemoteAccess',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Gets the first user.
     * @returns StartupUserDto Initial user retrieved.
     * @throws ApiError
     */
    public static getFirstUser(): CancelablePromise<StartupUserDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Startup/User',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Sets the user name and password.
     * @param requestBody The DTO containing username and password.
     * @returns void
     * @throws ApiError
     */
    public static updateStartupUser(
        requestBody?: StartupUserDto | null,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/Startup/User',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

}
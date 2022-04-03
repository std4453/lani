/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { EndPointInfo } from '../models/EndPointInfo';
import type { LogFile } from '../models/LogFile';
import type { PublicSystemInfo } from '../models/PublicSystemInfo';
import type { SystemInfo } from '../models/SystemInfo';
import type { WakeOnLanInfo } from '../models/WakeOnLanInfo';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class SystemService {

    /**
     * Gets information about the request endpoint.
     * @returns EndPointInfo Information retrieved.
     * @throws ApiError
     */
    public static getEndpointInfo(): CancelablePromise<EndPointInfo> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/System/Endpoint',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Gets information about the server.
     * @returns SystemInfo Information retrieved.
     * @throws ApiError
     */
    public static getSystemInfo(): CancelablePromise<SystemInfo> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/System/Info',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Gets public information about the server.
     * @returns PublicSystemInfo Information retrieved.
     * @throws ApiError
     */
    public static getPublicSystemInfo(): CancelablePromise<PublicSystemInfo> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/System/Info/Public',
        });
    }

    /**
     * Gets a list of available server log files.
     * @returns LogFile Information retrieved.
     * @throws ApiError
     */
    public static getServerLogs(): CancelablePromise<Array<LogFile>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/System/Logs',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Gets a log file.
     * @param name The name of the log file to get.
     * @returns binary Log file retrieved.
     * @throws ApiError
     */
    public static getLogFile(
        name: string,
    ): CancelablePromise<Blob> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/System/Logs/Log',
            query: {
                'name': name,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Pings the system.
     * @returns string Information retrieved.
     * @throws ApiError
     */
    public static getPingSystem(): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/System/Ping',
        });
    }

    /**
     * Pings the system.
     * @returns string Information retrieved.
     * @throws ApiError
     */
    public static postPingSystem(): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/System/Ping',
        });
    }

    /**
     * Restarts the application.
     * @returns void
     * @throws ApiError
     */
    public static restartApplication(): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/System/Restart',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Shuts down the application.
     * @returns void
     * @throws ApiError
     */
    public static shutdownApplication(): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/System/Shutdown',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Gets wake on lan information.
     * @returns WakeOnLanInfo Information retrieved.
     * @throws ApiError
     */
    public static getWakeOnLanInfo(): CancelablePromise<Array<WakeOnLanInfo>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/System/WakeOnLanInfo',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

}
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BasePluginConfiguration } from '../models/BasePluginConfiguration';
import type { PluginInfo } from '../models/PluginInfo';
import type { PluginSecurityInfo } from '../models/PluginSecurityInfo';
import type { Version } from '../models/Version';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class PluginsService {

    /**
     * Gets a list of currently installed plugins.
     * @returns PluginInfo Installed plugins returned.
     * @throws ApiError
     */
    public static getPlugins(): CancelablePromise<Array<PluginInfo>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Plugins',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * @deprecated
     * Uninstalls a plugin.
     * @param pluginId Plugin id.
     * @returns void
     * @throws ApiError
     */
    public static uninstallPlugin(
        pluginId: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/Plugins/{pluginId}',
            path: {
                'pluginId': pluginId,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Plugin not found.`,
            },
        });
    }

    /**
     * Uninstalls a plugin by version.
     * @param pluginId Plugin id.
     * @param version Plugin version.
     * @returns void
     * @throws ApiError
     */
    public static uninstallPluginByVersion(
        pluginId: string,
        version: Version,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/Plugins/{pluginId}/{version}',
            path: {
                'pluginId': pluginId,
                'version': version,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Plugin not found.`,
            },
        });
    }

    /**
     * Disable a plugin.
     * @param pluginId Plugin id.
     * @param version Plugin version.
     * @returns void
     * @throws ApiError
     */
    public static disablePlugin(
        pluginId: string,
        version: Version,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/Plugins/{pluginId}/{version}/Disable',
            path: {
                'pluginId': pluginId,
                'version': version,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Plugin not found.`,
            },
        });
    }

    /**
     * Enables a disabled plugin.
     * @param pluginId Plugin id.
     * @param version Plugin version.
     * @returns void
     * @throws ApiError
     */
    public static enablePlugin(
        pluginId: string,
        version: Version,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/Plugins/{pluginId}/{version}/Enable',
            path: {
                'pluginId': pluginId,
                'version': version,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Plugin not found.`,
            },
        });
    }

    /**
     * Gets a plugin's image.
     * @param pluginId Plugin id.
     * @param version Plugin version.
     * @returns binary Plugin image returned.
     * @throws ApiError
     */
    public static getPluginImage(
        pluginId: string,
        version: Version,
    ): CancelablePromise<Blob> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Plugins/{pluginId}/{version}/Image',
            path: {
                'pluginId': pluginId,
                'version': version,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }

    /**
     * Gets plugin configuration.
     * @param pluginId Plugin id.
     * @returns BasePluginConfiguration Plugin configuration returned.
     * @throws ApiError
     */
    public static getPluginConfiguration(
        pluginId: string,
    ): CancelablePromise<BasePluginConfiguration> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Plugins/{pluginId}/Configuration',
            path: {
                'pluginId': pluginId,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Plugin not found or plugin configuration not found.`,
            },
        });
    }

    /**
     * Updates plugin configuration.
     * Accepts plugin configuration as JSON body.
     * @param pluginId Plugin id.
     * @returns void
     * @throws ApiError
     */
    public static updatePluginConfiguration(
        pluginId: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/Plugins/{pluginId}/Configuration',
            path: {
                'pluginId': pluginId,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Plugin not found or plugin does not have configuration.`,
            },
        });
    }

    /**
     * Gets a plugin's manifest.
     * @param pluginId Plugin id.
     * @returns void
     * @throws ApiError
     */
    public static getPluginManifest(
        pluginId: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/Plugins/{pluginId}/Manifest',
            path: {
                'pluginId': pluginId,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Plugin not found.`,
            },
        });
    }

    /**
     * @deprecated
     * Updates plugin security info.
     * @param requestBody Plugin security info.
     * @returns void
     * @throws ApiError
     */
    public static updatePluginSecurityInfo(
        requestBody: PluginSecurityInfo,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/Plugins/SecurityInfo',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

}
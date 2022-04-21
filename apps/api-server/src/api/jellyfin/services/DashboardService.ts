/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ConfigurationPageInfo } from '../models/ConfigurationPageInfo';
import type { ConfigurationPageType } from '../models/ConfigurationPageType';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class DashboardService {

    /**
     * Gets a dashboard configuration page.
     * @param name The name of the page.
     * @returns binary ConfigurationPage returned.
     * @throws ApiError
     */
    public static getDashboardConfigurationPage(
        name?: string | null,
    ): CancelablePromise<Blob> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/web/ConfigurationPage',
            query: {
                'name': name,
            },
            errors: {
                404: `Plugin configuration page not found.`,
            },
        });
    }

    /**
     * Gets the configuration pages.
     * @param enableInMainMenu Whether to enable in the main menu.
     * @param pageType The Jellyfin.Api.Models.ConfigurationPageInfo.
     * @returns ConfigurationPageInfo ConfigurationPages returned.
     * @throws ApiError
     */
    public static getConfigurationPages(
        enableInMainMenu?: boolean | null,
        pageType?: ConfigurationPageType | null,
    ): CancelablePromise<Array<ConfigurationPageInfo>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/web/ConfigurationPages',
            query: {
                'enableInMainMenu': enableInMainMenu,
                'pageType': pageType,
            },
            errors: {
                404: `Server still loading.`,
            },
        });
    }

}
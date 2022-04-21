/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BrandingOptions } from '../models/BrandingOptions';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class BrandingService {

    /**
     * Gets branding configuration.
     * @returns BrandingOptions Branding configuration returned.
     * @throws ApiError
     */
    public static getBrandingOptions(): CancelablePromise<BrandingOptions> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Branding/Configuration',
        });
    }

    /**
     * Gets branding css.
     * @returns string Branding css returned.
     * @throws ApiError
     */
    public static getBrandingCss(): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Branding/Css',
        });
    }

    /**
     * Gets branding css.
     * @returns string Branding css returned.
     * @throws ApiError
     */
    public static getBrandingCss2(): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Branding/Css.css',
        });
    }

}
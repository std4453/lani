/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CountryInfo } from '../models/CountryInfo';
import type { CultureDto } from '../models/CultureDto';
import type { LocalizationOption } from '../models/LocalizationOption';
import type { ParentalRating } from '../models/ParentalRating';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class LocalizationService {

    /**
     * Gets known countries.
     * @returns CountryInfo Known countries returned.
     * @throws ApiError
     */
    public static getCountries(): CancelablePromise<Array<CountryInfo>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Localization/Countries',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Gets known cultures.
     * @returns CultureDto Known cultures returned.
     * @throws ApiError
     */
    public static getCultures(): CancelablePromise<Array<CultureDto>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Localization/Cultures',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Gets localization options.
     * @returns LocalizationOption Localization options returned.
     * @throws ApiError
     */
    public static getLocalizationOptions(): CancelablePromise<Array<LocalizationOption>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Localization/Options',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Gets known parental ratings.
     * @returns ParentalRating Known parental ratings returned.
     * @throws ApiError
     */
    public static getParentalRatings(): CancelablePromise<Array<ParentalRating>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Localization/ParentalRatings',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

}
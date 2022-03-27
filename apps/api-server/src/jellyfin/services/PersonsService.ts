/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BaseItemDto } from '../models/BaseItemDto';
import type { BaseItemDtoQueryResult } from '../models/BaseItemDtoQueryResult';
import type { ImageType } from '../models/ImageType';
import type { ItemFields } from '../models/ItemFields';
import type { ItemFilter } from '../models/ItemFilter';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class PersonsService {

    /**
     * Gets all persons.
     * @param limit Optional. The maximum number of records to return.
     * @param searchTerm The search term.
     * @param fields Optional. Specify additional fields of information to return in the output.
     * @param filters Optional. Specify additional filters to apply.
     * @param isFavorite Optional filter by items that are marked as favorite, or not. userId is required.
     * @param enableUserData Optional, include user data.
     * @param imageTypeLimit Optional, the max number of images to return, per image type.
     * @param enableImageTypes Optional. The image types to include in the output.
     * @param excludePersonTypes Optional. If specified results will be filtered to exclude those containing the specified PersonType. Allows multiple, comma-delimited.
     * @param personTypes Optional. If specified results will be filtered to include only those containing the specified PersonType. Allows multiple, comma-delimited.
     * @param appearsInItemId Optional. If specified, person results will be filtered on items related to said persons.
     * @param userId User id.
     * @param enableImages Optional, include image information in output.
     * @returns BaseItemDtoQueryResult Persons returned.
     * @throws ApiError
     */
    public static getPersons(
        limit?: number | null,
        searchTerm?: string | null,
        fields?: Array<ItemFields> | null,
        filters?: Array<ItemFilter> | null,
        isFavorite?: boolean | null,
        enableUserData?: boolean | null,
        imageTypeLimit?: number | null,
        enableImageTypes?: Array<ImageType> | null,
        excludePersonTypes?: Array<string> | null,
        personTypes?: Array<string> | null,
        appearsInItemId?: string | null,
        userId?: string | null,
        enableImages: boolean | null = true,
    ): CancelablePromise<BaseItemDtoQueryResult> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Persons',
            query: {
                'limit': limit,
                'searchTerm': searchTerm,
                'fields': fields,
                'filters': filters,
                'isFavorite': isFavorite,
                'enableUserData': enableUserData,
                'imageTypeLimit': imageTypeLimit,
                'enableImageTypes': enableImageTypes,
                'excludePersonTypes': excludePersonTypes,
                'personTypes': personTypes,
                'appearsInItemId': appearsInItemId,
                'userId': userId,
                'enableImages': enableImages,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Get person by name.
     * @param name Person name.
     * @param userId Optional. Filter by user id, and attach user data.
     * @returns BaseItemDto Person returned.
     * @throws ApiError
     */
    public static getPerson(
        name: string,
        userId?: string | null,
    ): CancelablePromise<BaseItemDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Persons/{name}',
            path: {
                'name': name,
            },
            query: {
                'userId': userId,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Person not found.`,
            },
        });
    }

}
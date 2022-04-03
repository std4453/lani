/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BaseItemDtoQueryResult } from '../models/BaseItemDtoQueryResult';
import type { ImageType } from '../models/ImageType';
import type { ItemFields } from '../models/ItemFields';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class InstantMixService {

    /**
     * Creates an instant playlist based on a given album.
     * @param id The item id.
     * @param userId Optional. Filter by user id, and attach user data.
     * @param limit Optional. The maximum number of records to return.
     * @param fields Optional. Specify additional fields of information to return in the output.
     * @param enableImages Optional. Include image information in output.
     * @param enableUserData Optional. Include user data.
     * @param imageTypeLimit Optional. The max number of images to return, per image type.
     * @param enableImageTypes Optional. The image types to include in the output.
     * @returns BaseItemDtoQueryResult Instant playlist returned.
     * @throws ApiError
     */
    public static getInstantMixFromAlbum(
        id: string,
        userId?: string | null,
        limit?: number | null,
        fields?: Array<ItemFields> | null,
        enableImages?: boolean | null,
        enableUserData?: boolean | null,
        imageTypeLimit?: number | null,
        enableImageTypes?: Array<ImageType> | null,
    ): CancelablePromise<BaseItemDtoQueryResult> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Albums/{id}/InstantMix',
            path: {
                'id': id,
            },
            query: {
                'userId': userId,
                'limit': limit,
                'fields': fields,
                'enableImages': enableImages,
                'enableUserData': enableUserData,
                'imageTypeLimit': imageTypeLimit,
                'enableImageTypes': enableImageTypes,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Creates an instant playlist based on a given artist.
     * @param id The item id.
     * @param userId Optional. Filter by user id, and attach user data.
     * @param limit Optional. The maximum number of records to return.
     * @param fields Optional. Specify additional fields of information to return in the output.
     * @param enableImages Optional. Include image information in output.
     * @param enableUserData Optional. Include user data.
     * @param imageTypeLimit Optional. The max number of images to return, per image type.
     * @param enableImageTypes Optional. The image types to include in the output.
     * @returns BaseItemDtoQueryResult Instant playlist returned.
     * @throws ApiError
     */
    public static getInstantMixFromArtists(
        id: string,
        userId?: string | null,
        limit?: number | null,
        fields?: Array<ItemFields> | null,
        enableImages?: boolean | null,
        enableUserData?: boolean | null,
        imageTypeLimit?: number | null,
        enableImageTypes?: Array<ImageType> | null,
    ): CancelablePromise<BaseItemDtoQueryResult> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Artists/{id}/InstantMix',
            path: {
                'id': id,
            },
            query: {
                'userId': userId,
                'limit': limit,
                'fields': fields,
                'enableImages': enableImages,
                'enableUserData': enableUserData,
                'imageTypeLimit': imageTypeLimit,
                'enableImageTypes': enableImageTypes,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * @deprecated
     * Creates an instant playlist based on a given artist.
     * @param id The item id.
     * @param userId Optional. Filter by user id, and attach user data.
     * @param limit Optional. The maximum number of records to return.
     * @param fields Optional. Specify additional fields of information to return in the output.
     * @param enableImages Optional. Include image information in output.
     * @param enableUserData Optional. Include user data.
     * @param imageTypeLimit Optional. The max number of images to return, per image type.
     * @param enableImageTypes Optional. The image types to include in the output.
     * @returns BaseItemDtoQueryResult Instant playlist returned.
     * @throws ApiError
     */
    public static getInstantMixFromArtists2(
        id: string,
        userId?: string | null,
        limit?: number | null,
        fields?: Array<ItemFields> | null,
        enableImages?: boolean | null,
        enableUserData?: boolean | null,
        imageTypeLimit?: number | null,
        enableImageTypes?: Array<ImageType> | null,
    ): CancelablePromise<BaseItemDtoQueryResult> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Artists/InstantMix',
            query: {
                'id': id,
                'userId': userId,
                'limit': limit,
                'fields': fields,
                'enableImages': enableImages,
                'enableUserData': enableUserData,
                'imageTypeLimit': imageTypeLimit,
                'enableImageTypes': enableImageTypes,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Creates an instant playlist based on a given item.
     * @param id The item id.
     * @param userId Optional. Filter by user id, and attach user data.
     * @param limit Optional. The maximum number of records to return.
     * @param fields Optional. Specify additional fields of information to return in the output.
     * @param enableImages Optional. Include image information in output.
     * @param enableUserData Optional. Include user data.
     * @param imageTypeLimit Optional. The max number of images to return, per image type.
     * @param enableImageTypes Optional. The image types to include in the output.
     * @returns BaseItemDtoQueryResult Instant playlist returned.
     * @throws ApiError
     */
    public static getInstantMixFromItem(
        id: string,
        userId?: string | null,
        limit?: number | null,
        fields?: Array<ItemFields> | null,
        enableImages?: boolean | null,
        enableUserData?: boolean | null,
        imageTypeLimit?: number | null,
        enableImageTypes?: Array<ImageType> | null,
    ): CancelablePromise<BaseItemDtoQueryResult> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Items/{id}/InstantMix',
            path: {
                'id': id,
            },
            query: {
                'userId': userId,
                'limit': limit,
                'fields': fields,
                'enableImages': enableImages,
                'enableUserData': enableUserData,
                'imageTypeLimit': imageTypeLimit,
                'enableImageTypes': enableImageTypes,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Creates an instant playlist based on a given genre.
     * @param id The item id.
     * @param userId Optional. Filter by user id, and attach user data.
     * @param limit Optional. The maximum number of records to return.
     * @param fields Optional. Specify additional fields of information to return in the output.
     * @param enableImages Optional. Include image information in output.
     * @param enableUserData Optional. Include user data.
     * @param imageTypeLimit Optional. The max number of images to return, per image type.
     * @param enableImageTypes Optional. The image types to include in the output.
     * @returns BaseItemDtoQueryResult Instant playlist returned.
     * @throws ApiError
     */
    public static getInstantMixFromMusicGenreById(
        id: string,
        userId?: string | null,
        limit?: number | null,
        fields?: Array<ItemFields> | null,
        enableImages?: boolean | null,
        enableUserData?: boolean | null,
        imageTypeLimit?: number | null,
        enableImageTypes?: Array<ImageType> | null,
    ): CancelablePromise<BaseItemDtoQueryResult> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/MusicGenres/{id}/InstantMix',
            path: {
                'id': id,
            },
            query: {
                'userId': userId,
                'limit': limit,
                'fields': fields,
                'enableImages': enableImages,
                'enableUserData': enableUserData,
                'imageTypeLimit': imageTypeLimit,
                'enableImageTypes': enableImageTypes,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Creates an instant playlist based on a given genre.
     * @param name The genre name.
     * @param userId Optional. Filter by user id, and attach user data.
     * @param limit Optional. The maximum number of records to return.
     * @param fields Optional. Specify additional fields of information to return in the output.
     * @param enableImages Optional. Include image information in output.
     * @param enableUserData Optional. Include user data.
     * @param imageTypeLimit Optional. The max number of images to return, per image type.
     * @param enableImageTypes Optional. The image types to include in the output.
     * @returns BaseItemDtoQueryResult Instant playlist returned.
     * @throws ApiError
     */
    public static getInstantMixFromMusicGenreByName(
        name: string,
        userId?: string | null,
        limit?: number | null,
        fields?: Array<ItemFields> | null,
        enableImages?: boolean | null,
        enableUserData?: boolean | null,
        imageTypeLimit?: number | null,
        enableImageTypes?: Array<ImageType> | null,
    ): CancelablePromise<BaseItemDtoQueryResult> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/MusicGenres/{name}/InstantMix',
            path: {
                'name': name,
            },
            query: {
                'userId': userId,
                'limit': limit,
                'fields': fields,
                'enableImages': enableImages,
                'enableUserData': enableUserData,
                'imageTypeLimit': imageTypeLimit,
                'enableImageTypes': enableImageTypes,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * @deprecated
     * Creates an instant playlist based on a given genre.
     * @param id The item id.
     * @param userId Optional. Filter by user id, and attach user data.
     * @param limit Optional. The maximum number of records to return.
     * @param fields Optional. Specify additional fields of information to return in the output.
     * @param enableImages Optional. Include image information in output.
     * @param enableUserData Optional. Include user data.
     * @param imageTypeLimit Optional. The max number of images to return, per image type.
     * @param enableImageTypes Optional. The image types to include in the output.
     * @returns BaseItemDtoQueryResult Instant playlist returned.
     * @throws ApiError
     */
    public static getInstantMixFromMusicGenreById2(
        id: string,
        userId?: string | null,
        limit?: number | null,
        fields?: Array<ItemFields> | null,
        enableImages?: boolean | null,
        enableUserData?: boolean | null,
        imageTypeLimit?: number | null,
        enableImageTypes?: Array<ImageType> | null,
    ): CancelablePromise<BaseItemDtoQueryResult> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/MusicGenres/InstantMix',
            query: {
                'id': id,
                'userId': userId,
                'limit': limit,
                'fields': fields,
                'enableImages': enableImages,
                'enableUserData': enableUserData,
                'imageTypeLimit': imageTypeLimit,
                'enableImageTypes': enableImageTypes,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Creates an instant playlist based on a given playlist.
     * @param id The item id.
     * @param userId Optional. Filter by user id, and attach user data.
     * @param limit Optional. The maximum number of records to return.
     * @param fields Optional. Specify additional fields of information to return in the output.
     * @param enableImages Optional. Include image information in output.
     * @param enableUserData Optional. Include user data.
     * @param imageTypeLimit Optional. The max number of images to return, per image type.
     * @param enableImageTypes Optional. The image types to include in the output.
     * @returns BaseItemDtoQueryResult Instant playlist returned.
     * @throws ApiError
     */
    public static getInstantMixFromPlaylist(
        id: string,
        userId?: string | null,
        limit?: number | null,
        fields?: Array<ItemFields> | null,
        enableImages?: boolean | null,
        enableUserData?: boolean | null,
        imageTypeLimit?: number | null,
        enableImageTypes?: Array<ImageType> | null,
    ): CancelablePromise<BaseItemDtoQueryResult> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Playlists/{id}/InstantMix',
            path: {
                'id': id,
            },
            query: {
                'userId': userId,
                'limit': limit,
                'fields': fields,
                'enableImages': enableImages,
                'enableUserData': enableUserData,
                'imageTypeLimit': imageTypeLimit,
                'enableImageTypes': enableImageTypes,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Creates an instant playlist based on a given song.
     * @param id The item id.
     * @param userId Optional. Filter by user id, and attach user data.
     * @param limit Optional. The maximum number of records to return.
     * @param fields Optional. Specify additional fields of information to return in the output.
     * @param enableImages Optional. Include image information in output.
     * @param enableUserData Optional. Include user data.
     * @param imageTypeLimit Optional. The max number of images to return, per image type.
     * @param enableImageTypes Optional. The image types to include in the output.
     * @returns BaseItemDtoQueryResult Instant playlist returned.
     * @throws ApiError
     */
    public static getInstantMixFromSong(
        id: string,
        userId?: string | null,
        limit?: number | null,
        fields?: Array<ItemFields> | null,
        enableImages?: boolean | null,
        enableUserData?: boolean | null,
        imageTypeLimit?: number | null,
        enableImageTypes?: Array<ImageType> | null,
    ): CancelablePromise<BaseItemDtoQueryResult> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Songs/{id}/InstantMix',
            path: {
                'id': id,
            },
            query: {
                'userId': userId,
                'limit': limit,
                'fields': fields,
                'enableImages': enableImages,
                'enableUserData': enableUserData,
                'imageTypeLimit': imageTypeLimit,
                'enableImageTypes': enableImageTypes,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

}
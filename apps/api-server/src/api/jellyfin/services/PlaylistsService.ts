/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BaseItemDtoQueryResult } from '../models/BaseItemDtoQueryResult';
import type { CreatePlaylistDto } from '../models/CreatePlaylistDto';
import type { ImageType } from '../models/ImageType';
import type { ItemFields } from '../models/ItemFields';
import type { PlaylistCreationResult } from '../models/PlaylistCreationResult';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class PlaylistsService {

    /**
     * Creates a new playlist.
     * For backwards compatibility parameters can be sent via Query or Body, with Query having higher precedence.
     * Query parameters are obsolete.
     * @param name The playlist name.
     * @param ids The item ids.
     * @param userId The user id.
     * @param mediaType The media type.
     * @param requestBody The create playlist payload.
     * @returns PlaylistCreationResult Success
     * @throws ApiError
     */
    public static createPlaylist(
        name?: string | null,
        ids?: Array<string> | null,
        userId?: string | null,
        mediaType?: string | null,
        requestBody?: CreatePlaylistDto | null,
    ): CancelablePromise<PlaylistCreationResult> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/Playlists',
            query: {
                'name': name,
                'ids': ids,
                'userId': userId,
                'mediaType': mediaType,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Adds items to a playlist.
     * @param playlistId The playlist id.
     * @param ids Item id, comma delimited.
     * @param userId The userId.
     * @returns void
     * @throws ApiError
     */
    public static addToPlaylist(
        playlistId: string,
        ids?: Array<string> | null,
        userId?: string | null,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/Playlists/{playlistId}/Items',
            path: {
                'playlistId': playlistId,
            },
            query: {
                'ids': ids,
                'userId': userId,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Removes items from a playlist.
     * @param playlistId The playlist id.
     * @param entryIds The item ids, comma delimited.
     * @returns void
     * @throws ApiError
     */
    public static removeFromPlaylist(
        playlistId: string,
        entryIds?: Array<string> | null,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/Playlists/{playlistId}/Items',
            path: {
                'playlistId': playlistId,
            },
            query: {
                'entryIds': entryIds,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Gets the original items of a playlist.
     * @param playlistId The playlist id.
     * @param userId User id.
     * @param startIndex Optional. The record index to start at. All items with a lower index will be dropped from the results.
     * @param limit Optional. The maximum number of records to return.
     * @param fields Optional. Specify additional fields of information to return in the output.
     * @param enableImages Optional. Include image information in output.
     * @param enableUserData Optional. Include user data.
     * @param imageTypeLimit Optional. The max number of images to return, per image type.
     * @param enableImageTypes Optional. The image types to include in the output.
     * @returns BaseItemDtoQueryResult Original playlist returned.
     * @throws ApiError
     */
    public static getPlaylistItems(
        playlistId: string,
        userId: string,
        startIndex?: number | null,
        limit?: number | null,
        fields?: Array<ItemFields> | null,
        enableImages?: boolean | null,
        enableUserData?: boolean | null,
        imageTypeLimit?: number | null,
        enableImageTypes?: Array<ImageType> | null,
    ): CancelablePromise<BaseItemDtoQueryResult> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Playlists/{playlistId}/Items',
            path: {
                'playlistId': playlistId,
            },
            query: {
                'userId': userId,
                'startIndex': startIndex,
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
                404: `Playlist not found.`,
            },
        });
    }

    /**
     * Moves a playlist item.
     * @param playlistId The playlist id.
     * @param itemId The item id.
     * @param newIndex The new index.
     * @returns void
     * @throws ApiError
     */
    public static moveItem(
        playlistId: string,
        itemId: string,
        newIndex: number,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/Playlists/{playlistId}/Items/{itemId}/Move/{newIndex}',
            path: {
                'playlistId': playlistId,
                'itemId': itemId,
                'newIndex': newIndex,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

}
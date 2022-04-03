/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BaseItemDto } from '../models/BaseItemDto';
import type { BaseItemDtoQueryResult } from '../models/BaseItemDtoQueryResult';
import type { ImageType } from '../models/ImageType';
import type { ItemFields } from '../models/ItemFields';
import type { UserItemDataDto } from '../models/UserItemDataDto';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class UserLibraryService {

    /**
     * Marks an item as a favorite.
     * @param userId User id.
     * @param itemId Item id.
     * @returns UserItemDataDto Item marked as favorite.
     * @throws ApiError
     */
    public static markFavoriteItem(
        userId: string,
        itemId: string,
    ): CancelablePromise<UserItemDataDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/Users/{userId}/FavoriteItems/{itemId}',
            path: {
                'userId': userId,
                'itemId': itemId,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Unmarks item as a favorite.
     * @param userId User id.
     * @param itemId Item id.
     * @returns UserItemDataDto Item unmarked as favorite.
     * @throws ApiError
     */
    public static unmarkFavoriteItem(
        userId: string,
        itemId: string,
    ): CancelablePromise<UserItemDataDto> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/Users/{userId}/FavoriteItems/{itemId}',
            path: {
                'userId': userId,
                'itemId': itemId,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Gets an item from a user's library.
     * @param userId User id.
     * @param itemId Item id.
     * @returns BaseItemDto Item returned.
     * @throws ApiError
     */
    public static getItem(
        userId: string,
        itemId: string,
    ): CancelablePromise<BaseItemDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Users/{userId}/Items/{itemId}',
            path: {
                'userId': userId,
                'itemId': itemId,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Gets intros to play before the main media item plays.
     * @param userId User id.
     * @param itemId Item id.
     * @returns BaseItemDtoQueryResult Intros returned.
     * @throws ApiError
     */
    public static getIntros(
        userId: string,
        itemId: string,
    ): CancelablePromise<BaseItemDtoQueryResult> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Users/{userId}/Items/{itemId}/Intros',
            path: {
                'userId': userId,
                'itemId': itemId,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Gets local trailers for an item.
     * @param userId User id.
     * @param itemId Item id.
     * @returns BaseItemDto An Microsoft.AspNetCore.Mvc.OkResult containing the item's local trailers.
     * @throws ApiError
     */
    public static getLocalTrailers(
        userId: string,
        itemId: string,
    ): CancelablePromise<Array<BaseItemDto>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Users/{userId}/Items/{itemId}/LocalTrailers',
            path: {
                'userId': userId,
                'itemId': itemId,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Deletes a user's saved personal rating for an item.
     * @param userId User id.
     * @param itemId Item id.
     * @returns UserItemDataDto Personal rating removed.
     * @throws ApiError
     */
    public static deleteUserItemRating(
        userId: string,
        itemId: string,
    ): CancelablePromise<UserItemDataDto> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/Users/{userId}/Items/{itemId}/Rating',
            path: {
                'userId': userId,
                'itemId': itemId,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Updates a user's rating for an item.
     * @param userId User id.
     * @param itemId Item id.
     * @param likes Whether this M:Jellyfin.Api.Controllers.UserLibraryController.UpdateUserItemRating(System.Guid,System.Guid,System.Nullable{System.Boolean}) is likes.
     * @returns UserItemDataDto Item rating updated.
     * @throws ApiError
     */
    public static updateUserItemRating(
        userId: string,
        itemId: string,
        likes?: boolean | null,
    ): CancelablePromise<UserItemDataDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/Users/{userId}/Items/{itemId}/Rating',
            path: {
                'userId': userId,
                'itemId': itemId,
            },
            query: {
                'likes': likes,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Gets special features for an item.
     * @param userId User id.
     * @param itemId Item id.
     * @returns BaseItemDto Special features returned.
     * @throws ApiError
     */
    public static getSpecialFeatures(
        userId: string,
        itemId: string,
    ): CancelablePromise<Array<BaseItemDto>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Users/{userId}/Items/{itemId}/SpecialFeatures',
            path: {
                'userId': userId,
                'itemId': itemId,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Gets latest media.
     * @param userId User id.
     * @param parentId Specify this to localize the search to a specific item or folder. Omit to use the root.
     * @param fields Optional. Specify additional fields of information to return in the output.
     * @param includeItemTypes Optional. If specified, results will be filtered based on item type. This allows multiple, comma delimited.
     * @param isPlayed Filter by items that are played, or not.
     * @param enableImages Optional. include image information in output.
     * @param imageTypeLimit Optional. the max number of images to return, per image type.
     * @param enableImageTypes Optional. The image types to include in the output.
     * @param enableUserData Optional. include user data.
     * @param limit Return item limit.
     * @param groupItems Whether or not to group items into a parent container.
     * @returns BaseItemDto Latest media returned.
     * @throws ApiError
     */
    public static getLatestMedia(
        userId: string,
        parentId?: string | null,
        fields?: Array<ItemFields> | null,
        includeItemTypes?: Array<string> | null,
        isPlayed?: boolean | null,
        enableImages?: boolean | null,
        imageTypeLimit?: number | null,
        enableImageTypes?: Array<ImageType> | null,
        enableUserData?: boolean | null,
        limit: number = 20,
        groupItems: boolean = true,
    ): CancelablePromise<Array<BaseItemDto>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Users/{userId}/Items/Latest',
            path: {
                'userId': userId,
            },
            query: {
                'parentId': parentId,
                'fields': fields,
                'includeItemTypes': includeItemTypes,
                'isPlayed': isPlayed,
                'enableImages': enableImages,
                'imageTypeLimit': imageTypeLimit,
                'enableImageTypes': enableImageTypes,
                'enableUserData': enableUserData,
                'limit': limit,
                'groupItems': groupItems,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Gets the root folder from a user's library.
     * @param userId User id.
     * @returns BaseItemDto Root folder returned.
     * @throws ApiError
     */
    public static getRootFolder(
        userId: string,
    ): CancelablePromise<BaseItemDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Users/{userId}/Items/Root',
            path: {
                'userId': userId,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

}
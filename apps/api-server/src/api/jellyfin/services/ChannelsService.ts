/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BaseItemDtoQueryResult } from '../models/BaseItemDtoQueryResult';
import type { ChannelFeatures } from '../models/ChannelFeatures';
import type { ItemFields } from '../models/ItemFields';
import type { ItemFilter } from '../models/ItemFilter';
import type { SortOrder } from '../models/SortOrder';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class ChannelsService {

    /**
     * Gets available channels.
     * @param userId User Id to filter by. Use System.Guid.Empty to not filter by user.
     * @param startIndex Optional. The record index to start at. All items with a lower index will be dropped from the results.
     * @param limit Optional. The maximum number of records to return.
     * @param supportsLatestItems Optional. Filter by channels that support getting latest items.
     * @param supportsMediaDeletion Optional. Filter by channels that support media deletion.
     * @param isFavorite Optional. Filter by channels that are favorite.
     * @returns BaseItemDtoQueryResult Channels returned.
     * @throws ApiError
     */
    public static getChannels(
        userId?: string | null,
        startIndex?: number | null,
        limit?: number | null,
        supportsLatestItems?: boolean | null,
        supportsMediaDeletion?: boolean | null,
        isFavorite?: boolean | null,
    ): CancelablePromise<BaseItemDtoQueryResult> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Channels',
            query: {
                'userId': userId,
                'startIndex': startIndex,
                'limit': limit,
                'supportsLatestItems': supportsLatestItems,
                'supportsMediaDeletion': supportsMediaDeletion,
                'isFavorite': isFavorite,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Get channel features.
     * @param channelId Channel id.
     * @returns ChannelFeatures Channel features returned.
     * @throws ApiError
     */
    public static getChannelFeatures(
        channelId: string,
    ): CancelablePromise<ChannelFeatures> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Channels/{channelId}/Features',
            path: {
                'channelId': channelId,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Get channel items.
     * @param channelId Channel Id.
     * @param folderId Optional. Folder Id.
     * @param userId Optional. User Id.
     * @param startIndex Optional. The record index to start at. All items with a lower index will be dropped from the results.
     * @param limit Optional. The maximum number of records to return.
     * @param sortOrder Optional. Sort Order - Ascending,Descending.
     * @param filters Optional. Specify additional filters to apply.
     * @param sortBy Optional. Specify one or more sort orders, comma delimited. Options: Album, AlbumArtist, Artist, Budget, CommunityRating, CriticRating, DateCreated, DatePlayed, PlayCount, PremiereDate, ProductionYear, SortName, Random, Revenue, Runtime.
     * @param fields Optional. Specify additional fields of information to return in the output.
     * @returns BaseItemDtoQueryResult Channel items returned.
     * @throws ApiError
     */
    public static getChannelItems(
        channelId: string,
        folderId?: string | null,
        userId?: string | null,
        startIndex?: number | null,
        limit?: number | null,
        sortOrder?: Array<SortOrder> | null,
        filters?: Array<ItemFilter> | null,
        sortBy?: Array<string> | null,
        fields?: Array<ItemFields> | null,
    ): CancelablePromise<BaseItemDtoQueryResult> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Channels/{channelId}/Items',
            path: {
                'channelId': channelId,
            },
            query: {
                'folderId': folderId,
                'userId': userId,
                'startIndex': startIndex,
                'limit': limit,
                'sortOrder': sortOrder,
                'filters': filters,
                'sortBy': sortBy,
                'fields': fields,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Get all channel features.
     * @returns ChannelFeatures All channel features returned.
     * @throws ApiError
     */
    public static getAllChannelFeatures(): CancelablePromise<Array<ChannelFeatures>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Channels/Features',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Gets latest channel items.
     * @param userId Optional. User Id.
     * @param startIndex Optional. The record index to start at. All items with a lower index will be dropped from the results.
     * @param limit Optional. The maximum number of records to return.
     * @param filters Optional. Specify additional filters to apply.
     * @param fields Optional. Specify additional fields of information to return in the output.
     * @param channelIds Optional. Specify one or more channel id's, comma delimited.
     * @returns BaseItemDtoQueryResult Latest channel items returned.
     * @throws ApiError
     */
    public static getLatestChannelItems(
        userId?: string | null,
        startIndex?: number | null,
        limit?: number | null,
        filters?: Array<ItemFilter> | null,
        fields?: Array<ItemFields> | null,
        channelIds?: Array<string> | null,
    ): CancelablePromise<BaseItemDtoQueryResult> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Channels/Items/Latest',
            query: {
                'userId': userId,
                'startIndex': startIndex,
                'limit': limit,
                'filters': filters,
                'fields': fields,
                'channelIds': channelIds,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

}
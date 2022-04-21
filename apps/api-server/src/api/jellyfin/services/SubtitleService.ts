/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { FontFile } from '../models/FontFile';
import type { RemoteSubtitleInfo } from '../models/RemoteSubtitleInfo';
import type { UploadSubtitleDto } from '../models/UploadSubtitleDto';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class SubtitleService {

    /**
     * Gets a list of available fallback font files.
     * @returns FontFile Information retrieved.
     * @throws ApiError
     */
    public static getFallbackFontList(): CancelablePromise<Array<FontFile>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/FallbackFont/Fonts',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Gets a fallback font file.
     * @param name The name of the fallback font file to get.
     * @returns binary Fallback font file retrieved.
     * @throws ApiError
     */
    public static getFallbackFont(
        name: string,
    ): CancelablePromise<Blob> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/FallbackFont/Fonts/{name}',
            path: {
                'name': name,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Search remote subtitles.
     * @param itemId The item id.
     * @param language The language of the subtitles.
     * @param isPerfectMatch Optional. Only show subtitles which are a perfect match.
     * @returns RemoteSubtitleInfo Subtitles retrieved.
     * @throws ApiError
     */
    public static searchRemoteSubtitles(
        itemId: string,
        language: string,
        isPerfectMatch?: boolean | null,
    ): CancelablePromise<Array<RemoteSubtitleInfo>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Items/{itemId}/RemoteSearch/Subtitles/{language}',
            path: {
                'itemId': itemId,
                'language': language,
            },
            query: {
                'isPerfectMatch': isPerfectMatch,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Downloads a remote subtitle.
     * @param itemId The item id.
     * @param subtitleId The subtitle id.
     * @returns void
     * @throws ApiError
     */
    public static downloadRemoteSubtitles(
        itemId: string,
        subtitleId: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/Items/{itemId}/RemoteSearch/Subtitles/{subtitleId}',
            path: {
                'itemId': itemId,
                'subtitleId': subtitleId,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Gets the remote subtitles.
     * @param id The item id.
     * @returns binary File returned.
     * @throws ApiError
     */
    public static getRemoteSubtitles(
        id: string,
    ): CancelablePromise<Blob> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Providers/Subtitles/Subtitles/{id}',
            path: {
                'id': id,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Gets an HLS subtitle playlist.
     * @param itemId The item id.
     * @param index The subtitle stream index.
     * @param mediaSourceId The media source id.
     * @param segmentLength The subtitle segment length.
     * @returns binary Subtitle playlist retrieved.
     * @throws ApiError
     */
    public static getSubtitlePlaylist(
        itemId: string,
        index: number,
        mediaSourceId: string,
        segmentLength: number,
    ): CancelablePromise<Blob> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Videos/{itemId}/{mediaSourceId}/Subtitles/{index}/subtitles.m3u8',
            path: {
                'itemId': itemId,
                'index': index,
                'mediaSourceId': mediaSourceId,
            },
            query: {
                'segmentLength': segmentLength,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Upload an external subtitle file.
     * @param itemId The item the subtitle belongs to.
     * @param requestBody The request body.
     * @returns void
     * @throws ApiError
     */
    public static uploadSubtitle(
        itemId: string,
        requestBody: UploadSubtitleDto,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/Videos/{itemId}/Subtitles',
            path: {
                'itemId': itemId,
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
     * Deletes an external subtitle file.
     * @param itemId The item id.
     * @param index The index of the subtitle file.
     * @returns void
     * @throws ApiError
     */
    public static deleteSubtitle(
        itemId: string,
        index: number,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/Videos/{itemId}/Subtitles/{index}',
            path: {
                'itemId': itemId,
                'index': index,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Item not found.`,
            },
        });
    }

    /**
     * Gets subtitles in a specified format.
     * @param routeItemId The (route) item id.
     * @param routeMediaSourceId The (route) media source id.
     * @param routeIndex The (route) subtitle stream index.
     * @param routeStartPositionTicks The (route) start position of the subtitle in ticks.
     * @param routeFormat The (route) format of the returned subtitle.
     * @param itemId The item id.
     * @param mediaSourceId The media source id.
     * @param index The subtitle stream index.
     * @param startPositionTicks The start position of the subtitle in ticks.
     * @param format The format of the returned subtitle.
     * @param endPositionTicks Optional. The end position of the subtitle in ticks.
     * @param copyTimestamps Optional. Whether to copy the timestamps.
     * @param addVttTimeMap Optional. Whether to add a VTT time map.
     * @returns binary File returned.
     * @throws ApiError
     */
    public static getSubtitleWithTicks(
        routeItemId: string,
        routeMediaSourceId: string,
        routeIndex: number,
        routeStartPositionTicks: number,
        routeFormat: string,
        itemId?: string | null,
        mediaSourceId?: string | null,
        index?: number | null,
        startPositionTicks?: number | null,
        format?: string | null,
        endPositionTicks?: number | null,
        copyTimestamps: boolean = false,
        addVttTimeMap: boolean = false,
    ): CancelablePromise<Blob> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Videos/{routeItemId}/{routeMediaSourceId}/Subtitles/{routeIndex}/{routeStartPositionTicks}/Stream.{routeFormat}',
            path: {
                'routeItemId': routeItemId,
                'routeMediaSourceId': routeMediaSourceId,
                'routeIndex': routeIndex,
                'routeStartPositionTicks': routeStartPositionTicks,
                'routeFormat': routeFormat,
            },
            query: {
                'itemId': itemId,
                'mediaSourceId': mediaSourceId,
                'index': index,
                'startPositionTicks': startPositionTicks,
                'format': format,
                'endPositionTicks': endPositionTicks,
                'copyTimestamps': copyTimestamps,
                'addVttTimeMap': addVttTimeMap,
            },
        });
    }

    /**
     * Gets subtitles in a specified format.
     * @param routeItemId The (route) item id.
     * @param routeMediaSourceId The (route) media source id.
     * @param routeIndex The (route) subtitle stream index.
     * @param routeFormat The (route) format of the returned subtitle.
     * @param itemId The item id.
     * @param mediaSourceId The media source id.
     * @param index The subtitle stream index.
     * @param format The format of the returned subtitle.
     * @param endPositionTicks Optional. The end position of the subtitle in ticks.
     * @param copyTimestamps Optional. Whether to copy the timestamps.
     * @param addVttTimeMap Optional. Whether to add a VTT time map.
     * @param startPositionTicks The start position of the subtitle in ticks.
     * @returns binary File returned.
     * @throws ApiError
     */
    public static getSubtitle(
        routeItemId: string,
        routeMediaSourceId: string,
        routeIndex: number,
        routeFormat: string,
        itemId?: string | null,
        mediaSourceId?: string | null,
        index?: number | null,
        format?: string | null,
        endPositionTicks?: number | null,
        copyTimestamps: boolean = false,
        addVttTimeMap: boolean = false,
        startPositionTicks?: number,
    ): CancelablePromise<Blob> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Videos/{routeItemId}/{routeMediaSourceId}/Subtitles/{routeIndex}/Stream.{routeFormat}',
            path: {
                'routeItemId': routeItemId,
                'routeMediaSourceId': routeMediaSourceId,
                'routeIndex': routeIndex,
                'routeFormat': routeFormat,
            },
            query: {
                'itemId': itemId,
                'mediaSourceId': mediaSourceId,
                'index': index,
                'format': format,
                'endPositionTicks': endPositionTicks,
                'copyTimestamps': copyTimestamps,
                'addVttTimeMap': addVttTimeMap,
                'startPositionTicks': startPositionTicks,
            },
        });
    }

}
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class HlsSegmentService {

    /**
     * Gets the specified audio segment for an audio item.
     * @param itemId The item id.
     * @param segmentId The segment id.
     * @returns binary Hls audio segment returned.
     * @throws ApiError
     */
    public static getHlsAudioSegmentLegacyAac(
        itemId: string,
        segmentId: string,
    ): CancelablePromise<Blob> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Audio/{itemId}/hls/{segmentId}/stream.aac',
            path: {
                'itemId': itemId,
                'segmentId': segmentId,
            },
        });
    }

    /**
     * Gets the specified audio segment for an audio item.
     * @param itemId The item id.
     * @param segmentId The segment id.
     * @returns binary Hls audio segment returned.
     * @throws ApiError
     */
    public static getHlsAudioSegmentLegacyMp3(
        itemId: string,
        segmentId: string,
    ): CancelablePromise<Blob> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Audio/{itemId}/hls/{segmentId}/stream.mp3',
            path: {
                'itemId': itemId,
                'segmentId': segmentId,
            },
        });
    }

    /**
     * Gets a hls video segment.
     * @param itemId The item id.
     * @param playlistId The playlist id.
     * @param segmentId The segment id.
     * @param segmentContainer The segment container.
     * @returns binary Hls video segment returned.
     * @throws ApiError
     */
    public static getHlsVideoSegmentLegacy(
        itemId: string,
        playlistId: string,
        segmentId: string,
        segmentContainer: string,
    ): CancelablePromise<Blob> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Videos/{itemId}/hls/{playlistId}/{segmentId}.{segmentContainer}',
            path: {
                'itemId': itemId,
                'playlistId': playlistId,
                'segmentId': segmentId,
                'segmentContainer': segmentContainer,
            },
            errors: {
                404: `Hls segment not found.`,
            },
        });
    }

    /**
     * Gets a hls video playlist.
     * @param itemId The video id.
     * @param playlistId The playlist id.
     * @returns binary Hls video playlist returned.
     * @throws ApiError
     */
    public static getHlsPlaylistLegacy(
        itemId: string,
        playlistId: string,
    ): CancelablePromise<Blob> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Videos/{itemId}/hls/{playlistId}/stream.m3u8',
            path: {
                'itemId': itemId,
                'playlistId': playlistId,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Stops an active encoding.
     * @param deviceId The device id of the client requesting. Used to stop encoding processes when needed.
     * @param playSessionId The play session id.
     * @returns void
     * @throws ApiError
     */
    public static stopEncodingProcess(
        deviceId: string,
        playSessionId: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/Videos/ActiveEncodings',
            query: {
                'deviceId': deviceId,
                'playSessionId': playSessionId,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

}
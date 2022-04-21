/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { LiveStreamResponse } from '../models/LiveStreamResponse';
import type { OpenLiveStreamDto } from '../models/OpenLiveStreamDto';
import type { PlaybackInfoDto } from '../models/PlaybackInfoDto';
import type { PlaybackInfoResponse } from '../models/PlaybackInfoResponse';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class MediaInfoService {

    /**
     * Gets live playback media info for an item.
     * @param itemId The item id.
     * @param userId The user id.
     * @returns PlaybackInfoResponse Playback info returned.
     * @throws ApiError
     */
    public static getPlaybackInfo(
        itemId: string,
        userId: string,
    ): CancelablePromise<PlaybackInfoResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Items/{itemId}/PlaybackInfo',
            path: {
                'itemId': itemId,
            },
            query: {
                'userId': userId,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Gets live playback media info for an item.
     * For backwards compatibility parameters can be sent via Query or Body, with Query having higher precedence.
     * Query parameters are obsolete.
     * @param itemId The item id.
     * @param userId The user id.
     * @param maxStreamingBitrate The maximum streaming bitrate.
     * @param startTimeTicks The start time in ticks.
     * @param audioStreamIndex The audio stream index.
     * @param subtitleStreamIndex The subtitle stream index.
     * @param maxAudioChannels The maximum number of audio channels.
     * @param mediaSourceId The media source id.
     * @param liveStreamId The livestream id.
     * @param autoOpenLiveStream Whether to auto open the livestream.
     * @param enableDirectPlay Whether to enable direct play. Default: true.
     * @param enableDirectStream Whether to enable direct stream. Default: true.
     * @param enableTranscoding Whether to enable transcoding. Default: true.
     * @param allowVideoStreamCopy Whether to allow to copy the video stream. Default: true.
     * @param allowAudioStreamCopy Whether to allow to copy the audio stream. Default: true.
     * @param requestBody The playback info.
     * @returns PlaybackInfoResponse Playback info returned.
     * @throws ApiError
     */
    public static getPostedPlaybackInfo(
        itemId: string,
        userId?: string | null,
        maxStreamingBitrate?: number | null,
        startTimeTicks?: number | null,
        audioStreamIndex?: number | null,
        subtitleStreamIndex?: number | null,
        maxAudioChannels?: number | null,
        mediaSourceId?: string | null,
        liveStreamId?: string | null,
        autoOpenLiveStream?: boolean | null,
        enableDirectPlay?: boolean | null,
        enableDirectStream?: boolean | null,
        enableTranscoding?: boolean | null,
        allowVideoStreamCopy?: boolean | null,
        allowAudioStreamCopy?: boolean | null,
        requestBody?: PlaybackInfoDto | null,
    ): CancelablePromise<PlaybackInfoResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/Items/{itemId}/PlaybackInfo',
            path: {
                'itemId': itemId,
            },
            query: {
                'userId': userId,
                'maxStreamingBitrate': maxStreamingBitrate,
                'startTimeTicks': startTimeTicks,
                'audioStreamIndex': audioStreamIndex,
                'subtitleStreamIndex': subtitleStreamIndex,
                'maxAudioChannels': maxAudioChannels,
                'mediaSourceId': mediaSourceId,
                'liveStreamId': liveStreamId,
                'autoOpenLiveStream': autoOpenLiveStream,
                'enableDirectPlay': enableDirectPlay,
                'enableDirectStream': enableDirectStream,
                'enableTranscoding': enableTranscoding,
                'allowVideoStreamCopy': allowVideoStreamCopy,
                'allowAudioStreamCopy': allowAudioStreamCopy,
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
     * Closes a media source.
     * @param liveStreamId The livestream id.
     * @returns void
     * @throws ApiError
     */
    public static closeLiveStream(
        liveStreamId: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/LiveStreams/Close',
            query: {
                'liveStreamId': liveStreamId,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Opens a media source.
     * @param openToken The open token.
     * @param userId The user id.
     * @param playSessionId The play session id.
     * @param maxStreamingBitrate The maximum streaming bitrate.
     * @param startTimeTicks The start time in ticks.
     * @param audioStreamIndex The audio stream index.
     * @param subtitleStreamIndex The subtitle stream index.
     * @param maxAudioChannels The maximum number of audio channels.
     * @param itemId The item id.
     * @param enableDirectPlay Whether to enable direct play. Default: true.
     * @param enableDirectStream Whether to enable direct stream. Default: true.
     * @param requestBody The open live stream dto.
     * @returns LiveStreamResponse Media source opened.
     * @throws ApiError
     */
    public static openLiveStream(
        openToken?: string | null,
        userId?: string | null,
        playSessionId?: string | null,
        maxStreamingBitrate?: number | null,
        startTimeTicks?: number | null,
        audioStreamIndex?: number | null,
        subtitleStreamIndex?: number | null,
        maxAudioChannels?: number | null,
        itemId?: string | null,
        enableDirectPlay?: boolean | null,
        enableDirectStream?: boolean | null,
        requestBody?: OpenLiveStreamDto | null,
    ): CancelablePromise<LiveStreamResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/LiveStreams/Open',
            query: {
                'openToken': openToken,
                'userId': userId,
                'playSessionId': playSessionId,
                'maxStreamingBitrate': maxStreamingBitrate,
                'startTimeTicks': startTimeTicks,
                'audioStreamIndex': audioStreamIndex,
                'subtitleStreamIndex': subtitleStreamIndex,
                'maxAudioChannels': maxAudioChannels,
                'itemId': itemId,
                'enableDirectPlay': enableDirectPlay,
                'enableDirectStream': enableDirectStream,
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
     * Tests the network with a request with the size of the bitrate.
     * @param size The bitrate. Defaults to 102400.
     * @returns binary Test buffer returned.
     * @throws ApiError
     */
    public static getBitrateTestBytes(
        size: number = 102400,
    ): CancelablePromise<Blob> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Playback/BitrateTest',
            query: {
                'size': size,
            },
            errors: {
                400: `Size has to be a numer between 0 and 10,000,000.`,
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

}
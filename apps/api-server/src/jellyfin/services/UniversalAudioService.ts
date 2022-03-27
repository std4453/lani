/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class UniversalAudioService {

    /**
     * Gets an audio stream.
     * @param itemId The item id.
     * @param container Optional. The audio container.
     * @param mediaSourceId The media version id, if playing an alternate version.
     * @param deviceId The device id of the client requesting. Used to stop encoding processes when needed.
     * @param userId Optional. The user id.
     * @param audioCodec Optional. The audio codec to transcode to.
     * @param maxAudioChannels Optional. The maximum number of audio channels.
     * @param transcodingAudioChannels Optional. The number of how many audio channels to transcode to.
     * @param maxStreamingBitrate Optional. The maximum streaming bitrate.
     * @param audioBitRate Optional. Specify an audio bitrate to encode to, e.g. 128000. If omitted this will be left to encoder defaults.
     * @param startTimeTicks Optional. Specify a starting offset, in ticks. 1 tick = 10000 ms.
     * @param transcodingContainer Optional. The container to transcode to.
     * @param transcodingProtocol Optional. The transcoding protocol.
     * @param maxAudioSampleRate Optional. The maximum audio sample rate.
     * @param maxAudioBitDepth Optional. The maximum audio bit depth.
     * @param enableRemoteMedia Optional. Whether to enable remote media.
     * @param breakOnNonKeyFrames Optional. Whether to break on non key frames.
     * @param enableRedirection Whether to enable redirection. Defaults to true.
     * @returns binary Audio stream returned.
     * @throws ApiError
     */
    public static getUniversalAudioStream(
        itemId: string,
        container?: Array<string> | null,
        mediaSourceId?: string | null,
        deviceId?: string | null,
        userId?: string | null,
        audioCodec?: string | null,
        maxAudioChannels?: number | null,
        transcodingAudioChannels?: number | null,
        maxStreamingBitrate?: number | null,
        audioBitRate?: number | null,
        startTimeTicks?: number | null,
        transcodingContainer?: string | null,
        transcodingProtocol?: string | null,
        maxAudioSampleRate?: number | null,
        maxAudioBitDepth?: number | null,
        enableRemoteMedia?: boolean | null,
        breakOnNonKeyFrames: boolean = false,
        enableRedirection: boolean = true,
    ): CancelablePromise<Blob> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Audio/{itemId}/universal',
            path: {
                'itemId': itemId,
            },
            query: {
                'container': container,
                'mediaSourceId': mediaSourceId,
                'deviceId': deviceId,
                'userId': userId,
                'audioCodec': audioCodec,
                'maxAudioChannels': maxAudioChannels,
                'transcodingAudioChannels': transcodingAudioChannels,
                'maxStreamingBitrate': maxStreamingBitrate,
                'audioBitRate': audioBitRate,
                'startTimeTicks': startTimeTicks,
                'transcodingContainer': transcodingContainer,
                'transcodingProtocol': transcodingProtocol,
                'maxAudioSampleRate': maxAudioSampleRate,
                'maxAudioBitDepth': maxAudioBitDepth,
                'enableRemoteMedia': enableRemoteMedia,
                'breakOnNonKeyFrames': breakOnNonKeyFrames,
                'enableRedirection': enableRedirection,
            },
            errors: {
                302: `Redirected to remote audio stream.`,
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Gets an audio stream.
     * @param itemId The item id.
     * @param container Optional. The audio container.
     * @param mediaSourceId The media version id, if playing an alternate version.
     * @param deviceId The device id of the client requesting. Used to stop encoding processes when needed.
     * @param userId Optional. The user id.
     * @param audioCodec Optional. The audio codec to transcode to.
     * @param maxAudioChannels Optional. The maximum number of audio channels.
     * @param transcodingAudioChannels Optional. The number of how many audio channels to transcode to.
     * @param maxStreamingBitrate Optional. The maximum streaming bitrate.
     * @param audioBitRate Optional. Specify an audio bitrate to encode to, e.g. 128000. If omitted this will be left to encoder defaults.
     * @param startTimeTicks Optional. Specify a starting offset, in ticks. 1 tick = 10000 ms.
     * @param transcodingContainer Optional. The container to transcode to.
     * @param transcodingProtocol Optional. The transcoding protocol.
     * @param maxAudioSampleRate Optional. The maximum audio sample rate.
     * @param maxAudioBitDepth Optional. The maximum audio bit depth.
     * @param enableRemoteMedia Optional. Whether to enable remote media.
     * @param breakOnNonKeyFrames Optional. Whether to break on non key frames.
     * @param enableRedirection Whether to enable redirection. Defaults to true.
     * @returns binary Audio stream returned.
     * @throws ApiError
     */
    public static headUniversalAudioStream(
        itemId: string,
        container?: Array<string> | null,
        mediaSourceId?: string | null,
        deviceId?: string | null,
        userId?: string | null,
        audioCodec?: string | null,
        maxAudioChannels?: number | null,
        transcodingAudioChannels?: number | null,
        maxStreamingBitrate?: number | null,
        audioBitRate?: number | null,
        startTimeTicks?: number | null,
        transcodingContainer?: string | null,
        transcodingProtocol?: string | null,
        maxAudioSampleRate?: number | null,
        maxAudioBitDepth?: number | null,
        enableRemoteMedia?: boolean | null,
        breakOnNonKeyFrames: boolean = false,
        enableRedirection: boolean = true,
    ): CancelablePromise<Blob> {
        return __request(OpenAPI, {
            method: 'HEAD',
            url: '/Audio/{itemId}/universal',
            path: {
                'itemId': itemId,
            },
            query: {
                'container': container,
                'mediaSourceId': mediaSourceId,
                'deviceId': deviceId,
                'userId': userId,
                'audioCodec': audioCodec,
                'maxAudioChannels': maxAudioChannels,
                'transcodingAudioChannels': transcodingAudioChannels,
                'maxStreamingBitrate': maxStreamingBitrate,
                'audioBitRate': audioBitRate,
                'startTimeTicks': startTimeTicks,
                'transcodingContainer': transcodingContainer,
                'transcodingProtocol': transcodingProtocol,
                'maxAudioSampleRate': maxAudioSampleRate,
                'maxAudioBitDepth': maxAudioBitDepth,
                'enableRemoteMedia': enableRemoteMedia,
                'breakOnNonKeyFrames': breakOnNonKeyFrames,
                'enableRedirection': enableRedirection,
            },
            errors: {
                302: `Redirected to remote audio stream.`,
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

}
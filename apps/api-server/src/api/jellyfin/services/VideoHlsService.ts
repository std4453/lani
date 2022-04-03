/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { EncodingContext } from '../models/EncodingContext';
import type { SubtitleDeliveryMethod } from '../models/SubtitleDeliveryMethod';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class VideoHlsService {

    /**
     * Gets a hls live stream.
     * @param itemId The item id.
     * @param container The audio container.
     * @param _static Optional. If true, the original file will be streamed statically without any encoding. Use either no url extension or the original file extension. true/false.
     * @param params The streaming parameters.
     * @param tag The tag.
     * @param deviceProfileId Optional. The dlna device profile id to utilize.
     * @param playSessionId The play session id.
     * @param segmentContainer The segment container.
     * @param segmentLength The segment lenght.
     * @param minSegments The minimum number of segments.
     * @param mediaSourceId The media version id, if playing an alternate version.
     * @param deviceId The device id of the client requesting. Used to stop encoding processes when needed.
     * @param audioCodec Optional. Specify a audio codec to encode to, e.g. mp3. If omitted the server will auto-select using the url's extension. Options: aac, mp3, vorbis, wma.
     * @param enableAutoStreamCopy Whether or not to allow automatic stream copy if requested values match the original source. Defaults to true.
     * @param allowVideoStreamCopy Whether or not to allow copying of the video stream url.
     * @param allowAudioStreamCopy Whether or not to allow copying of the audio stream url.
     * @param breakOnNonKeyFrames Optional. Whether to break on non key frames.
     * @param audioSampleRate Optional. Specify a specific audio sample rate, e.g. 44100.
     * @param maxAudioBitDepth Optional. The maximum audio bit depth.
     * @param audioBitRate Optional. Specify an audio bitrate to encode to, e.g. 128000. If omitted this will be left to encoder defaults.
     * @param audioChannels Optional. Specify a specific number of audio channels to encode to, e.g. 2.
     * @param maxAudioChannels Optional. Specify a maximum number of audio channels to encode to, e.g. 2.
     * @param profile Optional. Specify a specific an encoder profile (varies by encoder), e.g. main, baseline, high.
     * @param level Optional. Specify a level for the encoder profile (varies by encoder), e.g. 3, 3.1.
     * @param framerate Optional. A specific video framerate to encode to, e.g. 23.976. Generally this should be omitted unless the device has specific requirements.
     * @param maxFramerate Optional. A specific maximum video framerate to encode to, e.g. 23.976. Generally this should be omitted unless the device has specific requirements.
     * @param copyTimestamps Whether or not to copy timestamps when transcoding with an offset. Defaults to false.
     * @param startTimeTicks Optional. Specify a starting offset, in ticks. 1 tick = 10000 ms.
     * @param width Optional. The fixed horizontal resolution of the encoded video.
     * @param height Optional. The fixed vertical resolution of the encoded video.
     * @param videoBitRate Optional. Specify a video bitrate to encode to, e.g. 500000. If omitted this will be left to encoder defaults.
     * @param subtitleStreamIndex Optional. The index of the subtitle stream to use. If omitted no subtitles will be used.
     * @param subtitleMethod Optional. Specify the subtitle delivery method.
     * @param maxRefFrames Optional.
     * @param maxVideoBitDepth Optional. The maximum video bit depth.
     * @param requireAvc Optional. Whether to require avc.
     * @param deInterlace Optional. Whether to deinterlace the video.
     * @param requireNonAnamorphic Optional. Whether to require a non anamorphic stream.
     * @param transcodingMaxAudioChannels Optional. The maximum number of audio channels to transcode.
     * @param cpuCoreLimit Optional. The limit of how many cpu cores to use.
     * @param liveStreamId The live stream id.
     * @param enableMpegtsM2TsMode Optional. Whether to enable the MpegtsM2Ts mode.
     * @param videoCodec Optional. Specify a video codec to encode to, e.g. h264. If omitted the server will auto-select using the url's extension. Options: h265, h264, mpeg4, theora, vpx, wmv.
     * @param subtitleCodec Optional. Specify a subtitle codec to encode to.
     * @param transcodeReasons Optional. The transcoding reason.
     * @param audioStreamIndex Optional. The index of the audio stream to use. If omitted the first audio stream will be used.
     * @param videoStreamIndex Optional. The index of the video stream to use. If omitted the first video stream will be used.
     * @param context Optional. The MediaBrowser.Model.Dlna.EncodingContext.
     * @param streamOptions Optional. The streaming options.
     * @param maxWidth Optional. The max width.
     * @param maxHeight Optional. The max height.
     * @param enableSubtitlesInManifest Optional. Whether to enable subtitles in the manifest.
     * @returns binary Hls live stream retrieved.
     * @throws ApiError
     */
    public static getLiveHlsStream(
        itemId: string,
        container?: string | null,
        _static?: boolean | null,
        params?: string | null,
        tag?: string | null,
        deviceProfileId?: string | null,
        playSessionId?: string | null,
        segmentContainer?: string | null,
        segmentLength?: number | null,
        minSegments?: number | null,
        mediaSourceId?: string | null,
        deviceId?: string | null,
        audioCodec?: string | null,
        enableAutoStreamCopy?: boolean | null,
        allowVideoStreamCopy?: boolean | null,
        allowAudioStreamCopy?: boolean | null,
        breakOnNonKeyFrames?: boolean | null,
        audioSampleRate?: number | null,
        maxAudioBitDepth?: number | null,
        audioBitRate?: number | null,
        audioChannels?: number | null,
        maxAudioChannels?: number | null,
        profile?: string | null,
        level?: string | null,
        framerate?: number | null,
        maxFramerate?: number | null,
        copyTimestamps?: boolean | null,
        startTimeTicks?: number | null,
        width?: number | null,
        height?: number | null,
        videoBitRate?: number | null,
        subtitleStreamIndex?: number | null,
        subtitleMethod?: SubtitleDeliveryMethod | null,
        maxRefFrames?: number | null,
        maxVideoBitDepth?: number | null,
        requireAvc?: boolean | null,
        deInterlace?: boolean | null,
        requireNonAnamorphic?: boolean | null,
        transcodingMaxAudioChannels?: number | null,
        cpuCoreLimit?: number | null,
        liveStreamId?: string | null,
        enableMpegtsM2TsMode?: boolean | null,
        videoCodec?: string | null,
        subtitleCodec?: string | null,
        transcodeReasons?: string | null,
        audioStreamIndex?: number | null,
        videoStreamIndex?: number | null,
        context?: EncodingContext | null,
        streamOptions?: Record<string, string> | null,
        maxWidth?: number | null,
        maxHeight?: number | null,
        enableSubtitlesInManifest?: boolean | null,
    ): CancelablePromise<Blob> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Videos/{itemId}/live.m3u8',
            path: {
                'itemId': itemId,
            },
            query: {
                'container': container,
                'static': _static,
                'params': params,
                'tag': tag,
                'deviceProfileId': deviceProfileId,
                'playSessionId': playSessionId,
                'segmentContainer': segmentContainer,
                'segmentLength': segmentLength,
                'minSegments': minSegments,
                'mediaSourceId': mediaSourceId,
                'deviceId': deviceId,
                'audioCodec': audioCodec,
                'enableAutoStreamCopy': enableAutoStreamCopy,
                'allowVideoStreamCopy': allowVideoStreamCopy,
                'allowAudioStreamCopy': allowAudioStreamCopy,
                'breakOnNonKeyFrames': breakOnNonKeyFrames,
                'audioSampleRate': audioSampleRate,
                'maxAudioBitDepth': maxAudioBitDepth,
                'audioBitRate': audioBitRate,
                'audioChannels': audioChannels,
                'maxAudioChannels': maxAudioChannels,
                'profile': profile,
                'level': level,
                'framerate': framerate,
                'maxFramerate': maxFramerate,
                'copyTimestamps': copyTimestamps,
                'startTimeTicks': startTimeTicks,
                'width': width,
                'height': height,
                'videoBitRate': videoBitRate,
                'subtitleStreamIndex': subtitleStreamIndex,
                'subtitleMethod': subtitleMethod,
                'maxRefFrames': maxRefFrames,
                'maxVideoBitDepth': maxVideoBitDepth,
                'requireAvc': requireAvc,
                'deInterlace': deInterlace,
                'requireNonAnamorphic': requireNonAnamorphic,
                'transcodingMaxAudioChannels': transcodingMaxAudioChannels,
                'cpuCoreLimit': cpuCoreLimit,
                'liveStreamId': liveStreamId,
                'enableMpegtsM2TsMode': enableMpegtsM2TsMode,
                'videoCodec': videoCodec,
                'subtitleCodec': subtitleCodec,
                'transcodeReasons': transcodeReasons,
                'audioStreamIndex': audioStreamIndex,
                'videoStreamIndex': videoStreamIndex,
                'context': context,
                'streamOptions': streamOptions,
                'maxWidth': maxWidth,
                'maxHeight': maxHeight,
                'enableSubtitlesInManifest': enableSubtitlesInManifest,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

}
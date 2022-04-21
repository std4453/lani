/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PlaybackProgressInfo } from '../models/PlaybackProgressInfo';
import type { PlaybackStartInfo } from '../models/PlaybackStartInfo';
import type { PlaybackStopInfo } from '../models/PlaybackStopInfo';
import type { PlayMethod } from '../models/PlayMethod';
import type { RepeatMode } from '../models/RepeatMode';
import type { UserItemDataDto } from '../models/UserItemDataDto';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class PlaystateService {

    /**
     * Reports playback has started within a session.
     * @param requestBody The playback start info.
     * @returns void
     * @throws ApiError
     */
    public static reportPlaybackStart(
        requestBody?: PlaybackStartInfo | null,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/Sessions/Playing',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Pings a playback session.
     * @param playSessionId Playback session id.
     * @returns void
     * @throws ApiError
     */
    public static pingPlaybackSession(
        playSessionId: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/Sessions/Playing/Ping',
            query: {
                'playSessionId': playSessionId,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Reports playback progress within a session.
     * @param requestBody The playback progress info.
     * @returns void
     * @throws ApiError
     */
    public static reportPlaybackProgress(
        requestBody?: PlaybackProgressInfo | null,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/Sessions/Playing/Progress',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Reports playback has stopped within a session.
     * @param requestBody The playback stop info.
     * @returns void
     * @throws ApiError
     */
    public static reportPlaybackStopped(
        requestBody?: PlaybackStopInfo | null,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/Sessions/Playing/Stopped',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Marks an item as played for user.
     * @param userId User id.
     * @param itemId Item id.
     * @param datePlayed Optional. The date the item was played.
     * @returns UserItemDataDto Item marked as played.
     * @throws ApiError
     */
    public static markPlayedItem(
        userId: string,
        itemId: string,
        datePlayed?: string | null,
    ): CancelablePromise<UserItemDataDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/Users/{userId}/PlayedItems/{itemId}',
            path: {
                'userId': userId,
                'itemId': itemId,
            },
            query: {
                'datePlayed': datePlayed,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Marks an item as unplayed for user.
     * @param userId User id.
     * @param itemId Item id.
     * @returns UserItemDataDto Item marked as unplayed.
     * @throws ApiError
     */
    public static markUnplayedItem(
        userId: string,
        itemId: string,
    ): CancelablePromise<UserItemDataDto> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/Users/{userId}/PlayedItems/{itemId}',
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
     * Reports that a user has begun playing an item.
     * @param userId User id.
     * @param itemId Item id.
     * @param mediaSourceId The id of the MediaSource.
     * @param audioStreamIndex The audio stream index.
     * @param subtitleStreamIndex The subtitle stream index.
     * @param playMethod The play method.
     * @param liveStreamId The live stream id.
     * @param playSessionId The play session id.
     * @param canSeek Indicates if the client can seek.
     * @returns void
     * @throws ApiError
     */
    public static onPlaybackStart(
        userId: string,
        itemId: string,
        mediaSourceId?: string | null,
        audioStreamIndex?: number | null,
        subtitleStreamIndex?: number | null,
        playMethod?: PlayMethod | null,
        liveStreamId?: string | null,
        playSessionId?: string | null,
        canSeek: boolean = false,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/Users/{userId}/PlayingItems/{itemId}',
            path: {
                'userId': userId,
                'itemId': itemId,
            },
            query: {
                'mediaSourceId': mediaSourceId,
                'audioStreamIndex': audioStreamIndex,
                'subtitleStreamIndex': subtitleStreamIndex,
                'playMethod': playMethod,
                'liveStreamId': liveStreamId,
                'playSessionId': playSessionId,
                'canSeek': canSeek,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Reports that a user has stopped playing an item.
     * @param userId User id.
     * @param itemId Item id.
     * @param mediaSourceId The id of the MediaSource.
     * @param nextMediaType The next media type that will play.
     * @param positionTicks Optional. The position, in ticks, where playback stopped. 1 tick = 10000 ms.
     * @param liveStreamId The live stream id.
     * @param playSessionId The play session id.
     * @returns void
     * @throws ApiError
     */
    public static onPlaybackStopped(
        userId: string,
        itemId: string,
        mediaSourceId?: string | null,
        nextMediaType?: string | null,
        positionTicks?: number | null,
        liveStreamId?: string | null,
        playSessionId?: string | null,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/Users/{userId}/PlayingItems/{itemId}',
            path: {
                'userId': userId,
                'itemId': itemId,
            },
            query: {
                'mediaSourceId': mediaSourceId,
                'nextMediaType': nextMediaType,
                'positionTicks': positionTicks,
                'liveStreamId': liveStreamId,
                'playSessionId': playSessionId,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Reports a user's playback progress.
     * @param userId User id.
     * @param itemId Item id.
     * @param mediaSourceId The id of the MediaSource.
     * @param positionTicks Optional. The current position, in ticks. 1 tick = 10000 ms.
     * @param audioStreamIndex The audio stream index.
     * @param subtitleStreamIndex The subtitle stream index.
     * @param volumeLevel Scale of 0-100.
     * @param playMethod The play method.
     * @param liveStreamId The live stream id.
     * @param playSessionId The play session id.
     * @param repeatMode The repeat mode.
     * @param isPaused Indicates if the player is paused.
     * @param isMuted Indicates if the player is muted.
     * @returns void
     * @throws ApiError
     */
    public static onPlaybackProgress(
        userId: string,
        itemId: string,
        mediaSourceId?: string | null,
        positionTicks?: number | null,
        audioStreamIndex?: number | null,
        subtitleStreamIndex?: number | null,
        volumeLevel?: number | null,
        playMethod?: PlayMethod | null,
        liveStreamId?: string | null,
        playSessionId?: string | null,
        repeatMode?: RepeatMode | null,
        isPaused: boolean = false,
        isMuted: boolean = false,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/Users/{userId}/PlayingItems/{itemId}/Progress',
            path: {
                'userId': userId,
                'itemId': itemId,
            },
            query: {
                'mediaSourceId': mediaSourceId,
                'positionTicks': positionTicks,
                'audioStreamIndex': audioStreamIndex,
                'subtitleStreamIndex': subtitleStreamIndex,
                'volumeLevel': volumeLevel,
                'playMethod': playMethod,
                'liveStreamId': liveStreamId,
                'playSessionId': playSessionId,
                'repeatMode': repeatMode,
                'isPaused': isPaused,
                'isMuted': isMuted,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

}
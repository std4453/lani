/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { BaseItemDto } from './BaseItemDto';
import type { PlayMethod } from './PlayMethod';
import type { QueueItem } from './QueueItem';
import type { RepeatMode } from './RepeatMode';

/**
 * Class PlaybackStartInfo.
 */
export type PlaybackStartInfo = {
    /**
     * Gets or sets a value indicating whether this instance can seek.
     */
    CanSeek?: boolean;
    /**
     * Gets or sets the item.
     */
    Item?: BaseItemDto | null;
    /**
     * Gets or sets the item identifier.
     */
    ItemId?: string;
    /**
     * Gets or sets the session id.
     */
    SessionId?: string | null;
    /**
     * Gets or sets the media version identifier.
     */
    MediaSourceId?: string | null;
    /**
     * Gets or sets the index of the audio stream.
     */
    AudioStreamIndex?: number | null;
    /**
     * Gets or sets the index of the subtitle stream.
     */
    SubtitleStreamIndex?: number | null;
    /**
     * Gets or sets a value indicating whether this instance is paused.
     */
    IsPaused?: boolean;
    /**
     * Gets or sets a value indicating whether this instance is muted.
     */
    IsMuted?: boolean;
    /**
     * Gets or sets the position ticks.
     */
    PositionTicks?: number | null;
    PlaybackStartTimeTicks?: number | null;
    /**
     * Gets or sets the volume level.
     */
    VolumeLevel?: number | null;
    Brightness?: number | null;
    AspectRatio?: string | null;
    /**
     * Gets or sets the play method.
     */
    PlayMethod?: PlayMethod;
    /**
     * Gets or sets the live stream identifier.
     */
    LiveStreamId?: string | null;
    /**
     * Gets or sets the play session identifier.
     */
    PlaySessionId?: string | null;
    /**
     * Gets or sets the repeat mode.
     */
    RepeatMode?: RepeatMode;
    NowPlayingQueue?: Array<QueueItem> | null;
    PlaylistItemId?: string | null;
};

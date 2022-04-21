/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { PlayMethod } from './PlayMethod';
import type { RepeatMode } from './RepeatMode';

export type PlayerStateInfo = {
    /**
     * Gets or sets the now playing position ticks.
     */
    PositionTicks?: number | null;
    /**
     * Gets or sets a value indicating whether this instance can seek.
     */
    CanSeek?: boolean;
    /**
     * Gets or sets a value indicating whether this instance is paused.
     */
    IsPaused?: boolean;
    /**
     * Gets or sets a value indicating whether this instance is muted.
     */
    IsMuted?: boolean;
    /**
     * Gets or sets the volume level.
     */
    VolumeLevel?: number | null;
    /**
     * Gets or sets the index of the now playing audio stream.
     */
    AudioStreamIndex?: number | null;
    /**
     * Gets or sets the index of the now playing subtitle stream.
     */
    SubtitleStreamIndex?: number | null;
    /**
     * Gets or sets the now playing media version identifier.
     */
    MediaSourceId?: string | null;
    /**
     * Gets or sets the play method.
     */
    PlayMethod?: PlayMethod | null;
    /**
     * Gets or sets the repeat mode.
     */
    RepeatMode?: RepeatMode;
};

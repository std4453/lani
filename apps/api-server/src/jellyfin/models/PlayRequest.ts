/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { PlayCommand } from './PlayCommand';

/**
 * Class PlayRequest.
 */
export type PlayRequest = {
    /**
     * Gets or sets the item ids.
     */
    ItemIds?: Array<string> | null;
    /**
     * Gets or sets the start position ticks that the first item should be played at.
     */
    StartPositionTicks?: number | null;
    /**
     * Gets or sets the play command.
     */
    PlayCommand?: PlayCommand;
    /**
     * Gets or sets the controlling user identifier.
     */
    ControllingUserId?: string;
    SubtitleStreamIndex?: number | null;
    AudioStreamIndex?: number | null;
    MediaSourceId?: string | null;
    StartIndex?: number | null;
};

/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { MediaSourceInfo } from './MediaSourceInfo';
import type { PlaybackErrorCode } from './PlaybackErrorCode';

/**
 * Class PlaybackInfoResponse.
 */
export type PlaybackInfoResponse = {
    /**
     * Gets or sets the media sources.
     */
    MediaSources?: Array<MediaSourceInfo> | null;
    /**
     * Gets or sets the play session identifier.
     */
    PlaySessionId?: string | null;
    /**
     * Gets or sets the error code.
     */
    ErrorCode?: PlaybackErrorCode | null;
};

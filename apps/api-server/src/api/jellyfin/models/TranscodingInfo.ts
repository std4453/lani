/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { TranscodeReason } from './TranscodeReason';

export type TranscodingInfo = {
    AudioCodec?: string | null;
    VideoCodec?: string | null;
    Container?: string | null;
    IsVideoDirect?: boolean;
    IsAudioDirect?: boolean;
    Bitrate?: number | null;
    Framerate?: number | null;
    CompletionPercentage?: number | null;
    Width?: number | null;
    Height?: number | null;
    AudioChannels?: number | null;
    TranscodeReasons?: Array<TranscodeReason> | null;
};

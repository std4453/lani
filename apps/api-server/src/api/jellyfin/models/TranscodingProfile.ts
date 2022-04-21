/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { DlnaProfileType } from './DlnaProfileType';
import type { EncodingContext } from './EncodingContext';
import type { TranscodeSeekInfo } from './TranscodeSeekInfo';

export type TranscodingProfile = {
    Container?: string | null;
    Type?: DlnaProfileType;
    VideoCodec?: string | null;
    AudioCodec?: string | null;
    Protocol?: string | null;
    EstimateContentLength?: boolean;
    EnableMpegtsM2TsMode?: boolean;
    TranscodeSeekInfo?: TranscodeSeekInfo;
    CopyTimestamps?: boolean;
    Context?: EncodingContext;
    EnableSubtitlesInManifest?: boolean;
    MaxAudioChannels?: string | null;
    MinSegments?: number;
    SegmentLength?: number;
    BreakOnNonKeyFrames?: boolean;
};

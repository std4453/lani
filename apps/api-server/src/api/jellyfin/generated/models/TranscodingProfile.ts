/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { DlnaProfileType } from './DlnaProfileType';
import type { EncodingContext } from './EncodingContext';
import type { ProfileCondition } from './ProfileCondition';
import type { TranscodeSeekInfo } from './TranscodeSeekInfo';

export type TranscodingProfile = {
  Container?: string;
  Type?: DlnaProfileType;
  VideoCodec?: string;
  AudioCodec?: string;
  Protocol?: string;
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
  Conditions?: Array<ProfileCondition>;
};

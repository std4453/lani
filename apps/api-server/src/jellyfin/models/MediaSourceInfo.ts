/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { IsoType } from './IsoType';
import type { MediaAttachment } from './MediaAttachment';
import type { MediaProtocol } from './MediaProtocol';
import type { MediaSourceType } from './MediaSourceType';
import type { MediaStream } from './MediaStream';
import type { TransportStreamTimestamp } from './TransportStreamTimestamp';
import type { Video3DFormat } from './Video3DFormat';
import type { VideoType } from './VideoType';

export type MediaSourceInfo = {
    Protocol?: MediaProtocol;
    Id?: string | null;
    Path?: string | null;
    EncoderPath?: string | null;
    EncoderProtocol?: MediaProtocol | null;
    Type?: MediaSourceType;
    Container?: string | null;
    Size?: number | null;
    Name?: string | null;
    /**
     * Differentiate internet url vs local network.
     */
    IsRemote?: boolean;
    ETag?: string | null;
    RunTimeTicks?: number | null;
    ReadAtNativeFramerate?: boolean;
    IgnoreDts?: boolean;
    IgnoreIndex?: boolean;
    GenPtsInput?: boolean;
    SupportsTranscoding?: boolean;
    SupportsDirectStream?: boolean;
    SupportsDirectPlay?: boolean;
    IsInfiniteStream?: boolean;
    RequiresOpening?: boolean;
    OpenToken?: string | null;
    RequiresClosing?: boolean;
    LiveStreamId?: string | null;
    BufferMs?: number | null;
    RequiresLooping?: boolean;
    SupportsProbing?: boolean;
    VideoType?: VideoType | null;
    IsoType?: IsoType | null;
    Video3DFormat?: Video3DFormat | null;
    MediaStreams?: Array<MediaStream> | null;
    MediaAttachments?: Array<MediaAttachment> | null;
    Formats?: Array<string> | null;
    Bitrate?: number | null;
    Timestamp?: TransportStreamTimestamp | null;
    RequiredHttpHeaders?: Record<string, string> | null;
    TranscodingUrl?: string | null;
    TranscodingSubProtocol?: string | null;
    TranscodingContainer?: string | null;
    AnalyzeDurationMs?: number | null;
    DefaultAudioStreamIndex?: number | null;
    DefaultSubtitleStreamIndex?: number | null;
};

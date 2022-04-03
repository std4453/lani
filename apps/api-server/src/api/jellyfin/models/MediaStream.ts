/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { MediaStreamType } from './MediaStreamType';
import type { SubtitleDeliveryMethod } from './SubtitleDeliveryMethod';

/**
 * Class MediaStream.
 */
export type MediaStream = {
    /**
     * Gets or sets the codec.
     */
    Codec?: string | null;
    /**
     * Gets or sets the codec tag.
     */
    CodecTag?: string | null;
    /**
     * Gets or sets the language.
     */
    Language?: string | null;
    /**
     * Gets or sets the color range.
     */
    ColorRange?: string | null;
    /**
     * Gets or sets the color space.
     */
    ColorSpace?: string | null;
    /**
     * Gets or sets the color transfer.
     */
    ColorTransfer?: string | null;
    /**
     * Gets or sets the color primaries.
     */
    ColorPrimaries?: string | null;
    /**
     * Gets or sets the comment.
     */
    Comment?: string | null;
    /**
     * Gets or sets the time base.
     */
    TimeBase?: string | null;
    /**
     * Gets or sets the codec time base.
     */
    CodecTimeBase?: string | null;
    /**
     * Gets or sets the title.
     */
    Title?: string | null;
    /**
     * Gets or sets the video range.
     */
    readonly VideoRange?: string | null;
    localizedUndefined?: string | null;
    localizedDefault?: string | null;
    localizedForced?: string | null;
    readonly DisplayTitle?: string | null;
    NalLengthSize?: string | null;
    /**
     * Gets or sets a value indicating whether this instance is interlaced.
     */
    IsInterlaced?: boolean;
    IsAVC?: boolean | null;
    /**
     * Gets or sets the channel layout.
     */
    ChannelLayout?: string | null;
    /**
     * Gets or sets the bit rate.
     */
    BitRate?: number | null;
    /**
     * Gets or sets the bit depth.
     */
    BitDepth?: number | null;
    /**
     * Gets or sets the reference frames.
     */
    RefFrames?: number | null;
    /**
     * Gets or sets the length of the packet.
     */
    PacketLength?: number | null;
    /**
     * Gets or sets the channels.
     */
    Channels?: number | null;
    /**
     * Gets or sets the sample rate.
     */
    SampleRate?: number | null;
    /**
     * Gets or sets a value indicating whether this instance is default.
     */
    IsDefault?: boolean;
    /**
     * Gets or sets a value indicating whether this instance is forced.
     */
    IsForced?: boolean;
    /**
     * Gets or sets the height.
     */
    Height?: number | null;
    /**
     * Gets or sets the width.
     */
    Width?: number | null;
    /**
     * Gets or sets the average frame rate.
     */
    AverageFrameRate?: number | null;
    /**
     * Gets or sets the real frame rate.
     */
    RealFrameRate?: number | null;
    /**
     * Gets or sets the profile.
     */
    Profile?: string | null;
    /**
     * Gets or sets the type.
     */
    Type?: MediaStreamType;
    /**
     * Gets or sets the aspect ratio.
     */
    AspectRatio?: string | null;
    /**
     * Gets or sets the index.
     */
    Index?: number;
    /**
     * Gets or sets the score.
     */
    Score?: number | null;
    /**
     * Gets or sets a value indicating whether this instance is external.
     */
    IsExternal?: boolean;
    /**
     * Gets or sets the method.
     */
    DeliveryMethod?: SubtitleDeliveryMethod | null;
    /**
     * Gets or sets the delivery URL.
     */
    DeliveryUrl?: string | null;
    /**
     * Gets or sets a value indicating whether this instance is external URL.
     */
    IsExternalUrl?: boolean | null;
    readonly IsTextSubtitleStream?: boolean;
    /**
     * Gets or sets a value indicating whether [supports external stream].
     */
    SupportsExternalStream?: boolean;
    /**
     * Gets or sets the filename.
     */
    Path?: string | null;
    /**
     * Gets or sets the pixel format.
     */
    PixelFormat?: string | null;
    /**
     * Gets or sets the level.
     */
    Level?: number | null;
    /**
     * Gets a value indicating whether this instance is anamorphic.
     */
    IsAnamorphic?: boolean | null;
};

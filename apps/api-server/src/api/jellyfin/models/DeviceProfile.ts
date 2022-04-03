/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { CodecProfile } from './CodecProfile';
import type { ContainerProfile } from './ContainerProfile';
import type { DeviceIdentification } from './DeviceIdentification';
import type { DirectPlayProfile } from './DirectPlayProfile';
import type { ResponseProfile } from './ResponseProfile';
import type { SubtitleProfile } from './SubtitleProfile';
import type { TranscodingProfile } from './TranscodingProfile';
import type { XmlAttribute } from './XmlAttribute';

/**
 * Defines the MediaBrowser.Model.Dlna.DeviceProfile.
 */
export type DeviceProfile = {
    /**
     * Gets or sets the Name.
     */
    Name?: string | null;
    /**
     * Gets or sets the Id.
     */
    Id?: string | null;
    /**
     * Gets or sets the Identification.
     */
    Identification?: DeviceIdentification | null;
    /**
     * Gets or sets the FriendlyName.
     */
    FriendlyName?: string | null;
    /**
     * Gets or sets the Manufacturer.
     */
    Manufacturer?: string | null;
    /**
     * Gets or sets the ManufacturerUrl.
     */
    ManufacturerUrl?: string | null;
    /**
     * Gets or sets the ModelName.
     */
    ModelName?: string | null;
    /**
     * Gets or sets the ModelDescription.
     */
    ModelDescription?: string | null;
    /**
     * Gets or sets the ModelNumber.
     */
    ModelNumber?: string | null;
    /**
     * Gets or sets the ModelUrl.
     */
    ModelUrl?: string | null;
    /**
     * Gets or sets the SerialNumber.
     */
    SerialNumber?: string | null;
    /**
     * Gets or sets a value indicating whether EnableAlbumArtInDidl.
     */
    EnableAlbumArtInDidl?: boolean;
    /**
     * Gets or sets a value indicating whether EnableSingleAlbumArtLimit.
     */
    EnableSingleAlbumArtLimit?: boolean;
    /**
     * Gets or sets a value indicating whether EnableSingleSubtitleLimit.
     */
    EnableSingleSubtitleLimit?: boolean;
    /**
     * Gets or sets the SupportedMediaTypes.
     */
    SupportedMediaTypes?: string | null;
    /**
     * Gets or sets the UserId.
     */
    UserId?: string | null;
    /**
     * Gets or sets the AlbumArtPn.
     */
    AlbumArtPn?: string | null;
    /**
     * Gets or sets the MaxAlbumArtWidth.
     */
    MaxAlbumArtWidth?: number;
    /**
     * Gets or sets the MaxAlbumArtHeight.
     */
    MaxAlbumArtHeight?: number;
    /**
     * Gets or sets the MaxIconWidth.
     */
    MaxIconWidth?: number | null;
    /**
     * Gets or sets the MaxIconHeight.
     */
    MaxIconHeight?: number | null;
    /**
     * Gets or sets the MaxStreamingBitrate.
     */
    MaxStreamingBitrate?: number | null;
    /**
     * Gets or sets the MaxStaticBitrate.
     */
    MaxStaticBitrate?: number | null;
    /**
     * Gets or sets the MusicStreamingTranscodingBitrate.
     */
    MusicStreamingTranscodingBitrate?: number | null;
    /**
     * Gets or sets the MaxStaticMusicBitrate.
     */
    MaxStaticMusicBitrate?: number | null;
    /**
     * Gets or sets the content of the aggregationFlags element in the urn:schemas-sonycom:av namespace.
     */
    SonyAggregationFlags?: string | null;
    /**
     * Gets or sets the ProtocolInfo.
     */
    ProtocolInfo?: string | null;
    /**
     * Gets or sets the TimelineOffsetSeconds.
     */
    TimelineOffsetSeconds?: number;
    /**
     * Gets or sets a value indicating whether RequiresPlainVideoItems.
     */
    RequiresPlainVideoItems?: boolean;
    /**
     * Gets or sets a value indicating whether RequiresPlainFolders.
     */
    RequiresPlainFolders?: boolean;
    /**
     * Gets or sets a value indicating whether EnableMSMediaReceiverRegistrar.
     */
    EnableMSMediaReceiverRegistrar?: boolean;
    /**
     * Gets or sets a value indicating whether IgnoreTranscodeByteRangeRequests.
     */
    IgnoreTranscodeByteRangeRequests?: boolean;
    /**
     * Gets or sets the XmlRootAttributes.
     */
    XmlRootAttributes?: Array<XmlAttribute> | null;
    /**
     * Gets or sets the direct play profiles.
     */
    DirectPlayProfiles?: Array<DirectPlayProfile> | null;
    /**
     * Gets or sets the transcoding profiles.
     */
    TranscodingProfiles?: Array<TranscodingProfile> | null;
    /**
     * Gets or sets the ContainerProfiles.
     */
    ContainerProfiles?: Array<ContainerProfile> | null;
    /**
     * Gets or sets the CodecProfiles.
     */
    CodecProfiles?: Array<CodecProfile> | null;
    /**
     * Gets or sets the ResponseProfiles.
     */
    ResponseProfiles?: Array<ResponseProfile> | null;
    /**
     * Gets or sets the SubtitleProfiles.
     */
    SubtitleProfiles?: Array<SubtitleProfile> | null;
};

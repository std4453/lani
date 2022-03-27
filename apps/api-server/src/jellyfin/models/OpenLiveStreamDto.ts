/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { DeviceProfile } from './DeviceProfile';
import type { MediaProtocol } from './MediaProtocol';

/**
 * Open live stream dto.
 */
export type OpenLiveStreamDto = {
    /**
     * Gets or sets the open token.
     */
    OpenToken?: string | null;
    /**
     * Gets or sets the user id.
     */
    UserId?: string | null;
    /**
     * Gets or sets the play session id.
     */
    PlaySessionId?: string | null;
    /**
     * Gets or sets the max streaming bitrate.
     */
    MaxStreamingBitrate?: number | null;
    /**
     * Gets or sets the start time in ticks.
     */
    StartTimeTicks?: number | null;
    /**
     * Gets or sets the audio stream index.
     */
    AudioStreamIndex?: number | null;
    /**
     * Gets or sets the subtitle stream index.
     */
    SubtitleStreamIndex?: number | null;
    /**
     * Gets or sets the max audio channels.
     */
    MaxAudioChannels?: number | null;
    /**
     * Gets or sets the item id.
     */
    ItemId?: string | null;
    /**
     * Gets or sets a value indicating whether to enable direct play.
     */
    EnableDirectPlay?: boolean | null;
    /**
     * Gets or sets a value indicating whether to enale direct stream.
     */
    EnableDirectStream?: boolean | null;
    /**
     * Gets or sets the device profile.
     */
    DeviceProfile?: DeviceProfile | null;
    /**
     * Gets or sets the device play protocols.
     */
    DirectPlayProtocols?: Array<MediaProtocol> | null;
};

/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { BaseItem } from './BaseItem';
import type { BaseItemDto } from './BaseItemDto';
import type { ClientCapabilities } from './ClientCapabilities';
import type { GeneralCommandType } from './GeneralCommandType';
import type { PlayerStateInfo } from './PlayerStateInfo';
import type { QueueItem } from './QueueItem';
import type { SessionUserInfo } from './SessionUserInfo';
import type { TranscodingInfo } from './TranscodingInfo';

/**
 * Class SessionInfo.
 */
export type SessionInfo = {
    PlayState?: PlayerStateInfo | null;
    AdditionalUsers?: Array<SessionUserInfo> | null;
    Capabilities?: ClientCapabilities | null;
    /**
     * Gets or sets the remote end point.
     */
    RemoteEndPoint?: string | null;
    /**
     * Gets or sets the playable media types.
     */
    readonly PlayableMediaTypes?: Array<string> | null;
    /**
     * Gets or sets the id.
     */
    Id?: string | null;
    /**
     * Gets or sets the user id.
     */
    UserId?: string;
    /**
     * Gets or sets the username.
     */
    UserName?: string | null;
    /**
     * Gets or sets the type of the client.
     */
    Client?: string | null;
    /**
     * Gets or sets the last activity date.
     */
    LastActivityDate?: string;
    /**
     * Gets or sets the last playback check in.
     */
    LastPlaybackCheckIn?: string;
    /**
     * Gets or sets the name of the device.
     */
    DeviceName?: string | null;
    /**
     * Gets or sets the type of the device.
     */
    DeviceType?: string | null;
    /**
     * Gets or sets the now playing item.
     */
    NowPlayingItem?: BaseItemDto | null;
    /**
     * Class BaseItem.
     */
    FullNowPlayingItem?: BaseItem | null;
    /**
     * This is strictly used as a data transfer object from the api layer.
     * This holds information about a BaseItem in a format that is convenient for the client.
     */
    NowViewingItem?: BaseItemDto | null;
    /**
     * Gets or sets the device id.
     */
    DeviceId?: string | null;
    /**
     * Gets or sets the application version.
     */
    ApplicationVersion?: string | null;
    TranscodingInfo?: TranscodingInfo | null;
    /**
     * Gets a value indicating whether this instance is active.
     */
    readonly IsActive?: boolean;
    readonly SupportsMediaControl?: boolean;
    readonly SupportsRemoteControl?: boolean;
    NowPlayingQueue?: Array<QueueItem> | null;
    HasCustomDeviceName?: boolean;
    PlaylistItemId?: string | null;
    ServerId?: string | null;
    UserPrimaryImageTag?: string | null;
    /**
     * Gets or sets the supported commands.
     */
    readonly SupportedCommands?: Array<GeneralCommandType> | null;
};

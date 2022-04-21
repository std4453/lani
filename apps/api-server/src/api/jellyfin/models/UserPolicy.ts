/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AccessSchedule } from './AccessSchedule';
import type { SyncPlayUserAccessType } from './SyncPlayUserAccessType';
import type { UnratedItem } from './UnratedItem';

export type UserPolicy = {
    /**
     * Gets or sets a value indicating whether this instance is administrator.
     */
    IsAdministrator?: boolean;
    /**
     * Gets or sets a value indicating whether this instance is hidden.
     */
    IsHidden?: boolean;
    /**
     * Gets or sets a value indicating whether this instance is disabled.
     */
    IsDisabled?: boolean;
    /**
     * Gets or sets the max parental rating.
     */
    MaxParentalRating?: number | null;
    BlockedTags?: Array<string> | null;
    EnableUserPreferenceAccess?: boolean;
    AccessSchedules?: Array<AccessSchedule> | null;
    BlockUnratedItems?: Array<UnratedItem> | null;
    EnableRemoteControlOfOtherUsers?: boolean;
    EnableSharedDeviceControl?: boolean;
    EnableRemoteAccess?: boolean;
    EnableLiveTvManagement?: boolean;
    EnableLiveTvAccess?: boolean;
    EnableMediaPlayback?: boolean;
    EnableAudioPlaybackTranscoding?: boolean;
    EnableVideoPlaybackTranscoding?: boolean;
    EnablePlaybackRemuxing?: boolean;
    ForceRemoteSourceTranscoding?: boolean;
    EnableContentDeletion?: boolean;
    EnableContentDeletionFromFolders?: Array<string> | null;
    EnableContentDownloading?: boolean;
    /**
     * Gets or sets a value indicating whether [enable synchronize].
     */
    EnableSyncTranscoding?: boolean;
    EnableMediaConversion?: boolean;
    EnabledDevices?: Array<string> | null;
    EnableAllDevices?: boolean;
    EnabledChannels?: Array<string> | null;
    EnableAllChannels?: boolean;
    EnabledFolders?: Array<string> | null;
    EnableAllFolders?: boolean;
    InvalidLoginAttemptCount?: number;
    LoginAttemptsBeforeLockout?: number;
    MaxActiveSessions?: number;
    EnablePublicSharing?: boolean;
    BlockedMediaFolders?: Array<string> | null;
    BlockedChannels?: Array<string> | null;
    RemoteClientBitrateLimit?: number;
    AuthenticationProviderId?: string | null;
    PasswordResetProviderId?: string | null;
    /**
     * Gets or sets a value indicating what SyncPlay features the user can access.
     */
    SyncPlayAccess?: SyncPlayUserAccessType;
};

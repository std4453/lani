/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { DeviceProfile } from './DeviceProfile';
import type { GeneralCommandType } from './GeneralCommandType';

/**
 * Client capabilities dto.
 */
export type ClientCapabilitiesDto = {
    /**
     * Gets or sets the list of playable media types.
     */
    PlayableMediaTypes?: Array<string> | null;
    /**
     * Gets or sets the list of supported commands.
     */
    SupportedCommands?: Array<GeneralCommandType> | null;
    /**
     * Gets or sets a value indicating whether session supports media control.
     */
    SupportsMediaControl?: boolean;
    /**
     * Gets or sets a value indicating whether session supports content uploading.
     */
    SupportsContentUploading?: boolean;
    /**
     * Gets or sets the message callback url.
     */
    MessageCallbackUrl?: string | null;
    /**
     * Gets or sets a value indicating whether session supports a persistent identifier.
     */
    SupportsPersistentIdentifier?: boolean;
    /**
     * Gets or sets a value indicating whether session supports sync.
     */
    SupportsSync?: boolean;
    /**
     * Gets or sets the device profile.
     */
    DeviceProfile?: DeviceProfile | null;
    /**
     * Gets or sets the app store url.
     */
    AppStoreUrl?: string | null;
    /**
     * Gets or sets the icon url.
     */
    IconUrl?: string | null;
};

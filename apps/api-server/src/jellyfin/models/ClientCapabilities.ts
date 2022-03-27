/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { DeviceProfile } from './DeviceProfile';
import type { GeneralCommandType } from './GeneralCommandType';

export type ClientCapabilities = {
    PlayableMediaTypes?: Array<string> | null;
    SupportedCommands?: Array<GeneralCommandType> | null;
    SupportsMediaControl?: boolean;
    SupportsContentUploading?: boolean;
    MessageCallbackUrl?: string | null;
    SupportsPersistentIdentifier?: boolean;
    SupportsSync?: boolean;
    /**
     * Defines the MediaBrowser.Model.Dlna.DeviceProfile.
     */
    DeviceProfile?: DeviceProfile | null;
    AppStoreUrl?: string | null;
    IconUrl?: string | null;
};

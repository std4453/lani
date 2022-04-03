/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ClientCapabilities } from './ClientCapabilities';

export type DeviceInfo = {
    Name?: string | null;
    /**
     * Gets or sets the identifier.
     */
    Id?: string | null;
    /**
     * Gets or sets the last name of the user.
     */
    LastUserName?: string | null;
    /**
     * Gets or sets the name of the application.
     */
    AppName?: string | null;
    /**
     * Gets or sets the application version.
     */
    AppVersion?: string | null;
    /**
     * Gets or sets the last user identifier.
     */
    LastUserId?: string;
    /**
     * Gets or sets the date last modified.
     */
    DateLastActivity?: string;
    /**
     * Gets or sets the capabilities.
     */
    Capabilities?: ClientCapabilities | null;
    IconUrl?: string | null;
};

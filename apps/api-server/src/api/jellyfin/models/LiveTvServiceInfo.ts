/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { LiveTvServiceStatus } from './LiveTvServiceStatus';

/**
 * Class ServiceInfo.
 */
export type LiveTvServiceInfo = {
    /**
     * Gets or sets the name.
     */
    Name?: string | null;
    /**
     * Gets or sets the home page URL.
     */
    HomePageUrl?: string | null;
    /**
     * Gets or sets the status.
     */
    Status?: LiveTvServiceStatus;
    /**
     * Gets or sets the status message.
     */
    StatusMessage?: string | null;
    /**
     * Gets or sets the version.
     */
    Version?: string | null;
    /**
     * Gets or sets a value indicating whether this instance has update available.
     */
    HasUpdateAvailable?: boolean;
    /**
     * Gets or sets a value indicating whether this instance is visible.
     */
    IsVisible?: boolean;
    Tuners?: Array<string> | null;
};

/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { LiveTvServiceInfo } from './LiveTvServiceInfo';

export type LiveTvInfo = {
    /**
     * Gets or sets the services.
     */
    Services?: Array<LiveTvServiceInfo> | null;
    /**
     * Gets or sets a value indicating whether this instance is enabled.
     */
    IsEnabled?: boolean;
    /**
     * Gets or sets the enabled users.
     */
    EnabledUsers?: Array<string> | null;
};

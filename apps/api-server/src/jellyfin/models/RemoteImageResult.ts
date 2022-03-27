/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { RemoteImageInfo } from './RemoteImageInfo';

/**
 * Class RemoteImageResult.
 */
export type RemoteImageResult = {
    /**
     * Gets or sets the images.
     */
    Images?: Array<RemoteImageInfo> | null;
    /**
     * Gets or sets the total record count.
     */
    TotalRecordCount?: number;
    /**
     * Gets or sets the providers.
     */
    Providers?: Array<string> | null;
};

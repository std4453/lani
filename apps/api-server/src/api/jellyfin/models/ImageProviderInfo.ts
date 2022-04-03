/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ImageType } from './ImageType';

/**
 * Class ImageProviderInfo.
 */
export type ImageProviderInfo = {
    /**
     * Gets the name.
     */
    readonly Name?: string | null;
    /**
     * Gets the supported image types.
     */
    readonly SupportedImages?: Array<ImageType> | null;
};

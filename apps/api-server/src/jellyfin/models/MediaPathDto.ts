/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { MediaPathInfo } from './MediaPathInfo';

/**
 * Media Path dto.
 */
export type MediaPathDto = {
    /**
     * Gets or sets the name of the library.
     */
    Name: string;
    /**
     * Gets or sets the path to add.
     */
    Path?: string | null;
    /**
     * Gets or sets the path info.
     */
    PathInfo?: MediaPathInfo | null;
};

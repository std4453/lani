/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { LibraryOptions } from './LibraryOptions';

/**
 * Update library options dto.
 */
export type UpdateLibraryOptionsDto = {
    /**
     * Gets or sets the library item id.
     */
    Id?: string;
    /**
     * Gets or sets library options.
     */
    LibraryOptions?: LibraryOptions | null;
};

/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { MediaPathInfo } from './MediaPathInfo';

/**
 * Update library options dto.
 */
export type UpdateMediaPathRequestDto = {
    /**
     * Gets or sets the library name.
     */
    Name: string;
    /**
     * Gets or sets library folder path information.
     */
    PathInfo: MediaPathInfo;
};

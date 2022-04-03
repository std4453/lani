/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { BaseItemDto } from './BaseItemDto';

/**
 * Class ThemeMediaResult.
 */
export type ThemeMediaResult = {
    /**
     * Gets or sets the items.
     */
    Items?: Array<BaseItemDto> | null;
    /**
     * The total number of records available.
     */
    TotalRecordCount?: number;
    /**
     * The index of the first record in Items.
     */
    StartIndex?: number;
    /**
     * Gets or sets the owner id.
     */
    OwnerId?: string;
};

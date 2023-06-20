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
   * Gets or sets the total number of records available.
   */
  TotalRecordCount?: number;
  /**
   * Gets or sets the index of the first record in Items.
   */
  StartIndex?: number;
  /**
   * Gets or sets the owner id.
   */
  OwnerId?: string;
};

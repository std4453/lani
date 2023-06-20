/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { BaseItemDto } from './BaseItemDto';

export type BaseItemDtoQueryResult = {
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
};

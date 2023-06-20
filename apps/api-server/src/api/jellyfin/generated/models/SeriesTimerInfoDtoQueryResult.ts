/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { SeriesTimerInfoDto } from './SeriesTimerInfoDto';

export type SeriesTimerInfoDtoQueryResult = {
  /**
   * Gets or sets the items.
   */
  Items?: Array<SeriesTimerInfoDto> | null;
  /**
   * Gets or sets the total number of records available.
   */
  TotalRecordCount?: number;
  /**
   * Gets or sets the index of the first record in Items.
   */
  StartIndex?: number;
};

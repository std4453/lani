/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { TimerInfoDto } from './TimerInfoDto';

export type TimerInfoDtoQueryResult = {
  /**
   * Gets or sets the items.
   */
  Items?: Array<TimerInfoDto> | null;
  /**
   * Gets or sets the total number of records available.
   */
  TotalRecordCount?: number;
  /**
   * Gets or sets the index of the first record in Items.
   */
  StartIndex?: number;
};

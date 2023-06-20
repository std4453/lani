/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { DeviceInfo } from './DeviceInfo';

export type DeviceInfoQueryResult = {
  /**
   * Gets or sets the items.
   */
  Items?: Array<DeviceInfo> | null;
  /**
   * Gets or sets the total number of records available.
   */
  TotalRecordCount?: number;
  /**
   * Gets or sets the index of the first record in Items.
   */
  StartIndex?: number;
};

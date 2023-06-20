/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ActivityLogEntry } from './ActivityLogEntry';

export type ActivityLogEntryQueryResult = {
  /**
   * Gets or sets the items.
   */
  Items?: Array<ActivityLogEntry> | null;
  /**
   * Gets or sets the total number of records available.
   */
  TotalRecordCount?: number;
  /**
   * Gets or sets the index of the first record in Items.
   */
  StartIndex?: number;
};

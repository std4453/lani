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
     * The total number of records available.
     */
    TotalRecordCount?: number;
    /**
     * The index of the first record in Items.
     */
    StartIndex?: number;
};

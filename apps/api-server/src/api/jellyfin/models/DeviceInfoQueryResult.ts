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
     * The total number of records available.
     */
    TotalRecordCount?: number;
    /**
     * The index of the first record in Items.
     */
    StartIndex?: number;
};

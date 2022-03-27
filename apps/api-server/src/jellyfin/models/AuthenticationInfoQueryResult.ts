/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AuthenticationInfo } from './AuthenticationInfo';

export type AuthenticationInfoQueryResult = {
    /**
     * Gets or sets the items.
     */
    Items?: Array<AuthenticationInfo> | null;
    /**
     * The total number of records available.
     */
    TotalRecordCount?: number;
    /**
     * The index of the first record in Items.
     */
    StartIndex?: number;
};

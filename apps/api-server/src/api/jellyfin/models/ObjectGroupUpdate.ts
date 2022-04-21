/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { GroupUpdateType } from './GroupUpdateType';

/**
 * Class GroupUpdate.
 */
export type ObjectGroupUpdate = {
    /**
     * Gets the group identifier.
     */
    readonly GroupId?: string;
    /**
     * Gets the update type.
     */
    readonly Type?: GroupUpdateType;
    /**
     * Gets the update data.
     */
    readonly Data?: any;
};

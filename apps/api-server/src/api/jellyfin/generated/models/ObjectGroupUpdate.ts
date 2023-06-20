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
  GroupId?: string;
  /**
   * Gets the update type.
   */
  Type?: GroupUpdateType;
  /**
   * Gets the update data.
   */
  Data?: any;
};

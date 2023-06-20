/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { GroupStateType } from './GroupStateType';

/**
 * Class GroupInfoDto.
 */
export type GroupInfoDto = {
  /**
   * Gets the group identifier.
   */
  GroupId?: string;
  /**
   * Gets the group name.
   */
  GroupName?: string;
  /**
   * Gets the group state.
   */
  State?: GroupStateType;
  /**
   * Gets the participants.
   */
  Participants?: Array<string>;
  /**
   * Gets the date when this DTO has been created.
   */
  LastUpdatedAt?: string;
};

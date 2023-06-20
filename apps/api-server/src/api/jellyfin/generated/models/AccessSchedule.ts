/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { DynamicDayOfWeek } from './DynamicDayOfWeek';

/**
 * An entity representing a user's access schedule.
 */
export type AccessSchedule = {
  /**
   * Gets the id of this instance.
   */
  readonly Id?: number;
  /**
   * Gets the id of the associated user.
   */
  UserId?: string;
  /**
   * Gets or sets the day of week.
   */
  DayOfWeek?: DynamicDayOfWeek;
  /**
   * Gets or sets the start hour.
   */
  StartHour?: number;
  /**
   * Gets or sets the end hour.
   */
  EndHour?: number;
};

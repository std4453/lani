/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { DynamicDayOfWeek } from './DynamicDayOfWeek';

/**
 * An entity representing a user's access schedule.
 */
export type AccessSchedule = {
    /**
     * Gets or sets the id of this instance.
     */
    readonly Id: number;
    /**
     * Gets or sets the id of the associated user.
     */
    readonly UserId: string;
    /**
     * Gets or sets the day of week.
     */
    DayOfWeek: DynamicDayOfWeek;
    /**
     * Gets or sets the start hour.
     */
    StartHour: number;
    /**
     * Gets or sets the end hour.
     */
    EndHour: number;
};

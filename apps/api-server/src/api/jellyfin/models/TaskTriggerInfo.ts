/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { DayOfWeek } from './DayOfWeek';

/**
 * Class TaskTriggerInfo.
 */
export type TaskTriggerInfo = {
    /**
     * Gets or sets the type.
     */
    Type?: string | null;
    /**
     * Gets or sets the time of day.
     */
    TimeOfDayTicks?: number | null;
    /**
     * Gets or sets the interval.
     */
    IntervalTicks?: number | null;
    /**
     * Gets or sets the day of week.
     */
    DayOfWeek?: DayOfWeek | null;
    /**
     * Gets or sets the maximum runtime ticks.
     */
    MaxRuntimeTicks?: number | null;
};

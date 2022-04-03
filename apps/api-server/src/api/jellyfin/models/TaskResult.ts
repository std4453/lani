/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { TaskCompletionStatus } from './TaskCompletionStatus';

/**
 * Class TaskExecutionInfo.
 */
export type TaskResult = {
    /**
     * Gets or sets the start time UTC.
     */
    StartTimeUtc?: string;
    /**
     * Gets or sets the end time UTC.
     */
    EndTimeUtc?: string;
    /**
     * Gets or sets the status.
     */
    Status?: TaskCompletionStatus;
    /**
     * Gets or sets the name.
     */
    Name?: string | null;
    /**
     * Gets or sets the key.
     */
    Key?: string | null;
    /**
     * Gets or sets the id.
     */
    Id?: string | null;
    /**
     * Gets or sets the error message.
     */
    ErrorMessage?: string | null;
    /**
     * Gets or sets the long error message.
     */
    LongErrorMessage?: string | null;
};

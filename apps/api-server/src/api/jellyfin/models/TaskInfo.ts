/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { TaskResult } from './TaskResult';
import type { TaskState } from './TaskState';
import type { TaskTriggerInfo } from './TaskTriggerInfo';

/**
 * Class TaskInfo.
 */
export type TaskInfo = {
    /**
     * Gets or sets the name.
     */
    Name?: string | null;
    /**
     * Gets or sets the state of the task.
     */
    State?: TaskState;
    /**
     * Gets or sets the progress.
     */
    CurrentProgressPercentage?: number | null;
    /**
     * Gets or sets the id.
     */
    Id?: string | null;
    /**
     * Gets or sets the last execution result.
     */
    LastExecutionResult?: TaskResult | null;
    /**
     * Gets or sets the triggers.
     */
    Triggers?: Array<TaskTriggerInfo> | null;
    /**
     * Gets or sets the description.
     */
    Description?: string | null;
    /**
     * Gets or sets the category.
     */
    Category?: string | null;
    /**
     * Gets or sets a value indicating whether this instance is hidden.
     */
    IsHidden?: boolean;
    /**
     * Gets or sets the key.
     */
    Key?: string | null;
};

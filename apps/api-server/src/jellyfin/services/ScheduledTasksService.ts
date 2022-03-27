/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { TaskInfo } from '../models/TaskInfo';
import type { TaskTriggerInfo } from '../models/TaskTriggerInfo';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class ScheduledTasksService {

    /**
     * Get tasks.
     * @param isHidden Optional filter tasks that are hidden, or not.
     * @param isEnabled Optional filter tasks that are enabled, or not.
     * @returns TaskInfo Scheduled tasks retrieved.
     * @throws ApiError
     */
    public static getTasks(
        isHidden?: boolean | null,
        isEnabled?: boolean | null,
    ): CancelablePromise<Array<TaskInfo>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/ScheduledTasks',
            query: {
                'isHidden': isHidden,
                'isEnabled': isEnabled,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Get task by id.
     * @param taskId Task Id.
     * @returns TaskInfo Task retrieved.
     * @throws ApiError
     */
    public static getTask(
        taskId: string,
    ): CancelablePromise<TaskInfo> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/ScheduledTasks/{taskId}',
            path: {
                'taskId': taskId,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Task not found.`,
            },
        });
    }

    /**
     * Update specified task triggers.
     * @param taskId Task Id.
     * @param requestBody Triggers.
     * @returns void
     * @throws ApiError
     */
    public static updateTask(
        taskId: string,
        requestBody: Array<TaskTriggerInfo>,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/ScheduledTasks/{taskId}/Triggers',
            path: {
                'taskId': taskId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Task not found.`,
            },
        });
    }

    /**
     * Start specified task.
     * @param taskId Task Id.
     * @returns void
     * @throws ApiError
     */
    public static startTask(
        taskId: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/ScheduledTasks/Running/{taskId}',
            path: {
                'taskId': taskId,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Task not found.`,
            },
        });
    }

    /**
     * Stop specified task.
     * @param taskId Task Id.
     * @returns void
     * @throws ApiError
     */
    public static stopTask(
        taskId: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/ScheduledTasks/Running/{taskId}',
            path: {
                'taskId': taskId,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Task not found.`,
            },
        });
    }

}
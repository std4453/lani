/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { NotificationDto } from './NotificationDto';

/**
 * A list of notifications with the total record count for pagination.
 */
export type NotificationResultDto = {
    /**
     * Gets or sets the current page of notifications.
     */
    Notifications?: Array<NotificationDto> | null;
    /**
     * Gets or sets the total number of notifications.
     */
    TotalRecordCount?: number;
};

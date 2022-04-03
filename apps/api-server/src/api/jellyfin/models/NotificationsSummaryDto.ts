/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { NotificationLevel } from './NotificationLevel';

/**
 * The notification summary DTO.
 */
export type NotificationsSummaryDto = {
    /**
     * Gets or sets the number of unread notifications.
     */
    UnreadCount?: number;
    /**
     * Gets or sets the maximum unread notification level.
     */
    MaxUnreadNotificationLevel?: NotificationLevel | null;
};

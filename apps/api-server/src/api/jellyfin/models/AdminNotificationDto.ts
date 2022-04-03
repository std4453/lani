/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { NotificationLevel } from './NotificationLevel';

/**
 * The admin notification dto.
 */
export type AdminNotificationDto = {
    /**
     * Gets or sets the notification name.
     */
    Name?: string | null;
    /**
     * Gets or sets the notification description.
     */
    Description?: string | null;
    /**
     * Gets or sets the notification level.
     */
    NotificationLevel?: NotificationLevel | null;
    /**
     * Gets or sets the notification url.
     */
    Url?: string | null;
};

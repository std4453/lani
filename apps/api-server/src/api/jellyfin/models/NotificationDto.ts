/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { NotificationLevel } from './NotificationLevel';

/**
 * The notification DTO.
 */
export type NotificationDto = {
    /**
     * Gets or sets the notification ID. Defaults to an empty string.
     */
    Id?: string | null;
    /**
     * Gets or sets the notification's user ID. Defaults to an empty string.
     */
    UserId?: string | null;
    /**
     * Gets or sets the notification date.
     */
    Date?: string;
    /**
     * Gets or sets a value indicating whether the notification has been read. Defaults to false.
     */
    IsRead?: boolean;
    /**
     * Gets or sets the notification's name. Defaults to an empty string.
     */
    Name?: string | null;
    /**
     * Gets or sets the notification's description. Defaults to an empty string.
     */
    Description?: string | null;
    /**
     * Gets or sets the notification's URL. Defaults to an empty string.
     */
    Url?: string | null;
    /**
     * Gets or sets the notification level.
     */
    Level?: NotificationLevel;
};

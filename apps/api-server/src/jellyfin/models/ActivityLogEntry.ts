/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { LogLevel } from './LogLevel';

export type ActivityLogEntry = {
    /**
     * Gets or sets the identifier.
     */
    Id?: number;
    /**
     * Gets or sets the name.
     */
    Name?: string | null;
    /**
     * Gets or sets the overview.
     */
    Overview?: string | null;
    /**
     * Gets or sets the short overview.
     */
    ShortOverview?: string | null;
    /**
     * Gets or sets the type.
     */
    Type?: string | null;
    /**
     * Gets or sets the item identifier.
     */
    ItemId?: string | null;
    /**
     * Gets or sets the date.
     */
    Date?: string;
    /**
     * Gets or sets the user identifier.
     */
    UserId?: string;
    /**
     * Gets or sets the user primary image tag.
     */
    UserPrimaryImageTag?: string | null;
    /**
     * Gets or sets the log severity.
     */
    Severity?: LogLevel;
};

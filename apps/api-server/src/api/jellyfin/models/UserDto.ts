/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { UserConfiguration } from './UserConfiguration';
import type { UserPolicy } from './UserPolicy';

/**
 * Class UserDto.
 */
export type UserDto = {
    /**
     * Gets or sets the name.
     */
    Name?: string | null;
    /**
     * Gets or sets the server identifier.
     */
    ServerId?: string | null;
    /**
     * Gets or sets the name of the server.
     * This is not used by the server and is for client-side usage only.
     */
    ServerName?: string | null;
    /**
     * Gets or sets the id.
     */
    Id?: string;
    /**
     * Gets or sets the primary image tag.
     */
    PrimaryImageTag?: string | null;
    /**
     * Gets or sets a value indicating whether this instance has password.
     */
    HasPassword?: boolean;
    /**
     * Gets or sets a value indicating whether this instance has configured password.
     */
    HasConfiguredPassword?: boolean;
    /**
     * Gets or sets a value indicating whether this instance has configured easy password.
     */
    HasConfiguredEasyPassword?: boolean;
    /**
     * Gets or sets whether async login is enabled or not.
     */
    EnableAutoLogin?: boolean | null;
    /**
     * Gets or sets the last login date.
     */
    LastLoginDate?: string | null;
    /**
     * Gets or sets the last activity date.
     */
    LastActivityDate?: string | null;
    /**
     * Gets or sets the configuration.
     */
    Configuration?: UserConfiguration | null;
    /**
     * Gets or sets the policy.
     */
    Policy?: UserPolicy | null;
    /**
     * Gets or sets the primary image aspect ratio.
     */
    PrimaryImageAspectRatio?: number | null;
};

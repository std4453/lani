/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

/**
 * The authenticate user by name request body.
 */
export type AuthenticateUserByName = {
    /**
     * Gets or sets the username.
     */
    Username?: string | null;
    /**
     * Gets or sets the plain text password.
     */
    Pw?: string | null;
    /**
     * Gets or sets the sha1-hashed password.
     */
    Password?: string | null;
};

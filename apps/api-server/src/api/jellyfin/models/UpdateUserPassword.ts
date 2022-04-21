/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

/**
 * The update user password request body.
 */
export type UpdateUserPassword = {
    /**
     * Gets or sets the current sha1-hashed password.
     */
    CurrentPassword?: string | null;
    /**
     * Gets or sets the current plain text password.
     */
    CurrentPw?: string | null;
    /**
     * Gets or sets the new plain text password.
     */
    NewPw?: string | null;
    /**
     * Gets or sets a value indicating whether to reset the password.
     */
    ResetPassword?: boolean;
};

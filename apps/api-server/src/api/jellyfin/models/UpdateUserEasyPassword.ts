/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

/**
 * The update user easy password request body.
 */
export type UpdateUserEasyPassword = {
    /**
     * Gets or sets the new sha1-hashed password.
     */
    NewPassword?: string | null;
    /**
     * Gets or sets the new password.
     */
    NewPw?: string | null;
    /**
     * Gets or sets a value indicating whether to reset the password.
     */
    ResetPassword?: boolean;
};

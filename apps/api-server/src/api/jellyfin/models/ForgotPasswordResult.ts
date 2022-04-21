/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ForgotPasswordAction } from './ForgotPasswordAction';

export type ForgotPasswordResult = {
    /**
     * Gets or sets the action.
     */
    Action?: ForgotPasswordAction;
    /**
     * Gets or sets the pin file.
     */
    PinFile?: string | null;
    /**
     * Gets or sets the pin expiration date.
     */
    PinExpirationDate?: string | null;
};

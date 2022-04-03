/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

/**
 * Stores the result of an incoming quick connect request.
 */
export type QuickConnectResult = {
    /**
     * Gets a value indicating whether this request is authorized.
     */
    readonly Authenticated?: boolean;
    /**
     * Gets or sets the secret value used to uniquely identify this request. Can be used to retrieve authentication information.
     */
    Secret?: string | null;
    /**
     * Gets or sets the user facing code used so the user can quickly differentiate this request from others.
     */
    Code?: string | null;
    /**
     * Gets or sets the private access token.
     */
    Authentication?: string | null;
    /**
     * Gets or sets an error message.
     */
    Error?: string | null;
    /**
     * Gets or sets the DateTime that this request was created.
     */
    DateAdded?: string | null;
};

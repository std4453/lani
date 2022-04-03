/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

/**
 * Validate path object.
 */
export type ValidatePathDto = {
    /**
     * Gets or sets a value indicating whether validate if path is writable.
     */
    ValidateWritable?: boolean;
    /**
     * Gets or sets the path.
     */
    Path?: string | null;
    /**
     * Gets or sets is path file.
     */
    IsFile?: boolean | null;
};

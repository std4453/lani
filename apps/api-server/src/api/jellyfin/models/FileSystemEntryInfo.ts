/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { FileSystemEntryType } from './FileSystemEntryType';

/**
 * Class FileSystemEntryInfo.
 */
export type FileSystemEntryInfo = {
    /**
     * Gets the name.
     */
    readonly Name?: string | null;
    /**
     * Gets the path.
     */
    readonly Path?: string | null;
    /**
     * Gets the type.
     */
    readonly Type?: FileSystemEntryType;
};

/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { CollectionTypeOptions } from './CollectionTypeOptions';
import type { LibraryOptions } from './LibraryOptions';

/**
 * Used to hold information about a user's list of configured virtual folders.
 */
export type VirtualFolderInfo = {
    /**
     * Gets or sets the name.
     */
    Name?: string | null;
    /**
     * Gets or sets the locations.
     */
    Locations?: Array<string> | null;
    /**
     * Gets or sets the type of the collection.
     */
    CollectionType?: CollectionTypeOptions | null;
    LibraryOptions?: LibraryOptions | null;
    /**
     * Gets or sets the item identifier.
     */
    ItemId?: string | null;
    /**
     * Gets or sets the primary image item identifier.
     */
    PrimaryImageItemId?: string | null;
    RefreshProgress?: number | null;
    RefreshStatus?: string | null;
};

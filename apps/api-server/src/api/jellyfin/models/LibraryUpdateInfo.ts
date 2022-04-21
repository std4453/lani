/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

/**
 * Class LibraryUpdateInfo.
 */
export type LibraryUpdateInfo = {
    /**
     * Gets or sets the folders added to.
     */
    FoldersAddedTo?: Array<string> | null;
    /**
     * Gets or sets the folders removed from.
     */
    FoldersRemovedFrom?: Array<string> | null;
    /**
     * Gets or sets the items added.
     */
    ItemsAdded?: Array<string> | null;
    /**
     * Gets or sets the items removed.
     */
    ItemsRemoved?: Array<string> | null;
    /**
     * Gets or sets the items updated.
     */
    ItemsUpdated?: Array<string> | null;
    CollectionFolders?: Array<string> | null;
    readonly IsEmpty?: boolean;
};

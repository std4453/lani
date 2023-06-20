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
  FoldersAddedTo?: Array<string>;
  /**
   * Gets or sets the folders removed from.
   */
  FoldersRemovedFrom?: Array<string>;
  /**
   * Gets or sets the items added.
   */
  ItemsAdded?: Array<string>;
  /**
   * Gets or sets the items removed.
   */
  ItemsRemoved?: Array<string>;
  /**
   * Gets or sets the items updated.
   */
  ItemsUpdated?: Array<string>;
  CollectionFolders?: Array<string>;
  readonly IsEmpty?: boolean;
};

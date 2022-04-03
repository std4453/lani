/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ScrollDirection } from './ScrollDirection';
import type { SortOrder } from './SortOrder';

/**
 * Defines the display preferences for any item that supports them (usually Folders).
 */
export type DisplayPreferencesDto = {
    /**
     * Gets or sets the user id.
     */
    Id?: string | null;
    /**
     * Gets or sets the type of the view.
     */
    ViewType?: string | null;
    /**
     * Gets or sets the sort by.
     */
    SortBy?: string | null;
    /**
     * Gets or sets the index by.
     */
    IndexBy?: string | null;
    /**
     * Gets or sets a value indicating whether [remember indexing].
     */
    RememberIndexing?: boolean;
    /**
     * Gets or sets the height of the primary image.
     */
    PrimaryImageHeight?: number;
    /**
     * Gets or sets the width of the primary image.
     */
    PrimaryImageWidth?: number;
    /**
     * Gets or sets the custom prefs.
     */
    CustomPrefs?: Record<string, string> | null;
    /**
     * Gets or sets the scroll direction.
     */
    ScrollDirection?: ScrollDirection;
    /**
     * Gets or sets a value indicating whether to show backdrops on this item.
     */
    ShowBackdrop?: boolean;
    /**
     * Gets or sets a value indicating whether [remember sorting].
     */
    RememberSorting?: boolean;
    /**
     * Gets or sets the sort order.
     */
    SortOrder?: SortOrder;
    /**
     * Gets or sets a value indicating whether [show sidebar].
     */
    ShowSidebar?: boolean;
    /**
     * Gets or sets the client.
     */
    Client?: string | null;
};

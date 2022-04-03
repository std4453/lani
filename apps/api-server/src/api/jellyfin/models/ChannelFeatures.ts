/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ChannelItemSortField } from './ChannelItemSortField';
import type { ChannelMediaContentType } from './ChannelMediaContentType';
import type { ChannelMediaType } from './ChannelMediaType';

export type ChannelFeatures = {
    /**
     * Gets or sets the name.
     */
    Name?: string | null;
    /**
     * Gets or sets the identifier.
     */
    Id?: string | null;
    /**
     * Gets or sets a value indicating whether this instance can search.
     */
    CanSearch?: boolean;
    /**
     * Gets or sets the media types.
     */
    MediaTypes?: Array<ChannelMediaType> | null;
    /**
     * Gets or sets the content types.
     */
    ContentTypes?: Array<ChannelMediaContentType> | null;
    /**
     * Represents the maximum number of records the channel allows retrieving at a time.
     */
    MaxPageSize?: number | null;
    /**
     * Gets or sets the automatic refresh levels.
     */
    AutoRefreshLevels?: number | null;
    /**
     * Gets or sets the default sort orders.
     */
    DefaultSortFields?: Array<ChannelItemSortField> | null;
    /**
     * Indicates if a sort ascending/descending toggle is supported or not.
     */
    SupportsSortOrderToggle?: boolean;
    /**
     * Gets or sets a value indicating whether [supports latest media].
     */
    SupportsLatestMedia?: boolean;
    /**
     * Gets or sets a value indicating whether this instance can filter.
     */
    CanFilter?: boolean;
    /**
     * Gets or sets a value indicating whether [supports content downloading].
     */
    SupportsContentDownloading?: boolean;
};

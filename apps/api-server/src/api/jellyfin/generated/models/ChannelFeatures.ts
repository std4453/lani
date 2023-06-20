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
  Name?: string;
  /**
   * Gets or sets the identifier.
   */
  Id?: string;
  /**
   * Gets or sets a value indicating whether this instance can search.
   */
  CanSearch?: boolean;
  /**
   * Gets or sets the media types.
   */
  MediaTypes?: Array<ChannelMediaType>;
  /**
   * Gets or sets the content types.
   */
  ContentTypes?: Array<ChannelMediaContentType>;
  /**
   * Gets or sets the maximum number of records the channel allows retrieving at a time.
   */
  MaxPageSize?: number | null;
  /**
   * Gets or sets the automatic refresh levels.
   */
  AutoRefreshLevels?: number | null;
  /**
   * Gets or sets the default sort orders.
   */
  DefaultSortFields?: Array<ChannelItemSortField>;
  /**
   * Gets or sets a value indicating whether a sort ascending/descending toggle is supported.
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

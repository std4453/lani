/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { MusicVideoInfo } from './MusicVideoInfo';

export type MusicVideoInfoRemoteSearchQuery = {
  SearchInfo?: MusicVideoInfo | null;
  ItemId?: string;
  /**
   * Gets or sets the provider name to search within if set.
   */
  SearchProviderName?: string | null;
  /**
   * Gets or sets a value indicating whether disabled providers should be included.
   */
  IncludeDisabledProviders?: boolean;
};

/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { SeriesInfo } from './SeriesInfo';

export type SeriesInfoRemoteSearchQuery = {
    SearchInfo?: SeriesInfo | null;
    ItemId?: string;
    /**
     * Will only search within the given provider when set.
     */
    SearchProviderName?: string | null;
    /**
     * Gets or sets a value indicating whether disabled providers should be included.
     */
    IncludeDisabledProviders?: boolean;
};

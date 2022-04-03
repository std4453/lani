/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AlbumInfo } from './AlbumInfo';

export type AlbumInfoRemoteSearchQuery = {
    SearchInfo?: AlbumInfo | null;
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

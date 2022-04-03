/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { NameValuePair } from './NameValuePair';

export type ListingsProviderInfo = {
    Id?: string | null;
    Type?: string | null;
    Username?: string | null;
    Password?: string | null;
    ListingsId?: string | null;
    ZipCode?: string | null;
    Country?: string | null;
    Path?: string | null;
    EnabledTuners?: Array<string> | null;
    EnableAllTuners?: boolean;
    NewsCategories?: Array<string> | null;
    SportsCategories?: Array<string> | null;
    KidsCategories?: Array<string> | null;
    MovieCategories?: Array<string> | null;
    ChannelMappings?: Array<NameValuePair> | null;
    MoviePrefix?: string | null;
    PreferredLanguage?: string | null;
    UserAgent?: string | null;
};

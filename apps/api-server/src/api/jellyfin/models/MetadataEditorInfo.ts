/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { CountryInfo } from './CountryInfo';
import type { CultureDto } from './CultureDto';
import type { ExternalIdInfo } from './ExternalIdInfo';
import type { NameValuePair } from './NameValuePair';
import type { ParentalRating } from './ParentalRating';

export type MetadataEditorInfo = {
    ParentalRatingOptions?: Array<ParentalRating> | null;
    Countries?: Array<CountryInfo> | null;
    Cultures?: Array<CultureDto> | null;
    ExternalIdInfos?: Array<ExternalIdInfo> | null;
    ContentType?: string | null;
    ContentTypeOptions?: Array<NameValuePair> | null;
};

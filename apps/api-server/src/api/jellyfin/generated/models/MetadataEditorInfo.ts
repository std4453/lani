/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { CountryInfo } from './CountryInfo';
import type { CultureDto } from './CultureDto';
import type { ExternalIdInfo } from './ExternalIdInfo';
import type { NameValuePair } from './NameValuePair';
import type { ParentalRating } from './ParentalRating';

export type MetadataEditorInfo = {
  ParentalRatingOptions?: Array<ParentalRating>;
  Countries?: Array<CountryInfo>;
  Cultures?: Array<CultureDto>;
  ExternalIdInfos?: Array<ExternalIdInfo>;
  ContentType?: string | null;
  ContentTypeOptions?: Array<NameValuePair>;
};

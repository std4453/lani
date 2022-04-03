/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { NameGuidPair } from './NameGuidPair';

export type QueryFilters = {
    Genres?: Array<NameGuidPair> | null;
    Tags?: Array<string> | null;
};

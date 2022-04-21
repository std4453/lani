/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { SearchHint } from './SearchHint';

/**
 * Class SearchHintResult.
 */
export type SearchHintResult = {
    /**
     * Gets or sets the search hints.
     */
    SearchHints?: Array<SearchHint> | null;
    /**
     * Gets or sets the total record count.
     */
    TotalRecordCount?: number;
};

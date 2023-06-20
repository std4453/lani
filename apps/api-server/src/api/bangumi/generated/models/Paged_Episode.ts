/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Episode } from './Episode';

export type Paged_Episode = {
  total?: number;
  limit?: number;
  offset?: number;
  data?: Array<Episode>;
};

/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { IndexSubject } from './IndexSubject';

export type Paged_IndexSubject = {
  total?: number;
  limit?: number;
  offset?: number;
  data?: Array<IndexSubject>;
};

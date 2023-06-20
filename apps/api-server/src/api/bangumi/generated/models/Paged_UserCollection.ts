/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { UserSubjectCollection } from './UserSubjectCollection';

export type Paged_UserCollection = {
  total?: number;
  limit?: number;
  offset?: number;
  data?: Array<UserSubjectCollection>;
};

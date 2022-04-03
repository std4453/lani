/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { CollectionType } from './CollectionType';
import type { SubjectType1 } from './SubjectType1';

export type UserCollection = {
  subject_id: number;
  subject_type: SubjectType1;
  rate: number;
  type: CollectionType;
  comment?: string;
  tags: Array<string>;
  ep_status: number;
  vol_status: number;
  updated_at: string;
  private: boolean;
};

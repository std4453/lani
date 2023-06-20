/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Creator } from './Creator';

export type Revision = {
  id: number;
  type: number;
  creator?: Creator;
  summary: string;
  created_at: string;
};

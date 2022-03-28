/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Creator } from './Creator';

export type DetailedRevision = {
  id: number;
  type: number;
  creator?: Creator;
  summary: string;
  created_at: string;
  /**
   * 编辑修改内容
   */
  data?: any;
};

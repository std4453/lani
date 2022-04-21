/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { SubjectType } from './SubjectType';

export type Subject = {
  /**
   * 条目 ID
   */
  id?: number;
  /**
   * 条目地址
   */
  url?: string;
  type?: SubjectType;
  /**
   * 条目名称
   */
  name?: string;
};

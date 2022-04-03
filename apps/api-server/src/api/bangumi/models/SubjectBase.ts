/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Subject } from './Subject';

export type SubjectBase = (Subject & {
  /**
   * 条目中文名称
   */
  name_cn?: string;
  /**
   * 剧情简介
   */
  summary?: string;
  /**
   * 放送开始日期
   */
  air_date?: string;
  /**
   * 放送星期
   */
  air_weekday?: number;
  /**
   * 封面
   */
  images?: {
    large?: string;
    common?: string;
    medium?: string;
    small?: string;
    grid?: string;
  };
});

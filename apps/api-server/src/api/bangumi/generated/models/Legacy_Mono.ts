/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Legacy_MonoBase } from './Legacy_MonoBase';

/**
 * 人物
 */
export type Legacy_Mono = (Legacy_MonoBase & {
  /**
   * 简体中文名
   */
  name_cn?: string;
  /**
   * 回复数量
   */
  comment?: number;
  /**
   * 收藏人数
   */
  collects?: number;
});

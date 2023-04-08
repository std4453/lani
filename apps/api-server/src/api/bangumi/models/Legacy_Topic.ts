/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Legacy_User } from './Legacy_User';

/**
 * 讨论版
 */
export type Legacy_Topic = {
  /**
   * ID
   */
  id?: number;
  /**
   * 地址
   */
  url?: string;
  /**
   * 标题
   */
  title?: string;
  /**
   * 所属对象（条目） ID
   */
  main_id?: number;
  /**
   * 发布时间
   */
  timestamp?: number;
  /**
   * 最后回复时间
   */
  lastpost?: number;
  /**
   * 回复数
   */
  replies?: number;
  user?: Legacy_User;
};

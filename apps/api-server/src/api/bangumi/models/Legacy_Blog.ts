/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Legacy_User } from './Legacy_User';

/**
 * 日志
 */
export type Legacy_Blog = {
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
   * 概览
   */
  summary?: string;
  /**
   * 图片
   */
  image?: string;
  /**
   * 回复数
   */
  replies?: number;
  /**
   * 发布时间
   */
  timestamp?: number;
  /**
   * 发布时间
   */
  dateline?: string;
  user?: Legacy_User;
};

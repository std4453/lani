/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { UserGroup } from './UserGroup';

/**
 * 用户信息
 */
export type User = {
  /**
   * 用户 id
   */
  id?: number;
  /**
   * 用户主页地址
   */
  url?: string;
  /**
   * 用户名
   */
  username?: string;
  /**
   * 昵称
   */
  nickname?: string;
  /**
   * 头像地址
   */
  avatar?: {
    large?: string;
    medium?: string;
    small?: string;
  };
  /**
   * 签名
   */
  sign?: string;
  usergroup?: UserGroup;
};

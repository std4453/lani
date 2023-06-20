/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Avatar } from './Avatar';
import type { UserGroup } from './UserGroup';

/**
 * 实际的返回值可能包括文档未声明的 `url` 字段，此字段主要用于开发者从 api 响应直接转跳到网页。
 * 客户端开发者请不用依赖于此特性，此字段的值随时可能会改变。
 *
 */
export type User = {
  id: number;
  /**
   * 唯一用户名，初始与 UID 相同，可修改一次
   */
  username: string;
  nickname: string;
  user_group: UserGroup;
  avatar: Avatar;
  /**
   * 个人签名
   */
  sign: string;
};

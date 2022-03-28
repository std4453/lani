/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Avatar } from './Avatar';
import type { UserGroup1 } from './UserGroup1';

export type Me = {
  id: number;
  url: string;
  /**
   * 唯一用户名，初始与uid相同，可修改
   */
  username: string;
  nickname: string;
  user_group: UserGroup1;
  avatar: Avatar;
  sign: string;
};

/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Creator } from './Creator';
import type { Stat } from './Stat';

export type Index = {
  id: number;
  title: string;
  desc: string;
  /**
   * 收录条目总数
   */
  total?: number;
  /**
   * 目录评论及收藏数
   */
  stat: Stat;
  created_at: string;
  creator: Creator;
  ban: boolean;
  nsfw: boolean;
};

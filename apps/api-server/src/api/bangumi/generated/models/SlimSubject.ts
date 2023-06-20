/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Images } from './Images';
import type { SubjectTags } from './SubjectTags';
import type { SubjectType } from './SubjectType';

export type SlimSubject = {
  id: number;
  type: SubjectType;
  name: string;
  name_cn: string;
  /**
   * 截短后的条目描述。
   */
  short_summary: string;
  /**
   * air date in `YYYY-MM-DD` format
   */
  date?: string;
  images: Images;
  /**
   * 书籍条目的册数，由旧服务端从wiki中解析
   */
  volumes: number;
  /**
   * 由旧服务端从wiki中解析，对于书籍条目为`话数`
   */
  eps: number;
  /**
   * 收藏人数
   */
  collection_total: number;
  /**
   * 分数
   */
  score: number;
  /**
   * 前 10 个 tag
   */
  tags: SubjectTags;
};

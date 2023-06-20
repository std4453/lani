/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { SubjectCollectionType } from './SubjectCollectionType';

/**
 * 所有的字段均可选
 */
export type UserSubjectCollectionModifyPayload = {
  /**
   * 修改条目收藏类型
   */
  type?: SubjectCollectionType;
  /**
   * 评分，`0` 表示删除评分
   */
  rate?: number;
  /**
   * 只能用于修改书籍条目进度
   */
  ep_status?: number;
  /**
   * 只能用于修改书籍条目进度
   */
  vol_status?: number;
  /**
   * 评价
   */
  comment?: string;
  /**
   * 仅自己可见
   */
  private?: boolean;
  /**
   * 不传或者 `null` 都会被忽略，传 `[]` 则会删除所有 tag。
   */
  tags?: Array<string>;
};

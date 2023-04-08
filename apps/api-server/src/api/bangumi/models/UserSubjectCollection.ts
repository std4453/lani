/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { SlimSubject } from './SlimSubject';
import type { SubjectCollectionType } from './SubjectCollectionType';
import type { SubjectType } from './SubjectType';

export type UserSubjectCollection = {
  subject_id: number;
  subject_type: SubjectType;
  rate: number;
  type: SubjectCollectionType;
  comment?: string;
  tags: Array<string>;
  ep_status: number;
  vol_status: number;
  /**
   * 本时间并不代表条目的收藏时间。修改评分，评价，章节观看状态等收藏信息时未更新此时间是一个 bug。请不要依赖此特性
   */
  updated_at: string;
  private: boolean;
  subject?: SlimSubject;
};

/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Legacy_Blog } from './Legacy_Blog';
import type { Legacy_Episode } from './Legacy_Episode';
import type { Legacy_SubjectMedium } from './Legacy_SubjectMedium';
import type { Legacy_Topic } from './Legacy_Topic';

export type Legacy_SubjectLarge = (Legacy_SubjectMedium & {
  /**
   * 章节列表
   */
  eps?: Array<Legacy_Episode>;
  /**
   * 讨论版
   */
  topic?: Array<Legacy_Topic>;
  /**
   * 评论日志
   */
  blog?: Array<Legacy_Blog>;
});

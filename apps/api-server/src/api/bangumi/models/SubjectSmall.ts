/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { SubjectBase } from './SubjectBase';
import type { SubjectCollection } from './SubjectCollection';

export type SubjectSmall = (SubjectBase & {
  /**
   * 话数
   */
  eps?: number;
  /**
   * 话数
   */
  eps_count?: number;
  /**
   * 评分
   */
  rating?: {
    /**
     * 总评分人数
     */
    total?: number;
    /**
     * 各分值评分人数
     */
    count?: {
      '1'?: number;
      '2'?: number;
      '3'?: number;
      '4'?: number;
      '5'?: number;
      '6'?: number;
      '7'?: number;
      '8'?: number;
      '9'?: number;
      '10'?: number;
    };
    /**
     * 评分
     */
    score?: number;
  };
  /**
   * 排名
   */
  rank?: number;
  collection?: SubjectCollection;
});

/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

/**
 * 收藏人数
 */
export type SubjectCollection = {
  /**
   * 想做
   */
  wish?: number;
  /**
   * 做过
   */
  collect?: number;
  /**
   * 在做
   */
  doing?: number;
  /**
   * 搁置
   */
  on_hold?: number;
  /**
   * 抛弃
   */
  dropped?: number;
};

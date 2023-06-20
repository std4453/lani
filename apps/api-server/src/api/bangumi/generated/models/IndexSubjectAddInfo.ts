/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

/**
 * 新增某条目到目录的请求信息
 */
export type IndexSubjectAddInfo = {
  subject_id?: number;
  /**
   * 排序条件，越小越靠前
   */
  sort?: number;
  comment?: string;
};

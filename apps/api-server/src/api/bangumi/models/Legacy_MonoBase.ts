/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

/**
 * 人物（基础模型）
 */
export type Legacy_MonoBase = {
  /**
   * 人物 ID
   */
  id?: number;
  /**
   * 人物地址
   */
  url?: string;
  /**
   * 姓名
   */
  name?: string;
  /**
   * 肖像
   */
  images?: {
    large?: string;
    medium?: string;
    small?: string;
    grid?: string;
  };
};

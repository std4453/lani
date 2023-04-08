/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

/**
 * 人物信息
 */
export type Legacy_MonoInfo = {
  /**
   * 生日
   */
  birth?: string;
  /**
   * 身高
   */
  height?: string;
  /**
   * 性别
   */
  gender?: string;
  /**
   * 别名（另外添加出来的 key 为 0 开始的数字）
   */
  alias?: {
    /**
     * 日文名
     */
    jp?: string;
    /**
     * 纯假名
     */
    kana?: string;
    /**
     * 昵称
     */
    nick?: string;
    /**
     * 罗马字
     */
    romaji?: string;
    /**
     * 第二中文名
     */
    zh?: string;
  };
  /**
   * 引用来源
   */
  source?: (string | Array<string>);
  /**
   * 简体中文名
   */
  name_cn?: string;
  /**
   * 声优
   */
  cv?: string;
};

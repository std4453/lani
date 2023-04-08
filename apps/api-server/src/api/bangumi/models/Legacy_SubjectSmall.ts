/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type Legacy_SubjectSmall = {
  /**
   * 条目 ID
   */
  id?: number;
  /**
   * 条目地址
   */
  url?: string;
  /**
   * 条目类型
   * - `1` 为 书籍
   * - `2` 为 动画
   * - `3` 为 音乐
   * - `4` 为 游戏
   * - `6` 为 三次元
   *
   * 没有 `5`
   */
  type?: Legacy_SubjectSmall.type;
  /**
   * 条目名称
   */
  name?: string;
  /**
   * 条目中文名称
   */
  name_cn?: string;
  /**
   * 剧情简介
   */
  summary?: string;
  /**
   * 放送开始日期
   */
  air_date?: string;
  /**
   * 放送星期
   */
  air_weekday?: number;
  /**
   * 封面
   */
  images?: {
    large?: string;
    common?: string;
    medium?: string;
    small?: string;
    grid?: string;
  };
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
  /**
   * 收藏人数
   */
  collection?: {
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
};

export namespace Legacy_SubjectSmall {

  /**
   * 条目类型
   * - `1` 为 书籍
   * - `2` 为 动画
   * - `3` 为 音乐
   * - `4` 为 游戏
   * - `6` 为 三次元
   *
   * 没有 `5`
   */
  export enum type {
    Book = 1,
    Anime = 2,
    Music = 3,
    Game = 4,
    Real = 6,
  }


}

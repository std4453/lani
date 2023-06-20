/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Legacy_EpisodeType } from './Legacy_EpisodeType';

/**
 * 章节信息
 */
export type Legacy_Episode = {
  /**
   * 章节 ID
   */
  id?: number;
  /**
   * 章节地址
   */
  url?: string;
  type?: Legacy_EpisodeType;
  /**
   * 集数
   */
  sort?: number;
  /**
   * 标题
   */
  name?: string;
  /**
   * 简体中文标题
   */
  name_cn?: string;
  /**
   * 时长
   */
  duration?: string;
  /**
   * 放送日期
   */
  airdate?: string;
  /**
   * 回复数量
   */
  comment?: number;
  /**
   * 简介
   */
  desc?: string;
  /**
   * 放送状态 <br> Air = 已放送 <br> Today = 正在放送 <br> NA = 未放送
   */
  status?: Legacy_Episode.status;
};

export namespace Legacy_Episode {

  /**
   * 放送状态 <br> Air = 已放送 <br> Today = 正在放送 <br> NA = 未放送
   */
  export enum status {
    AIR = 'Air',
    TODAY = 'Today',
    NA = 'NA',
  }


}

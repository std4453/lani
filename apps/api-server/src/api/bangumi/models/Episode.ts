/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type Episode = {
  id: number;
  /**
   * `0` 本篇，`1` SP，`2` OP，`3` ED
   */
  type: number;
  name: string;
  name_cn: string;
  /**
   * 同类条目的排序和集数
   */
  sort: number;
  /**
   * 条目内的集数, 从`1`开始。非本篇剧集的此字段无意义
   */
  ep?: number;
  airdate: string;
  comment: number;
  /**
   * 维基人填写的原始时长
   */
  duration: string;
  /**
   * 简介
   */
  desc: string;
  /**
   * 音乐曲目的碟片数
   */
  disc: number;
  /**
   * 服务器解析的时长，无法解析时为 `0`
   */
  duration_seconds?: number;
};

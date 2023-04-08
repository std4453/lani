/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Images } from './Images';
import type { SubjectTags } from './SubjectTags';
import type { SubjectType } from './SubjectType';
import type { WikiV0 } from './WikiV0';

export type Subject = {
  id: number;
  type: SubjectType;
  name: string;
  name_cn: string;
  summary: string;
  nsfw: boolean;
  locked: boolean;
  /**
   * air date in `YYYY-MM-DD` format
   */
  date?: string;
  /**
   * TV, Web, 欧美剧, PS4...
   */
  platform: string;
  images: Images;
  infobox?: WikiV0;
  /**
   * 书籍条目的册数，由旧服务端从wiki中解析
   */
  volumes: number;
  /**
   * 由旧服务端从wiki中解析，对于书籍条目为`话数`
   */
  eps: number;
  /**
   * 数据库中的章节数量
   */
  total_episodes: number;
  rating: {
    rank: number;
    total: number;
    count: {
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
    score: number;
  };
  collection: {
    wish: number;
    collect: number;
    doing: number;
    on_hold: number;
    dropped: number;
  };
  tags: SubjectTags;
};

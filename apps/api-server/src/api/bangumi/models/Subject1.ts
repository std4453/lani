/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Collection } from './Collection';
import type { Images } from './Images';
import type { Item } from './Item';
import type { Rating } from './Rating';
import type { Tag } from './Tag';

export type Subject1 = {
  id: number;
  type: number;
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
  images?: Images;
  infobox?: Array<Item>;
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
  rating: Rating;
  collection: Collection;
  tags: Array<Tag>;
};

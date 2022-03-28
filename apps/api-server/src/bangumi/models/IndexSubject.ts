/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Images } from './Images';
import type { Item } from './Item';

/**
 * 同名字段意义同<a href="#model-Subject">Subject</a>
 */
export type IndexSubject = {
  id: number;
  type: number;
  name: string;
  images?: Images;
  infobox?: Array<Item>;
  date?: string;
  comment: string;
  added_at: string;
};

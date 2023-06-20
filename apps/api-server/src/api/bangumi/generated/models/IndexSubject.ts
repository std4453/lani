/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Images } from './Images';
import type { WikiV0 } from './WikiV0';

/**
 * 同名字段意义同<a href="#model-Subject">Subject</a>
 */
export type IndexSubject = {
  id: number;
  type: number;
  name: string;
  images?: Images;
  infobox?: WikiV0;
  date?: string;
  comment: string;
  added_at: string;
};

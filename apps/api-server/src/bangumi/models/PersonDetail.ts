/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { BloodType } from './BloodType';
import type { PersonCareer } from './PersonCareer';
import type { PersonImages } from './PersonImages';
import type { PersonType } from './PersonType';
import type { Stat } from './Stat';

export type PersonDetail = {
  id: number;
  name: string;
  /**
   * `1`, `2`, `3` 表示 `个人`, `公司`, `组合`
   */
  type: PersonType;
  career: Array<PersonCareer>;
  /**
   * object with some size of images, this object maybe `null`
   */
  images?: PersonImages;
  summary: string;
  locked: boolean;
  /**
   * currently it's latest user comment time, it will be replaced by wiki modified date in the future
   */
  last_modified: string;
  /**
   * server parsed infobox, a map from key to string or tuple
   * null if server infobox is not valid
   */
  infobox?: Array<any>;
  /**
   * parsed from wiki, maybe null
   */
  gender?: string;
  /**
   * parsed from wiki, maybe null, `1, 2, 3, 4` for `A, B, CD, O`
   */
  blood_type?: BloodType;
  /**
   * parsed from wiki, maybe `null`
   */
  birth_year?: number;
  /**
   * parsed from wiki, maybe `null`
   */
  birth_mon?: number;
  /**
   * parsed from wiki, maybe `null`
   */
  birth_day?: number;
  stat: Stat;
};

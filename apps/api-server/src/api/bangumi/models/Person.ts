/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { PersonCareer } from './PersonCareer';
import type { PersonImages } from './PersonImages';
import type { PersonType } from './PersonType';

export type Person = {
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
  short_summary: string;
  locked: boolean;
};

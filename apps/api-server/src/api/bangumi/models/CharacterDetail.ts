/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { BloodType } from './BloodType';
import type { CharacterType } from './CharacterType';
import type { PersonImages } from './PersonImages';
import type { Stat } from './Stat';

export type CharacterDetail = {
  id: number;
  name: string;
  /**
   * 角色，机体，舰船，组织...
   */
  type: CharacterType;
  /**
   * object with some size of images, this object maybe `null`
   */
  images?: PersonImages;
  summary: string;
  locked: boolean;
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

/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { CharacterType } from './CharacterType';
import type { PersonImages } from './PersonImages';

export type PersonCharacter = {
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
  subject_id: number;
  subject_name: string;
  subject_name_cn: string;
};

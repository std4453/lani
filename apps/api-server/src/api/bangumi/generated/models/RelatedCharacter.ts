/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { CharacterType } from './CharacterType';
import type { Person } from './Person';
import type { PersonImages } from './PersonImages';

export type RelatedCharacter = {
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
  relation: string;
  /**
   * 演员列表
   */
  actors?: Array<Person>;
};

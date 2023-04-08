/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Legacy_Mono } from './Legacy_Mono';
import type { Legacy_MonoBase } from './Legacy_MonoBase';
import type { Legacy_MonoInfo } from './Legacy_MonoInfo';

/**
 * 虚拟角色
 */
export type Legacy_Character = (Legacy_Mono & {
  info?: Legacy_MonoInfo;
  /**
   * 声优列表
   */
  actors?: Array<Legacy_MonoBase>;
});

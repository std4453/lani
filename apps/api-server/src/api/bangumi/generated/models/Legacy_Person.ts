/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Legacy_Mono } from './Legacy_Mono';
import type { Legacy_MonoInfo } from './Legacy_MonoInfo';

/**
 * 现实人物
 */
export type Legacy_Person = (Legacy_Mono & {
  info?: Legacy_MonoInfo;
});

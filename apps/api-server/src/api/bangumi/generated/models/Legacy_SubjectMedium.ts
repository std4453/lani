/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Legacy_Character } from './Legacy_Character';
import type { Legacy_Person } from './Legacy_Person';
import type { Legacy_SubjectSmall } from './Legacy_SubjectSmall';

export type Legacy_SubjectMedium = (Legacy_SubjectSmall & {
  /**
   * 角色信息
   */
  crt?: Array<(Legacy_Character & {
    /**
     * 角色类型
     */
    role_name?: string;
  })>;
  /**
   * 制作人员信息
   */
  staff?: Array<(Legacy_Person & {
    /**
     * 人物类型
     */
    role_name?: string;
    /**
     * 职位
     */
    jobs?: Array<string>;
  })>;
});

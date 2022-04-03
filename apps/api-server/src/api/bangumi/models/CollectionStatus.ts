/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { CollectionStatusId } from './CollectionStatusId';
import type { CollectionStatusName } from './CollectionStatusName';
import type { CollectionStatusType } from './CollectionStatusType';

/**
 * 收藏状态 <br> 1 = wish = 想做 <br> 2 = collect = 做过 <br> 3 = do = 在做 <br> 4 = on_hold = 搁置 <br> 5 = dropped = 抛弃
 */
export type CollectionStatus = {
  id?: CollectionStatusId;
  type?: CollectionStatusType;
  name?: CollectionStatusName;
};

/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { PersonRevisionDataItem } from './PersonRevisionDataItem';
import type { Revision } from './Revision';

export type PersonRevision = (Revision & {
  data?: Record<string, PersonRevisionDataItem>;
});

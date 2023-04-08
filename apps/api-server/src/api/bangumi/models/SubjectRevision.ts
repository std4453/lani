/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Revision } from './Revision';
import type { SubjectRevisionData } from './SubjectRevisionData';

export type SubjectRevision = (Revision & {
  data?: SubjectRevisionData;
});

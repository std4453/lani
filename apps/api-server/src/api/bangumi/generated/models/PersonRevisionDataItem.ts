/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { PersonRevisionProfession } from './PersonRevisionProfession';
import type { RevisionExtra } from './RevisionExtra';

export type PersonRevisionDataItem = {
  prsn_infobox: string;
  prsn_summary: string;
  profession: PersonRevisionProfession;
  extra: RevisionExtra;
  prsn_name: string;
};

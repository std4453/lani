/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { PersonRevisionExtra } from './PersonRevisionExtra';
import type { PersonRevisionProfession } from './PersonRevisionProfession';

export type PersonRevisionDataItem = {
  prsn_infobox: string;
  prsn_summary: string;
  profession: PersonRevisionProfession;
  extra: PersonRevisionExtra;
  prsn_name: string;
};

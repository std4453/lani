/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { DlnaProfileType } from './DlnaProfileType';
import type { ProfileCondition } from './ProfileCondition';

export type ContainerProfile = {
    Type?: DlnaProfileType;
    Conditions?: Array<ProfileCondition> | null;
    Container?: string | null;
};

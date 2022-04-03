/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { CodecType } from './CodecType';
import type { ProfileCondition } from './ProfileCondition';

export type CodecProfile = {
    Type?: CodecType;
    Conditions?: Array<ProfileCondition> | null;
    ApplyConditions?: Array<ProfileCondition> | null;
    Codec?: string | null;
    Container?: string | null;
};

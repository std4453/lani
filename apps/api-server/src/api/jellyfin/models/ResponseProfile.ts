/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { DlnaProfileType } from './DlnaProfileType';
import type { ProfileCondition } from './ProfileCondition';

export type ResponseProfile = {
    Container?: string | null;
    AudioCodec?: string | null;
    VideoCodec?: string | null;
    Type?: DlnaProfileType;
    OrgPn?: string | null;
    MimeType?: string | null;
    Conditions?: Array<ProfileCondition> | null;
};

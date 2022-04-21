/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { DlnaProfileType } from './DlnaProfileType';

export type DirectPlayProfile = {
    Container?: string | null;
    AudioCodec?: string | null;
    VideoCodec?: string | null;
    Type?: DlnaProfileType;
};

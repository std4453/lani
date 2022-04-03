/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { SubtitleDeliveryMethod } from './SubtitleDeliveryMethod';

export type SubtitleProfile = {
    Format?: string | null;
    Method?: SubtitleDeliveryMethod;
    DidlMode?: string | null;
    Language?: string | null;
    Container?: string | null;
};

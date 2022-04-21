/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { HeaderMatchType } from './HeaderMatchType';

export type HttpHeaderInfo = {
    Name?: string | null;
    Value?: string | null;
    Match?: HeaderMatchType;
};

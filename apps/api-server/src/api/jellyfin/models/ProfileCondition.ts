/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ProfileConditionType } from './ProfileConditionType';
import type { ProfileConditionValue } from './ProfileConditionValue';

export type ProfileCondition = {
    Condition?: ProfileConditionType;
    Property?: ProfileConditionValue;
    Value?: string | null;
    IsRequired?: boolean;
};

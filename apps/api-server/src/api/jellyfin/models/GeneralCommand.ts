/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { GeneralCommandType } from './GeneralCommandType';

export type GeneralCommand = {
    /**
     * This exists simply to identify a set of known commands.
     */
    Name?: GeneralCommandType;
    ControllingUserId?: string;
    Arguments?: Record<string, string> | null;
};

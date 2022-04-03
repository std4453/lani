/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { GroupStateType } from './GroupStateType';

/**
 * Class GroupInfoDto.
 */
export type GroupInfoDto = {
    /**
     * Gets the group identifier.
     */
    readonly GroupId?: string;
    /**
     * Gets the group name.
     */
    readonly GroupName?: string | null;
    /**
     * Gets the group state.
     */
    readonly State?: GroupStateType;
    /**
     * Gets the participants.
     */
    readonly Participants?: Array<string> | null;
    /**
     * Gets the date when this DTO has been created.
     */
    readonly LastUpdatedAt?: string;
};

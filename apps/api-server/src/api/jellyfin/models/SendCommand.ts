/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { SendCommandType } from './SendCommandType';

/**
 * Class SendCommand.
 */
export type SendCommand = {
    /**
     * Gets the group identifier.
     */
    readonly GroupId?: string;
    /**
     * Gets the playlist identifier of the playing item.
     */
    readonly PlaylistItemId?: string;
    /**
     * Gets or sets the UTC time when to execute the command.
     */
    When?: string;
    /**
     * Gets the position ticks.
     */
    readonly PositionTicks?: number | null;
    /**
     * Gets the command.
     */
    readonly Command?: SendCommandType;
    /**
     * Gets the UTC time when this command has been emitted.
     */
    readonly EmittedAt?: string;
};

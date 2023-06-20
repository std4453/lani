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
  GroupId?: string;
  /**
   * Gets the playlist identifier of the playing item.
   */
  PlaylistItemId?: string;
  /**
   * Gets or sets the UTC time when to execute the command.
   */
  When?: string;
  /**
   * Gets the position ticks.
   */
  PositionTicks?: number | null;
  /**
   * Gets the command.
   */
  Command?: SendCommandType;
  /**
   * Gets the UTC time when this command has been emitted.
   */
  EmittedAt?: string;
};

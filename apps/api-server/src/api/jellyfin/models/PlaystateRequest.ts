/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { PlaystateCommand } from './PlaystateCommand';

export type PlaystateRequest = {
    /**
     * Enum PlaystateCommand.
     */
    Command?: PlaystateCommand;
    SeekPositionTicks?: number | null;
    /**
     * Gets or sets the controlling user identifier.
     */
    ControllingUserId?: string | null;
};

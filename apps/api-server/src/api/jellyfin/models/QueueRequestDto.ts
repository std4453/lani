/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { GroupQueueMode } from './GroupQueueMode';

/**
 * Class QueueRequestDto.
 */
export type QueueRequestDto = {
    /**
     * Gets or sets the items to enqueue.
     */
    ItemIds?: Array<string> | null;
    /**
     * Gets or sets the mode in which to add the new items.
     */
    Mode?: GroupQueueMode;
};

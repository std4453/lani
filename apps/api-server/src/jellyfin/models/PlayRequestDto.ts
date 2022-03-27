/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

/**
 * Class PlayRequestDto.
 */
export type PlayRequestDto = {
    /**
     * Gets or sets the playing queue.
     */
    PlayingQueue?: Array<string> | null;
    /**
     * Gets or sets the position of the playing item in the queue.
     */
    PlayingItemPosition?: number;
    /**
     * Gets or sets the start position ticks.
     */
    StartPositionTicks?: number;
};

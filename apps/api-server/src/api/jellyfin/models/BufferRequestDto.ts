/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

/**
 * Class BufferRequestDto.
 */
export type BufferRequestDto = {
    /**
     * Gets or sets when the request has been made by the client.
     */
    When?: string;
    /**
     * Gets or sets the position ticks.
     */
    PositionTicks?: number;
    /**
     * Gets or sets a value indicating whether the client playback is unpaused.
     */
    IsPlaying?: boolean;
    /**
     * Gets or sets the playlist item identifier of the playing item.
     */
    PlaylistItemId?: string;
};

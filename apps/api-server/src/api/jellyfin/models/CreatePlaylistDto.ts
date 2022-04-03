/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

/**
 * Create new playlist dto.
 */
export type CreatePlaylistDto = {
    /**
     * Gets or sets the name of the new playlist.
     */
    Name?: string | null;
    /**
     * Gets or sets item ids to add to the playlist.
     */
    Ids?: Array<string> | null;
    /**
     * Gets or sets the user id.
     */
    UserId?: string | null;
    /**
     * Gets or sets the media type.
     */
    MediaType?: string | null;
};

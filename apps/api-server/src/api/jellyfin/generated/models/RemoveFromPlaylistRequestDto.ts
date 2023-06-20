/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

/**
 * Class RemoveFromPlaylistRequestDto.
 */
export type RemoveFromPlaylistRequestDto = {
  /**
   * Gets or sets the playlist identifiers ot the items. Ignored when clearing the playlist.
   */
  PlaylistItemIds?: Array<string>;
  /**
   * Gets or sets a value indicating whether the entire playlist should be cleared.
   */
  ClearPlaylist?: boolean;
  /**
   * Gets or sets a value indicating whether the playing item should be removed as well. Used only when clearing the playlist.
   */
  ClearPlayingItem?: boolean;
};

/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { BaseItemDto } from './BaseItemDto';
import type { QueueItem } from './QueueItem';

/**
 * Class PlaybackStopInfo.
 */
export type PlaybackStopInfo = {
    /**
     * Gets or sets the item.
     */
    Item?: BaseItemDto | null;
    /**
     * Gets or sets the item identifier.
     */
    ItemId?: string;
    /**
     * Gets or sets the session id.
     */
    SessionId?: string | null;
    /**
     * Gets or sets the media version identifier.
     */
    MediaSourceId?: string | null;
    /**
     * Gets or sets the position ticks.
     */
    PositionTicks?: number | null;
    /**
     * Gets or sets the live stream identifier.
     */
    LiveStreamId?: string | null;
    /**
     * Gets or sets the play session identifier.
     */
    PlaySessionId?: string | null;
    /**
     * Gets or sets a value indicating whether this MediaBrowser.Model.Session.PlaybackStopInfo is failed.
     */
    Failed?: boolean;
    NextMediaType?: string | null;
    PlaylistItemId?: string | null;
    NowPlayingQueue?: Array<QueueItem> | null;
};

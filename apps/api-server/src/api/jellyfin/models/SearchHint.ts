/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

/**
 * Class SearchHintResult.
 */
export type SearchHint = {
    /**
     * Gets or sets the item id.
     */
    ItemId?: string;
    Id?: string;
    /**
     * Gets or sets the name.
     */
    Name?: string | null;
    /**
     * Gets or sets the matched term.
     */
    MatchedTerm?: string | null;
    /**
     * Gets or sets the index number.
     */
    IndexNumber?: number | null;
    /**
     * Gets or sets the production year.
     */
    ProductionYear?: number | null;
    /**
     * Gets or sets the parent index number.
     */
    ParentIndexNumber?: number | null;
    /**
     * Gets or sets the image tag.
     */
    PrimaryImageTag?: string | null;
    /**
     * Gets or sets the thumb image tag.
     */
    ThumbImageTag?: string | null;
    /**
     * Gets or sets the thumb image item identifier.
     */
    ThumbImageItemId?: string | null;
    /**
     * Gets or sets the backdrop image tag.
     */
    BackdropImageTag?: string | null;
    /**
     * Gets or sets the backdrop image item identifier.
     */
    BackdropImageItemId?: string | null;
    /**
     * Gets or sets the type.
     */
    Type?: string | null;
    IsFolder?: boolean | null;
    /**
     * Gets or sets the run time ticks.
     */
    RunTimeTicks?: number | null;
    /**
     * Gets or sets the type of the media.
     */
    MediaType?: string | null;
    StartDate?: string | null;
    EndDate?: string | null;
    /**
     * Gets or sets the series.
     */
    Series?: string | null;
    Status?: string | null;
    /**
     * Gets or sets the album.
     */
    Album?: string | null;
    AlbumId?: string;
    /**
     * Gets or sets the album artist.
     */
    AlbumArtist?: string | null;
    /**
     * Gets or sets the artists.
     */
    Artists?: Array<string> | null;
    /**
     * Gets or sets the song count.
     */
    SongCount?: number | null;
    /**
     * Gets or sets the episode count.
     */
    EpisodeCount?: number | null;
    /**
     * Gets or sets the channel identifier.
     */
    ChannelId?: string;
    /**
     * Gets or sets the name of the channel.
     */
    ChannelName?: string | null;
    /**
     * Gets or sets the primary image aspect ratio.
     */
    PrimaryImageAspectRatio?: number | null;
};

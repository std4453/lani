/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ImageType } from './ImageType';
import type { ItemFields } from './ItemFields';
import type { SortOrder } from './SortOrder';

/**
 * Get programs dto.
 */
export type GetProgramsDto = {
    /**
     * Gets or sets the channels to return guide information for.
     */
    ChannelIds?: Array<string> | null;
    /**
     * Gets or sets optional. Filter by user id.
     */
    UserId?: string;
    /**
     * Gets or sets the minimum premiere start date.
     * Optional.
     */
    MinStartDate?: string | null;
    /**
     * Gets or sets filter by programs that have completed airing, or not.
     * Optional.
     */
    HasAired?: boolean | null;
    /**
     * Gets or sets filter by programs that are currently airing, or not.
     * Optional.
     */
    IsAiring?: boolean | null;
    /**
     * Gets or sets the maximum premiere start date.
     * Optional.
     */
    MaxStartDate?: string | null;
    /**
     * Gets or sets the minimum premiere end date.
     * Optional.
     */
    MinEndDate?: string | null;
    /**
     * Gets or sets the maximum premiere end date.
     * Optional.
     */
    MaxEndDate?: string | null;
    /**
     * Gets or sets filter for movies.
     * Optional.
     */
    IsMovie?: boolean | null;
    /**
     * Gets or sets filter for series.
     * Optional.
     */
    IsSeries?: boolean | null;
    /**
     * Gets or sets filter for news.
     * Optional.
     */
    IsNews?: boolean | null;
    /**
     * Gets or sets filter for kids.
     * Optional.
     */
    IsKids?: boolean | null;
    /**
     * Gets or sets filter for sports.
     * Optional.
     */
    IsSports?: boolean | null;
    /**
     * Gets or sets the record index to start at. All items with a lower index will be dropped from the results.
     * Optional.
     */
    StartIndex?: number | null;
    /**
     * Gets or sets the maximum number of records to return.
     * Optional.
     */
    Limit?: number | null;
    /**
     * Gets or sets specify one or more sort orders, comma delimited. Options: Name, StartDate.
     * Optional.
     */
    SortBy?: Array<string> | null;
    /**
     * Gets or sets sort Order - Ascending,Descending.
     */
    SortOrder?: Array<SortOrder> | null;
    /**
     * Gets or sets the genres to return guide information for.
     */
    Genres?: Array<string> | null;
    /**
     * Gets or sets the genre ids to return guide information for.
     */
    GenreIds?: Array<string> | null;
    /**
     * Gets or sets include image information in output.
     * Optional.
     */
    EnableImages?: boolean | null;
    /**
     * Gets or sets a value indicating whether retrieve total record count.
     */
    EnableTotalRecordCount?: boolean;
    /**
     * Gets or sets the max number of images to return, per image type.
     * Optional.
     */
    ImageTypeLimit?: number | null;
    /**
     * Gets or sets the image types to include in the output.
     * Optional.
     */
    EnableImageTypes?: Array<ImageType> | null;
    /**
     * Gets or sets include user data.
     * Optional.
     */
    EnableUserData?: boolean | null;
    /**
     * Gets or sets filter by series timer id.
     * Optional.
     */
    SeriesTimerId?: string | null;
    /**
     * Gets or sets filter by library series id.
     * Optional.
     */
    LibrarySeriesId?: string;
    /**
     * Gets or sets specify additional fields of information to return in the output. This allows multiple, comma delimited. Options: Budget, Chapters, DateCreated, Genres, HomePageUrl, IndexOptions, MediaStreams, Overview, ParentId, Path, People, ProviderIds, PrimaryImageAspectRatio, Revenue, SortName, Studios, Taglines.
     * Optional.
     */
    Fields?: Array<ItemFields> | null;
};

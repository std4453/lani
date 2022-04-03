/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type RemoteSearchResult = {
    /**
     * Gets or sets the name.
     */
    Name?: string | null;
    /**
     * Gets or sets the provider ids.
     */
    ProviderIds?: Record<string, string> | null;
    /**
     * Gets or sets the year.
     */
    ProductionYear?: number | null;
    IndexNumber?: number | null;
    IndexNumberEnd?: number | null;
    ParentIndexNumber?: number | null;
    PremiereDate?: string | null;
    ImageUrl?: string | null;
    SearchProviderName?: string | null;
    Overview?: string | null;
    AlbumArtist?: RemoteSearchResult | null;
    Artists?: Array<RemoteSearchResult> | null;
};

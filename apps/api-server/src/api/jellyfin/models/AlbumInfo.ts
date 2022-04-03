/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { SongInfo } from './SongInfo';

export type AlbumInfo = {
    /**
     * Gets or sets the name.
     */
    Name?: string | null;
    /**
     * Gets or sets the path.
     */
    Path?: string | null;
    /**
     * Gets or sets the metadata language.
     */
    MetadataLanguage?: string | null;
    /**
     * Gets or sets the metadata country code.
     */
    MetadataCountryCode?: string | null;
    /**
     * Gets or sets the provider ids.
     */
    ProviderIds?: Record<string, string> | null;
    /**
     * Gets or sets the year.
     */
    Year?: number | null;
    IndexNumber?: number | null;
    ParentIndexNumber?: number | null;
    PremiereDate?: string | null;
    IsAutomated?: boolean;
    /**
     * Gets or sets the album artist.
     */
    AlbumArtists?: Array<string> | null;
    /**
     * Gets or sets the artist provider ids.
     */
    ArtistProviderIds?: Record<string, string> | null;
    SongInfos?: Array<SongInfo> | null;
};

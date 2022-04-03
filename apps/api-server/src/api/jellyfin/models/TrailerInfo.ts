/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type TrailerInfo = {
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
};

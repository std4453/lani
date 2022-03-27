/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

/**
 * The startup configuration DTO.
 */
export type StartupConfigurationDto = {
    /**
     * Gets or sets UI language culture.
     */
    UICulture?: string | null;
    /**
     * Gets or sets the metadata country code.
     */
    MetadataCountryCode?: string | null;
    /**
     * Gets or sets the preferred language for the metadata.
     */
    PreferredMetadataLanguage?: string | null;
};

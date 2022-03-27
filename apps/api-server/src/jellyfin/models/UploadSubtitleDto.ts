/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

/**
 * Upload subtitles dto.
 */
export type UploadSubtitleDto = {
    /**
     * Gets or sets the subtitle language.
     */
    Language: string;
    /**
     * Gets or sets the subtitle format.
     */
    Format: string;
    /**
     * Gets or sets a value indicating whether the subtitle is forced.
     */
    IsForced: boolean;
    /**
     * Gets or sets the subtitle data.
     */
    Data: string;
};

/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { LibraryOptionInfoDto } from './LibraryOptionInfoDto';
import type { LibraryTypeOptionsDto } from './LibraryTypeOptionsDto';

/**
 * Library options result dto.
 */
export type LibraryOptionsResultDto = {
    /**
     * Gets or sets the metadata savers.
     */
    MetadataSavers?: Array<LibraryOptionInfoDto> | null;
    /**
     * Gets or sets the metadata readers.
     */
    MetadataReaders?: Array<LibraryOptionInfoDto> | null;
    /**
     * Gets or sets the subtitle fetchers.
     */
    SubtitleFetchers?: Array<LibraryOptionInfoDto> | null;
    /**
     * Gets or sets the type options.
     */
    TypeOptions?: Array<LibraryTypeOptionsDto> | null;
};

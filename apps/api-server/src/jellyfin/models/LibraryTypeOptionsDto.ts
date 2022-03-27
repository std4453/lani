/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ImageOption } from './ImageOption';
import type { ImageType } from './ImageType';
import type { LibraryOptionInfoDto } from './LibraryOptionInfoDto';

/**
 * Library type options dto.
 */
export type LibraryTypeOptionsDto = {
    /**
     * Gets or sets the type.
     */
    Type?: string | null;
    /**
     * Gets or sets the metadata fetchers.
     */
    MetadataFetchers?: Array<LibraryOptionInfoDto> | null;
    /**
     * Gets or sets the image fetchers.
     */
    ImageFetchers?: Array<LibraryOptionInfoDto> | null;
    /**
     * Gets or sets the supported image types.
     */
    SupportedImageTypes?: Array<ImageType> | null;
    /**
     * Gets or sets the default image options.
     */
    DefaultImageOptions?: Array<ImageOption> | null;
};

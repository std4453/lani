/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ImageType } from './ImageType';

/**
 * Class ImageInfo.
 */
export type ImageInfo = {
    /**
     * Gets or sets the type of the image.
     */
    ImageType?: ImageType;
    /**
     * Gets or sets the index of the image.
     */
    ImageIndex?: number | null;
    /**
     * Gets or sets the image tag.
     */
    ImageTag?: string | null;
    /**
     * Gets or sets the path.
     */
    Path?: string | null;
    /**
     * Gets or sets the blurhash.
     */
    BlurHash?: string | null;
    /**
     * Gets or sets the height.
     */
    Height?: number | null;
    /**
     * Gets or sets the width.
     */
    Width?: number | null;
    /**
     * Gets or sets the size.
     */
    Size?: number;
};

/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ImageOption } from './ImageOption';

export type TypeOptions = {
    Type?: string | null;
    MetadataFetchers?: Array<string> | null;
    MetadataFetcherOrder?: Array<string> | null;
    ImageFetchers?: Array<string> | null;
    ImageFetcherOrder?: Array<string> | null;
    ImageOptions?: Array<ImageOption> | null;
};

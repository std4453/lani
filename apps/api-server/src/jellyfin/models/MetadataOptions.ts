/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

/**
 * Class MetadataOptions.
 */
export type MetadataOptions = {
    ItemType?: string | null;
    DisabledMetadataSavers?: Array<string> | null;
    LocalMetadataReaderOrder?: Array<string> | null;
    DisabledMetadataFetchers?: Array<string> | null;
    MetadataFetcherOrder?: Array<string> | null;
    DisabledImageFetchers?: Array<string> | null;
    ImageFetcherOrder?: Array<string> | null;
};

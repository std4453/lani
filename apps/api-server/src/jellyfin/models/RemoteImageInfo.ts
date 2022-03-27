/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ImageType } from './ImageType';
import type { RatingType } from './RatingType';

/**
 * Class RemoteImageInfo.
 */
export type RemoteImageInfo = {
    /**
     * Gets or sets the name of the provider.
     */
    ProviderName?: string | null;
    /**
     * Gets or sets the URL.
     */
    Url?: string | null;
    /**
     * Gets a url used for previewing a smaller version.
     */
    ThumbnailUrl?: string | null;
    /**
     * Gets or sets the height.
     */
    Height?: number | null;
    /**
     * Gets or sets the width.
     */
    Width?: number | null;
    /**
     * Gets or sets the community rating.
     */
    CommunityRating?: number | null;
    /**
     * Gets or sets the vote count.
     */
    VoteCount?: number | null;
    /**
     * Gets or sets the language.
     */
    Language?: string | null;
    /**
     * Gets or sets the type.
     */
    Type?: ImageType;
    /**
     * Gets or sets the type of the rating.
     */
    RatingType?: RatingType;
};

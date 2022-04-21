/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

/**
 * This is used by the api to get information about a Person within a BaseItem.
 */
export type BaseItemPerson = {
    /**
     * Gets or sets the name.
     */
    Name?: string | null;
    /**
     * Gets or sets the identifier.
     */
    Id?: string | null;
    /**
     * Gets or sets the role.
     */
    Role?: string | null;
    /**
     * Gets or sets the type.
     */
    Type?: string | null;
    /**
     * Gets or sets the primary image tag.
     */
    PrimaryImageTag?: string | null;
    /**
     * Gets or sets the primary image blurhash.
     */
    ImageBlurHashes?: {
        Primary?: Record<string, string>;
        Art?: Record<string, string>;
        Backdrop?: Record<string, string>;
        Banner?: Record<string, string>;
        Logo?: Record<string, string>;
        Thumb?: Record<string, string>;
        Disc?: Record<string, string>;
        Box?: Record<string, string>;
        Screenshot?: Record<string, string>;
        Menu?: Record<string, string>;
        Chapter?: Record<string, string>;
        BoxRear?: Record<string, string>;
        Profile?: Record<string, string>;
    } | null;
};

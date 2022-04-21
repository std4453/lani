/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { VersionInfo } from './VersionInfo';

/**
 * Class PackageInfo.
 */
export type PackageInfo = {
    /**
     * Gets or sets the name.
     */
    name?: string | null;
    /**
     * Gets or sets a long description of the plugin containing features or helpful explanations.
     */
    description?: string | null;
    /**
     * Gets or sets a short overview of what the plugin does.
     */
    overview?: string | null;
    /**
     * Gets or sets the owner.
     */
    owner?: string | null;
    /**
     * Gets or sets the category.
     */
    category?: string | null;
    /**
     * Gets or sets the guid of the assembly associated with this plugin.
     * This is used to identify the proper item for automatic updates.
     */
    guid?: string | null;
    /**
     * Gets or sets the versions.
     */
    versions?: Array<VersionInfo> | null;
    /**
     * Gets or sets the image url for the package.
     */
    imageUrl?: string | null;
};

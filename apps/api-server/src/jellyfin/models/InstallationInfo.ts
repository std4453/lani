/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { PackageInfo } from './PackageInfo';
import type { Version } from './Version';

/**
 * Class InstallationInfo.
 */
export type InstallationInfo = {
    /**
     * Gets or sets the Id.
     */
    Guid?: string;
    /**
     * Gets or sets the name.
     */
    Name?: string | null;
    /**
     * Gets or sets the version.
     */
    Version?: Version | null;
    /**
     * Gets or sets the changelog for this version.
     */
    Changelog?: string | null;
    /**
     * Gets or sets the source URL.
     */
    SourceUrl?: string | null;
    /**
     * Gets or sets a checksum for the binary.
     */
    Checksum?: string | null;
    /**
     * Gets or sets package information for the installation.
     */
    PackageInfo?: PackageInfo | null;
};

/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Version } from './Version';

/**
 * Defines the MediaBrowser.Model.Updates.VersionInfo class.
 */
export type VersionInfo = {
    /**
     * Gets or sets the version.
     */
    version?: string | null;
    /**
     * Gets the version as a System.Version.
     */
    readonly VersionNumber?: Version | null;
    /**
     * Gets or sets the changelog for this version.
     */
    changelog?: string | null;
    /**
     * Gets or sets the ABI that this version was built against.
     */
    targetAbi?: string | null;
    /**
     * Gets or sets the source URL.
     */
    sourceUrl?: string | null;
    /**
     * Gets or sets a checksum for the binary.
     */
    checksum?: string | null;
    /**
     * Gets or sets a timestamp of when the binary was built.
     */
    timestamp?: string | null;
    /**
     * Gets or sets the repository name.
     */
    repositoryName?: string | null;
    /**
     * Gets or sets the repository url.
     */
    repositoryUrl?: string | null;
};

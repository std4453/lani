/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Version } from './Version';

/**
 * Defines the MediaBrowser.Common.Plugins.IPlugin.
 */
export type IPlugin = {
    /**
     * Gets the name of the plugin.
     */
    readonly Name?: string | null;
    /**
     * Gets the Description.
     */
    readonly Description?: string | null;
    /**
     * Gets the unique id.
     */
    readonly Id?: string;
    /**
     * Gets the plugin version.
     */
    readonly Version?: Version | null;
    /**
     * Gets the path to the assembly file.
     */
    readonly AssemblyFilePath?: string | null;
    /**
     * Gets a value indicating whether the plugin can be uninstalled.
     */
    readonly CanUninstall?: boolean;
    /**
     * Gets the full path to the data folder, where the plugin can store any miscellaneous files needed.
     */
    readonly DataFolderPath?: string | null;
};

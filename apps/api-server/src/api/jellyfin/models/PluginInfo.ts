/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { PluginStatus } from './PluginStatus';
import type { Version } from './Version';

/**
 * This is a serializable stub class that is used by the api to provide information about installed plugins.
 */
export type PluginInfo = {
    /**
     * Gets or sets the name.
     */
    Name?: string | null;
    /**
     * Gets or sets the version.
     */
    Version?: Version | null;
    /**
     * Gets or sets the name of the configuration file.
     */
    ConfigurationFileName?: string | null;
    /**
     * Gets or sets the description.
     */
    Description?: string | null;
    /**
     * Gets or sets the unique id.
     */
    Id?: string;
    /**
     * Gets or sets a value indicating whether the plugin can be uninstalled.
     */
    CanUninstall?: boolean;
    /**
     * Gets or sets a value indicating whether this plugin has a valid image.
     */
    HasImage?: boolean;
    /**
     * Gets or sets a value indicating the status of the plugin.
     */
    Status?: PluginStatus;
};

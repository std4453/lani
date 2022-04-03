/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ConfigurationPageType } from './ConfigurationPageType';

/**
 * The configuration page info.
 */
export type ConfigurationPageInfo = {
    /**
     * Gets or sets the name.
     */
    Name?: string | null;
    /**
     * Gets or sets a value indicating whether the configurations page is enabled in the main menu.
     */
    EnableInMainMenu?: boolean;
    /**
     * Gets or sets the menu section.
     */
    MenuSection?: string | null;
    /**
     * Gets or sets the menu icon.
     */
    MenuIcon?: string | null;
    /**
     * Gets or sets the display name.
     */
    DisplayName?: string | null;
    /**
     * Gets or sets the type of the configuration page.
     */
    ConfigurationPageType?: ConfigurationPageType;
    /**
     * Gets or sets the plugin id.
     */
    PluginId?: string | null;
};

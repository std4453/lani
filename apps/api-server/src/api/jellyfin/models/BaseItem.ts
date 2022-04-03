/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { MediaUrl } from './MediaUrl';

/**
 * Class BaseItem.
 */
export type BaseItem = {
    Size?: number | null;
    Container?: string | null;
    DateLastSaved?: string;
    /**
     * Gets or sets the remote trailers.
     */
    RemoteTrailers?: Array<MediaUrl> | null;
    readonly IsHD?: boolean;
    IsShortcut?: boolean;
    ShortcutPath?: string | null;
    Width?: number;
    Height?: number;
    ExtraIds?: Array<string> | null;
    readonly SupportsExternalTransfer?: boolean;
};

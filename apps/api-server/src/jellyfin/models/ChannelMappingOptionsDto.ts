/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { NameIdPair } from './NameIdPair';
import type { NameValuePair } from './NameValuePair';
import type { TunerChannelMapping } from './TunerChannelMapping';

/**
 * Channel mapping options dto.
 */
export type ChannelMappingOptionsDto = {
    /**
     * Gets or sets list of tuner channels.
     */
    TunerChannels?: Array<TunerChannelMapping> | null;
    /**
     * Gets or sets list of provider channels.
     */
    ProviderChannels?: Array<NameIdPair> | null;
    /**
     * Gets or sets list of mappings.
     */
    Mappings?: Array<NameValuePair> | null;
    /**
     * Gets or sets provider name.
     */
    ProviderName?: string | null;
};

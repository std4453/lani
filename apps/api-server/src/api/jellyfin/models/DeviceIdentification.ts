/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { HttpHeaderInfo } from './HttpHeaderInfo';

export type DeviceIdentification = {
    /**
     * Gets or sets the name of the friendly.
     */
    FriendlyName?: string | null;
    /**
     * Gets or sets the model number.
     */
    ModelNumber?: string | null;
    /**
     * Gets or sets the serial number.
     */
    SerialNumber?: string | null;
    /**
     * Gets or sets the name of the model.
     */
    ModelName?: string | null;
    /**
     * Gets or sets the model description.
     */
    ModelDescription?: string | null;
    /**
     * Gets or sets the model URL.
     */
    ModelUrl?: string | null;
    /**
     * Gets or sets the manufacturer.
     */
    Manufacturer?: string | null;
    /**
     * Gets or sets the manufacturer URL.
     */
    ManufacturerUrl?: string | null;
    /**
     * Gets or sets the headers.
     */
    Headers?: Array<HttpHeaderInfo> | null;
};

/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { DeviceProfileType } from './DeviceProfileType';

export type DeviceProfileInfo = {
    /**
     * Gets or sets the identifier.
     */
    Id?: string | null;
    /**
     * Gets or sets the name.
     */
    Name?: string | null;
    /**
     * Gets or sets the type.
     */
    Type?: DeviceProfileType;
};

/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

/**
 * Provides the MAC address and port for wake-on-LAN functionality.
 */
export type WakeOnLanInfo = {
    /**
     * Gets the MAC address of the device.
     */
    MacAddress?: string | null;
    /**
     * Gets or sets the wake-on-LAN port.
     */
    Port?: number;
};

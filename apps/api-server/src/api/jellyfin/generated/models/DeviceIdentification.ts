/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { HttpHeaderInfo } from './HttpHeaderInfo';

export type DeviceIdentification = {
  /**
   * Gets or sets the name of the friendly.
   */
  FriendlyName?: string;
  /**
   * Gets or sets the model number.
   */
  ModelNumber?: string;
  /**
   * Gets or sets the serial number.
   */
  SerialNumber?: string;
  /**
   * Gets or sets the name of the model.
   */
  ModelName?: string;
  /**
   * Gets or sets the model description.
   */
  ModelDescription?: string;
  /**
   * Gets or sets the model URL.
   */
  ModelUrl?: string;
  /**
   * Gets or sets the manufacturer.
   */
  Manufacturer?: string;
  /**
   * Gets or sets the manufacturer URL.
   */
  ManufacturerUrl?: string;
  /**
   * Gets or sets the headers.
   */
  Headers?: Array<HttpHeaderInfo>;
};

/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

/**
 * Delivery method to use during playback of a specific subtitle format.
 */
export enum SubtitleDeliveryMethod {
  ENCODE = 'Encode',
  EMBED = 'Embed',
  EXTERNAL = 'External',
  HLS = 'Hls',
  DROP = 'Drop',
}
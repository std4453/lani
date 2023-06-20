/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { DeviceProfile } from './DeviceProfile';
import type { GeneralCommandType } from './GeneralCommandType';

export type ClientCapabilities = {
  PlayableMediaTypes?: Array<string> | null;
  SupportedCommands?: Array<GeneralCommandType> | null;
  SupportsMediaControl?: boolean;
  SupportsContentUploading?: boolean;
  MessageCallbackUrl?: string | null;
  SupportsPersistentIdentifier?: boolean;
  SupportsSync?: boolean;
  /**
   * A MediaBrowser.Model.Dlna.DeviceProfile represents a set of metadata which determines which content a certain device is able to play.
   * <br />
   * Specifically, it defines the supported <see cref="P:MediaBrowser.Model.Dlna.DeviceProfile.ContainerProfiles">containers</see> and
   * <see cref="P:MediaBrowser.Model.Dlna.DeviceProfile.CodecProfiles">codecs</see> (video and/or audio, including codec profiles and levels)
   * the device is able to direct play (without transcoding or remuxing),
   * as well as which <see cref="P:MediaBrowser.Model.Dlna.DeviceProfile.TranscodingProfiles">containers/codecs to transcode to</see> in case it isn't.
   */
  DeviceProfile?: DeviceProfile | null;
  AppStoreUrl?: string | null;
  IconUrl?: string | null;
};

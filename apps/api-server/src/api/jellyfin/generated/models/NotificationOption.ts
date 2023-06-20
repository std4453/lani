/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { SendToUserType } from './SendToUserType';

export type NotificationOption = {
  Type?: string | null;
  /**
   * Gets or sets user Ids to not monitor (it's opt out).
   */
  DisabledMonitorUsers?: Array<string>;
  /**
   * Gets or sets user Ids to send to (if SendToUserMode == Custom).
   */
  SendToUsers?: Array<string>;
  /**
   * Gets or sets a value indicating whether this MediaBrowser.Model.Notifications.NotificationOption is enabled.
   */
  Enabled?: boolean;
  /**
   * Gets or sets the disabled services.
   */
  DisabledServices?: Array<string>;
  /**
   * Gets or sets the send to user mode.
   */
  SendToUserMode?: SendToUserType;
};

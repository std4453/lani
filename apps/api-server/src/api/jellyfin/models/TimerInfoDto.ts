/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { BaseItemDto } from './BaseItemDto';
import type { KeepUntil } from './KeepUntil';
import type { RecordingStatus } from './RecordingStatus';

export type TimerInfoDto = {
    /**
     * Id of the recording.
     */
    Id?: string | null;
    Type?: string | null;
    /**
     * Gets or sets the server identifier.
     */
    ServerId?: string | null;
    /**
     * Gets or sets the external identifier.
     */
    ExternalId?: string | null;
    /**
     * ChannelId of the recording.
     */
    ChannelId?: string;
    /**
     * Gets or sets the external channel identifier.
     */
    ExternalChannelId?: string | null;
    /**
     * ChannelName of the recording.
     */
    ChannelName?: string | null;
    ChannelPrimaryImageTag?: string | null;
    /**
     * Gets or sets the program identifier.
     */
    ProgramId?: string | null;
    /**
     * Gets or sets the external program identifier.
     */
    ExternalProgramId?: string | null;
    /**
     * Name of the recording.
     */
    Name?: string | null;
    /**
     * Description of the recording.
     */
    Overview?: string | null;
    /**
     * The start date of the recording, in UTC.
     */
    StartDate?: string;
    /**
     * The end date of the recording, in UTC.
     */
    EndDate?: string;
    /**
     * Gets or sets the name of the service.
     */
    ServiceName?: string | null;
    /**
     * Gets or sets the priority.
     */
    Priority?: number;
    /**
     * Gets or sets the pre padding seconds.
     */
    PrePaddingSeconds?: number;
    /**
     * Gets or sets the post padding seconds.
     */
    PostPaddingSeconds?: number;
    /**
     * Gets or sets a value indicating whether this instance is pre padding required.
     */
    IsPrePaddingRequired?: boolean;
    /**
     * If the item does not have any backdrops, this will hold the Id of the Parent that has one.
     */
    ParentBackdropItemId?: string | null;
    /**
     * Gets or sets the parent backdrop image tags.
     */
    ParentBackdropImageTags?: Array<string> | null;
    /**
     * Gets or sets a value indicating whether this instance is post padding required.
     */
    IsPostPaddingRequired?: boolean;
    KeepUntil?: KeepUntil;
    /**
     * Gets or sets the status.
     */
    Status?: RecordingStatus;
    /**
     * Gets or sets the series timer identifier.
     */
    SeriesTimerId?: string | null;
    /**
     * Gets or sets the external series timer identifier.
     */
    ExternalSeriesTimerId?: string | null;
    /**
     * Gets or sets the run time ticks.
     */
    RunTimeTicks?: number | null;
    /**
     * Gets or sets the program information.
     */
    ProgramInfo?: BaseItemDto | null;
};

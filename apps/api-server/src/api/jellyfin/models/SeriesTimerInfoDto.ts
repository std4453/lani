/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { DayOfWeek } from './DayOfWeek';
import type { DayPattern } from './DayPattern';
import type { KeepUntil } from './KeepUntil';

/**
 * Class SeriesTimerInfoDto.
 */
export type SeriesTimerInfoDto = {
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
     * Gets or sets a value indicating whether [record any time].
     */
    RecordAnyTime?: boolean;
    SkipEpisodesInLibrary?: boolean;
    /**
     * Gets or sets a value indicating whether [record any channel].
     */
    RecordAnyChannel?: boolean;
    KeepUpTo?: number;
    /**
     * Gets or sets a value indicating whether [record new only].
     */
    RecordNewOnly?: boolean;
    /**
     * Gets or sets the days.
     */
    Days?: Array<DayOfWeek> | null;
    /**
     * Gets or sets the day pattern.
     */
    DayPattern?: DayPattern | null;
    /**
     * Gets or sets the image tags.
     */
    ImageTags?: Record<string, string> | null;
    /**
     * Gets or sets the parent thumb item id.
     */
    ParentThumbItemId?: string | null;
    /**
     * Gets or sets the parent thumb image tag.
     */
    ParentThumbImageTag?: string | null;
    /**
     * Gets or sets the parent primary image item identifier.
     */
    ParentPrimaryImageItemId?: string | null;
    /**
     * Gets or sets the parent primary image tag.
     */
    ParentPrimaryImageTag?: string | null;
};

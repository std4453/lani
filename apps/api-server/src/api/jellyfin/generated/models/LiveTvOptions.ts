/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ListingsProviderInfo } from './ListingsProviderInfo';
import type { TunerHostInfo } from './TunerHostInfo';

export type LiveTvOptions = {
  GuideDays?: number | null;
  RecordingPath?: string | null;
  MovieRecordingPath?: string | null;
  SeriesRecordingPath?: string | null;
  EnableRecordingSubfolders?: boolean;
  EnableOriginalAudioWithEncodedRecordings?: boolean;
  TunerHosts?: Array<TunerHostInfo> | null;
  ListingProviders?: Array<ListingsProviderInfo> | null;
  PrePaddingSeconds?: number;
  PostPaddingSeconds?: number;
  MediaLocationsCreated?: Array<string> | null;
  RecordingPostProcessor?: string | null;
  RecordingPostProcessorArguments?: string | null;
};

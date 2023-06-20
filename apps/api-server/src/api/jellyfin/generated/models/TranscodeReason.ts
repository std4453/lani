/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export enum TranscodeReason {
  CONTAINER_NOT_SUPPORTED = 'ContainerNotSupported',
  VIDEO_CODEC_NOT_SUPPORTED = 'VideoCodecNotSupported',
  AUDIO_CODEC_NOT_SUPPORTED = 'AudioCodecNotSupported',
  SUBTITLE_CODEC_NOT_SUPPORTED = 'SubtitleCodecNotSupported',
  AUDIO_IS_EXTERNAL = 'AudioIsExternal',
  SECONDARY_AUDIO_NOT_SUPPORTED = 'SecondaryAudioNotSupported',
  VIDEO_PROFILE_NOT_SUPPORTED = 'VideoProfileNotSupported',
  VIDEO_LEVEL_NOT_SUPPORTED = 'VideoLevelNotSupported',
  VIDEO_RESOLUTION_NOT_SUPPORTED = 'VideoResolutionNotSupported',
  VIDEO_BIT_DEPTH_NOT_SUPPORTED = 'VideoBitDepthNotSupported',
  VIDEO_FRAMERATE_NOT_SUPPORTED = 'VideoFramerateNotSupported',
  REF_FRAMES_NOT_SUPPORTED = 'RefFramesNotSupported',
  ANAMORPHIC_VIDEO_NOT_SUPPORTED = 'AnamorphicVideoNotSupported',
  INTERLACED_VIDEO_NOT_SUPPORTED = 'InterlacedVideoNotSupported',
  AUDIO_CHANNELS_NOT_SUPPORTED = 'AudioChannelsNotSupported',
  AUDIO_PROFILE_NOT_SUPPORTED = 'AudioProfileNotSupported',
  AUDIO_SAMPLE_RATE_NOT_SUPPORTED = 'AudioSampleRateNotSupported',
  AUDIO_BIT_DEPTH_NOT_SUPPORTED = 'AudioBitDepthNotSupported',
  CONTAINER_BITRATE_EXCEEDS_LIMIT = 'ContainerBitrateExceedsLimit',
  VIDEO_BITRATE_NOT_SUPPORTED = 'VideoBitrateNotSupported',
  AUDIO_BITRATE_NOT_SUPPORTED = 'AudioBitrateNotSupported',
  UNKNOWN_VIDEO_STREAM_INFO = 'UnknownVideoStreamInfo',
  UNKNOWN_AUDIO_STREAM_INFO = 'UnknownAudioStreamInfo',
  DIRECT_PLAY_ERROR = 'DirectPlayError',
  VIDEO_RANGE_TYPE_NOT_SUPPORTED = 'VideoRangeTypeNotSupported',
}
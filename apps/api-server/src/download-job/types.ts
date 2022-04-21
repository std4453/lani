import { ValidateNested } from 'class-validator';

export const DOWNLOAD_JOB_QUEUE_NAME = 'download_job';

export const EventType = {
  SUBMIT_DOWNLOAD: 'submitDownload',
  TORRENT_MISSING: 'torrentMissing',
} as const;

export interface JobParams {
  jobId: number;
}

/**
 * @see https://github.com/qbittorrent/qBittorrent/wiki/WebUI-API-(qBittorrent-4.1)#get-torrent-list
 */
export class QBTTorrent {
  added_on: number;
  amount_left: number;
  auto_tmm: boolean;
  availability: number;
  category: string;
  completed: number;
  /**
   * unix timestamp (seconds)
   */
  completion_on: number;
  content_path: string;
  dl_limit: number;
  dlspeed: number;
  download_path: string;
  downloaded: number;
  downloaded_session: number;
  eta: number;
  f_l_piece_prio: boolean;
  force_start: boolean;
  hash: string;
  infohash_v1: string;
  infohash_v2: string;
  last_activity: number;
  magnet_uri: string;
  max_ratio: number;
  max_seeding_time: number;
  name: string;
  num_complete: number;
  num_incomplete: number;
  num_leechs: number;
  num_seeds: number;
  priority: number;
  progress: number;
  ratio: number;
  ratio_limit: number;
  save_path: string;
  seeding_time: number;
  seeding_time_limit: number;
  seen_complete: number;
  size: number;
  state: string;
  super_seeding: boolean;
  tags: string;
  time_active: number;
  total_size: number;
  tracker: string;
  trackers_count: number;
  up_limit: number;
  uploaded: number;
  uploaded_session: number;
  upspeed: number;
}

export class QBTTorrents {
  @ValidateNested()
  torrents: QBTTorrent[];
}

export type QBTTorrentState =
  | 'error' // Some error occurred, applies to paused torrents
  | 'missingFiles' // Torrent data files is missing
  | 'uploading' // Torrent is being seeded and data is being transferred
  | 'pausedUP' // Torrent is paused and has finished downloading
  | 'queuedUP' // Queuing is enabled and torrent is queued for upload
  | 'stalledUP' // Torrent is being seeded, but no connection were made
  | 'checkingUP' // Torrent has finished downloading and is being checked
  | 'forcedUP' // Torrent is forced to uploading and ignore queue limit
  | 'allocating' // Torrent is allocating disk space for download
  | 'downloading' // Torrent is being downloaded and data is being transferred
  | 'metaDL' // Torrent has just started downloading and is fetching metadata
  | 'pausedDL' // Torrent is paused and has NOT finished downloading
  | 'queuedDL' // Queuing is enabled and torrent is queued for download
  | 'stalledDL' // Torrent is being downloaded, but no connection were made
  | 'checkingDL' // Same as checkingUP, but torrent has NOT finished downloading
  | 'forcedDL' // Torrent is forced to downloading to ignore queue limit
  | 'checkingResumeData' // Checking resume data on qBt startup
  | 'moving' // Torrent is moving to another location
  | 'unknown'; // Unknown status

export class QBTFile {
  index?: number;
  name: string;
  size: number;
  progress: number;
  priority: number;
  is_seed: boolean;
  piece_range: [number, number];
  availability: number;
}

export class QBTFiles {
  @ValidateNested()
  files: QBTFile[];
}

// that's from copilot
export const VIDEO_FILE_EXTENSIONS = [
  'avi',
  'mkv',
  'mp4',
  'm4v',
  'mov',
  'mpg',
  'mpeg',
  'wmv',
  'flv',
  'vob',
  'ogm',
  'ogv',
  'asf',
  'rm',
  'rmvb',
  'm2ts',
  'ts',
  'mts',
  'm2t',
  'm2v',
  'm4v',
  'm4p',
  'm4b',
  'm4r',
  'm4a',
  '3gp',
  '3g2',
  '3gpp',
  '3gpp2',
  '3g2p',
  '3gpp2p',
  '3gp2',
  '3gp2p',
  'mxf',
  'm2ts',
  'ts',
  'mts',
  'm2t',
  'm2v',
  'm4v',
  'm4p',
  'm4b',
  'm4r',
  'm4a',
  '3gp',
  '3g2',
  '3gpp',
  '3gpp2',
  '3g2p',
  '3gpp2p',
  '3gp2',
  '3gp2p',
  'mxf',
  'm2ts',
  'ts',
  'mts',
  'm2t',
  'm2v',
  'm4v',
  'm4p',
  'm4b',
  'm4r',
  'm4a',
  '3gp',
  '3g2',
  '3gpp',
  '3gpp2',
  '3g2p',
  '3gpp2p',
  '3gp2',
  '3gp2p',
  'mxf',
  'm2ts',
  'ts',
] as const;

export const VIDEO_FILE_MATCHER = new RegExp(
  `\\.(${VIDEO_FILE_EXTENSIONS.join('|')})$`,
  'i',
);

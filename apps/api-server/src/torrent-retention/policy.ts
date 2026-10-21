import {
  durationSeconds,
  TorrentRetentionConfig,
} from '@/config/torrent-retention';
import { QBTTorrent } from '@/download-client/types';

export const RETENTION_QUEUE = 'torrent-retention';
export const RETENTION_BATCH_SIZE = 100;
export const validHash = (hash: unknown): hash is string =>
  typeof hash === 'string' && /^(?:[a-f0-9]{40}|[a-f0-9]{64})$/i.test(hash);

export function retentionDecision(
  torrent: QBTTorrent,
  config: TorrentRetentionConfig,
  nowSeconds = Date.now() / 1000,
) {
  if (!config.enabled || !validHash(torrent.hash) || torrent.progress !== 1)
    return;
  let rule: 'afterFinish' | 'afterSeeding';
  switch (torrent.state) {
    case 'pausedUP':
    case 'stoppedUP':
      rule = 'afterFinish';
      break;
    case 'uploading':
    case 'stalledUP':
    case 'forcedUP':
    case 'queuedUP':
      rule = 'afterSeeding';
      break;
    default:
      return;
  }
  // API 没有停止做种时间；两类状态都用完成时间，缺失才回退加入时间。
  const timeField = torrent.completion_on > 0 ? 'completion_on' : 'added_on';
  const since = torrent[timeField];
  if (!Number.isSafeInteger(since) || since <= 0 || since > nowSeconds) return;
  const dueAt = since + durationSeconds(config[rule]);
  if (nowSeconds < dueAt) return;
  return { rule, timeField, since, dueAt };
}

export function torrentIdentities(torrent: QBTTorrent): string[] {
  return [torrent.hash, torrent.infohash_v1, torrent.infohash_v2]
    .filter(validHash)
    .map((hash) => hash.toLowerCase());
}

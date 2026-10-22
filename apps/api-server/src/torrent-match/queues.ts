// 通道定义随 API 发布；数据库中的 queueName 只标识所属通道。
export const MATCH_QUEUE = 'torrent-match';
export const CATALOG_QUEUE = 'torrent-match-catalog';

export interface TorrentMatchPayload {
  /** 兼容已排队的 v1 输入；新生产者始终写入版本。 */
  version?: 1;
  torrentId: number;
}

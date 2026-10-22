import { validHash } from './policy';

export type TorrentRetentionPayload = {
  /** 历史无版本输入按 v1 读取；新任务总是写入 version: 1。 */
  version?: 1;
  hashes: string[];
};

export function validateRetentionPayload(payload: TorrentRetentionPayload) {
  if (payload?.version !== undefined && payload.version !== 1)
    throw new Error('不支持的种子清理任务版本');
  if (!Array.isArray(payload?.hashes) || !payload.hashes.every(validHash))
    throw new Error('种子清理任务内容无效');
}

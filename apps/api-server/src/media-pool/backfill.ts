import { PrismaClient } from '@lani/db';
import path from 'path';
import { digest, canonical } from './files';
import { MediaPool, VersionInput } from './media-pool.service';
import { VIDEO_FILE_MATCHER } from '@/utils/video-file';

export interface BackfillEntry {
  episodeId: number;
  jellyfinEpisodeId: string;
  files: Array<{ path: string; hash: string; role: 'video' | 'subtitle' }>;
}

export async function inspectBackfillFile(
  filename: string,
  role: 'video' | 'subtitle',
) {
  await canonical(filename);
  if (role === 'video' && !VIDEO_FILE_MATCHER.test(filename))
    throw new Error('历史媒体不是支持的视频文件');
  return {
    path: path.resolve(filename),
    hash: (await digest(filename)).hash,
    role,
  };
}

export async function applyBackfill(
  db: PrismaClient,
  pool: MediaPool,
  entries: BackfillEntry[],
) {
  if (new Set(entries.map((entry) => entry.episodeId)).size !== entries.length)
    throw new Error('回填清单包含重复剧集');
  for (const entry of entries) {
    const episode = await db.episode.findUnique({
      rejectOnNotFound: false,
      where: { id: entry.episodeId },
    });
    if (!episode || episode.jellyfinEpisodeId !== entry.jellyfinEpisodeId)
      throw new Error('回填目标关联已变化');
    if (entry.files.filter((file) => file.role === 'video').length !== 1)
      throw new Error('回填清单必须包含一个视频');
    for (const file of entry.files) {
      if (!['video', 'subtitle'].includes(file.role))
        throw new Error('回填文件类型无效');
      if ((await inspectBackfillFile(file.path, file.role)).hash !== file.hash)
        throw new Error('回填文件内容已变化，请重新生成清单');
    }
    const input: VersionInput = {
      episodeId: entry.episodeId,
      operationKey: `backfill:${entry.episodeId}:${entry.jellyfinEpisodeId}`,
      source: 'unknown',
      files: entry.files.map((file) => ({
        source: file.path,
        target: file.path,
        role: file.role,
      })),
    };
    await pool.adopt(input);
  }
}

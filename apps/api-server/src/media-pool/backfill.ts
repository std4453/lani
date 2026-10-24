import { PrismaClient } from '@lani/db';
import path from 'path';
import { createHash } from 'crypto';
import { FileIdentity } from '@lani/workflow';
import { identity, canonical, sameFile } from './files';
import { MediaPool, VersionInput } from './media-pool.service';
import { VIDEO_FILE_MATCHER } from '@/utils/video-file';
import { seasonMediaRoot, relativeMediaPath } from './paths';

export interface BackfillEntry {
  episodeId: number;
  jellyfinEpisodeId: string;
  files: Array<{
    path: string;
    identity: FileIdentity;
    role: 'video' | 'subtitle';
  }>;
}
export async function inspectBackfillFile(
  filename: string,
  role: 'video' | 'subtitle',
) {
  await canonical(filename);
  if (role === 'video' && !VIDEO_FILE_MATCHER.test(filename))
    throw new Error('历史媒体不是支持的视频文件');
  const stat = await identity(filename);
  if (!stat?.size) throw new Error('历史媒体文件不存在或为空');
  return { path: path.resolve(filename), identity: stat, role };
}
/** 仅登记已有文件，保留播放关联、任务和文件位置；不按内容推断任何共享关系。 */
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
      include: { season: { include: { jellyfinFolder: true } } },
    });
    if (!episode || episode.jellyfinEpisodeId !== entry.jellyfinEpisodeId)
      throw new Error('回填目标关联已变化');
    const root = seasonMediaRoot(episode.season);
    const files = [...entry.files].sort((a, b) => a.path.localeCompare(b.path));
    for (const file of files) {
      if (!['video', 'subtitle'].includes(file.role))
        throw new Error('回填文件类型无效');
      if (
        !sameFile(
          (await inspectBackfillFile(file.path, file.role)).identity,
          file.identity,
        )
      )
        throw new Error('回填文件身份已变化');
      relativeMediaPath(path.relative(root, file.path));
    }
    const fingerprint = createHash('sha256')
      .update(JSON.stringify(files))
      .digest('hex');
    const input: VersionInput = {
      episodeId: entry.episodeId,
      operationKey: `backfill:${entry.episodeId}:${entry.jellyfinEpisodeId}:${fingerprint}`,
      source: 'unknown',
      files: files.map((file) => ({
        source: file.path,
        target: path.relative(root, file.path),
        role: file.role,
      })),
    };
    await pool.adopt(input);
  }
}

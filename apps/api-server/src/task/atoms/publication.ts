import { Prisma } from '@lani/db';
import { AtomContext } from '@/task/atom';
import { fileIdentity, sameFile } from './import-file.operation';

/** 剧集互斥仅供下载发布业务使用，任务行锁由 AtomContext 管理。 */
export async function lockEpisode(
  tx: Prisma.TransactionClient,
  episodeId: number,
) {
  await tx.$queryRaw`SELECT pg_advisory_xact_lock(14521, ${episodeId})::text`;
}

/** 发布原子按需调用；其他任务和原子不获取剧集锁。 */
export async function claimEpisodePublication(
  id: number,
  context: AtomContext,
  verifyFile = false,
) {
  await context.transaction(async ({ tx, workflow, input, saveCheckpoint }) => {
    if (!input.episodeId) throw new Error('剧集已被删除');
    await lockEpisode(tx, input.episodeId);
    const file = workflow.steps.find((item) => item.atom === 'importFile')
      ?.checkpoint.file;
    if (
      verifyFile &&
      file &&
      !sameFile(await fileIdentity(file.target), file.stagedIdentity)
    )
      throw new Error('已导入文件已变化或丢失');
    // 只有发布原子提交的标记证明归属，识别到相同 Jellyfin ID 不代表已发布。
    const other = await tx.$queryRaw<{ id: number }[]>`
      SELECT id FROM download_jobs WHERE episode_id=${input.episodeId} AND id<>${id}
        AND (status='AVAILABLE'::download_status OR
          (workflow->'steps' @> '[{"checkpoint":{"publicationClaimed":true}}]'::jsonb
            AND workflow->>'status' IN ('running','cancelling','succeeded')) OR
          workflow->'steps' @> '[{"atom":"publishEpisode","checkpoint":{"episodePublished":true}}]'::jsonb)
      LIMIT 1`;
    if (other.length)
      throw new Error('同一剧集的其他任务正在发布或已发布，无法继续');
    await saveCheckpoint({ publicationClaimed: true });
  });
}

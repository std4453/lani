import { Prisma } from '@lani/db';
import { AtomContext, AtomTransaction } from '@/task/atom';
import { currentStep } from '@lani/workflow';
import { identity as fileIdentity, sameFile } from '@/media-pool/files';
import { FileIdentity } from '@lani/workflow';

/** 剧集互斥供下载和导入发布共用，任务行锁由 AtomContext 管理。 */
export async function lockEpisode(
  tx: Prisma.TransactionClient,
  episodeId: number,
) {
  await tx.$queryRaw`SELECT pg_advisory_xact_lock(14521, ${episodeId})::text`;
}

/** 发布格式的解释集中在此：旧任务/单集读取根检查点，批量按 Task 内部条目 ID 读取。 */
async function checkPublication(
  id: number,
  transaction: AtomTransaction,
  verifyFile: boolean,
) {
  const { tx, workflow, input } = transaction;
  if (!input.episodeId) throw new Error('剧集已被删除');
  await lockEpisode(tx, input.episodeId);
  const imported = workflow.steps.find(
    (item) => item.atom === 'importFile',
  )?.checkpoint;
  if (verifyFile && imported) {
    if (!imported.mediaVersionId)
      throw new Error('旧任务缺少媒体版本关联，请重新创建任务');
    const episode = await tx.episode.findUnique({
      where: { id: input.episodeId },
    });
    if (episode?.currentVersionId !== imported.mediaVersionId)
      throw new Error('剧集当前媒体版本已变化');
    const files = await tx.episodeVersionFile.findMany({
      where: { versionId: imported.mediaVersionId },
      include: { asset: true },
    });
    if (!files.length) throw new Error('媒体版本没有文件');
    for (const file of files) {
      if (
        file.asset.jellyfinPath !== file.targetPath ||
        !sameFile(
          await fileIdentity(file.targetPath),
          file.asset.jellyfinIdentity as unknown as FileIdentity,
        )
      )
        throw new Error('已导入文件已变化或丢失');
    }
  }
  const other = await tx.$queryRaw<{ id: number }[]>`
    SELECT t.id FROM download_jobs t JOIN task_episodes te ON te.task_id=t.id
    WHERE te.episode_id=${input.episodeId} AND t.id<>${id}
      AND t.workflow->>'status' IN ('running','cancelling','failed')
      AND (t.workflow->'steps' @> '[{"checkpoint":{"publicationClaimed":true}}]'::jsonb
        OR EXISTS (SELECT 1 FROM jsonb_array_elements(t.batch_entries) entry,
            jsonb_array_elements(t.workflow->'steps') step
          WHERE entry->>'episodeId'=te.episode_id::text
            AND step->'checkpoint'->'entries'->(entry->>'id')->>'publicationClaimed'='true'))
    LIMIT 1`;
  if (other.length)
    throw new Error('同一剧集的其他任务正在发布或已发布，无法继续');
}

/** 竞争检查与占用标记在同一个持有剧集锁的事务中提交。 */
export async function claimEpisodePublication(
  id: number,
  context: AtomContext,
  verifyFile = false,
) {
  await context.transaction(async (transaction) => {
    await checkPublication(id, transaction, verifyFile);
    await transaction.saveCheckpoint({ publicationClaimed: true });
  });
}

/** 发布关联与完成标记同时提交，atom 不解释持久化标记。 */
export async function completeEpisodePublication(
  id: number,
  context: AtomContext,
  publish: (transaction: AtomTransaction) => Promise<void>,
): Promise<'published' | 'already-published'> {
  return context.transaction(async (transaction) => {
    const { workflow, saveCheckpoint } = transaction;
    await checkPublication(id, transaction, true);
    await publish(transaction);
    if (currentStep(workflow).checkpoint.episodePublished)
      return 'already-published';
    await saveCheckpoint({ publicationClaimed: true, episodePublished: true });
    return 'published';
  });
}

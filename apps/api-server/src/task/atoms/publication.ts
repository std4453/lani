import { AtomContext, AtomTransaction } from '@/task/atom';
import { currentStep, batchImportEntries, parseWorkflow } from '@lani/workflow';
import { mediaTarget, seasonMediaRoot } from '@/media-pool/paths';
import { identity as fileIdentity, sameFile } from '@/media-pool/files';
import { FileIdentity } from '@lani/workflow';

import { lockEpisode } from '@/common/episode-lock';
import { activeTaskWhere } from '../queries';

/** 发布格式的解释集中在此：旧任务/单集读取根检查点，批量按 Task 内部条目 ID 读取。 */
export async function checkPublication(
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
      include: { season: { include: { jellyfinFolder: true } } },
    });
    if (episode?.currentVersionId !== imported.mediaVersionId)
      throw new Error('剧集当前媒体版本已变化');
    const files = await tx.episodeVersionFile.findMany({
      where: { versionId: imported.mediaVersionId },
      include: { asset: true },
    });
    if (!files.length) throw new Error('媒体版本没有文件');
    for (const file of files) {
      const target = mediaTarget(
        seasonMediaRoot(episode!.season),
        file.targetPath,
      );
      if (
        file.asset.jellyfinPath !== target ||
        !sameFile(
          await fileIdentity(target),
          file.asset.jellyfinIdentity as unknown as FileIdentity,
        )
      )
        throw new Error('已导入文件已变化或丢失');
    }
  }
  const candidates = await tx.task.findMany({
    where: {
      AND: [
        activeTaskWhere,
        { id: { not: id }, episodes: { some: { episodeId: input.episodeId } } },
      ],
    },
    select: { workflow: true, batchEntries: true },
  });
  // PostgreSQL JSON filter 不支持关联两个 JSON 数组的动态 key；先缩小候选集再按工作流协议解释。
  const other = candidates.some((task) => {
    const steps = parseWorkflow(task.workflow).steps;
    const entries = batchImportEntries(task.batchEntries).filter(
      (entry) => entry.episodeId === input.episodeId,
    );
    return steps.some(
      (step) =>
        step.checkpoint.publicationClaimed ||
        entries.some(
          (entry) => step.checkpoint.entries?.[entry.id]?.publicationClaimed,
        ),
    );
  });
  if (other)
    throw new Error(
      '同一剧集的其他任务正在发布，或发布失败后尚未处理，无法继续',
    );
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

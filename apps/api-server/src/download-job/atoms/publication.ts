import { PrismaService } from '@/common/prisma.service';
import { currentStep, parseWorkflow } from '@lani/download-workflow';
import { AtomContext, ExecutionStopped } from '@/task/atom';
import { fileIdentity, sameFile } from './import-file.operation';
/** 发布原子按需调用；其他任务和原子不获取剧集锁。 */
export async function claimEpisodePublication(
  prisma: PrismaService,
  id: number,
  context: AtomContext,
  verifyFile = false,
) {
  await context.assertActive();
  for (;;) {
    const job = await prisma.downloadJob.findUnique({ where: { id } });
    if (!job.episodeId) throw new Error('剧集已被删除');
    const workflow = parseWorkflow(job.workflow);
    const step = currentStep(workflow);
    if (
      workflow.status !== 'running' ||
      workflow.cancellation ||
      step.id !== context.stepId ||
      step.attempt !== context.attempt
    )
      throw new ExecutionStopped();
    const file = workflow.steps.find((item) => item.atom === 'importFile')
      ?.checkpoint.file;
    if (
      verifyFile &&
      file &&
      !sameFile(await fileIdentity(file.target), file.stagedIdentity)
    )
      throw new Error('已导入文件已变化或丢失');
    workflow.publicationClaimed = true;
    const claimed = await prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT pg_advisory_xact_lock(14521, ${job.episodeId})::text`;
      const other = await tx.$queryRaw<{ id: number }[]>`
        SELECT id FROM download_jobs WHERE episode_id=${job.episodeId} AND id<>${id}
          AND (status='AVAILABLE'::download_status OR
            (workflow->>'publicationClaimed'='true' AND workflow->>'status' IN ('running','cancelling','succeeded')))
        LIMIT 1`;
      if (other.length)
        throw new Error('同一剧集的其他任务正在发布或已发布，无法继续');
      await tx.$queryRaw`SELECT id FROM download_jobs WHERE id=${id} FOR UPDATE`;
      const result = await tx.downloadJob.updateMany({
        where: { id, version: job.version },
        data: {
          workflow: JSON.parse(JSON.stringify(workflow)),
          version: { increment: 1 },
          updatedAt: new Date(),
        },
      });
      return result.count > 0;
    });
    if (claimed) {
      await context.assertActive();
      return;
    }
  }
}

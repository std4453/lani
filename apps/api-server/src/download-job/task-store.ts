import { PrismaService } from '@/common/prisma.service';
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DownloadJob, DownloadStatus, TaskType } from '@lani/db';
import {
  buildWorkflowSnapshot,
  currentStep,
  DownloadWorkflow,
  parseWorkflow,
} from '@lani/download-workflow';
import { StepInput } from '@/task/atom';
import {
  Atoms,
  Output,
  StoredWorkflow,
  WorkflowStore,
} from '@/task/workflow-runner';
import { DownloadWorkflowDefinition } from './atoms/types';
import { downloadDefinition, legacyStatus } from './definition';
import { EpisodePublishEvent, EPISODE_PUBLISH_EVENT } from './events';
import { LaniError } from '@/utils/error';
@Injectable()
export class DownloadTaskStore
  implements WorkflowStore<DownloadWorkflowDefinition>
{
  constructor(private prisma: PrismaService, private emitter: EventEmitter2) {}
  async read(id: number): Promise<StoredWorkflow<DownloadWorkflowDefinition>> {
    const job = await this.prisma.downloadJob.findUnique({ where: { id } });
    if (!job.workflow) throw new LaniError('旧任务不允许启动');
    return {
      id,
      version: job.version,
      workflow: parseWorkflow(job.workflow),
      input: this.jobToInput(job),
    };
  }

  async create(
    episodeId: number,
    torrentLink: string,
    atoms: Atoms<DownloadWorkflowDefinition>,
  ) {
    return this.prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT pg_advisory_xact_lock(14521, ${episodeId})::text`;
      const existing = await tx.downloadJob.findFirst({
        where: {
          episodeId,
          isFailed: false,
          isCancelled: false,
          status: { not: DownloadStatus.AVAILABLE },
        },
        orderBy: { id: 'desc' },
      });
      if (existing) return existing.id;
      const workflow = buildWorkflowSnapshot(
        downloadDefinition,
        atoms,
        new Date().toISOString(),
      );
      const job = await tx.downloadJob.create({
        data: {
          type: TaskType.DOWNLOAD,
          episodeId,
          torrentLink,
          status: legacyStatus[currentStep(workflow).atom],
          workflow: JSON.parse(JSON.stringify(workflow)),
        },
      });
      return job.id;
    });
  }
  async commit(
    job: StoredWorkflow<DownloadWorkflowDefinition>,
    next: DownloadWorkflow,
    output: Output<DownloadWorkflowDefinition> = {},
  ) {
    const workflow = parseWorkflow(next);
    const hash =
      output.submitDownload?.qbtTorrentHash ??
      workflow.steps.find((step) => step.atom === 'submitDownload')?.checkpoint
        .submission?.hash;
    const finished = workflow.status === 'succeeded';
    const jellyfinEpisodeId =
      output.refreshPlayer?.jellyfinEpisodeId ??
      job.input.steps.refreshPlayer?.jellyfinEpisodeId;
    const changed = await this.prisma.$transaction(async (tx) => {
      // Prisma 3 的 updateMany 会先选 ID 再更新；行锁保证版本检查与写入不被并发拆开。
      await tx.$queryRaw`SELECT id FROM download_jobs WHERE id=${job.id} FOR UPDATE`;
      const result = await tx.downloadJob.updateMany({
        where: { id: job.id, version: job.version },
        data: {
          workflow: JSON.parse(JSON.stringify(workflow)),
          version: { increment: 1 },
          updatedAt: new Date(),
          status: finished
            ? DownloadStatus.AVAILABLE
            : legacyStatus[currentStep(workflow).atom],
          isFailed: workflow.status === 'failed',
          failedAt: workflow.error ? new Date(workflow.error.at) : null,
          failedReason: workflow.error?.message ?? '',
          isCancelled: workflow.status === 'cancelled',
          cancelledAt:
            workflow.status === 'cancelled'
              ? new Date(workflow.finishedAt!)
              : null,
          qbtTorrentHash: hash,
          torrentTitle: output.submitDownload?.torrentTitle,
          downloadPath: output.download?.downloadPath,
          importPath: output.findVideoFile?.importPath,
          filePath: output.importFile?.filePath,
          nfoPath: output.writeMetadata?.nfoPath,
          jellyfinEpisodeId: output.refreshPlayer?.jellyfinEpisodeId,
        },
      });
      if (!result.count) return false;
      if (finished && job.input.params.episodeId && jellyfinEpisodeId) {
        await tx.episode.update({
          where: { id: job.input.params.episodeId },
          data: { jellyfinEpisodeId },
        });
      }
      return true;
    });
    if (
      changed &&
      finished &&
      job.input.params.episodeId &&
      jellyfinEpisodeId
    ) {
      const episode = await this.prisma.episode.findUnique({
        where: { id: job.input.params.episodeId },
        include: {
          season: { include: { jellyfinFolder: true, posterImage: true } },
          downloadJobs: { where: { id: job.id } },
        },
      });
      this.emitter.emit(
        EPISODE_PUBLISH_EVENT,
        new EpisodePublishEvent(episode),
      );
    }
    return changed;
  }
  private jobToInput(job: DownloadJob): StepInput<DownloadWorkflowDefinition> {
    return {
      id: job.id,
      params: {
        episodeId: job.episodeId ?? undefined,
        torrentLink: job.torrentLink ?? '',
      },
      steps: {
        submitDownload: job.qbtTorrentHash
          ? {
              qbtTorrentHash: job.qbtTorrentHash,
            }
          : undefined,
        download: job.downloadPath
          ? { downloadPath: job.downloadPath }
          : undefined,
        findVideoFile: job.importPath
          ? { importPath: job.importPath }
          : undefined,
        importFile: job.filePath ? { filePath: job.filePath } : undefined,
        writeMetadata: job.nfoPath ? { nfoPath: job.nfoPath } : undefined,
        refreshPlayer: job.jellyfinEpisodeId
          ? { jellyfinEpisodeId: job.jellyfinEpisodeId }
          : undefined,
      },
    };
  }
}

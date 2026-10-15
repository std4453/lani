import { LegacyTaskStage } from '@lani/db';
import { AtomType, Workflow, currentStep } from '@lani/workflow';

// 物理表保留旧阶段和结果列；流程调度只读取 workflow。
const stages: Record<AtomType, LegacyTaskStage> = {
  submitDownload: LegacyTaskStage.DOWNLOAD_SUBMITTING,
  download: LegacyTaskStage.DOWNLOADING,
  findVideoFile: LegacyTaskStage.DOWNLOAD_COMPLETED,
  importFile: LegacyTaskStage.IMPORTING,
  writeMetadata: LegacyTaskStage.WRITING_METADATA,
  refreshPlayer: LegacyTaskStage.PLAYER_WAITING,
  publishEpisode: LegacyTaskStage.PLAYER_WAITING,
};
export function legacyTaskFields(workflow: Workflow) {
  return {
    legacyStage:
      workflow.status === 'succeeded'
        ? LegacyTaskStage.AVAILABLE
        : stages[currentStep(workflow).atom],
    isFailed: workflow.status === 'failed',
    failedAt: workflow.error ? new Date(workflow.error.at) : null,
    failedReason: workflow.error?.message ?? '',
    isCancelled: workflow.status === 'cancelled',
    cancelledAt:
      workflow.status === 'cancelled' ? new Date(workflow.finishedAt!) : null,
  };
}

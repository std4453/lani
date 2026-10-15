import { AsyncAtom, AtomContext, StepInput } from '@/task/atom';
import { DownloadWorkflowDefinition } from '@/download-job/atoms/types';
import { DownloadRefreshService } from './refresh/download-refresh.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class DownloadAtom extends AsyncAtom<
  DownloadWorkflowDefinition,
  'download'
> {
  readonly wants = [['submitDownload']] as const;
  constructor(private refresh: DownloadRefreshService) {
    super();
  }
  async run(
    _id: number,
    { steps }: StepInput<DownloadWorkflowDefinition>,
    context: AtomContext,
  ) {
    if (!steps.submitDownload) throw new Error('提交下载步骤尚未完成');
    try {
      return await context.waitFor(
        this.refresh.enqueue(_id, steps.submitDownload.qbtTorrentHash),
      );
    } finally {
      this.refresh.remove(_id);
    }
  }
}

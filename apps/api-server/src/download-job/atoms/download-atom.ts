import { AsyncAtom, AtomContext, StepInput } from '@/download-job/atoms';
import { DownloadWorkflowDefinition } from '@/download-job/atoms/types';
import { IDownloadClient } from '@/download-job/client/IDownloadClient';
import { Injectable } from '@nestjs/common';

@Injectable()
export class DownloadAtom extends AsyncAtom<
  DownloadWorkflowDefinition,
  'download'
> {
  readonly wants = [['submitDownload']] as const;
  constructor(private client: IDownloadClient) {
    super();
  }
  async run(
    _id: number,
    { steps }: StepInput<DownloadWorkflowDefinition>,
    context: AtomContext,
  ) {
    if (!steps.submitDownload) throw new Error('提交下载步骤尚未完成');
    for (;;) {
      await context.assertActive();
      const [torrent] = await this.client.lookupTorrents([
        steps.submitDownload.qbtTorrentHash,
      ]);
      if (!torrent) throw new Error('种子不存在或被删除');
      if (torrent.status === 'error')
        throw new Error(`种子下载失败，当前状态：${torrent.state}`);
      if (torrent.status === 'success')
        return { downloadPath: torrent.downloadPath };
      await context.wait(30000);
    }
  }
}

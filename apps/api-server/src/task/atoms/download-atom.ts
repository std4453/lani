import { AsyncAtom, AtomContext, TaskInput } from '@/task/atom';
import { DownloadRefreshService } from './refresh/download-refresh.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class DownloadAtom extends AsyncAtom {
  readonly wants = [['submitDownload']] as const;
  constructor(private refresh: DownloadRefreshService) {
    super();
  }
  async run(
    id: number,
    { qbtTorrentHash, downloadTimeoutMinutes }: TaskInput,
    context: AtomContext,
  ) {
    if (!qbtTorrentHash) throw new Error('提交下载步骤尚未完成');
    try {
      return await context.waitFor(
        this.refresh.enqueue(id, {
          hash: qbtTorrentHash,
          timeoutMinutes: downloadTimeoutMinutes,
        }),
      );
    } finally {
      this.refresh.remove(id);
    }
  }
}

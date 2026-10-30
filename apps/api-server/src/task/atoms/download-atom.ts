import {
  AsyncAtom,
  AtomContext,
  TaskInput,
  TaskCancellation,
} from '@/task/atom';
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
          onPending: (torrent) => {
            if (
              downloadTimeoutMinutes != null &&
              downloadTimeoutMinutes > 0 &&
              torrent.addedAt != null &&
              torrent.addedAt > 0 &&
              Date.now() - torrent.addedAt * 1000 >=
                downloadTimeoutMinutes * 60000
            ) {
              throw new TaskCancellation(
                `智能下载任务超时（${downloadTimeoutMinutes} 分钟）`,
                'timeout',
              );
            }
          },
        }),
      );
    } finally {
      this.refresh.remove(id);
    }
  }
}

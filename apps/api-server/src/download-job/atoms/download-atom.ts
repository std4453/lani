import { Atom, StepInput } from '@/download-job/atoms';
import { DownloadWorkflowDefinition } from '@/download-job/atoms/types';
import { IDownloadClient } from '@/download-job/client/IDownloadClient';
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Int, Mutation, Resolver } from '@nestjs/graphql';
import { Cron } from '@nestjs/schedule';

@Resolver()
@Injectable()
export class DownloadAtom extends Atom<DownloadWorkflowDefinition, 'download'> {
  constructor(eventEmitter: EventEmitter2, private client: IDownloadClient) {
    super(eventEmitter, 'download');
  }

  private queue: Record<
    number,
    DownloadWorkflowDefinition['steps']['submitDownload']['output']
  > = {};

  enqueue(id: number, { steps }: StepInput<DownloadWorkflowDefinition>) {
    if (this.isTracked(id)) {
      return;
    }
    if (!steps.submitDownload) {
      throw new Error('submitDownload step not finished');
    }
    this.queue[id] = steps.submitDownload;
  }

  private isTracked(id: number) {
    return id in this.queue;
  }

  @Cron('*/30 * * * * *') // 每 30 秒
  @Mutation(() => Int)
  async refreshAllDownloadStatus() {
    const ids = Object.keys(this.queue).map((idStr) => parseInt(idStr, 10));
    if (ids.length === 0) {
      return 0;
    }
    const torrents = await this.client.lookupTorrents(
      ids.map((id) => this.queue[id].qbtTorrentHash),
    );
    let count = 0;
    for (const id of ids) {
      const { qbtTorrentHash } = this.queue[id];
      const torrent = torrents.find(({ hash }) => hash === qbtTorrentHash);
      let modified = false;
      if (!torrent) {
        modified = true;
        this.jobFail(id, new Error('Torrent missing'));
      } else if (torrent.status === 'error') {
        modified = true;
        this.jobFail(
          id,
          new Error(`Torrent at invalid state: ${torrent.state}`),
        );
      } else if (torrent.status === 'success') {
        modified = true;
        this.jobSuccess(id, {
          downloadPath: torrent.downloadPath,
        });
      }
      if (modified) {
        ++count;
        delete this.queue[id];
      }
    }
    return count;
  }
}

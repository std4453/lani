import { Atom, StepInput } from '@/job/atoms';
import { DownloadWorkflowDefinition } from '@/job/atoms/types';
import { QBittorrentService } from '@/job/qbt.service';
import { QBTTorrent, QBTTorrentState } from '@/job/types';
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Int, Mutation, Resolver } from '@nestjs/graphql';
import { Cron } from '@nestjs/schedule';

@Resolver()
@Injectable()
export class DownloadAtom extends Atom<DownloadWorkflowDefinition, 'download'> {
  constructor(eventEmitter: EventEmitter2, private qbt: QBittorrentService) {
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
    const torrents = await this.qbt.listTorrents({
      hashes: ids.map((id) => this.queue[id].qbtTorrentHash),
    });
    let count = 0;
    for (const id of ids) {
      const { qbtTorrentHash } = this.queue[id];
      const torrent = torrents.find(({ hash }) => hash === qbtTorrentHash);
      if (this.processTorrentAndJob(id, torrent)) {
        ++count;
        delete this.queue[id];
      }
    }
    return count;
  }

  private processTorrentAndJob(id: number, torrent: QBTTorrent | undefined) {
    if (!torrent) {
      this.jobFail(id, new Error('Torrent missing'));
      return true;
    }
    switch (torrent.state as QBTTorrentState) {
      case 'error':
      case 'missingFiles':
        this.jobFail(
          id,
          new Error(`Torrent at invalid state: ${torrent.state}`),
        );
        return true;
    }
    if (torrent.completion_on > 0) {
      this.jobSuccess(id, {
        downloadPath: torrent.save_path,
      });
      return true;
    }
    return false;
  }
}

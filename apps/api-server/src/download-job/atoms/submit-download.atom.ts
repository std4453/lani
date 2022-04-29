import { AsyncAtom, StepInput } from '@/download-job/atoms';
import { DownloadWorkflowDefinition } from '@/download-job/atoms/types';
import { IDownloadClient } from '@/download-job/client/IDownloadClient';
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class SubmitDownloadAtom extends AsyncAtom<
  DownloadWorkflowDefinition,
  'submitDownload'
> {
  constructor(emitter: EventEmitter2, private client: IDownloadClient) {
    super(emitter, 'submitDownload');
  }

  override async run(
    _id: number,
    { params: { torrentLink } }: StepInput<DownloadWorkflowDefinition>,
  ) {
    if (!torrentLink) {
      throw new Error('torrentLink not set');
    }
    const { hash } = await this.client.submitTorrentLink(torrentLink);
    return {
      qbtTorrentHash: hash,
    };
  }
}

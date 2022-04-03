import { AsyncAtom, StepInput } from '@/download-job/atoms';
import { DownloadWorkflowDefinition } from '@/download-job/atoms/types';
import { QBittorrentService } from '@/download-job/qbt.service';
import { VIDEO_FILE_MATCHER } from '@/download-job/types';
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class FindVideoFileAtom extends AsyncAtom<
  DownloadWorkflowDefinition,
  'findVideoFile'
> {
  constructor(emitter: EventEmitter2, private qbt: QBittorrentService) {
    super(emitter, 'findVideoFile');
  }

  async run(_id: number, { steps }: StepInput<DownloadWorkflowDefinition>) {
    if (!steps.submitDownload || !steps.download) {
      throw new Error('submitDownload or download step not finished');
    }
    const files = await this.qbt.getFiles(steps.submitDownload.qbtTorrentHash);
    const totalSize = files.reduce((acc, { size }) => acc + size, 0);
    const videoFile = files.find(
      ({ name, size }) =>
        VIDEO_FILE_MATCHER.test(name) && size > totalSize * 0.9,
    );
    if (!videoFile) {
      throw new Error('No video file found or multiple video files');
    }
    return {
      importPath: `${steps.download.downloadPath}${videoFile.name}`,
    };
  }
}

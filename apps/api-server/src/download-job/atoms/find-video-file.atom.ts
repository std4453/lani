import { AsyncAtom, StepInput } from '@/download-job/atoms';
import { DownloadWorkflowDefinition } from '@/download-job/atoms/types';
import { IDownloadClient } from '@/download-job/client/IDownloadClient';
import { VIDEO_FILE_MATCHER } from '@/download-job/types';
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import path from 'path';

@Injectable()
export class FindVideoFileAtom extends AsyncAtom<
  DownloadWorkflowDefinition,
  'findVideoFile'
> {
  constructor(emitter: EventEmitter2, private client: IDownloadClient) {
    super(emitter, 'findVideoFile');
  }

  async run(_id: number, { steps }: StepInput<DownloadWorkflowDefinition>) {
    if (!steps.submitDownload || !steps.download) {
      throw new Error('submitDownload or download step not finished');
    }
    const files = await this.client.getTorrentFiles(
      steps.submitDownload.qbtTorrentHash,
    );
    const totalSize = files.reduce((acc, { size }) => acc + size, 0);
    const videoFile = files.find(
      ({ path, size }) =>
        VIDEO_FILE_MATCHER.test(path) && size > totalSize * 0.9,
    );
    if (!videoFile) {
      throw new Error('未找到视频文件或找到多个视频文件，无法确定导入目标');
    }
    return {
      importPath: path.join(steps.download.downloadPath, videoFile.path),
    };
  }
}

import { AsyncAtom, TaskInput } from '@/task/atom';
import { IDownloadClient } from '@/download-client/IDownloadClient';
import { VIDEO_FILE_MATCHER } from '@/utils/video-file';
import { Injectable } from '@nestjs/common';
import path from 'path';

@Injectable()
export class FindVideoFileAtom extends AsyncAtom {
  readonly wants = [['submitDownload'], ['download']] as const;

  constructor(private client: IDownloadClient) {
    super();
  }

  async run(_id: number, { qbtTorrentHash, downloadPath }: TaskInput) {
    if (!qbtTorrentHash || !downloadPath) {
      throw new Error('submitDownload or download step not finished');
    }
    const files = await this.client.getTorrentFiles(qbtTorrentHash);
    const totalSize = files.reduce((acc, { size }) => acc + size, 0);
    const videoFile = files.find(
      ({ path, size }) =>
        VIDEO_FILE_MATCHER.test(path) && size > totalSize * 0.9,
    );
    if (!videoFile) {
      throw new Error('未找到视频文件或找到多个视频文件，无法确定导入目标');
    }
    return {
      importPath: path.join(downloadPath, videoFile.path),
    };
  }
}

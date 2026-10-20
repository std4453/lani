import { BatchableEpisodeAtom } from '../batchable-episode-atom';
import { TaskInput } from '@/task/atom';
import { IDownloadClient } from '@/download-client/IDownloadClient';
import { VIDEO_FILE_MATCHER } from '@/utils/video-file';
import { Injectable } from '@nestjs/common';
import path from 'path';
import { isTorrentFilePath } from '@/download-client/torrent-files';

@Injectable()
export class FindVideoFileAtom extends BatchableEpisodeAtom {
  readonly wants = [['submitDownload'], ['download']] as const;

  constructor(private client: IDownloadClient) {
    super();
  }

  protected async runEpisode(
    _id: number,
    { qbtTorrentHash, downloadPath, type, sourcePath }: TaskInput,
  ) {
    if (!qbtTorrentHash || !downloadPath) {
      throw new Error('submitDownload or download step not finished');
    }
    const files = await this.client.getTorrentFiles(qbtTorrentHash);
    if (type === 'BATCH_DOWNLOAD') {
      if (
        !sourcePath ||
        !isTorrentFilePath(sourcePath) ||
        !files.some((file) => file.path === sourcePath)
      )
        throw new Error('下载结果中未找到所选文件');
      return { importPath: path.posix.join(downloadPath, sourcePath) };
    }
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

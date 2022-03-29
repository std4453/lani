import { Atom } from '@/job/atoms';
import { QBittorrentService } from '@/job/qbt.service';
import { VIDEO_FILE_MATCHER } from '@/job/types';
import { Injectable } from '@nestjs/common';
import { DownloadJob } from '@prisma/client';

@Injectable()
export class FindVideoFileAtom extends Atom {
  constructor(private qbt: QBittorrentService) {
    super();
  }

  async run({ qbtTorrentHash, downloadPath }: DownloadJob) {
    if (!qbtTorrentHash) {
      throw new Error('qbtTorrentHash not set');
    }
    const files = await this.qbt.getFiles(qbtTorrentHash);
    const totalSize = files.reduce((acc, { size }) => acc + size, 0);
    const videoFile = files.find(
      ({ name, size }) =>
        VIDEO_FILE_MATCHER.test(name) && size > totalSize * 0.9,
    );
    if (!videoFile) {
      throw new Error('No video file found or multiple video files');
    }
    return {
      importPath: `${downloadPath}${videoFile.name}`,
    };
  }
}

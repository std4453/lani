import { GlobalAxiosService } from '@/common/axios.service';
import { AsyncAtom, StepInput } from '@/job/atoms';
import { DownloadWorkflowDefinition } from '@/job/atoms/types';
import { QBittorrentService } from '@/job/qbt.service';
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import FormData from 'form-data';
import parseTorrent from 'parse-torrent';

@Injectable()
export class SubmitDownloadAtom extends AsyncAtom<
  DownloadWorkflowDefinition,
  'submitDownload'
> {
  constructor(
    emitter: EventEmitter2,
    private global: GlobalAxiosService,
    private qbt: QBittorrentService,
  ) {
    super(emitter, 'submitDownload');
  }

  override async run(
    _id: number,
    { params: { torrentLink } }: StepInput<DownloadWorkflowDefinition>,
  ) {
    if (!torrentLink) {
      throw new Error('torrentLink not set');
    }
    const { data } = await this.global.get<Buffer>(torrentLink, {
      responseType: 'arraybuffer',
    });
    const torrent = parseTorrent(data);
    if (!torrent.name || !torrent.infoHash) {
      throw new Error('Invalid torrent file');
    }
    const params = new FormData();
    params.append('torrents', data, {
      filename: torrent.name as string | undefined,
    });
    // 为了幂等，如果已经存在种子，就不再提交，也无需报错，相信hash不会碰撞
    if (!(await this.qbt.getTorrent(torrent.infoHash))) {
      await this.qbt.post('/torrents/add', params.getBuffer(), {
        headers: params.getHeaders(),
      });
      console.debug(`torrent ${torrent.name} (${torrent.infoHash}) submitted`);
    }
    return {
      qbtTorrentHash: torrent.infoHash,
    };
  }
}

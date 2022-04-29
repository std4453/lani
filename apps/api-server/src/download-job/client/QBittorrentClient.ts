import { GlobalAxiosService } from '@/common/axios.service';
import {
  IDownloadClient,
  TorrentStatus,
} from '@/download-job/client/IDownloadClient';
import { QBittorrentService } from '@/download-job/client/QBittorrentService';
import { QBTTorrentState } from '@/download-job/types';
import FormData from 'form-data';
import parseTorrent from 'parse-torrent';

export class QBittorrentClient implements IDownloadClient {
  constructor(
    private qbt: QBittorrentService,
    private global: GlobalAxiosService,
  ) {}

  async getTorrentFiles(hash: string) {
    const files = await this.qbt.getFiles(hash);
    return files.map(({ name, size }) => ({
      path: name,
      size,
    }));
  }

  async submitTorrentLink(torrentLink: string) {
    // 判断磁力链
    if (torrentLink.startsWith('magnet:')) {
      const magnet = parseTorrent(torrentLink);
      if (!magnet.infoHash) {
        throw new Error('Invalid magnet link');
      }
      const params = new FormData();
      params.append('urls', torrentLink);
      if (!(await this.qbt.getTorrent(magnet.infoHash))) {
        await this.qbt.post('/torrents/add', params.getBuffer(), {
          headers: params.getHeaders(),
        });
        console.debug(`torrent ${magnet.xt} (${magnet.infoHash}) submitted`);
      }
      return {
        hash: magnet.infoHash,
      };
    } else {
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
        console.debug(
          `torrent ${torrent.name} (${torrent.infoHash}) submitted`,
        );
      }
      return {
        hash: torrent.infoHash,
      };
    }
  }

  async lookupTorrents(hashes: string[]) {
    const torrents = await this.qbt.listTorrents({
      hashes,
    });
    return torrents.map((torrent): { hash: string } & TorrentStatus => {
      switch (torrent.state as QBTTorrentState) {
        case 'error':
        case 'missingFiles':
          return {
            hash: torrent.hash,
            status: 'error',
            state: torrent.state,
          };
      }
      if (torrent.completion_on > 0) {
        return {
          hash: torrent.hash,
          status: 'success',
          downloadPath: torrent.save_path,
        };
      }
      return {
        hash: torrent.hash,
        status: 'pending',
      };
    });
  }
}

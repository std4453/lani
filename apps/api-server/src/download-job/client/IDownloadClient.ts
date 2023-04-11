export type TorrentInfo = { hash: string; name?: string };

export type TorrentStatus =
  | {
      status: 'error';
      state: string;
    }
  | {
      status: 'pending';
    }
  | {
      status: 'success';
      downloadPath: string;
    };

export type TorrentInfoWithStatus = TorrentInfo & TorrentStatus;

export abstract class IDownloadClient {
  abstract submitTorrentLink(torrentLink: string): Promise<TorrentInfo>;

  abstract lookupTorrents(hashes: string[]): Promise<TorrentInfoWithStatus[]>;

  abstract getTorrentFiles(hash: string): Promise<
    {
      /**
       * path mapping 之前的路径
       */
      path: string;
      size: number;
    }[]
  >;

  abstract getActiveTorrentsStatus(hashes: string[]): Promise<
    {
      hash: string;
      /**
       * 当前速度，单位: byte/s
       */
      speed: number;
      /**
       * 已下载量，单位：byte
       */
      downloaded: number;
      /**
       * 总大小，单位：byte
       */
      total: number;
      /**
       * 预期时间，单位：秒
       */
      eta?: number;
      /**
       * 做种人数
       */
      peers?: number;
    }[]
  >;
}

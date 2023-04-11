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

export abstract class IDownloadClient {
  abstract submitTorrentLink(torrentLink: string): Promise<{
    hash: string;
  }>;

  abstract lookupTorrents(hashes: string[]): Promise<
    ({
      hash: string;
    } & TorrentStatus)[]
  >;

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

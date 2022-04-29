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
}

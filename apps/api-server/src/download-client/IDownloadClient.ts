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

export type PreparedTorrent = TorrentInfo & {
  /** 提交时的下载器 ID：已知 v2 时取前 40 位，否则使用 v1。 */
  clientHash: string;
  input: string | Buffer;
};

export type TorrentSubmissionOptions = {
  /** 保留种子中的原始目录结构，避免下载器全局布局改写预览路径。 */
  preservePaths?: boolean;
};

export abstract class IDownloadClient {
  abstract prepareTorrent(torrentLink: string): Promise<PreparedTorrent>;
  /** 返回下载器确认后的实际 ID，可能与输入的内容 hash 不同。 */
  abstract submitTorrent(
    torrent: PreparedTorrent,
    options?: TorrentSubmissionOptions,
  ): Promise<TorrentInfo>;

  abstract removeTorrent(hash: string): Promise<void>;

  /** 返回值的 hash 保留请求标识，以兼容仍保存 v1 hash 的历史任务。 */
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
       * 下载者人数
       */
      peers?: number;
      seeds?: number;
    }[]
  >;
}

import { GlobalAxiosService, HttpRequestError } from '@/common/axios.service';
import { LaniError } from '@/utils/error';
import {
  IDownloadClient,
  TorrentInfo,
  TorrentInfoWithStatus,
} from '@/download-job/client/IDownloadClient';
import { QBittorrentService } from '@/download-job/client/QBittorrentService';
import { QBTTorrentState } from '@/download-job/types';
import { Injectable, Logger } from '@nestjs/common';
import FormData from 'form-data';
import parseTorrent from 'parse-torrent';

@Injectable()
export class QBittorrentClient implements IDownloadClient {
  private logger = new Logger(QBittorrentClient.name);

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

  private async pause(ms: number) {
    await new Promise<void>((resolve) => setTimeout(resolve, ms));
  }

  private isTransientError(error: unknown): error is HttpRequestError {
    return (
      error instanceof HttpRequestError &&
      ([408, 429, 500, 502, 503, 504, 520, 522, 524].includes(
        error.status ?? 0,
      ) ||
        [
          'ETIMEDOUT',
          'ECONNABORTED',
          'ECONNRESET',
          'ECONNREFUSED',
          'EAI_AGAIN',
          'ENOTFOUND',
          'EPIPE',
        ].includes(error.code ?? ''))
    );
  }

  private async fetchTorrent(torrentLink: string) {
    let host: string;
    try {
      const url = new URL(torrentLink);
      if (url.protocol !== 'http:' && url.protocol !== 'https:')
        throw new Error();
      host = url.host;
    } catch {
      throw new LaniError('获取种子文件失败：下载地址无效');
    }
    for (let attempt = 0; ; ++attempt) {
      try {
        const { data } = await this.global.get<Buffer>(torrentLink, {
          responseType: 'arraybuffer',
        });
        return data;
      } catch (error) {
        if (attempt < 2 && this.isTransientError(error)) {
          await this.pause(1000 * 2 ** attempt);
          continue;
        }
        const detail = error instanceof Error ? error.message : '未知错误';
        throw new LaniError(`获取种子文件失败（${host}）：${detail}`);
      }
    }
  }

  private parseTorrentInput(input: string | Buffer) {
    try {
      const torrent = parseTorrent(input);
      const { infoHash } = torrent;
      if (!infoHash || (Buffer.isBuffer(input) && !torrent.name)) {
        throw new Error();
      }
      return { ...torrent, infoHash };
    } catch {
      throw new LaniError(
        typeof input === 'string'
          ? '解析磁力链接失败：链接无效或缺少 info hash'
          : '解析种子文件失败：内容不是有效的 torrent 文件',
      );
    }
  }

  /** 添加接口先受理，再异步加入列表；仍留在当前的提交阶段等待确认。 */
  private async waitForTorrent(hash: string) {
    const deadline = Date.now() + 30000;
    let lastError: unknown;
    for (;;) {
      try {
        if (await this.qbt.getTorrent(hash)) return true;
        lastError = undefined;
      } catch (error) {
        if (!this.isTransientError(error)) throw error;
        lastError = error;
      }
      const remaining = deadline - Date.now();
      if (remaining <= 0) break;
      await this.pause(Math.min(1000, remaining));
    }
    if (lastError) throw lastError;
    return false;
  }

  private async addAndConfirm(hash: string, params: FormData) {
    // Buffer 可在鉴权恢复后重放；不重放已经消费过的 FormData 流。
    const data = params.getBuffer();
    for (let attempt = 0; ; ++attempt) {
      try {
        if (await this.qbt.getTorrent(hash)) return;
      } catch (error) {
        if (attempt >= 2 || !this.isTransientError(error)) throw error;
        await this.pause(1000 * 2 ** attempt);
        continue;
      }
      let submissionError: HttpRequestError | undefined;
      let rejected = false;
      try {
        const response = await this.qbt.post<string>('/torrents/add', data, {
          headers: params.getHeaders(),
        });
        if (response.data !== 'Ok.' && response.data !== 'Fails.') {
          throw new LaniError('qBittorrent 提交种子失败：接口返回了非预期响应');
        }
        rejected = response.data === 'Fails.';
      } catch (error) {
        if (!this.isTransientError(error)) throw error;
        submissionError = error;
      }
      // Fails. 可能是同 hash 已存在/正在添加；超时也可能已被下载器受理。
      // 两者都先查询确认，不能直接失败或盲目重复提交。
      if (await this.waitForTorrent(hash)) return;
      if (submissionError) {
        if (attempt < 2) {
          await this.pause(1000 * 2 ** attempt);
          continue;
        }
        throw new LaniError(
          `${submissionError.message}；按 hash 核对仍未找到种子（${hash}）`,
        );
      }
      throw new LaniError(
        rejected
          ? `qBittorrent 提交种子失败：返回 Fails.，等待确认后仍未找到种子（${hash}）`
          : `qBittorrent 提交确认超时：已受理，但等待后仍未找到种子（${hash}）`,
      );
    }
  }

  async submitTorrentLink(torrentLink: string) {
    const isMagnet = torrentLink.startsWith('magnet:');
    const input = isMagnet ? torrentLink : await this.fetchTorrent(torrentLink);
    const torrent = this.parseTorrentInput(input);
    const hash = torrent.infoHash;
    const name = Array.isArray(torrent.name) ? torrent.name[0] : torrent.name;
    const params = new FormData();
    if (isMagnet) {
      params.append('urls', torrentLink);
    } else {
      params.append('torrents', input, { filename: name });
    }
    await this.addAndConfirm(hash, params);
    this.logger.log(`Torrent ${hash} submission confirmed`);
    return { hash, name };
  }

  async lookupTorrents(hashes: string[]) {
    const torrents = await this.qbt.listTorrents({
      hashes,
    });
    return torrents.map((torrent): TorrentInfoWithStatus => {
      const torrentInfo: TorrentInfo = {
        hash: torrent.hash,
        name: torrent.name,
      };
      switch (torrent.state as QBTTorrentState) {
        case 'error':
        case 'missingFiles':
          return {
            ...torrentInfo,
            status: 'error',
            state: torrent.state,
          };
      }
      if (torrent.completion_on > 0) {
        return {
          ...torrentInfo,
          status: 'success',
          downloadPath: torrent.save_path,
        };
      }
      return {
        ...torrentInfo,
        status: 'pending',
      };
    });
  }

  async getActiveTorrentsStatus(hashes: string[]): Promise<
    {
      hash: string;
      speed: number;
      downloaded: number;
      total: number;
      eta?: number;
      peers?: number;
    }[]
  > {
    const torrents = await this.qbt.listTorrents({
      hashes,
    });
    return torrents.map((torrent) => ({
      hash: torrent.hash,
      speed: torrent.completion_on > 0 ? 0 : torrent.dlspeed,
      downloaded: torrent.downloaded,
      total: torrent.size,
      eta: torrent.completion_on > 0 ? 0 : torrent.eta,
      peers: torrent.num_leechs,
    }));
  }
}

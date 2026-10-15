import { GlobalAxiosService, HttpRequestError } from '@/common/axios.service';
import { LaniError } from '@/utils/error';
import {
  IDownloadClient,
  PreparedTorrent,
  TorrentInfo,
  TorrentInfoWithStatus,
} from '@/download-job/client/IDownloadClient';
import { QBittorrentService } from '@/download-job/client/QBittorrentService';
import { QBTTorrentState } from '@/download-job/types';
import { Injectable, Logger } from '@nestjs/common';
import FormData from 'form-data';
import parseTorrent from 'parse-torrent';
import { inspect } from 'util';

// 单次获取或提交流程的最大尝试次数，包含首次请求。
const MAX_ATTEMPTS = 3;

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

  /** 只对可能短暂恢复的 HTTP/网络错误重试，不重试鉴权失败或输入错误。 */
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

  /** 获取种子文件；暂时性错误按 MAX_ATTEMPTS 限制次数，并使用指数退避。 */
  private async fetchTorrent(torrentLink: string) {
    let host: string;
    try {
      const url = new URL(torrentLink);
      if (url.protocol !== 'http:' && url.protocol !== 'https:')
        throw new Error();
      host = url.host;
    } catch (error) {
      this.logger.error(
        `Invalid torrent download URL: ${torrentLink}, error=${inspect(error)}`,
      );
      throw new LaniError('获取种子文件失败：下载地址无效');
    }
    for (let attempt = 0; ; ++attempt) {
      try {
        const { data } = await this.global.get<Buffer>(torrentLink, {
          responseType: 'arraybuffer',
        });
        return data;
      } catch (error) {
        if (attempt < MAX_ATTEMPTS - 1 && this.isTransientError(error)) {
          const delay = 1000 * 2 ** attempt;
          this.logger.warn(
            `Torrent file fetch failed: url=${torrentLink}, attempt=${
              attempt + 1
            }/${MAX_ATTEMPTS}; retrying in ${delay}ms, error=${inspect(error)}`,
          );
          await this.pause(delay);
          continue;
        }
        this.logger.error(
          `Torrent file fetch failed without further retries: url=${torrentLink}, attempt=${
            attempt + 1
          }/${MAX_ATTEMPTS}, error=${inspect(error)}`,
        );
        const detail = error instanceof Error ? error.message : '未知错误';
        throw new LaniError(`获取种子文件失败（${host}）：${detail}`);
      }
    }
  }

  /** 解析磁力链接或种子文件，在提交前检查 info hash 和文件元数据。 */
  private parseTorrentInput(input: string | Buffer) {
    try {
      const torrent = parseTorrent(input);
      const { infoHash } = torrent;
      if (!infoHash || (Buffer.isBuffer(input) && !torrent.name)) {
        throw new Error('Missing info hash or torrent file name');
      }
      return { ...torrent, infoHash };
    } catch (error) {
      this.logger.error(
        `Torrent input parsing failed: ${
          typeof input === 'string'
            ? `magnet=${input}`
            : `fileBytes=${input.length}`
        }, error=${inspect(error)}`,
      );
      throw new LaniError(
        typeof input === 'string'
          ? '解析磁力链接失败：链接无效或缺少 info hash'
          : '解析种子文件失败：内容不是有效的 torrent 文件',
      );
    }
  }

  /**
   * 添加接口先受理，再异步加入列表；在当前提交阶段最多等待约 30 秒确认 hash 可见。
   * qBittorrent 将任务记入 m_loadingTorrents 后调用 async_add_torrent，并立即返回 true：
   * https://github.com/qbittorrent/qBittorrent/blob/release-4.6.7/src/base/bittorrent/sessionimpl.cpp#L2959-L2965
   */
  private async waitForTorrent(hash: string) {
    const startedAt = Date.now();
    const deadline = startedAt + 30000;
    let polls = 0;
    let lastError: unknown;
    for (;;) {
      ++polls;
      try {
        if (await this.qbt.getTorrent(hash)) {
          return true;
        }
        lastError = undefined;
      } catch (error) {
        if (!this.isTransientError(error)) {
          this.logger.error(
            `Torrent confirmation query failed without retry: hash=${hash}, poll=${polls}, error=${inspect(
              error,
            )}`,
          );
          throw error;
        }
        this.logger.warn(
          `Transient torrent confirmation query failure: hash=${hash}, poll=${polls}; polling will continue while time remains, error=${inspect(
            error,
          )}`,
        );
        lastError = error;
      }
      const remaining = deadline - Date.now();
      if (remaining <= 0) break;
      await this.pause(Math.min(1000, remaining));
    }
    this.logger.warn(
      `Torrent visibility wait expired: hash=${hash}, polls=${polls}, elapsed=${
        Date.now() - startedAt
      }ms, lastError=${inspect(lastError)}`,
    );
    if (lastError) throw lastError;
    return false;
  }

  /**
   * 按 hash 保证幂等：已存在则复用，否则提交并等待可查询后才算成功。
   * 提交遇到暂时性错误时先查询确认，仍不存在才允许有限重试，避免重复提交。
   */
  private async addAndConfirm(hash: string, params: FormData) {
    // Buffer 可在鉴权恢复后重放；不重放已经消费过的 FormData 流。
    const data = params.getBuffer();
    for (let attempt = 0; ; ++attempt) {
      try {
        // 已存在时无需重复提交，相信 hash 不会碰撞。
        if (await this.qbt.getTorrent(hash)) {
          return;
        }
      } catch (error) {
        if (attempt >= MAX_ATTEMPTS - 1 || !this.isTransientError(error)) {
          this.logger.error(
            `Pre-submission torrent query failed without further retries: hash=${hash}, attempt=${
              attempt + 1
            }/${MAX_ATTEMPTS}, error=${inspect(error)}`,
          );
          throw error;
        }
        const delay = 1000 * 2 ** attempt;
        this.logger.warn(
          `Pre-submission torrent query failed: hash=${hash}, attempt=${
            attempt + 1
          }/${MAX_ATTEMPTS}; retrying in ${delay}ms, error=${inspect(error)}`,
        );
        await this.pause(delay);
        continue;
      }
      let submissionError: HttpRequestError | undefined;
      let rejected = false;
      try {
        const response = await this.qbt.post<string>('/torrents/add', data, {
          headers: params.getHeaders(),
        });
        if (response.data !== 'Ok.' && response.data !== 'Fails.') {
          throw new LaniError(
            'qBittorrent 提交种子失败：接口返回了非预期响应',
            {
              status: response.status,
              response: response.data,
            },
          );
        }
        rejected = response.data === 'Fails.';
      } catch (error) {
        if (!this.isTransientError(error)) {
          this.logger.error(
            `Torrent submission failed without retry: hash=${hash}, attempt=${
              attempt + 1
            }/${MAX_ATTEMPTS}, error=${inspect(error)}`,
          );
          throw error;
        }
        this.logger.warn(
          `Torrent submission outcome is uncertain: hash=${hash}, attempt=${
            attempt + 1
          }/${MAX_ATTEMPTS}; checking visibility before any retry, error=${inspect(
            error,
          )}`,
        );
        submissionError = error;
      }
      // 添加接口在本次所有 addTorrent 调用都返回 false 时返回 Fails.，不是登录失败：
      // https://github.com/qbittorrent/qBittorrent/blob/release-4.6.7/src/webui/api/torrentscontroller.cpp#L733-L760
      // 原因包括启动时尚未恢复完成（!isRestored）、无效输入、同 hash 已在
      // m_loadingTorrents 中等待异步添加，或已存在（可能合并 trackers 后仍返回 false）。
      // https://github.com/qbittorrent/qBittorrent/blob/release-4.6.7/src/base/bittorrent/sessionimpl.cpp#L2616-L2668
      // https://github.com/qbittorrent/qBittorrent/blob/release-4.6.7/src/base/bittorrent/sessionimpl.cpp#L2733-L2790
      // 因此 Fails. 不等于种子不存在；提交超时也可能已被受理。先按 hash 确认，
      // 未确认的 Fails. 最终报错，只有暂时性提交异常才允许有限重试。
      if (rejected) {
        this.logger.warn(
          `qBittorrent returned Fails. for torrent submission: hash=${hash}; checking whether it already exists or is still being added`,
        );
      }
      if (await this.waitForTorrent(hash)) return;
      if (submissionError) {
        if (attempt < MAX_ATTEMPTS - 1) {
          const delay = 1000 * 2 ** attempt;
          this.logger.warn(
            `Torrent still absent after submission error: hash=${hash}, attempt=${
              attempt + 1
            }/${MAX_ATTEMPTS}; retrying submission in ${delay}ms, error=${inspect(
              submissionError,
            )}`,
          );
          await this.pause(delay);
          continue;
        }
        this.logger.error(
          `Torrent submission retries exhausted and hash remains absent: hash=${hash}, attempts=${
            attempt + 1
          }, error=${inspect(submissionError)}`,
        );
        throw new LaniError(
          `${submissionError.message}；按 hash 核对仍未找到种子（${hash}）`,
        );
      }
      this.logger.error(
        `Torrent submission could not be confirmed: hash=${hash}, response=${
          rejected ? 'Fails.' : 'Ok.'
        }, attempt=${attempt + 1}/${MAX_ATTEMPTS}`,
      );
      throw new LaniError(
        rejected
          ? `qBittorrent 提交种子失败：返回 Fails.，等待确认后仍未找到种子（${hash}）`
          : `qBittorrent 提交确认超时：已受理，但等待后仍未找到种子（${hash}）`,
      );
    }
  }

  async prepareTorrent(torrentLink: string): Promise<PreparedTorrent> {
    const input = torrentLink.startsWith('magnet:')
      ? torrentLink
      : await this.fetchTorrent(torrentLink);
    const torrent = this.parseTorrentInput(input);
    return {
      hash: torrent.infoHash,
      name: Array.isArray(torrent.name) ? torrent.name[0] : torrent.name,
      input,
    };
  }

  async submitTorrent({ hash, name, input }: PreparedTorrent) {
    const params = new FormData();
    if (typeof input === 'string') params.append('urls', input);
    else params.append('torrents', input, { filename: name });
    await this.addAndConfirm(hash, params);
    this.logger.log(
      `Torrent ${name ?? '(unnamed)'} (${hash}) submission confirmed`,
    );
  }

  async removeTorrent(hash: string) {
    if (!hash) throw new LaniError('无法取消：缺少种子 hash');
    await this.qbt.post(
      '/torrents/delete',
      new URLSearchParams({ hashes: hash, deleteFiles: 'false' }).toString(),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      },
    );
    for (let attempt = 0; attempt < 10; ++attempt) {
      if (!(await this.qbt.getTorrent(hash))) return;
      await this.pause(500);
    }
    throw new LaniError('下载器尚未确认移除种子，请重试');
  }

  async lookupTorrents(hashes: string[]) {
    if (!hashes.length) return [];
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
      seeds?: number;
    }[]
  > {
    if (!hashes.length) return [];
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
      seeds: torrent.num_seeds,
    }));
  }
}

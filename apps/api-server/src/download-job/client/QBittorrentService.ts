import {
  AxiosService,
  getAxiosConfig,
  HttpRequestError,
} from '@/common/axios.service';
import { LaniError } from '@/utils/error';
import config from '@/config';
import { QBittorrentConfig } from '@/config/types';
import { QBTFiles, QBTTorrent, QBTTorrents } from '@/download-job/types';
import { Injectable, Logger } from '@nestjs/common';
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { plainToClass } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import cookie from 'cookie';
import { inspect } from 'util';

export type TorrentStateFilter =
  | 'all'
  | 'downloading'
  | 'seeding'
  | 'completed'
  | 'paused'
  | 'active'
  | 'inactive'
  | 'resumed'
  | 'stalled'
  | 'stalled_uploading'
  | 'stalled_downloading'
  | 'errored';

export interface ListTorrentsParams {
  filter?: TorrentStateFilter;
  category?: string;
  tag?: string;
  sort?: keyof QBTTorrent;
  reverse?: boolean;
  limit?: number;
  offset?: number;
  hashes?: string[];
}

function getQBittorrentConfig() {
  const {
    downloadClient: { qbittorrent },
  } = config;
  if (!qbittorrent) throw new Error('qbittorrent not configured!');
  return qbittorrent;
}

@Injectable()
export class QBittorrentService extends AxiosService {
  private SID = '';
  private loginTime = 0;
  private authVersion = 0;
  private authPromise: Promise<void> | null = null;
  private qbtConfig: QBittorrentConfig;

  private logger = new Logger(QBittorrentService.name);

  constructor() {
    super({
      baseURL: `${getQBittorrentConfig().apiEndpoint}/api/v2`,
      ...getAxiosConfig('local'),
    });
    this.qbtConfig = getQBittorrentConfig();
  }

  /**
   * 实际进行登录，校验响应后写入 SID、登录时间和会话版本。
   * 使用 super.request 跳过鉴权恢复；不携带旧 SID，确保获取新的会话。
   */
  private async doLogin() {
    const params = new URLSearchParams();
    params.append('username', this.qbtConfig.username);
    params.append('password', this.qbtConfig.password);
    try {
      const response = await super.request<string>({
        method: 'post',
        url: '/auth/login',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        data: params.toString(),
      });
      // 登录接口用 HTTP 200 + Fails. 表示用户名/密码校验失败；IP 被封禁则返回 403。
      // https://github.com/qbittorrent/qBittorrent/blob/release-4.6.7/src/webui/api/authcontroller.cpp#L68-L96
      if (response.data === 'Fails.') {
        throw new LaniError('用户名或密码被拒绝');
      }
      if (response.data !== 'Ok.' && response.status !== 204) {
        throw new LaniError('登录接口返回了非预期响应', {
          status: response.status,
          response: response.data,
        });
      }
      const setCookie = response.headers['set-cookie'];
      const cookies =
        typeof setCookie === 'string' ? [setCookie] : setCookie ?? [];
      const sid = cookies.map((value) => cookie.parse(value).SID).find(Boolean);
      if (!sid) {
        throw new LaniError('登录响应缺少 SID，无法建立会话', {
          status: response.status,
          setCookie,
        });
      }
      this.SID = sid;
      this.loginTime = Date.now();
      ++this.authVersion;
      this.logger.log(
        `Logged into qBittorrent, SID=${this.SID}, authVersion=${this.authVersion}`,
      );
    } catch (error) {
      this.logger.error(
        `qBittorrent login failed: endpoint=${
          this.qbtConfig.apiEndpoint
        }, username=${this.qbtConfig.username}, error=${inspect(error)}`,
      );
      throw this.requestError('登录', error);
    }
  }

  /**
   * 清空旧凭据并调用登录函数；登录期间保存 authPromise，结束后清空。
   * 本方法不检查并发或登录状态，由调用者决定是否需要发起新的登录。
   */
  private loginNoCheck() {
    this.SID = '';
    this.loginTime = 0;
    const promise = this.doLogin().finally(() => {
      this.authPromise = null;
    });
    return (this.authPromise = promise);
  }

  /**
   * 调接口前保证存在有效期内的 Cookie，登录失败则抛错。
   * 并发调用共享同一个登录请求；已有 SID 且登录未超过一小时则复用。
   */
  async ensureCredentials() {
    if (this.authPromise) {
      return this.authPromise;
    }
    // 定期更新会话；实际失效仍由 401/403 恢复处理。
    if (this.SID && Date.now() - this.loginTime <= 60 * 60 * 1000) return;
    return this.loginNoCheck();
  }

  /**
   * 401/403 后更新鉴权信息，并发调用共享同一个登录请求。
   * 若失败请求使用的是旧会话版本，则复用已刷新的 SID，避免迟到的响应重复重登。
   */
  async refreshCredentials(failedVersion = this.authVersion) {
    if (this.authPromise) {
      this.logger.verbose(
        `Waiting for the ongoing qBittorrent credential refresh, failedVersion=${failedVersion}`,
      );
      return this.authPromise;
    }
    // 旧请求的 403 可能晚于其他请求的重登完成，直接使用新会话。
    if (this.SID && failedVersion !== this.authVersion) {
      this.logger.verbose(
        `Reusing refreshed qBittorrent credentials, failedVersion=${failedVersion}, authVersion=${this.authVersion}, SID=${this.SID}`,
      );
      return;
    }
    return this.loginNoCheck();
  }

  /** 为用户补充中文操作上下文，同时保留供重试判断使用的 HTTP 状态和网络错误码。 */
  private requestError(operation: string, error: unknown, retried = false) {
    const detail = error instanceof Error ? error.message : '未知错误';
    return new HttpRequestError(
      `qBittorrent ${operation}失败${
        retried ? '（重新登录后重试）' : ''
      }：${detail}`,
      error instanceof HttpRequestError ? error.status : undefined,
      error instanceof HttpRequestError ? error.code : undefined,
    );
  }

  /** 固定本次请求的 SID，避免等待响应期间其他请求刷新会话而混淆失败版本。 */
  private requestWithSID<T, R, D>(config: AxiosRequestConfig<D>): Promise<R> {
    // 固定本次请求的凭据，与 request 中记录的 authVersion 保持一致。
    return super.request<T, R, D>({
      ...config,
      headers: { ...config.headers, cookie: `SID=${this.SID}` },
    });
  }

  /** 请求前确保登录；遇到 401/403 时恢复会话并仅重放一次，其他错误直接上抛。 */
  override async request<T = any, R = AxiosResponse<T, any>, D = any>(
    config: AxiosRequestConfig<D>,
  ): Promise<R> {
    await this.ensureCredentials();
    const version = this.authVersion;
    const sid = this.SID;
    const request = `${config.method ?? 'get'} ${config.url}`;
    const operation = config.url === '/torrents/add' ? '提交种子' : '查询';
    try {
      return await this.requestWithSID<T, R, D>(config);
    } catch (error) {
      if (
        !(error instanceof HttpRequestError) ||
        (error.status !== 401 && error.status !== 403)
      ) {
        this.logger.error(
          `qBittorrent request failed: ${request}, params=${inspect(
            config.params,
          )}, authVersion=${version}, SID=${sid}, error=${inspect(error)}`,
        );
        throw this.requestError(operation, error);
      }
      this.logger.warn(
        `qBittorrent request returned HTTP ${
          error.status
        }: ${request}, params=${inspect(
          config.params,
        )}, authVersion=${version}, SID=${sid}; refreshing credentials before retry`,
      );
      try {
        await this.refreshCredentials(version);
      } catch (loginError) {
        this.logger.error(
          `Cannot retry qBittorrent request because credential refresh failed: ${request}, failedVersion=${version}, error=${inspect(
            loginError,
          )}`,
        );
        throw loginError;
      }
      const retryVersion = this.authVersion;
      const retrySID = this.SID;
      try {
        // 只重放一次，不把第二次失败再次送入鉴权恢复。
        this.logger.verbose(
          `Retrying qBittorrent request after credential refresh: ${request}, authVersion=${retryVersion}, SID=${retrySID}`,
        );
        const response = await this.requestWithSID<T, R, D>(config);
        this.logger.log(
          `qBittorrent request recovered after retry: ${request}`,
        );
        return response;
      } catch (retryError) {
        this.logger.error(
          `qBittorrent request failed after credential refresh: ${request}, params=${inspect(
            config.params,
          )}, authVersion=${retryVersion}, SID=${retrySID}, error=${inspect(
            retryError,
          )}`,
        );
        throw this.requestError(operation, retryError, true);
      }
    }
  }

  async listTorrents({ hashes, ...params }: ListTorrentsParams = {}) {
    const resp = await this.get('/torrents/info', {
      params: {
        ...params,
        ...(hashes ? { hashes: hashes.join('|') } : undefined),
      },
      responseType: 'json',
    });
    if (!Array.isArray(resp.data)) {
      this.logger.error(
        `Invalid qBittorrent torrent list response: hashes=${inspect(
          hashes,
        )}, body=${inspect(resp.data)}`,
      );
      throw new LaniError('qBittorrent 查询失败：种子列表响应格式无效');
    }
    const obj = plainToClass(QBTTorrents, { torrents: resp.data });
    try {
      await validateOrReject(obj);
    } catch (error) {
      this.logger.error(
        `qBittorrent torrent list validation failed: hashes=${inspect(
          hashes,
        )}, error=${inspect(error)}`,
      );
      throw new LaniError('qBittorrent 查询失败：种子列表数据校验失败');
    }
    return Array.from(obj.torrents);
  }

  async getTorrent(hash: string): Promise<QBTTorrent | undefined> {
    return (
      await this.listTorrents({
        hashes: [hash],
      })
    )[0];
  }

  async getFiles(hash: string) {
    const resp = await this.get('/torrents/files', { params: { hash } });
    const obj = plainToClass(QBTFiles, { files: resp.data });
    try {
      await validateOrReject(obj);
    } catch (error) {
      this.logger.error(
        `qBittorrent file list validation failed: hash=${hash}, error=${inspect(
          error,
        )}`,
      );
      throw new LaniError('qBittorrent 查询失败：文件列表数据校验失败');
    }
    return Array.from(obj.files);
  }
}

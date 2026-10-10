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

  /** 登录请求不携带旧 SID，避免把失效凭据误当成会话复用。 */
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
      if (response.data === 'Fails.') {
        throw new LaniError('用户名或密码被拒绝');
      }
      if (response.data !== 'Ok.' && response.status !== 204) {
        throw new LaniError('登录接口返回了非预期响应');
      }
      const setCookie = response.headers['set-cookie'];
      const cookies =
        typeof setCookie === 'string' ? [setCookie] : setCookie ?? [];
      const sid = cookies.map((value) => cookie.parse(value).SID).find(Boolean);
      if (!sid) {
        throw new LaniError('登录响应缺少 SID，无法建立会话');
      }
      this.SID = sid;
      this.loginTime = Date.now();
      ++this.authVersion;
      this.logger.log('Logged into qBittorrent');
    } catch (error) {
      throw this.requestError('登录', error);
    }
  }

  private loginNoCheck() {
    this.SID = '';
    this.loginTime = 0;
    const promise = this.doLogin().finally(() => {
      this.authPromise = null;
    });
    return (this.authPromise = promise);
  }

  async ensureCredentials() {
    if (this.authPromise) return this.authPromise;
    // 定期更新会话；实际失效仍由 401/403 恢复处理。
    if (this.SID && Date.now() - this.loginTime <= 60 * 60 * 1000) return;
    return this.loginNoCheck();
  }

  async refreshCredentials(failedVersion = this.authVersion) {
    if (this.authPromise) return this.authPromise;
    // 旧请求的 403 可能晚于其他请求的重登完成，直接使用新会话。
    if (this.SID && failedVersion !== this.authVersion) return;
    return this.loginNoCheck();
  }

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

  private requestWithSID<T, R, D>(config: AxiosRequestConfig<D>): Promise<R> {
    // 固定本次请求的凭据，与 request 中记录的 authVersion 保持一致。
    return super.request<T, R, D>({
      ...config,
      headers: { ...config.headers, cookie: `SID=${this.SID}` },
    });
  }

  override async request<T = any, R = AxiosResponse<T, any>, D = any>(
    config: AxiosRequestConfig<D>,
  ): Promise<R> {
    await this.ensureCredentials();
    const version = this.authVersion;
    const operation = config.url === '/torrents/add' ? '提交种子' : '查询';
    try {
      return await this.requestWithSID<T, R, D>(config);
    } catch (error) {
      if (
        !(error instanceof HttpRequestError) ||
        (error.status !== 401 && error.status !== 403)
      ) {
        throw this.requestError(operation, error);
      }
      await this.refreshCredentials(version);
      try {
        // 只重放一次，不把第二次失败再次送入鉴权恢复。
        return await this.requestWithSID<T, R, D>(config);
      } catch (retryError) {
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
      throw new LaniError('qBittorrent 查询失败：种子列表响应格式无效');
    }
    const obj = plainToClass(QBTTorrents, { torrents: resp.data });
    try {
      await validateOrReject(obj);
    } catch (error) {
      throw error;
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
    await validateOrReject(obj);
    return Array.from(obj.files);
  }
}

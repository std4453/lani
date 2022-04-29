import { AxiosService } from '@/common/axios.service';
import config from '@/config';
import { QBittorrentConfig } from '@/config/types';
import { QBTFiles, QBTTorrent, QBTTorrents } from '@/download-job/types';
import { Injectable } from '@nestjs/common';
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
  private authPromise: Promise<void> | null = null;
  private qbtConfig: QBittorrentConfig;

  constructor() {
    super({
      baseURL: `${getQBittorrentConfig().apiEndpoint}/api/v2`,
      timeout: config.network.timeout.local,
    });
    this.qbtConfig = getQBittorrentConfig();
    this.interceptors.request.use((config) => {
      return {
        ...config,
        headers: {
          ...config.headers,
          ...(this.SID ? { cookie: `SID=${this.SID}` } : undefined),
        },
      };
    });
  }

  /**
   * 实际进行登录，成功则会写入 SID
   */
  private async doLogin() {
    console.debug('logging in to qBittorrent...');
    const params = new URLSearchParams();
    params.append('username', this.qbtConfig.username);
    params.append('password', this.qbtConfig.password);
    // 使用 super.request，因为这次接口调用不需要拦截
    const { headers } = await super.request({
      method: 'post',
      url: '/auth/login',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      data: params.toString(),
    });
    const cookies = cookie.parse(headers?.['set-cookie']?.[0] ?? '');
    this.SID = cookies.SID;
    this.loginTime = new Date().getTime();
    console.debug(`logged in to qBittorrent, SID=${this.SID}`);
  }

  /**
   * 调用登陆函数，保证登录过程中存在 authPromise，登录完成后清空 authPromise
   * 没有并发检查，也不检查是否已经登录
   */
  private loginNoCheck() {
    const promise = this.doLogin().finally(() => {
      this.authPromise = null;
    });
    return (this.authPromise = promise);
  }

  /**
   * 保证存在 Cookie 后返回，调接口之前使用，如果登录失败则会报错
   * 并发调用时只会触发一次请求，已登录时不会重复登录
   */
  async ensureCredentials() {
    // 登录中，等登录完成才知道结果
    if (this.authPromise) {
      return this.authPromise;
    }
    // 已经登录，直接返回
    // qbt cookie会过期，过期（超过1小时）的话不等到请求失败直接刷新
    if (this.SID && new Date().getTime() - this.loginTime <= 60 * 60 * 1000) {
      return;
    } else {
      return this.loginNoCheck();
    }
  }

  /**
   * 重置鉴权信息，强制重新登陆，并发调用时只会触发一次请求
   */
  async refreshCredentials() {
    // 登录中，等登录完成才知道结果
    if (this.authPromise) {
      return this.authPromise;
    }
    return this.loginNoCheck();
  }

  override async request<T = any, R = AxiosResponse<T, any>, D = any>(
    config: AxiosRequestConfig<D>,
  ): Promise<R> {
    // 如果登录失败直接抛出去
    await this.ensureCredentials();
    try {
      return super.request<T, R, D>(config);
    } catch (error) {
      // 401/403 报错（如cookie过期）时，尝试一次重新登陆
      if (
        error['isAxiosError'] &&
        error.response?.status === 401 &&
        error.response?.status === 403
      ) {
        await this.refreshCredentials();
        return super.request<T, R, D>(config);
      }

      throw error;
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
    const obj = plainToClass(QBTTorrents, { torrents: resp.data });
    try {
      await validateOrReject(obj);
    } catch (error) {
      console.error(error);
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

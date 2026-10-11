import config from '@/config';
import { LaniError } from '@/utils/error';
import { Injectable, Logger } from '@nestjs/common';
import axios, {
  Axios,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from 'axios';
import createHttpsProxyAgent from 'https-proxy-agent';
import { inspect } from 'util';

// 保留机器可判断的错误信息，供下载器鉴权恢复和有限网络重试使用。
export class HttpRequestError extends LaniError {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly code?: string,
  ) {
    super(message, { status, code });
  }
}

export function getAxiosConfig(
  key: 'global' | 'hk' | 'local' | 'china',
): AxiosRequestConfig {
  // 本地不使用 proxy
  const proxy =
    key === 'local'
      ? undefined
      : config.network.proxy !== undefined
      ? typeof config.network.proxy === 'string'
        ? config.network.proxy
        : key === 'hk'
        ? config.network.proxy.hk ?? config.network.proxy.global
        : config.network.proxy[key]
      : undefined;
  const timeout =
    typeof config.network.timeout === 'number'
      ? config.network.timeout
      : key === 'hk'
      ? config.network.timeout.hk ?? config.network.timeout.global
      : config.network.timeout[key];
  return {
    httpsAgent: proxy ? createHttpsProxyAgent(proxy) : undefined,
    timeout,
  };
}

// extends Axios 这里只是个幌子，因为 Axios.constructor 制造的 instance 比
// axios.create() 制造的少很多默认值，导致了问题，因此实际上我们的 request
// 托管给 instance 而非 super
export class AxiosService extends Axios {
  protected instance: AxiosInstance;
  defaults: Axios['defaults'];
  interceptors: Axios['interceptors'];
  private httpLogger = new Logger(AxiosService.name);

  protected constructor(private requestConfig: AxiosRequestConfig) {
    super();
    this.instance = axios.create(requestConfig);
    this.defaults = this.instance.defaults;
    this.interceptors = this.instance.interceptors;
  }

  /**
   * 代理 Axios 请求，并用外层超时覆盖连接建立阶段；超时后取消底层请求。
   * 日志记录请求及响应详情，用户错误只携带简明中文说明、HTTP 状态和网络错误码。
   */
  request<T = any, R = AxiosResponse<T>, D = any>(
    config: AxiosRequestConfig<D>,
  ): Promise<R> {
    return new Promise((resolve, reject) => {
      const timeout = config.timeout ?? this.requestConfig.timeout ?? 0;
      const request = `${config.method ?? 'get'} ${
        config.baseURL ?? this.defaults.baseURL ?? ''
      }${config.url ?? ''}`;
      // 部署镜像使用 Node 14，不能依赖全局 AbortController。
      const cancellation = axios.CancelToken.source();
      const callerToken = config.cancelToken ?? this.defaults.cancelToken;
      if (callerToken?.reason) cancellation.cancel(callerToken.reason.message);
      // Axios 0.26 的 promise.then 返回可取消订阅的 Promise。
      const subscription = callerToken?.promise.then((reason) => {
        cancellation.cancel(reason.message);
      }) as (Promise<void> & { cancel?: () => void }) | undefined;
      let timeoutRejected = false;
      const timer =
        timeout > 0
          ? setTimeout(() => {
              timeoutRejected = true;
              this.httpLogger.warn(
                `HTTP request timed out after ${timeout}ms; cancelling request: ${request}, params=${inspect(
                  config.params,
                )}`,
              );
              reject(
                new HttpRequestError(
                  `请求超时 (${(timeout / 1000).toFixed(1)}秒)`,
                  undefined,
                  'ETIMEDOUT',
                ),
              );
              cancellation.cancel('Request timed out');
            }, timeout)
          : undefined;
      this.instance
        .request<T, R, D>({ ...config, cancelToken: cancellation.token })
        .then(resolve, (error: unknown) => {
          // 如果已经超时了，这里就不再抛错
          if (timeoutRejected) {
            return;
          }
          if (axios.isAxiosError(error)) {
            // Axios 响应详情写入日志；供用户展示的报错保留状态/错误码。
            this.httpLogger.warn(
              `HTTP request failed: ${request}, params=${inspect(
                config.params,
              )}, status=${error.response?.status}, code=${
                error.code
              }, message=${error.message}, response=${inspect(
                error.response?.data,
              )}`,
            );
            if (error.response) {
              throw new HttpRequestError(
                `HTTP ${error.response.status}`,
                error.response.status,
                error.code,
              );
            } else if (error.request) {
              throw new HttpRequestError(
                `请求错误${error.code ? ` (${error.code})` : ''}`,
                undefined,
                error.code,
              );
            }
          }
          // 其他情况下，原封不动抛出
          this.httpLogger.error(
            `Unexpected HTTP request failure: ${request}, error=${inspect(
              error,
            )}`,
          );
          throw error;
        })
        .catch(reject)
        .finally(() => {
          if (timer) clearTimeout(timer);
          subscription?.cancel?.();
        });
    });
  }
}

@Injectable()
export class GlobalAxiosService extends AxiosService {
  constructor() {
    super(getAxiosConfig('global'));
  }
}

@Injectable()
export class HKAxiosService extends AxiosService {
  constructor() {
    super(getAxiosConfig('hk'));
  }
}

@Injectable()
export class ChinaAxiosService extends AxiosService {
  constructor() {
    super(getAxiosConfig('china'));
  }
}

@Injectable()
export class LocalAxiosService extends AxiosService {
  constructor() {
    super(getAxiosConfig('local'));
  }
}

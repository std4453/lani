import config from '@/config';
import { LaniError } from '@/utils/error';
import { Injectable } from '@nestjs/common';
import axios, {
  Axios,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from 'axios';
import createHttpsProxyAgent from 'https-proxy-agent';

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

  protected constructor(private requestConfig: AxiosRequestConfig) {
    super();
    this.instance = axios.create(requestConfig);
    this.defaults = this.instance.defaults;
    this.interceptors = this.instance.interceptors;
  }

  request<T = any, R = AxiosResponse<T>, D = any>(
    config: AxiosRequestConfig<D>,
  ): Promise<R> {
    return new Promise((resolve, reject) => {
      const timeout = config.timeout ?? this.requestConfig.timeout ?? 0;
      let timeoutRejected = false;
      setTimeout(() => {
        timeoutRejected = true;
        reject(
          new LaniError(`请求超时 (${(timeout / 1000).toFixed(1)}秒)`, {
            config,
          }),
        );
      }, timeout);
      this.instance.request<T, R, D>(config).then(resolve, (error: unknown) => {
        // 如果已经超时了，这里就不再抛错
        if (timeoutRejected) {
          return;
        }
        if (axios.isAxiosError(error)) {
          // 如果是Axios报错，展示相关数据
          if (error.response) {
            throw new LaniError(
              `响应错误 (${error.response.status}), data = ${error.response.data}`,
              {
                headers: error.response.headers,
                data: error.response.data,
              },
            );
          } else if (error.request) {
            throw new LaniError(`请求错误`, {
              request: error.request,
            });
          }
        }
        // 其他情况下，原封不动抛出
        throw error;
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

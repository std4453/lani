import config from '@/config';
import { Injectable } from '@nestjs/common';
import axios, {
  Axios,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from 'axios';
import createHttpsProxyAgent from 'https-proxy-agent';

function getAxiosConfig(
  key: keyof typeof config.network.timeout,
): AxiosRequestConfig {
  // 本地不使用 proxy
  const proxy =
    key === 'local'
      ? undefined
      : config.network.proxy.enabled
      ? config.network.proxy[key]
      : undefined;
  const timeout =
    typeof config.network.timeout[key] === 'number' &&
    config.network.timeout[key] > 0
      ? config.network.timeout[key]
      : undefined;
  return {
    httpsAgent: proxy ? createHttpsProxyAgent(proxy) : undefined,
    timeout,
  };
}

// extends Axios 这里只是个幌子，因为 Axios.constructor 制造的 instance 比
// axios.create() 制造的少很多默认值，导致了问题，因此实际上我们的 request
// 托管给 instance 而非 super
export class AxiosService extends Axios {
  private instance: AxiosInstance;
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
      setTimeout(() => {
        reject(config);
      }, config.timeout ?? this.requestConfig.timeout ?? 0);
      this.instance.request<T, R, D>(config).then(resolve, reject);
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
    super(getAxiosConfig('default'));
  }
}

@Injectable()
export class LocalAxiosService extends AxiosService {
  constructor() {
    super(getAxiosConfig('local'));
  }
}

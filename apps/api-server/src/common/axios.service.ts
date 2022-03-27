import { ConfigType } from '@/config';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, {
  Axios,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from 'axios';
import createHttpsProxyAgent from 'https-proxy-agent';

function pTimeout<T>(
  promise: Promise<T>,
  timeout: number,
  message?: string,
): Promise<T> {
  if (timeout <= 0) {
    return promise;
  }
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      reject(new Error(message));
    }, timeout);
    promise.then(resolve, reject);
  });
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
    return pTimeout(
      this.instance.request<T, R, D>(config),
      config.timeout ?? this.requestConfig.timeout ?? 0,
    );
  }
}

@Injectable()
export class GlobalAxiosService extends AxiosService {
  constructor(config: ConfigService<ConfigType, true>) {
    super({
      httpsAgent: createHttpsProxyAgent(config.get<string>('globalProxy')),
      timeout: config.get<number>('timeoutGlobal'),
    });
  }
}

@Injectable()
export class HKAxiosService extends AxiosService {
  constructor(config: ConfigService<ConfigType, true>) {
    super({
      httpsAgent: createHttpsProxyAgent(config.get<string>('hk1Proxy')),
      timeout: config.get<number>('timeoutGlobal'),
    });
  }
}

@Injectable()
export class ChinaAxiosService extends AxiosService {
  constructor(config: ConfigService<ConfigType>) {
    super({
      timeout: config.get<number>('timeoutChina'),
    });
  }
}

@Injectable()
export class LocalAxiosService extends AxiosService {
  constructor(config: ConfigService<ConfigType>) {
    super({
      timeout: config.get<number>('timeoutLocal'),
    });
  }
}

import { ConfigType } from '@/config';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Axios, AxiosRequestConfig, AxiosResponse } from 'axios';
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

export class AxiosService extends Axios {
  protected constructor(private requestConfig: AxiosRequestConfig) {
    super(requestConfig);
  }

  request<T = any, R = AxiosResponse<T>, D = any>(
    config: AxiosRequestConfig<D>,
  ): Promise<R> {
    return pTimeout(
      super.request<T, R, D>(config),
      config.timeout ?? this.requestConfig.timeout ?? 0,
    );
  }
}

@Injectable()
export class GlobalAxiosService extends AxiosService {
  constructor(config: ConfigService<ConfigType>) {
    super({
      httpsAgent: createHttpsProxyAgent(config.get<string>('proxy')),
      timeout: config.get<number>('timeoutGlobal'),
    });
  }
}

@Injectable()
export class HKAxiosService extends AxiosService {
  constructor(config: ConfigService<ConfigType>) {
    super({
      httpsAgent: createHttpsProxyAgent(config.get<string>('proxy')),
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

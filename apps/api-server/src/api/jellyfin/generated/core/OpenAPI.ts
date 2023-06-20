/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import config from '@/config';
import type { ApiRequestOptions } from './ApiRequestOptions';

type Resolver<T> = (options: ApiRequestOptions) => Promise<T>;
type Headers = Record<string, string>;

export type OpenAPIConfig = {
  BASE: string;
  VERSION: string;
  WITH_CREDENTIALS: boolean;
  CREDENTIALS: 'include' | 'omit' | 'same-origin';
  TOKEN?: string | Resolver<string>;
  USERNAME?: string | Resolver<string>;
  PASSWORD?: string | Resolver<string>;
  HEADERS?: Headers | Resolver<Headers>;
  ENCODE_PATH?: (path: string) => string;
};

export const OpenAPI: OpenAPIConfig = {
  BASE: config.jellyfin.apiEndpoint,
  VERSION: '10.7.7',
  WITH_CREDENTIALS: false,
  CREDENTIALS: 'include',
  TOKEN: undefined,
  USERNAME: undefined,
  PASSWORD: undefined,
  HEADERS: {
    'X-Emby-Token': config.jellyfin.apiToken,
  },
  ENCODE_PATH: undefined,
};

import { LocalAxiosService } from '@/common/axios.service';
import { MatcherBackend } from './backend';
import {
  CatalogSnapshot,
  MatchQuery,
  MatchResponse,
  WorkerStatus,
} from './protocol';

const MAX_BYTES = 16 * 1024 * 1024;
export interface TransportOptions {
  endpoint: string;
  timeoutMs: number;
}

/** API 只调用独立服务；一次操作失败即返回，不自动重试。 */
export class MatcherTransport implements MatcherBackend {
  private serial: Promise<unknown> = Promise.resolve();
  private closed = false;
  private cancel?: () => void;

  constructor(
    private options: TransportOptions,
    private http: LocalAxiosService,
  ) {
    if (!Number.isFinite(options.timeoutMs) || options.timeoutMs <= 0)
      throw new Error('Invalid matcher timeout');
    if (!/^https?:$/.test(new URL(options.endpoint).protocol))
      throw new Error('Invalid matcher endpoint');
  }

  private exclusive<T>(operation: () => Promise<T>): Promise<T> {
    if (this.closed)
      return Promise.reject(new Error('Matcher transport is closed'));
    const result = this.serial.then(operation, operation);
    this.serial = result.catch(() => undefined);
    return result;
  }

  load(catalog: CatalogSnapshot) {
    return this.exclusive(() => this.ensure(catalog));
  }

  match(
    catalog: CatalogSnapshot,
    query: MatchQuery,
    candidateIds: string[],
    requestId: string,
  ): Promise<MatchResponse> {
    return this.exclusive(async () => {
      await this.ensure(catalog);
      const response = (await this.request('match', {
        protocolVersion: 2,
        catalogVersion: catalog.version,
        query,
        candidateIds,
        requestId,
      })) as MatchResponse;
      this.validateStatus(response);
      if (
        response.catalogVersion !== catalog.version ||
        response.requestId !== requestId ||
        !response.result ||
        (response.result.seasonId !== null &&
          !catalog.catalog.some(
            (season) => season.id === response.result.seasonId,
          ))
      )
        throw new Error('Invalid matcher result');
      return response;
    });
  }

  private async readStatus() {
    const status = (await this.request('status', {})) as WorkerStatus;
    this.validateStatus(status);
    return status;
  }

  private validateStatus(value: WorkerStatus) {
    if (
      !value ||
      value.protocolVersion !== 2 ||
      (value.catalogVersion !== null &&
        typeof value.catalogVersion !== 'string')
    )
      throw new Error('Incompatible matcher protocol');
  }

  private async ensure(catalog: CatalogSnapshot): Promise<WorkerStatus> {
    const status = await this.readStatus();
    if (status.catalogVersion === catalog.version) return status;
    // 明确的缓存同步，不是匹配失败后的重试。worker 可随时丢弃派生缓存。
    const loaded = (await this.request('configure', {
      protocolVersion: 2,
      catalogVersion: catalog.version,
      catalog: catalog.catalog,
    })) as WorkerStatus;
    this.validateStatus(loaded);
    if (loaded.catalogVersion !== catalog.version)
      throw new Error('Matcher catalog was not activated');
    return loaded;
  }

  private request(
    method: 'status' | 'configure' | 'match',
    payload: object,
  ): Promise<unknown> {
    if (this.closed)
      return Promise.reject(new Error('Matcher transport is closed'));
    return this.requestHttp(method, payload);
  }

  private async requestHttp(method: string, payload: object): Promise<unknown> {
    const url = `${this.options.endpoint.replace(/\/$/, '')}/v2/${
      method === 'configure' ? 'catalog' : method
    }`;
    const body = method === 'status' ? undefined : JSON.stringify(payload);
    if (body && Buffer.byteLength(body) > MAX_BYTES)
      throw new Error('Matcher request too large');
    const controller = new AbortController();
    this.cancel = () => controller.abort();
    try {
      const { data } = await this.http.request<string>({
        url,
        method:
          method === 'status' ? 'GET' : method === 'configure' ? 'PUT' : 'POST',
        data: body,
        headers: body ? { 'content-type': 'application/json' } : undefined,
        timeout: this.options.timeoutMs,
        signal: controller.signal,
        // 内部服务不经过环境代理，也不跟随重定向重新发送请求。
        proxy: false,
        maxRedirects: 0,
        maxBodyLength: MAX_BYTES,
        maxContentLength: MAX_BYTES,
        validateStatus: (status) => status === 200,
        responseType: 'text',
        // 协议层严格解析 JSON，HTTP 错误保留通用客户端的状态与错误码。
        transformResponse: [(data) => data],
      });
      try {
        return JSON.parse(data);
      } catch {
        throw new Error('Invalid matcher JSON');
      }
    } finally {
      this.cancel = undefined;
    }
  }

  async close() {
    this.closed = true;
    this.cancel?.();
    await this.serial;
  }
}

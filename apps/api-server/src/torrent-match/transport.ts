import * as http from 'http';
import * as https from 'https';
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
export class MatcherTransport {
  private serial: Promise<unknown> = Promise.resolve();
  private closed = false;
  private cancel?: () => void;

  constructor(private options: TransportOptions) {
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
      const status = await this.ensure(catalog);
      const response = (await this.request('match', {
        protocolVersion: 1,
        catalogVersion: catalog.version,
        query,
        candidateIds,
        requestId,
      })) as MatchResponse;
      this.validateStatus(response);
      if (
        response.catalogVersion !== catalog.version ||
        response.requestId !== requestId ||
        response.modelVersion !== status.modelVersion ||
        response.mode !== status.mode ||
        !response.result ||
        (response.result.seasonId !== null &&
          !candidateIds.includes(response.result.seasonId)) ||
        (response.result.score != null &&
          (typeof response.result.score !== 'number' ||
            !Number.isFinite(response.result.score))) ||
        (response.result.reason != null &&
          typeof response.result.reason !== 'string')
      )
        throw new Error('Invalid matcher result');
      return response;
    });
  }

  private validateStatus(value: WorkerStatus) {
    if (
      !value ||
      value.protocolVersion !== 1 ||
      !['lexical', 'semantic'].includes(value.mode) ||
      typeof value.modelVersion !== 'string' ||
      !value.modelVersion ||
      (value.catalogVersion !== null &&
        typeof value.catalogVersion !== 'string')
    )
      throw new Error('Incompatible matcher protocol');
  }

  private async ensure(catalog: CatalogSnapshot): Promise<WorkerStatus> {
    const status = (await this.request('status', {})) as WorkerStatus;
    this.validateStatus(status);
    if (status.catalogVersion === catalog.version) return status;
    // 明确的缓存同步，不是匹配失败后的重试。worker 可随时丢弃派生缓存。
    const loaded = (await this.request('configure', {
      protocolVersion: 1,
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

  private requestHttp(method: string, payload: object): Promise<unknown> {
    const url = new URL(
      `${this.options.endpoint.replace(/\/$/, '')}/v1/${
        method === 'configure' ? 'catalog' : method
      }`,
    );
    const body =
      method === 'status' ? undefined : Buffer.from(JSON.stringify(payload));
    if (body && body.length > MAX_BYTES)
      return Promise.reject(new Error('Matcher request too large'));
    return new Promise((resolve, reject) => {
      let settled = false;
      const req = (url.protocol === 'https:' ? https : http).request(url, {
        method:
          method === 'status' ? 'GET' : method === 'configure' ? 'PUT' : 'POST',
        headers: body
          ? {
              'content-type': 'application/json',
              'content-length': body.length,
            }
          : {},
      });
      const timer = setTimeout(
        () => req.destroy(new Error('Matcher request timed out')),
        this.options.timeoutMs,
      );
      this.cancel = () => req.destroy(new Error('Matcher transport closed'));
      const finish = (error?: Error, value?: unknown) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        this.cancel = undefined;
        if (error) reject(error);
        else resolve(value);
      };
      req.on('error', () => finish(new Error('Matcher HTTP request failed')));
      req.on('response', (res) => {
        const chunks: Buffer[] = [];
        let size = 0;
        res.on('data', (chunk: Buffer) => {
          size += chunk.length;
          if (size > MAX_BYTES)
            req.destroy(new Error('Matcher response too large'));
          else chunks.push(chunk);
        });
        res.on('error', () =>
          finish(new Error('Matcher HTTP response failed')),
        );
        res.on('end', () => {
          if (res.statusCode !== 200)
            return finish(new Error(`Matcher HTTP status ${res.statusCode}`));
          try {
            finish(
              undefined,
              JSON.parse(Buffer.concat(chunks).toString('utf8')),
            );
          } catch {
            finish(new Error('Invalid matcher JSON'));
          }
        });
      });
      req.end(body);
    });
  }

  async close() {
    this.closed = true;
    this.cancel?.();
    await this.serial;
  }
}

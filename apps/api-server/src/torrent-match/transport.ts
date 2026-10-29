import { LocalAxiosService } from '@/common/axios.service';
import {
  CatalogSnapshot,
  MatchQuery,
  MatchResponse,
  MatchDiagnostics,
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
  private status?: WorkerStatus;
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
    primaryCandidateIds: string[],
    requestId: string,
  ): Promise<MatchResponse> {
    return this.exclusive(async () => {
      const status = await this.ensure(catalog);
      const fallbackCandidateIds = catalog.catalog.map((season) => season.id);
      const response = (await this.request('match', {
        protocolVersion: 2,
        catalogVersion: catalog.version,
        query,
        primaryCandidateIds,
        fallbackCandidateIds,
        requestId,
      })) as MatchResponse;
      this.validateStatus(response);
      const stage = response.decision?.stage;
      const ids =
        stage === 'primary' ? primaryCandidateIds : fallbackCandidateIds;
      if (
        response.catalogVersion !== catalog.version ||
        response.requestId !== requestId ||
        response.modelVersion !== status.modelVersion ||
        response.mode !== status.mode ||
        !['primary', 'fallback'].includes(stage) ||
        (response.decision.fallbackReason !== undefined &&
          (typeof response.decision.fallbackReason !== 'string' ||
            response.decision.fallbackReason.length > 128)) ||
        !response.result ||
        (response.result.seasonId !== null &&
          !ids.includes(response.result.seasonId)) ||
        (response.result.score != null &&
          (typeof response.result.score !== 'number' ||
            !Number.isFinite(response.result.score))) ||
        (response.result.reason != null &&
          typeof response.result.reason !== 'string')
      )
        throw new Error('Invalid matcher result');
      // 模型或路由配置可能在长请求期间变更，旧响应不得进入提交阶段。
      const current = await this.readStatus();
      if (!this.sameIdentity(current, response))
        throw new Error('Matcher identity changed during matching');
      return {
        ...response,
        diagnostics: this.diagnostics(response.diagnostics),
      };
    });
  }

  private sameIdentity(a: WorkerStatus, b: WorkerStatus) {
    return (
      a.catalogVersion === b.catalogVersion &&
      a.modelVersion === b.modelVersion &&
      a.mode === b.mode
    );
  }

  isCurrent(response: WorkerStatus) {
    return !!this.status && this.sameIdentity(this.status, response);
  }

  private async readStatus() {
    const status = (await this.request('status', {})) as WorkerStatus;
    this.validateStatus(status);
    this.status = status;
    return status;
  }

  private diagnostics(value: MatchDiagnostics | undefined) {
    if (value === undefined) return undefined;
    const duration = (number: number) =>
      typeof number === 'number' && Number.isFinite(number) && number >= 0;
    const text = (text: string | undefined) =>
      text === undefined || (typeof text === 'string' && text.length <= 128);
    if (
      !value ||
      !duration(value.elapsedMs) ||
      !Array.isArray(value.attempts) ||
      value.attempts.length > 4
    )
      throw new Error('Invalid matcher diagnostics');
    const attempts = value.attempts.map((attempt) => {
      if (
        !attempt ||
        !['primary', 'fallback'].includes(attempt.stage) ||
        ![1, 2].includes(attempt.attempt) ||
        !duration(attempt.elapsedMs) ||
        !text(attempt.model) ||
        !text(attempt.error)
      )
        throw new Error('Invalid matcher diagnostics');
      const counts: Partial<MatchDiagnostics['attempts'][number]> = {};
      for (const field of [
        'promptTokens',
        'completionTokens',
        'cacheHitTokens',
        'cacheMissTokens',
        'reasoningTokens',
      ] as const) {
        const count = attempt[field];
        if (count === undefined) continue;
        if (!Number.isSafeInteger(count) || count < 0)
          throw new Error('Invalid matcher diagnostics');
        counts[field] = count;
      }
      return {
        stage: attempt.stage,
        attempt: attempt.attempt,
        elapsedMs: attempt.elapsedMs,
        ...(attempt.model === undefined ? {} : { model: attempt.model }),
        ...(attempt.error === undefined ? {} : { error: attempt.error }),
        ...counts,
      };
    });
    const hashes = value.promptHashes;
    if (
      hashes !== undefined &&
      (!hashes ||
        typeof hashes !== 'object' ||
        Array.isArray(hashes) ||
        !text(hashes.primary) ||
        !text(hashes.fallback))
    )
      throw new Error('Invalid matcher diagnostics');
    return {
      elapsedMs: value.elapsedMs,
      attempts,
      ...(hashes === undefined
        ? {}
        : {
            promptHashes: {
              ...(hashes.primary === undefined
                ? {}
                : { primary: hashes.primary }),
              ...(hashes.fallback === undefined
                ? {}
                : { fallback: hashes.fallback }),
            },
          }),
    };
  }

  private validateStatus(value: WorkerStatus) {
    if (
      !value ||
      value.protocolVersion !== 2 ||
      typeof value.mode !== 'string' ||
      !value.mode.trim() ||
      typeof value.modelVersion !== 'string' ||
      !value.modelVersion ||
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
    this.status = loaded;
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

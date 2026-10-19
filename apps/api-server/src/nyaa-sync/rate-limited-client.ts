export function responseStatus(error: unknown): number | undefined {
  const failure = error as { status?: number; response?: { status?: number } };
  return failure?.response?.status ?? failure?.status;
}

export class NyaaPausedError extends Error {
  constructor() {
    super('Nyaa 请求已暂停，请稍后重试');
  }
}

// 同一客户端的 RSS、历史请求共用队列；失败不阻塞后续请求。
export class RateLimitedClient {
  private tail: Promise<unknown> = Promise.resolve();
  private lastStarted = 0;
  private pauseEnd = 0;

  get pausedUntil() {
    return this.pauseEnd;
  }
  private readonly interval: number;

  constructor(qps: number, private readonly timeoutMs = 30000) {
    if (!Number.isFinite(qps) || qps <= 0) {
      throw new Error('Nyaa QPS must be a finite number greater than 0');
    }
    this.interval = Math.ceil(1000 / qps);
  }

  request<T>(send: (signal: AbortSignal) => Promise<T>): Promise<T> {
    const result = this.tail.then(async () => {
      if (Date.now() < this.pauseEnd) throw new NyaaPausedError();
      const delay = this.lastStarted + this.interval - Date.now();
      if (delay > 0) await new Promise((resolve) => setTimeout(resolve, delay));
      this.lastStarted = Date.now();
      const controller = new AbortController();
      let timer: ReturnType<typeof setTimeout>;
      try {
        return await Promise.race([
          Promise.resolve().then(() => send(controller.signal)),
          new Promise<never>((_, reject) => {
            timer = setTimeout(() => {
              reject(new Error('Nyaa 请求超时，请重试'));
              controller.abort();
            }, this.timeoutMs);
          }),
        ]);
      } catch (error) {
        const status = responseStatus(error);
        if (status === 403 || status === 429) {
          this.pauseEnd = Date.now() + 15 * 60000;
        }
        throw error;
      } finally {
        clearTimeout(timer!);
      }
    });
    this.tail = result.catch(() => undefined);
    return result;
  }
}

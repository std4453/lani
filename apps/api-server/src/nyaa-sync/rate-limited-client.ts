export function responseStatus(error: unknown): number | undefined {
  const failure = error as { status?: number; response?: { status?: number } };
  return failure?.response?.status ?? failure?.status;
}

export class NyaaStoppedError extends Error {
  constructor() {
    super('Nyaa 同步已停止');
  }
}

// RSS、历史和详情共用队列；限流期间继续排队，退出时取消等待及在途请求。
export class RateLimitedClient {
  private tail: Promise<unknown> = Promise.resolve();
  private lastStarted = 0;
  private pauseEnd = 0;
  private readonly shutdown = new AbortController();
  private readonly interval: number;

  get pausedUntil() {
    return this.pauseEnd;
  }

  constructor(qps: number, private readonly timeoutMs = 30000) {
    if (!Number.isFinite(qps) || qps <= 0) {
      throw new Error('Nyaa QPS must be a finite number greater than 0');
    }
    this.interval = Math.ceil(1000 / qps);
  }

  close() {
    this.shutdown.abort();
    return this.tail;
  }

  private async waitUntilReady() {
    if (this.shutdown.signal.aborted) throw new NyaaStoppedError();
    const delay =
      Math.max(this.lastStarted + this.interval, this.pauseEnd) - Date.now();
    if (delay <= 0) return;
    await new Promise<void>((resolve, reject) => {
      const finish = (error?: Error) => {
        clearTimeout(timer);
        this.shutdown.signal.removeEventListener('abort', abort);
        if (error) reject(error);
        else resolve();
      };
      const abort = () => finish(new NyaaStoppedError());
      const timer = setTimeout(() => finish(), delay);
      this.shutdown.signal.addEventListener('abort', abort, { once: true });
    });
  }

  request<T>(send: (signal: AbortSignal) => Promise<T>): Promise<T> {
    const result = this.tail.then(async () => {
      await this.waitUntilReady();
      if (this.shutdown.signal.aborted) throw new NyaaStoppedError();
      this.lastStarted = Date.now();
      const controller = new AbortController();
      let timer: ReturnType<typeof setTimeout> | undefined;
      let abort: () => void = () => undefined;
      try {
        return await Promise.race([
          new Promise<never>((_, reject) => {
            abort = () => {
              reject(new NyaaStoppedError());
              controller.abort();
            };
            this.shutdown.signal.addEventListener('abort', abort, {
              once: true,
            });
            timer = setTimeout(() => {
              reject(new Error('Nyaa 请求超时，请重试'));
              controller.abort();
            }, this.timeoutMs);
          }),
          Promise.resolve().then(() => {
            if (this.shutdown.signal.aborted) throw new NyaaStoppedError();
            return send(controller.signal);
          }),
        ]);
      } catch (error) {
        const status = responseStatus(error);
        if (status === 403 || status === 429)
          this.pauseEnd = Date.now() + 15 * 60000;
        throw error;
      } finally {
        if (timer) clearTimeout(timer);
        this.shutdown.signal.removeEventListener('abort', abort);
      }
    });
    this.tail = result.catch(() => undefined);
    return result;
  }
}

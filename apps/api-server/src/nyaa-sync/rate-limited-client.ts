// 同一客户端的 RSS、历史请求共用队列；失败不阻塞后续请求。
export class RateLimitedClient {
  private tail: Promise<unknown> = Promise.resolve();
  private lastStarted = 0;
  private readonly interval: number;

  constructor(qps: number) {
    if (!Number.isFinite(qps) || qps <= 0 || qps > 0.5) {
      throw new Error('Nyaa QPS must be greater than 0 and at most 0.5');
    }
    this.interval = Math.ceil(1000 / qps);
  }

  request<T>(send: () => Promise<T>): Promise<T> {
    const result = this.tail.then(async () => {
      const delay = this.lastStarted + this.interval - Date.now();
      if (delay > 0) await new Promise((resolve) => setTimeout(resolve, delay));
      this.lastStarted = Date.now();
      return send();
    });
    this.tail = result.catch(() => undefined);
    return result;
  }
}

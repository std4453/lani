import { RateLimitedClient } from './rate-limited-client';

describe('Nyaa request rate limit', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(10000);
  });
  afterEach(() => jest.useRealTimers());
  it.each([0, -1, NaN, Infinity])('rejects invalid QPS %s', (qps) => {
    expect(() => new RateLimitedClient(qps)).toThrow();
  });
  it('spaces concurrent callers and continues after a failed request', async () => {
    const client = new RateLimitedClient(0.5);
    const started: number[] = [];
    const first = client.request(async () => {
      started.push(Date.now());
      throw new Error('offline');
    });
    const second = client.request(async () => {
      started.push(Date.now());
      return 2;
    });
    await expect(first).rejects.toThrow('offline');
    await Promise.resolve();
    jest.advanceTimersByTime(1999);
    expect(started).toHaveLength(1);
    jest.advanceTimersByTime(1);
    await expect(second).resolves.toBe(2);
    expect(started).toEqual([10000, 12000]);
  });
  it.each([0.25, 1, 2])('supports configured QPS %s', async (qps) => {
    const client = new RateLimitedClient(qps);
    await client.request(async () => 1);
    const next = client.request(async () => Date.now());
    await Promise.resolve();
    jest.advanceTimersByTime(1000 / qps);
    await expect(next).resolves.toBe(10000 + 1000 / qps);
  });
});

it('aborts a stuck request, releases the queue and handles a late rejection', async () => {
  jest.useFakeTimers();
  jest.setSystemTime(10000);
  try {
    const client = new RateLimitedClient(2, 1000);
    let signal: AbortSignal;
    let fail: (reason: Error) => void;
    const first = client.request((value) => {
      signal = value;
      return new Promise((_, reject) => {
        fail = reject;
      });
    });
    const rejection = expect(first).rejects.toThrow('请求超时');
    const next = client.request(async () => 2);
    for (let i = 0; i < 5; i++) await Promise.resolve();
    jest.advanceTimersByTime(1000);
    await rejection;
    expect(signal!.aborted).toBe(true);
    await expect(next).resolves.toBe(2);
    fail!(new Error('late network failure'));
    await Promise.resolve();
    expect(jest.getTimerCount()).toBe(0);
  } finally {
    jest.useRealTimers();
  }
});

it.each([403, 429])(
  'pauses all queued callers for 15 minutes after HTTP %s',
  async (status) => {
    jest.useFakeTimers();
    jest.setSystemTime(10000);
    try {
      const client = new RateLimitedClient(1);
      const send = jest.fn().mockResolvedValue('ok');
      const first = client.request(async () => {
        throw { response: { status } };
      });
      const queued = client.request(send);
      await expect(first).rejects.toEqual({ response: { status } });
      await expect(queued).rejects.toThrow('已暂停');
      jest.advanceTimersByTime(14 * 60000);
      await expect(client.request(send)).rejects.toThrow('已暂停');
      expect(send).not.toHaveBeenCalled();
      jest.advanceTimersByTime(60000);
      await expect(client.request(send)).resolves.toBe('ok');
      expect(send).toHaveBeenCalledTimes(1);
    } finally {
      jest.useRealTimers();
    }
  },
);

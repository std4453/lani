async function flush() {
  for (let i = 0; i < 12; i++) await Promise.resolve();
}

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
    await flush();
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
    await flush();
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
    for (let i = 0; i < 5; i++) await flush();
    jest.advanceTimersByTime(1000);
    await rejection;
    expect(signal!.aborted).toBe(true);
    await expect(next).resolves.toBe(2);
    fail!(new Error('late network failure'));
    await flush();
    expect(jest.getTimerCount()).toBe(0);
  } finally {
    jest.useRealTimers();
  }
});

it.each([403, 429])(
  'keeps callers queued without rejecting during HTTP %s cooldown',
  async (status) => {
    jest.useFakeTimers();
    jest.setSystemTime(10000);
    try {
      const client = new RateLimitedClient(1);
      const send = jest.fn().mockResolvedValue('ok');
      const first = client.request(async () => {
        throw { response: { status } };
      });
      const second = client.request(send);
      await expect(first).rejects.toEqual({ response: { status } });
      await flush();
      jest.advanceTimersByTime(14 * 60000);
      const third = client.request(send);
      await flush();
      expect(send).not.toHaveBeenCalled();
      jest.advanceTimersByTime(60000);
      await expect(second).resolves.toBe('ok');
      await flush();
      expect(send).toHaveBeenCalledTimes(1);
      jest.advanceTimersByTime(1000);
      await expect(third).resolves.toBe('ok');
    } finally {
      jest.useRealTimers();
    }
  },
);

it.each(['cooldown', 'spacing', 'active'] as const)(
  'cancels %s work and queued callers on close',
  async (phase) => {
    jest.useFakeTimers();
    jest.setSystemTime(10000);
    try {
      const client = new RateLimitedClient(1);
      const send = jest.fn().mockResolvedValue('ok');
      let signal: AbortSignal | undefined;
      if (phase === 'cooldown') {
        await expect(
          client.request(async () => {
            throw { status: 429 };
          }),
        ).rejects.toEqual({ status: 429 });
      } else if (phase === 'spacing') {
        await client.request(send);
        send.mockClear();
      }
      const pending =
        phase === 'active'
          ? client.request((value) => {
              signal = value;
              return new Promise(() => undefined);
            })
          : client.request(send);
      const queued = client.request(send);
      const checks = [
        expect(pending).rejects.toThrow('已停止'),
        expect(queued).rejects.toThrow('已停止'),
      ];
      await flush();
      await client.close();
      await Promise.all(checks);
      expect(send).not.toHaveBeenCalled();
      if (phase === 'active') expect(signal?.aborted).toBe(true);
      expect(jest.getTimerCount()).toBe(0);
      await expect(client.request(send)).rejects.toThrow('已停止');
    } finally {
      jest.useRealTimers();
    }
  },
);

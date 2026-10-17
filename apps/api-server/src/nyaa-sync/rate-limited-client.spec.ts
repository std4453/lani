import { RateLimitedClient } from './rate-limited-client';

describe('Nyaa request rate limit', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(10000);
  });
  afterEach(() => jest.useRealTimers());
  it.each([0, -1, 0.51, NaN, Infinity])('rejects invalid QPS %s', (qps) => {
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
  it('supports a slower configured rate', async () => {
    const client = new RateLimitedClient(0.25);
    await client.request(async () => 1);
    const next = client.request(async () => Date.now());
    await Promise.resolve();
    jest.advanceTimersByTime(4000);
    await expect(next).resolves.toBe(14000);
  });
});

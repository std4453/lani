jest.mock('@/config', () => ({
  __esModule: true,
  default: { s3: { bucket: 'unit-test' } },
}));
jest.mock('@/common/axios.service', () => ({
  GlobalAxiosService: class GlobalAxiosService {},
}));
jest.mock('@/common/s3.service', () => ({ S3Service: class S3Service {} }));

import { BangumiDataService } from './BangumiDataService';

const sourceItem = (options: Record<string, unknown> = {}) => ({
  begin: '2026-10-07T15:00:00.000Z',
  broadcast: 'R/2026-10-07T15:00:00.000Z/P7D',
  sites: [{ site: 'bangumi', id: '123' }],
  ...options,
});

const success = <T>(value: T) => ({
  promise: jest.fn().mockResolvedValue(value),
  abort: jest.fn(),
});

describe('BangumiDataService', () => {
  let http: { get: jest.Mock };
  let s3: { getObject: jest.Mock; putObject: jest.Mock };
  let service: BangumiDataService;

  const response = (
    items: unknown = [sourceItem()],
    status = 200,
    etag = '"etag-1"',
  ) => ({
    status,
    data: Buffer.from(JSON.stringify({ siteMeta: {}, items })),
    headers: { etag },
  });

  beforeEach(() => {
    http = { get: jest.fn().mockResolvedValue(response()) };
    s3 = {
      getObject: jest.fn(() => ({
        promise: jest.fn().mockRejectedValue(new Error('missing')),
        abort: jest.fn(),
      })),
      putObject: jest.fn(() => success({})),
    };
    service = new BangumiDataService(http as never, s3 as never);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('starts a cold refresh at bootstrap without waiting for the interval', async () => {
    service.onApplicationBootstrap();
    await service.getSchedule('123');
    expect(http.get).toHaveBeenCalledTimes(1);
    expect(s3.putObject).toHaveBeenCalledTimes(1);
    const snapshot = JSON.parse(s3.putObject.mock.calls[0][0].Body);
    expect(snapshot).toMatchObject({
      schemaVersion: 1,
      etag: '"etag-1"',
      items: [sourceItem()],
    });
    expect(http.get.mock.calls[0][1].proxy).toBe(false);
  });

  it('restores a fresh snapshot without downloading, then refreshes conditionally at six hours', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-10-18T00:00:00Z'));
    await service.getSchedule('123');
    const snapshotBody = s3.putObject.mock.calls[0][0].Body;
    s3.getObject.mockReturnValue(success({ Body: snapshotBody }));
    http.get.mockClear();
    service = new BangumiDataService(http as never, s3 as never);
    expect(await service.getSchedule('123')).toBeDefined();
    await service.refreshIfDue();
    expect(http.get).not.toHaveBeenCalled();
    jest.setSystemTime(new Date('2026-10-18T06:00:00Z'));
    http.get.mockResolvedValue({ status: 304, headers: {} });
    await service.refreshIfDue();
    expect(http.get).toHaveBeenCalledTimes(1);
    expect(http.get.mock.calls[0][1].headers).toEqual({
      'If-None-Match': '"etag-1"',
    });
    expect(JSON.parse(s3.putObject.mock.calls[1][0].Body).lastValidatedAt).toBe(
      '2026-10-18T06:00:00.000Z',
    );
  });

  it('honors exponential backoff on interval ticks and cold lookups without rereading S3', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-10-18T00:00:00Z'));
    http.get.mockRejectedValue(new Error('offline'));
    await service.getSchedule('123');
    jest.setSystemTime(new Date('2026-10-18T00:01:00Z'));
    await service.refreshIfDue();
    await service.getSchedule('123');
    expect(http.get).toHaveBeenCalledTimes(1);
    jest.setSystemTime(new Date('2026-10-18T00:05:00Z'));
    await service.getSchedule('123');
    expect(http.get).toHaveBeenCalledTimes(2);
    jest.setSystemTime(new Date('2026-10-18T00:14:00Z'));
    await service.refreshIfDue();
    expect(http.get).toHaveBeenCalledTimes(2);
    jest.setSystemTime(new Date('2026-10-18T00:15:00Z'));
    http.get.mockResolvedValue(response());
    await Promise.all([service.refreshIfDue(), service.getSchedule('123')]);
    expect(http.get).toHaveBeenCalledTimes(3);
    expect(s3.getObject).toHaveBeenCalledTimes(1);
    expect(await service.getSchedule('123')).toBeDefined();
  });

  it.each([false, true])(
    'merges identical schedules and rejects conflicting IDs independently of order (%s)',
    async (reverse) => {
      const items = [
        sourceItem(),
        sourceItem(),
        sourceItem({
          sites: [{ site: 'bangumi', id: '443831' }],
          begin: '2024-12-31T16:00:00Z',
          broadcast: 'R/2024-12-31T16:00:00Z/P7D',
        }),
        sourceItem({
          sites: [{ site: 'bangumi', id: '443831' }],
          begin: '2026-01-03T14:30:00Z',
          broadcast: 'R/2026-01-03T14:30:00Z/P7D',
        }),
      ];
      http.get.mockResolvedValue(response(reverse ? items.reverse() : items));
      expect(await service.getSchedule('123')).toBeDefined();
      expect(await service.getSchedule('443831')).toBeUndefined();
      expect(await service.getSchedule('999')).toBeUndefined();
      expect(http.get).toHaveBeenCalledTimes(1);
    },
  );

  it.each([undefined, 'invalid', 'R/2026-02-30T15:00:00Z/P7D'])(
    'falls back to begin for an absent or invalid broadcast: %s',
    async (broadcast) => {
      http.get.mockResolvedValue(response([sourceItem({ broadcast })]));
      expect((await service.getSchedule('123'))?.broadcastAt).toBe(
        '2026-10-07T15:00:00.000Z',
      );
    },
  );

  it('prefers broadcast time and ignores platform-specific schedules', async () => {
    http.get.mockResolvedValue(
      response([
        sourceItem({
          broadcast: 'R/2026-10-14T16:30:00Z/P7D',
          sites: [
            { site: 'bangumi', id: '123' },
            { site: 'gamer', id: '1', begin: '2026-10-07T17:00:00Z' },
          ],
        }),
      ]),
    );
    expect(await service.getSchedule('123')).toEqual({
      begin: '2026-10-07T15:00:00.000Z',
      broadcastAt: '2026-10-14T16:30:00.000Z',
    });
  });

  it('rejects a corrupt or future snapshot and a cold 304 without sending an ETag', async () => {
    const future = '9999-01-01T00:00:00Z';
    s3.getObject.mockReturnValue(
      success({
        Body: JSON.stringify({
          schemaVersion: 1,
          sourceUrl:
            'https://raw.githubusercontent.com/bangumi-data/bangumi-data/master/dist/data.json',
          downloadedAt: future,
          lastValidatedAt: future,
          etag: '"bad"',
          items: [sourceItem()],
        }),
      }),
    );
    http.get.mockResolvedValue({ status: 304, headers: {} });
    expect(await service.getSchedule('123')).toBeUndefined();
    expect(http.get.mock.calls[0][1].headers).toBeUndefined();
    expect(s3.putObject).not.toHaveBeenCalled();
  });

  it('fetches immediately on a cold lookup and returns the top-level schedule', async () => {
    await expect(service.getSchedule('123')).resolves.toEqual({
      begin: '2026-10-07T15:00:00.000Z',
      broadcastAt: '2026-10-07T15:00:00.000Z',
    });
    expect(http.get).toHaveBeenCalledTimes(1);
    expect(http.get.mock.calls[0][1]).toMatchObject({
      timeout: 20_000,
      maxContentLength: 32 * 1024 * 1024,
    });
  });

  it('rejects nonnumeric Bangumi IDs without loading the snapshot', async () => {
    await expect(service.getSchedule('not-an-id')).resolves.toBeUndefined();
    expect(s3.getObject).not.toHaveBeenCalled();
    expect(http.get).not.toHaveBeenCalled();
  });

  it('restores a valid S3 snapshot and refreshes an expired snapshot in background', async () => {
    const old = new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString();
    const snapshot = {
      schemaVersion: 1,
      sourceUrl:
        'https://raw.githubusercontent.com/bangumi-data/bangumi-data/master/dist/data.json',
      downloadedAt: old,
      lastValidatedAt: old,
      items: [sourceItem()],
    };
    s3.getObject.mockReturnValue(
      success({ Body: Buffer.from(JSON.stringify(snapshot)) }),
    );
    let resolve!: (value: unknown) => void;
    http.get.mockReturnValue(
      new Promise((done) => {
        resolve = done;
      }),
    );

    await expect(service.getSchedule('123')).resolves.toEqual({
      begin: '2026-10-07T15:00:00.000Z',
      broadcastAt: '2026-10-07T15:00:00.000Z',
    });
    expect(http.get).toHaveBeenCalledTimes(1);
    resolve(response([sourceItem({ begin: '2026-10-08T15:00:00Z' })]));
    await (service as any).refreshInFlight;
  });

  it('uses conditional GET and preserves the map on 304', async () => {
    await service.getSchedule('123');
    http.get.mockResolvedValue({ status: 304, data: undefined, headers: {} });
    await (service as any).refresh();
    expect(http.get.mock.calls[1][1].headers).toEqual({
      'If-None-Match': '"etag-1"',
    });
    await expect(service.getSchedule('123')).resolves.toEqual({
      begin: '2026-10-07T15:00:00.000Z',
      broadcastAt: '2026-10-07T15:00:00.000Z',
    });
  });

  it('coalesces concurrent cold lookups into one download', async () => {
    let resolveS3!: (value: unknown) => void;
    s3.getObject.mockReturnValue({
      promise: jest.fn(
        () =>
          new Promise((done) => {
            resolveS3 = done;
          }),
      ),
      abort: jest.fn(),
    });
    let resolve!: (value: unknown) => void;
    http.get.mockReturnValue(
      new Promise((done) => {
        resolve = done;
      }),
    );
    const first = service.getSchedule('123');
    const second = service.getSchedule('123');
    resolveS3({ Body: Buffer.from('missing') });
    await new Promise((done) => setImmediate(done));
    expect(http.get).toHaveBeenCalledTimes(1);
    resolve(response());
    await expect(Promise.all([first, second])).resolves.toEqual([
      {
        begin: '2026-10-07T15:00:00.000Z',
        broadcastAt: '2026-10-07T15:00:00.000Z',
      },
      {
        begin: '2026-10-07T15:00:00.000Z',
        broadcastAt: '2026-10-07T15:00:00.000Z',
      },
    ]);
  });

  it('rejects duplicate Bangumi IDs and malformed refreshes without dropping the old map', async () => {
    await service.getSchedule('123');
    http.get.mockResolvedValue(
      response([
        sourceItem(),
        sourceItem({ broadcast: 'R/2026-10-07T16:00:00Z/P7D' }),
      ]),
    );
    await (service as any).refresh();
    await expect(service.getSchedule('123')).resolves.toEqual({
      begin: '2026-10-07T15:00:00.000Z',
      broadcastAt: '2026-10-07T15:00:00.000Z',
    });
    http.get.mockResolvedValue(response({ not: 'an array' }));
    await (service as any).refresh();
    await expect(service.getSchedule('123')).resolves.toEqual({
      begin: '2026-10-07T15:00:00.000Z',
      broadcastAt: '2026-10-07T15:00:00.000Z',
    });
  });

  it('does not retry on every lookup after a cold network failure', async () => {
    http.get.mockRejectedValue(new Error('offline'));
    await expect(service.getSchedule('123')).resolves.toBeUndefined();
    await expect(service.getSchedule('456')).resolves.toBeUndefined();
    expect(http.get).toHaveBeenCalledTimes(1);
  });

  it('keeps the in-memory cache when S3 persistence fails', async () => {
    s3.putObject.mockReturnValue({
      promise: jest.fn().mockRejectedValue(new Error('S3 unavailable')),
      abort: jest.fn(),
    });
    await expect(service.getSchedule('123')).resolves.toEqual({
      begin: '2026-10-07T15:00:00.000Z',
      broadcastAt: '2026-10-07T15:00:00.000Z',
    });
  });

  it('aborts an S3 request that exceeds its timeout', async () => {
    jest.useFakeTimers();
    const request = {
      promise: jest.fn(
        () =>
          new Promise(() => {
            /* 模拟永不完成的 S3 请求。 */
          }),
      ),
      abort: jest.fn(),
    };
    const pending = (service as any).withS3Timeout(request);
    jest.advanceTimersByTime(10_000);
    await expect(pending).rejects.toThrow('S3 request timed out');
    expect(request.abort).toHaveBeenCalledTimes(1);
    jest.useRealTimers();
  });
});

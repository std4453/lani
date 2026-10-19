jest.mock('@/config', () => ({ __esModule: true, default: {} }));
jest.mock('@/common/prisma.service', () => ({ PrismaService: class {} }));
jest.mock('./index.service', () => ({ NyaaSyncService: class {} }));
jest.mock('@/utils/GraphQLExceptionFilter', () => ({
  LaniFilterCron: () => () => undefined,
}));
jest.mock('./subtitles', () => ({
  extractNyaaMetadata: jest.fn(),
  parseNyaaSubtitles: jest.fn(),
}));
import { NyaaMetadataService } from './metadata.service';
import { extractNyaaMetadata, parseNyaaSubtitles } from './subtitles';

function setup() {
  const row = {
    id: 1,
    hash: 'a'.repeat(40),
    permalink: 'https://nyaa.si/view/1',
    nyaaMetadataFailures: 0,
  };
  const prisma = {
    torrent: {
      findMany: jest.fn().mockResolvedValue([row]),
      updateMany: jest.fn().mockResolvedValue({ count: 1 }),
    },
  };
  const nyaa = { fetchDetails: jest.fn().mockResolvedValue('html') };
  (extractNyaaMetadata as jest.Mock).mockReturnValue({
    title: 'Title',
    description: 'Subs: English',
    files: [],
  });
  (parseNyaaSubtitles as jest.Mock).mockReturnValue({
    version: 1,
    status: 'known',
    subtitleInfo: { languages: ['en'], multi: false, delivery: [] },
    evidence: [],
  });
  return {
    service: new NyaaMetadataService(prisma as any, nyaa as any),
    prisma,
    nyaa,
    row,
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
  jest.setSystemTime(new Date('2026-10-19T00:00:00Z'));
});
afterEach(() => jest.useRealTimers());

it('selects recent unfetched Nyaa records, claims a lease, and atomically saves metadata plus analysis', async () => {
  const { service, prisma, nyaa, row } = setup();
  const first = service.syncMetadata();
  expect(service.syncMetadata()).toBe(first);
  expect(await first).toBe(1);
  const query = prisma.torrent.findMany.mock.calls[0][0];
  expect(query.where).toEqual({
    channel: 'NYAA',
    publishDate: { gte: new Date('2026-09-19'), lte: new Date('2026-10-19') },
    nyaaMetadataFetchedAt: null,
    nyaaMetadataStatus: { in: ['pending', 'failed'] },
    OR: [
      { nyaaMetadataRetryAt: null },
      { nyaaMetadataRetryAt: { lte: new Date('2026-10-19') } },
    ],
  });
  expect(query.take).toBe(40);
  expect(nyaa.fetchDetails).toHaveBeenCalledWith(row.permalink);
  expect(extractNyaaMetadata).toHaveBeenCalledWith('html', row.hash);
  const save = prisma.torrent.updateMany.mock.calls[1][0];
  expect(save.where).toEqual({
    id: 1,
    nyaaMetadataRetryAt: new Date('2026-10-19T00:05:00Z'),
  });
  expect(save.data).toMatchObject({
    nyaaMetadataStatus: 'parsed',
    nyaaMetadataFailures: 0,
    nyaaMetadataRetryAt: null,
    nyaaMetadataResult: { status: 'known' },
  });
  expect(save.data).not.toHaveProperty('parseResult');
});

it('skips a record claimed by another worker', async () => {
  const { service, prisma, nyaa } = setup();
  prisma.torrent.updateMany.mockResolvedValue({ count: 0 });
  expect(await service.syncMetadata()).toBe(0);
  expect(nyaa.fetchDetails).not.toHaveBeenCalled();
});

it('persists unknown results as successfully fetched, not a retryable error', async () => {
  const { service, prisma } = setup();
  (parseNyaaSubtitles as jest.Mock).mockReturnValue({
    version: 1,
    status: 'unknown',
    evidence: [],
  });
  await service.syncMetadata();
  expect(prisma.torrent.updateMany.mock.calls[1][0].data).toMatchObject({
    nyaaMetadataStatus: 'parsed',
    nyaaMetadataFetchedAt: expect.any(Date),
    nyaaMetadataResult: { status: 'unknown' },
  });
});

it.each([404, 410])(
  'marks HTTP %s unavailable without claiming successful parsing',
  async (status) => {
    const { service, prisma, nyaa } = setup();
    nyaa.fetchDetails.mockRejectedValue({ status });
    await service.syncMetadata();
    const data = prisma.torrent.updateMany.mock.calls[1][0].data;
    expect(data).toEqual({
      nyaaMetadataStatus: 'unavailable',
      nyaaMetadataFailures: 1,
      nyaaMetadataRetryAt: null,
    });
  },
);

it('backs off failures durably, continues other records, and releases the running guard', async () => {
  const { service, prisma, nyaa, row } = setup();
  prisma.torrent.findMany.mockResolvedValue([row, { ...row, id: 2 }]);
  nyaa.fetchDetails.mockRejectedValueOnce(new Error('timeout'));
  expect(await service.syncMetadata()).toBe(1);
  expect(prisma.torrent.updateMany.mock.calls[1][0].data).toEqual({
    nyaaMetadataStatus: 'failed',
    nyaaMetadataFailures: 1,
    nyaaMetadataRetryAt: new Date('2026-10-19T00:02:00Z'),
  });
  prisma.torrent.findMany.mockResolvedValue([]);
  expect(await service.syncMetadata()).toBe(0);
});

it.each([403, 429])('pauses the batch on HTTP %s', async (status) => {
  const { service, prisma, nyaa, row } = setup();
  prisma.torrent.findMany.mockResolvedValue([row, { ...row, id: 2 }]);
  nyaa.fetchDetails.mockRejectedValue({ response: { status } });
  expect(await service.syncMetadata()).toBe(0);
  expect(nyaa.fetchDetails).toHaveBeenCalledTimes(1);
  expect(
    prisma.torrent.updateMany.mock.calls[1][0].data.nyaaMetadataRetryAt,
  ).toEqual(new Date('2026-10-19T00:15:00Z'));
});

it('treats invalid HTML as retryable and does not save unvalidated metadata', async () => {
  const { service, prisma } = setup();
  (extractNyaaMetadata as jest.Mock).mockImplementationOnce(() => {
    throw new Error('captcha');
  });
  await service.syncMetadata();
  expect(
    prisma.torrent.updateMany.mock.calls[1][0].data.nyaaMetadataStatus,
  ).toBe('failed');
  expect(prisma.torrent.updateMany.mock.calls[1][0].data).not.toHaveProperty(
    'nyaaMetadata',
  );
});

it('stops taking new work on shutdown', async () => {
  const { service, prisma } = setup();
  service.onApplicationShutdown();
  expect(await service.syncMetadata()).toBe(0);
  expect(prisma.torrent.findMany).not.toHaveBeenCalled();
});

it('does not report a save after another worker takes over an expired lease', async () => {
  const { service, prisma } = setup();
  prisma.torrent.updateMany
    .mockResolvedValueOnce({ count: 1 })
    .mockResolvedValueOnce({ count: 0 });
  expect(await service.syncMetadata()).toBe(0);
});

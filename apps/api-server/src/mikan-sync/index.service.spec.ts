import type { PrismaService } from '../common/prisma.service';
import type { FetchMikanService } from '../fetch-mikan/index.service';
import type { ParseTorrentService } from '../parse-torrent/index.service';
import { MikanSyncService } from './index.service';

jest.mock('@/common/prisma.service', () => ({ PrismaService: jest.fn() }), {
  virtual: true,
});
jest.mock(
  '@/fetch-mikan/index.service',
  () => ({ FetchMikanService: jest.fn() }),
  {
    virtual: true,
  },
);
jest.mock(
  '@/parse-torrent/index.service',
  () => ({ ParseTorrentService: jest.fn() }),
  {
    virtual: true,
  },
);

const item = (hash: string) => ({
  hash,
  link: `https://example.com/${hash}`,
  title: `Torrent ${hash}`,
  torrentLink: `https://example.com/${hash}.torrent`,
  size: BigInt(1024),
  publishDate: new Date('2026-01-01T00:00:00Z'),
});

describe('MikanSyncService', () => {
  const prisma = {
    torrent: { findMany: jest.fn(), createMany: jest.fn() },
  };
  const fetcher = { fetchMikanRSSItems: jest.fn() };
  const parser = { titleToCreateInput: jest.fn() };
  let service: MikanSyncService;

  beforeEach(() => {
    jest.resetAllMocks();
    prisma.torrent.findMany.mockResolvedValue([]);
    prisma.torrent.createMany.mockResolvedValue({ count: 1 });
    fetcher.fetchMikanRSSItems.mockResolvedValue([]);
    parser.titleToCreateInput.mockReturnValue({ episodeIndex: 1 });
    service = new MikanSyncService(
      prisma as unknown as PrismaService,
      fetcher as unknown as FetchMikanService,
      parser as unknown as ParseTorrentService,
    );
  });

  it('does not query or insert an empty feed', async () => {
    expect(await service.syncMikan()).toBe(0);
    expect(prisma.torrent.findMany).not.toHaveBeenCalled();
    expect(prisma.torrent.createMany).not.toHaveBeenCalled();
  });

  it('does not insert or parse hashes already in the database', async () => {
    fetcher.fetchMikanRSSItems.mockResolvedValue([item('old'), item('old')]);
    prisma.torrent.findMany.mockResolvedValue([{ hash: 'old' }]);

    expect(await service.syncMikan()).toBe(0);
    expect(prisma.torrent.createMany).not.toHaveBeenCalled();
    expect(parser.titleToCreateInput).not.toHaveBeenCalled();
  });

  it('inserts only unseen hashes once, preserving the first feed entry', async () => {
    fetcher.fetchMikanRSSItems.mockResolvedValue([
      item('old'),
      item('new'),
      { ...item('new'), title: 'Duplicate entry' },
    ]);
    prisma.torrent.findMany.mockResolvedValue([{ hash: 'old' }]);

    expect(await service.syncMikan()).toBe(1);
    expect(prisma.torrent.findMany).toHaveBeenCalledWith({
      where: { hash: { in: ['old', 'new'] } },
      select: { hash: true },
    });
    expect(prisma.torrent.createMany).toHaveBeenCalledWith({
      data: [
        {
          hash: 'new',
          title: 'Torrent new',
          torrentLink: 'https://example.com/new.torrent',
          size: BigInt(1024),
          publishDate: new Date('2026-01-01T00:00:00Z'),
          episodeIndex: 1,
        },
      ],
      skipDuplicates: true,
    });
    expect(parser.titleToCreateInput).toHaveBeenCalledTimes(1);
    expect(parser.titleToCreateInput).toHaveBeenCalledWith('Torrent new');
  });

  it('deduplicates overlapping history pages before inserting', async () => {
    fetcher.fetchMikanRSSItems.mockImplementation(async (path: string) =>
      path === 'Classic/0' ? [item('old'), item('new')] : [item('new')],
    );
    prisma.torrent.findMany.mockResolvedValue([{ hash: 'old' }]);

    expect(await service.syncMikanHistory()).toBe(1);
    expect(fetcher.fetchMikanRSSItems).toHaveBeenCalledTimes(10);
    expect(prisma.torrent.findMany).toHaveBeenCalledTimes(1);
    expect(prisma.torrent.createMany).toHaveBeenCalledTimes(1);
    expect(prisma.torrent.createMany.mock.calls[0][0].data).toHaveLength(1);
    expect(prisma.torrent.createMany.mock.calls[0][0].data[0].hash).toBe('new');
  });

  it('returns the inserted count when a concurrent sync wins the conflict', async () => {
    fetcher.fetchMikanRSSItems.mockResolvedValue([item('new')]);
    prisma.torrent.createMany.mockResolvedValue({ count: 0 });

    expect(await service.syncMikan()).toBe(0);
    expect(prisma.torrent.createMany.mock.calls[0][0].skipDuplicates).toBe(
      true,
    );
  });
});

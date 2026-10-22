jest.mock('@/config', () => ({
  __esModule: true,
  default: { matching: { enabled: false } },
}));
jest.mock('@/common/prisma.service', () => ({ PrismaService: class {} }));
jest.mock('@/parse-torrent/index.service', () => ({
  ParseTorrentService: class {},
}));
import { TorrentChannel } from '@lani/db';
import { TorrentSyncService } from './index.service';

const item = {
  hash: 'ABC',
  title: 'title',
  torrentLink: 'torrent',
  permalink: 'detail',
  size: 1n,
  publishDate: new Date(),
};
function setup(existing: string[] = []) {
  const prisma: any = {
    $executeRaw: jest.fn(),
    torrent: {
      findMany: jest.fn().mockResolvedValue(existing.map((hash) => ({ hash }))),
      createMany: jest.fn().mockResolvedValue({ count: 1 }),
    },
  };
  prisma.$transaction = (fn) => fn(prisma);
  const parser = {
    titleToCreateInput: jest
      .fn()
      .mockReturnValue({ episodeNumber: '3', parseVersion: 1 }),
  };
  return {
    prisma,
    parser,
    service: new TorrentSyncService(prisma as any, parser as any),
  };
}

describe('shared torrent ingestion', () => {
  it('deduplicates hashes and uses the existing parser for new Nyaa items', async () => {
    const { service, prisma, parser } = setup();
    expect(
      await service.insert(
        [item, { ...item, hash: 'abc' }],
        TorrentChannel.NYAA,
      ),
    ).toBe(1);
    expect(parser.titleToCreateInput).toHaveBeenCalledTimes(1);
    expect(prisma.torrent.createMany).toHaveBeenCalledWith({
      data: [
        {
          ...item,
          hash: 'abc',
          channel: 'NYAA',
          episodeNumber: '3',
          parseVersion: 1,
        },
      ],
      skipDuplicates: true,
    });
  });
  it('does not rewrite existing cross-channel records or backfill old permalinks', async () => {
    const { service, prisma, parser } = setup(['abc']);
    expect(await service.insert([item], TorrentChannel.MIKAN)).toBe(0);
    expect(prisma.torrent.createMany).not.toHaveBeenCalled();
    expect(parser.titleToCreateInput).not.toHaveBeenCalled();
  });
  it('preserves Mikan permalink for new items and propagates database failure', async () => {
    const { service, prisma } = setup();
    prisma.torrent.createMany.mockRejectedValue(new Error('db unavailable'));
    await expect(service.insert([item], TorrentChannel.MIKAN)).rejects.toThrow(
      'db unavailable',
    );
    expect(prisma.torrent.createMany.mock.calls[0][0].data[0].permalink).toBe(
      'detail',
    );
  });
});

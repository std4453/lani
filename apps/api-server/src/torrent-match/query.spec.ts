import { Prisma } from '@lani/db';
import { torrentQuery, TorrentMatchInput } from './query';

const torrent = (
  changes: Partial<TorrentMatchInput> = {},
): TorrentMatchInput => ({
  title: '[Group] Anime S02E03 [1080p]',
  publishDate: new Date('2026-10-21T00:00:00Z'),
  parseResult: {},
  seasonTitleRaw: 'Anime S02',
  seasonTitleAliases: ['Anime S02', '动画 第二季'],
  episodeType: 'EPISODE',
  episodeNumber: new Prisma.Decimal(3),
  episodeNumberFrom: null,
  episodeNumberTo: null,
  ...changes,
});

it('retains the full raw title even when the parser could not extract aliases', () => {
  expect(
    torrentQuery(torrent({ seasonTitleRaw: null, seasonTitleAliases: [] })),
  ).toEqual({
    rawTitle: '[Group] Anime S02E03 [1080p]',
    aliases: [],
    publishedAt: '2026-10-21T00:00:00.000Z',
    episode: 3,
  });
  expect(
    torrentQuery(
      torrent({ title: ' ', seasonTitleRaw: null, seasonTitleAliases: [] }),
    ),
  ).toBeNull();
});

it('projects only an existing finite integer publisher season', () => {
  expect(
    torrentQuery(torrent({ parseResult: { publisherSeason: 2 } })),
  ).toMatchObject({ publisherSeason: 2 });
  expect(torrentQuery(torrent())).not.toHaveProperty('publisherSeason');
  for (const publisherSeason of [
    -1,
    Number.NaN,
    Number.POSITIVE_INFINITY,
    1.5,
    Number.MAX_SAFE_INTEGER + 1,
    '2',
    null,
  ]) {
    expect(
      torrentQuery(torrent({ parseResult: { publisherSeason } })),
    ).not.toHaveProperty('publisherSeason');
  }
});

it('keeps single fractional episode numbers but does not coerce a range or special', () => {
  expect(
    torrentQuery(torrent({ episodeNumber: new Prisma.Decimal('3.5') })),
  ).toMatchObject({ episode: 3.5 });
  expect(
    torrentQuery(
      torrent({
        episodeNumberFrom: new Prisma.Decimal(1),
        episodeNumberTo: new Prisma.Decimal(3),
      }),
    ),
  ).not.toHaveProperty('episode');
  expect(torrentQuery(torrent({ episodeType: 'OVA' }))).not.toHaveProperty(
    'episode',
  );
});

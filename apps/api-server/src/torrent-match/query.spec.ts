import { Prisma } from '@lani/db';
import {
  torrentQuery,
  TorrentMatchInput,
  unsupportedMatchReason,
} from './query';

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

it('bounds the wire title by Unicode code points without modifying stored input', () => {
  const input = torrent({ title: '动画😀'.repeat(1000) });
  const query = torrentQuery(input)!;
  expect([...query.rawTitle]).toHaveLength(2048);
  expect(query.rawTitle).toBe('动画😀'.repeat(682) + '动画');
  expect(input.title).toBe('动画😀'.repeat(1000));
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
  ).toBeNull();
  expect(torrentQuery(torrent({ episodeType: 'OVA' }))).not.toHaveProperty(
    'episode',
  );
});

it.each([
  'Anime S01-S03',
  'Anime Seasons 1 + 2',
  'Anime Seasons 1-3',
  'Anime Season 1 - Season 3',
  '动画 第1-3季',
])('skips explicit multi-season collections: %s', (title) => {
  expect(torrentQuery(torrent({ title }))).toBeNull();
  expect(unsupportedMatchReason(torrent({ title }))).toBe('multiple_seasons');
});
it('keeps a single recap episode and repeated same-season markers', () => {
  expect(torrentQuery(torrent({ title: 'Anime Special 13.5' }))).not.toBeNull();
  expect(torrentQuery(torrent({ title: 'Anime S01-S01 E03' }))).not.toBeNull();
});

it.each(['Season 2 - 05', 'Season 2 -05', 'Season 02 - 5'])(
  'keeps a season followed by an episode in the matcher query: %s',
  (marker) => {
    const input = torrent({
      title: `[ANi] Anime ${marker} [1080P][Baha][CHT]`,
      episodeNumber: new Prisma.Decimal(5),
    });
    expect(torrentQuery(input)).toMatchObject({
      rawTitle: input.title,
      episode: 5,
    });
    expect(unsupportedMatchReason(input)).toBeNull();
  },
);

it.each([
  'Anime (Season 1-4 + OVA + Junior High)',
  'Anime (Season 01-02) [1080p] [Batch]',
  'Anime Season 1-2 BDRip 1080p MKV',
  'Anime [Season 1-3 + Movie] [BD 1080p]',
  'Anime 2nd Season 01-02 [1080p]',
])('keeps unparsed collection ranges out of matcher requests: %s', (title) => {
  const input = torrent({
    title,
    episodeType: null,
    episodeNumber: null,
  });
  expect(torrentQuery(input)).toBeNull();
  expect(unsupportedMatchReason(input)).toBe('multiple_seasons');
});

it('distinguishes episode ranges from missing titles', () => {
  expect(
    unsupportedMatchReason(
      torrent({ episodeNumberFrom: new Prisma.Decimal(1) }),
    ),
  ).toBe('episode_range');
  expect(
    unsupportedMatchReason(
      torrent({ title: ' ', seasonTitleRaw: null, seasonTitleAliases: [' '] }),
    ),
  ).toBe('no_title');
});

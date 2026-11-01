import { Prisma } from '@lani/db';
import { hasNumberEvidence, summarizeNumbers } from './numbers';

const episode = (
  local: number,
  sort: number | null,
  episodeType = 'EPISODE',
) => ({
  episodeType,
  episodeNumber: new Prisma.Decimal(local),
  bangumiSort: sort === null ? null : new Prisma.Decimal(sort),
});

test('summarizes real local/sort numbers, keeps gaps and fractional specials, and ignores missing sorts', () => {
  expect(
    summarizeNumbers([
      episode(3, 16),
      episode(1, 14),
      episode(2, 15),
      episode(2, 15),
      episode(5, 18),
      episode(9, null),
      episode(1, 13.5, 'SP'),
    ]),
  ).toEqual({
    episode: { local: '1-3,5', sort: '14-16,18' },
    sp: { sort: '13.5' },
  });
  expect(summarizeNumbers([episode(1, null)])).toBeUndefined();
});

test('ignores malformed numbers and unrelated episode types', () => {
  expect(
    summarizeNumbers([
      { episodeType: 'EPISODE', bangumiSort: 'NaN', episodeNumber: 1 },
      { episodeType: 'EPISODE', bangumiSort: '-1', episodeNumber: 1 },
      { episodeType: 'EPISODE', bangumiSort: '1.0001', episodeNumber: 1 },
      episode(1, 2, 'OP'),
    ]),
  ).toBeUndefined();
});

test('does not use legacy index or invent a local number from sort', () => {
  expect(
    summarizeNumbers([{ episodeType: 'EPISODE', bangumiSort: 14 }]),
  ).toEqual({ episode: { sort: '14' } });
});

test('preserves decimals without turning an integer range into a continuous interval', () => {
  const numbers = summarizeNumbers([
    episode(1, 1),
    episode(2, 2),
    episode(3, 3),
  ]);
  const query = {
    rawTitle: '动画 1.5',
    aliases: [],
    publishedAt: '2026-10-01Z',
    episode: 1.5,
  };
  expect(hasNumberEvidence(numbers, query)).toBe(false);
  expect(hasNumberEvidence(summarizeNumbers([episode(1.5, 1.5)]), query)).toBe(
    true,
  );
  expect(hasNumberEvidence(numbers, { ...query, episode: 2 })).toBe(true);
});

test.each(['SP01', 'Special 01', 'OVA 01', 'OAD 01', 'Recap 01', '特别篇 01'])(
  'requires sp.sort for %s',
  (suffix) => {
    const query = {
      rawTitle: `动画 ${suffix}`,
      aliases: [],
      publishedAt: '2026-10-01Z',
      episode: 1,
    };
    expect(
      hasNumberEvidence({ episode: { local: '1-12', sort: '14-25' } }, query),
    ).toBe(false);
    expect(hasNumberEvidence({ sp: { sort: '1' } }, query)).toBe(true);
  },
);

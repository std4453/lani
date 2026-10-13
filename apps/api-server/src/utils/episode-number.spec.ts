import { Prisma } from '@lani/db';
import { episodeLabel, jellyfinNumber } from './episode-number';

const old = {
  id: 123,
  index: 7,
  episodeType: 'EPISODE' as const,
  episodeNumber: null,
};
it('preserves historical integer media names', () => {
  expect(jellyfinNumber(old)).toEqual({ season: 1, index: 7 });
  expect(episodeLabel(old)).toBe('7');
});
it('keeps decimal numbering intact and derives a stable integer media identity', () => {
  const episode = {
    ...old,
    index: null,
    episodeNumber: new Prisma.Decimal('12.5'),
  };
  expect(episodeLabel(episode)).toBe('12.5');
  expect(jellyfinNumber(episode)).toEqual({ season: 0, index: 123 });
  expect(
    jellyfinNumber({ ...episode, episodeNumber: new Prisma.Decimal('13.5') }),
  ).toEqual(jellyfinNumber(episode));
});
it('separates SP1 from ordinary episode 1', () => {
  const episode = {
    ...old,
    episodeType: 'SP' as const,
    index: null,
    episodeNumber: new Prisma.Decimal(1),
  };
  expect(episodeLabel(episode)).toBe('SP 1');
  expect(jellyfinNumber(episode)).toEqual({ season: 0, index: 123 });
});

import { Episode, Prisma } from '@lani/db';

type NumberedEpisode = Pick<
  Episode,
  'id' | 'index' | 'episodeType' | 'episodeNumber'
>;

export function episodeNumber(episode: NumberedEpisode): Prisma.Decimal | null {
  return (
    episode.episodeNumber ??
    (episode.index == null ? null : new Prisma.Decimal(episode.index))
  );
}

export function episodeLabel(episode: NumberedEpisode): string {
  const number = episodeNumber(episode)?.toString();
  return episode.episodeType === 'EPISODE'
    ? number ?? '-'
    : `${episode.episodeType}${number == null ? '' : ` ${number}`}`;
}

// Jellyfin uses integer season/episode numbers. Keep ordinary filenames intact;
// use the stable local identity in Season 0 for fractional/special episodes.
// This is a media adapter, not the source numbering or the UI sort order.
export function jellyfinNumber(episode: NumberedEpisode) {
  const number = episodeNumber(episode);
  if (episode.episodeType === 'EPISODE' && number?.isInteger()) {
    return { season: 1, index: number.toNumber() };
  }
  return { season: 0, index: episode.id };
}

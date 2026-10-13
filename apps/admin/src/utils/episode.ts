export interface EpisodeInfo {
  type: string;
  index?: string | number | { from: string | number; to: string | number };
}
export interface EpisodeNumbering {
  type: string;
  number: string | null;
  sort: string | null;
}
export function formatNumber(value: string | number) {
  return String(value).replace(/(\.\d*?[1-9])0+$|\.0+$/, '$1');
}
export function formatEpisode(info?: EpisodeInfo | null): string {
  if (!info) return '-';
  const prefix = info.type === 'episode' ? '' : info.type.toUpperCase();
  const number = info.index;
  const text =
    number === null || number === undefined
      ? ''
      : typeof number === 'object'
      ? `${formatNumber(number.from)}–${formatNumber(number.to)}`
      : formatNumber(number);
  return [prefix, text].filter(Boolean).join(' ') || '-';
}
export function formatNumbering(numbering?: EpisodeNumbering | null) {
  return formatEpisode(
    numbering
      ? { type: numbering.type, index: numbering.number ?? undefined }
      : null,
  );
}
export function compareEpisodes(
  a: { id: number; numbering?: EpisodeNumbering | null },
  b: { id: number; numbering?: EpisodeNumbering | null },
) {
  const rank = (type?: string) =>
    ({ episode: 0, sp: 1, ova: 2, oad: 3 }[type ?? 'episode'] ?? 4);
  const value = (e: typeof a) =>
    Number(e.numbering?.sort ?? e.numbering?.number ?? Infinity);
  return (
    rank(a.numbering?.type) - rank(b.numbering?.type) ||
    value(a) - value(b) ||
    a.id - b.id
  );
}

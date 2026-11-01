import { EpisodeNumbers, MatchQuery } from './protocol';

export interface NumberedEpisode {
  episodeType: string;
  episodeNumber?: number | string | { toString(): string } | null;
  bangumiSort?: number | string | { toString(): string } | null;
}

function number(value: NumberedEpisode['bangumiSort']): number | undefined {
  if (value == null) return undefined;
  const text = String(value);
  if (!/^\d{1,7}(?:\.\d{1,3})?$/.test(text)) return undefined;
  return Number(text);
}

function compress(values: number[]): string {
  const sorted = [...new Set(values)].sort((a, b) => a - b);
  const ranges: string[] = [];
  for (let i = 0; i < sorted.length; i++) {
    const start = sorted[i];
    let end = start;
    while (
      Number.isInteger(end) &&
      i + 1 < sorted.length &&
      sorted[i + 1] === end + 1
    ) {
      end = sorted[++i];
    }
    ranges.push(start === end ? String(start) : `${start}-${end}`);
  }
  return ranges.join(',');
}

/** 只有真实 Bangumi sort 才提供编号证据，不从旧 index 或已同步数量推算。 */
export function summarizeNumbers(
  episodes: NumberedEpisode[],
): EpisodeNumbers | undefined {
  const local: number[] = [];
  const sort: number[] = [];
  const sp: number[] = [];
  for (const episode of episodes) {
    const order = number(episode.bangumiSort);
    if (order === undefined) continue;
    if (episode.episodeType === 'EPISODE') {
      sort.push(order);
      const index = number(episode.episodeNumber);
      if (index !== undefined) local.push(index);
    } else if (episode.episodeType === 'SP') sp.push(order);
  }
  if (!sort.length && !sp.length) return undefined;
  return {
    ...(sort.length
      ? {
          episode: {
            ...(local.length ? { local: compress(local) } : {}),
            sort: compress(sort),
          },
        }
      : {}),
    ...(sp.length ? { sp: { sort: compress(sp) } } : {}),
  };
}

function contains(range: string | undefined, value: number): boolean {
  return !!range?.split(',').some((part) => {
    const [start, end] = part.split('-').map(Number);
    // 合并范围只包括整数，小数必须由独立条目明确列出。
    return end === undefined
      ? value === start
      : Number.isInteger(value) && start <= value && value <= end;
  });
}

const special =
  /\b(?:SP\d*|Specials?|OVA|OAD|Recap)\b|特别篇|特別篇|特別編|总集篇|總集篇|総集編/i;

export function hasNumberEvidence(
  numbers: EpisodeNumbers | undefined,
  query: MatchQuery,
): boolean {
  if (!numbers || query.episode == null || !Number.isFinite(query.episode))
    return false;
  if (contains(numbers.sp?.sort, query.episode)) return true;
  if (special.test(query.rawTitle)) return false;
  return (
    contains(numbers.episode?.local, query.episode) ||
    contains(numbers.episode?.sort, query.episode)
  );
}

import { createHash } from 'crypto';
import { CatalogSnapshot, CatalogState, MatchQuery } from './protocol';

export const digest = (value: unknown) =>
  createHash('sha256').update(JSON.stringify(value)).digest('hex');
const compare = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);

function validPremiereDate(value: string | null | undefined) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value) || value.startsWith('0000'))
    return null;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === value
    ? value
    : null;
}

export function snapshot(
  rows: {
    id: number;
    title: string;
    aliases: string[];
    yearAndSemester: string;
    declaredEpisodeCount?: number | null;
    premiereDate?: string | null;
  }[],
): CatalogSnapshot {
  const catalog = rows
    .map((row) => {
      const match = /^(\d{4})0([1-4])$/.exec(row.yearAndSemester);
      return {
        id: String(row.id),
        title: row.title,
        declaredEpisodeCount:
          Number.isSafeInteger(row.declaredEpisodeCount) &&
          row.declaredEpisodeCount! > 0
            ? row.declaredEpisodeCount!
            : null,
        premiereDate: validPremiereDate(row.premiereDate),
        aliases: [...new Set(row.aliases)].sort(compare),
        year: match ? Number(match[1]) : null,
        quarter: match
          ? ({ 1: 2, 2: 3, 3: 4, 4: 1 }[Number(match[2])] as number)
          : null,
      };
    })
    .sort((a, b) => compare(a.id, b.id));
  return { version: digest(catalog), catalog };
}

export function observeCatalog(
  previous: CatalogState | null,
  desired: CatalogSnapshot,
  now: Date,
  debounceMs: number,
): CatalogState {
  if (previous?.desired.version === desired.version) return previous;
  return {
    schemaVersion: 1,
    active: previous?.active ?? null,
    desired,
    changedAt: now.toISOString(),
    // 首次快照立即初始化；后续实际内容变化从最后一次检测起等待配置的静默窗口。
    dueAt: new Date(now.getTime() + (previous ? debounceMs : 0)).toISOString(),
  };
}

export interface CandidatePolicy {
  timezone: string;
  previousQuarters: number;
  nextQuarters: number;
}
export function validatePolicy(policy: CandidatePolicy) {
  new Intl.DateTimeFormat('en', { timeZone: policy.timezone }).format();
  for (const number of [policy.previousQuarters, policy.nextQuarters]) {
    if (!Number.isInteger(number) || number < 0 || number > 8)
      throw new Error(
        'Adjacent quarter count must be an integer between 0 and 8',
      );
  }
}

export function candidateSeasons(
  catalog: CatalogSnapshot,
  query: MatchQuery,
  policy: CandidatePolicy,
) {
  const date = new Date(query.publishedAt);
  if (!Number.isFinite(date.getTime()))
    throw new Error('Invalid torrent publication date');
  const parts = new Intl.DateTimeFormat('en', {
    timeZone: policy.timezone,
    year: 'numeric',
    month: 'numeric',
  }).formatToParts(date);
  const year = Number(parts.find((part) => part.type === 'year')!.value);
  const month = Number(parts.find((part) => part.type === 'month')!.value);
  const quarterIndex = year * 4 + Math.floor((month - 1) / 3);
  return catalog.catalog.filter((season) => {
    if (season.year === null || season.quarter === null) return false;
    const index = season.year * 4 + season.quarter - 1;
    return (
      index >= quarterIndex - policy.previousQuarters &&
      index <= quarterIndex + policy.nextQuarters
    );
  });
}

export function catalogReady(state: CatalogState | null) {
  // 任一季度都可能成为回退候选，窗口外变化也必须先激活完整新快照。
  return !!state?.active && state.active.version === state.desired.version;
}

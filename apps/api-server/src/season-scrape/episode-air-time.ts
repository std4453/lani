import type { BangumiDataSchedule } from './bangumi-data/BangumiDataService';
import type { SeasonEpisode } from './index.model';

const UTC_PLUS_8_MS = 8 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;
const FALLBACK_MINUTES = 23 * 60;

export interface EpisodeClock {
  minutes: number;
  dayOffset: number;
}

function makeUtcDate(year: number, month: number, day: number): Date {
  const date = new Date(0);
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCFullYear(year, month - 1, day);
  return date;
}

function parseClock(value: string): number | undefined {
  const match = /^(\d{2}):(\d{2})$/.exec(value);
  if (!match) return undefined;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (minutes > 59) return undefined;
  return hours * 60 + minutes;
}

function parseIsoDate(value: string): Date | undefined {
  const match =
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d+)?(Z|[+-]\d{2}:\d{2})$/.exec(
      value,
    );
  if (!match) return undefined;
  const [, year, month, day, hour, minute, second, zone] = match;
  const calendarDate = makeUtcDate(+year, +month, +day);
  if (
    calendarDate.getUTCFullYear() !== +year ||
    calendarDate.getUTCMonth() !== +month - 1 ||
    calendarDate.getUTCDate() !== +day ||
    +hour > 23 ||
    +minute > 59 ||
    +second > 59
  ) {
    return undefined;
  }
  if (zone !== 'Z') {
    if (+zone.slice(1, 3) > 23 || +zone.slice(4, 6) > 59) return undefined;
  }
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? new Date(timestamp) : undefined;
}

function parseAirDate(value: string | undefined): Date | undefined {
  if (!value || !/^\d{8}$/.test(value)) return undefined;
  const year = Number(value.slice(0, 4));
  const month = Number(value.slice(4, 6));
  const day = Number(value.slice(6, 8));
  const date = makeUtcDate(year, month, day);
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return undefined;
  }
  return date;
}

function isMainEpisode(episode: SeasonEpisode): boolean {
  if (episode.episodeType && episode.episodeType !== 'EPISODE') return false;
  return episode.episodeNumber != null
    ? Number(episode.episodeNumber) === 1
    : episode.index === 1;
}

function getScheduleDayOffset(
  episodes: readonly SeasonEpisode[],
  begin: string,
): number {
  const firstEpisodeDates = new Set(
    episodes
      .filter(isMainEpisode)
      .map((episode) => parseAirDate(episode.airDate))
      .filter((date): date is Date => date !== undefined)
      .map((date) => date.getTime()),
  );
  if (firstEpisodeDates.size !== 1) return 0;

  // Bangumi日期常是节目日；固定UTC+8后，begin日期可能与episode.airDate相差一天。
  // 这里只用begin作日期锚，不推断先行放送或停播造成的偏移。
  const beginDate = parseIsoDate(begin);
  if (!beginDate) return 0;
  const beginUtcPlus8Date = new Date(beginDate.getTime() + UTC_PLUS_8_MS);
  const episodeDate = new Date(
    firstEpisodeDates.values().next().value as number,
  );
  const dayOffset = Math.round(
    (makeUtcDate(
      beginUtcPlus8Date.getUTCFullYear(),
      beginUtcPlus8Date.getUTCMonth() + 1,
      beginUtcPlus8Date.getUTCDate(),
    ).getTime() -
      episodeDate.getTime()) /
      DAY_MS,
  );
  return Math.abs(dayOffset) <= 1 ? dayOffset : 0;
}

export function resolveEpisodeClock(
  airTime: string,
  episodes: readonly SeasonEpisode[],
  schedule?: BangumiDataSchedule,
): EpisodeClock {
  const manualMinutes = parseClock(airTime);
  if (manualMinutes !== undefined) {
    return { minutes: manualMinutes, dayOffset: 0 };
  }

  if (schedule) {
    const broadcastAt = parseIsoDate(schedule.broadcastAt);
    if (broadcastAt) {
      const local = new Date(broadcastAt.getTime() + UTC_PLUS_8_MS);
      return {
        minutes: local.getUTCHours() * 60 + local.getUTCMinutes(),
        dayOffset: getScheduleDayOffset(episodes, schedule.begin),
      };
    }
  }

  return { minutes: FALLBACK_MINUTES, dayOffset: 0 };
}

export function getEpisodeAirTime(
  clock: EpisodeClock,
  airDate: string | undefined,
): Date | null {
  const date = parseAirDate(airDate);
  if (
    !date ||
    !Number.isFinite(clock.minutes) ||
    !Number.isInteger(clock.dayOffset)
  ) {
    return null;
  }
  const localDateTime =
    date.getTime() + clock.dayOffset * DAY_MS + clock.minutes * 60 * 1000;
  return new Date(localDateTime - UTC_PLUS_8_MS);
}

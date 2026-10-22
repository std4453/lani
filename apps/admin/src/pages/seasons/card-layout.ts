import {
  CardSeasonFieldsFragment,
  ListSeasonCardsQueryVariables,
} from '@/generated/types';
import { compareEpisodes, EpisodeNumbering } from '@/utils/episode';
import {
  calcEpisodeStatus,
  EPISODE_STATUS_TAGS,
  EpisodeStatus,
} from '@/constants/download-status';

export const CARD_PAGE_SIZE = 30;
export const CARD_EPISODE_LIMIT = 14;

export function cardQueryVariables(
  page: number,
  keyword: string,
): ListSeasonCardsQueryVariables {
  const title = keyword.trim();
  return {
    first: CARD_PAGE_SIZE,
    offset: (page - 1) * CARD_PAGE_SIZE,
    // 后端拒绝显式 null 或空对象；清空搜索时必须省略 filter。
    ...(title ? { filter: { title: { includesInsensitive: title } } } : {}),
  };
}

type NumberedEpisode = {
  id: number;
  numbering?: EpisodeNumbering | null;
  airTime?: string | null;
};

// 与 latestMainEpisode 一样，取正片中编号排序最后的已放送集。
// 区间以实际集号划分，避免 .5 集或缺少元数据的集数把后续季度整体错位。
export function selectEpisodeWindow<T extends NumberedEpisode>(
  episodes: T[],
  now = Date.now(),
): T[] {
  const main = episodes
    .filter((episode) => episode.numbering?.type === 'episode')
    .sort(compareEpisodes);
  if (!main.length) return [];
  const numbered = main.map((episode, index) => ({
    episode,
    number:
      Number(episode.numbering?.number) > 0
        ? Number(episode.numbering?.number)
        : index + 1,
  }));
  const aired = numbered.filter(
    ({ episode }) =>
      episode.airTime && new Date(episode.airTime).getTime() <= now,
  );
  const latest = aired[aired.length - 1] ?? numbered[0];
  const lastNumber = Math.max(...numbered.map(({ number }) => number));
  let start = Math.floor((Math.ceil(latest.number) - 1) / 12) * 12;
  // 只有整部番最后的 1–2 集才并入前一段；连续多季的第 13/25 集仍开始新段。
  if (start > 0 && lastNumber <= start + 2) start -= 12;
  const end = lastNumber <= start + 14 ? start + 14 : start + 12;
  const window = numbered.filter(
    ({ number }) => number > start && number <= end,
  );
  // 正片中可能有 .5 集；极端情况下也保证最新集可见且总数不超过 14。
  const latestIndex = window.findIndex(
    ({ episode }) => episode.id === latest.episode.id,
  );
  const offset = Math.max(0, latestIndex - CARD_EPISODE_LIMIT + 1);
  return window
    .slice(offset, offset + CARD_EPISODE_LIMIT)
    .map(({ episode }) => episode);
}

// 最后一行允许 7–8 集，避免为一两个方块单独增加一行。
export function episodeRows<T>(episodes: T[]): T[][] {
  const visible = episodes.slice(0, CARD_EPISODE_LIMIT);
  const rows: T[][] = [];
  while (visible.length) {
    const size = visible.length <= 8 ? visible.length : 6;
    rows.push(visible.splice(0, size));
  }
  return rows;
}

export function episodeColor(status: EpisodeStatus, monitoring: boolean) {
  if (
    !monitoring &&
    (status === 'RESOURCE_WAITING' || status === 'RESOURCE_MISSING')
  ) {
    return undefined;
  }
  return EPISODE_STATUS_TAGS[status].color;
}

export function cardEpisodeStatus(
  episode: NonNullable<
    CardSeasonFieldsFragment['mainEpisodes']['edges'][number]['node']
  >,
): EpisodeStatus {
  if (episode.jellyfinEpisodeId) return 'AVAILABLE';
  const task = episode.latestTask.nodes[0];
  if (task) {
    const status = task.statusSummary;
    return status &&
      Object.prototype.hasOwnProperty.call(EPISODE_STATUS_TAGS, status)
      ? (status as EpisodeStatus)
      : 'UNKNOWN';
  }
  return calcEpisodeStatus({ ...episode, tasks: { edges: [] } }).status;
}

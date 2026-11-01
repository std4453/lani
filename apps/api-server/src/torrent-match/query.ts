import { hasMultipleSeasons } from '@lani/parse-torrent-title';
import { Torrent } from '@lani/db';
import { MatchQuery } from './protocol';

export type TorrentMatchInput = Pick<
  Torrent,
  | 'title'
  | 'parseResult'
  | 'seasonTitleAliases'
  | 'seasonTitleRaw'
  | 'publishDate'
  | 'episodeType'
  | 'episodeNumber'
  | 'episodeNumberFrom'
  | 'episodeNumberTo'
>;

export function torrentQuery(torrent: TorrentMatchInput): MatchQuery | null {
  // 单集季度匹配不消费解析出的范围或明确跨季合集。
  if (torrent.episodeNumberFrom != null || torrent.episodeNumberTo != null)
    return null;
  if (hasMultipleSeasons(torrent.title)) return null;
  const aliases = [
    ...new Set(
      [torrent.seasonTitleRaw ?? '', ...torrent.seasonTitleAliases]
        .map((v) => v.trim())
        .filter(Boolean),
    ),
  ];
  if (!torrent.title.trim() && !aliases.length) return null;
  const single =
    torrent.episodeType === 'EPISODE' &&
    torrent.episodeNumber != null &&
    torrent.episodeNumberFrom == null &&
    torrent.episodeNumberTo == null;
  const episode = single ? Number(torrent.episodeNumber) : undefined;
  // 只传已有的解析信号；发布者季数与公历季度、目录分部编号相互独立。
  const parsed = torrent.parseResult;
  const season =
    parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? parsed.publisherSeason
      : undefined;
  const publisherSeason =
    typeof season === 'number' && Number.isSafeInteger(season) && season >= 0
      ? season
      : undefined;
  return {
    rawTitle: [...torrent.title].slice(0, 2048).join(''),
    aliases,
    publishedAt: torrent.publishDate.toISOString(),
    ...(episode !== undefined && Number.isFinite(episode) ? { episode } : {}),
    ...(publisherSeason !== undefined ? { publisherSeason } : {}),
  };
}

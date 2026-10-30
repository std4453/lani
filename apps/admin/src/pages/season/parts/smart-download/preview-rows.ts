import {
  Decision,
  SmartEpisode,
  SmartTorrent,
  SmartDownloadSettings,
  evaluateTorrents,
  isMainEpisode,
} from '@lani/smart-download';
const timestamp = (value: string | null) =>
  value === null ? NaN : Date.parse(value);

/** 时间相同使用 ID 作为第二排序键，避免分页重叠或漏项。 */
export function compareTorrents(a: SmartTorrent, b: SmartTorrent): number {
  return Date.parse(a.publishDate) - Date.parse(b.publishDate) || a.id - b.id;
}

export interface PreviewRelease {
  at: number;
  episodeIds: number[];
  label: string;
}
export interface PreviewRow {
  key: string;
  torrent?: SmartTorrent;
  decision?: Decision;
  release?: PreviewRelease;
  precedingReleaseAt?: number;
}
export function formatEpisodeNumbers(numbers: number[]): string {
  const sorted = [...new Set(numbers)].sort((a, b) => a - b);
  const groups: string[] = [];
  for (let i = 0; i < sorted.length; i++) {
    const start = sorted[i];
    while (i + 1 < sorted.length && sorted[i + 1] === sorted[i] + 1) i++;
    groups.push(start === sorted[i] ? `${start}` : `${start}-${sorted[i]}`);
  }
  return `#${groups.join(',')} 发布`;
}

export function episodeReleases(
  episodes: readonly SmartEpisode[],
): PreviewRelease[] {
  const groups = new Map<number, SmartEpisode[]>();
  for (const episode of episodes.filter(isMainEpisode)) {
    const at = timestamp(episode.airTime);
    if (Number.isFinite(at))
      groups.set(at, [...(groups.get(at) ?? []), episode]);
  }
  return [...groups]
    .sort((a, b) => a[0] - b[0])
    .map(([at, group]) => ({
      at,
      episodeIds: group.map((episode) => episode.id),
      label: formatEpisodeNumbers(group.map((episode) => episode.number!)),
    }));
}

/** 正序时间线只标记已读取范围内的事件，未取完整的尾部区间暂时置灰。 */
export function previewRows(
  episodes: readonly SmartEpisode[],
  torrents: readonly SmartTorrent[],
  settings: SmartDownloadSettings,
  now: number,
  excludes: readonly string[],
  coverage: { from: number; through: number; completeUntil: number },
): PreviewRow[] {
  const ordered = [...torrents].sort(compareTorrents);
  const decisions = new Map(
    evaluateTorrents(episodes, ordered, settings, now, excludes).map((d) => [
      d.torrentId,
      d,
    ]),
  );
  const releases = episodeReleases(episodes);
  const rows: PreviewRow[] = ordered.map((torrent) => ({
    key: `torrent-${torrent.id}`,
    torrent,
    decision: decisions.get(torrent.id),
  }));
  let index = 0;
  for (const row of rows) {
    const at = timestamp(row.torrent!.publishDate);
    while (index < releases.length && releases[index].at <= at) index++;
    row.precedingReleaseAt = releases[index - 1]?.at;
  }
  const emptyTimes = new Map<string, number>();
  for (let i = 0; i < releases.length; i++) {
    const release = releases[i];
    // 首集尚未发布时仍保留定位点，其他未来剧集不提前展示空区间。
    if (
      release.at < coverage.from ||
      release.at > coverage.through ||
      (release.at > now && i > 0)
    )
      continue;
    const next = releases[i + 1]?.at ?? Infinity;
    const first = rows.find(
      (row) =>
        row.torrent &&
        timestamp(row.torrent.publishDate) >= release.at &&
        timestamp(row.torrent.publishDate) < next,
    );
    if (first) first.release = release;
    else if (release.at < coverage.completeUntil) {
      const key = `release-${release.episodeIds.join('-')}`;
      rows.push({ key, release, precedingReleaseAt: release.at });
      emptyTimes.set(key, release.at);
    }
  }
  return rows.sort((a, b) => {
    const time = (row: PreviewRow) =>
      row.torrent
        ? timestamp(row.torrent.publishDate)
        : emptyTimes.get(row.key)!;
    return time(a) - time(b) || (a.torrent?.id ?? 0) - (b.torrent?.id ?? 0);
  });
}

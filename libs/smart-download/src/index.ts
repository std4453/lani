export type SubtitleRequirement = "chinese" | "chinese-or-english" | "any";
export interface SmartDownloadSettings {
  subtitle: SubtitleRequirement;
  preferBaha: boolean;
  windowHours: number;
  timeoutMinutes: number | null;
}
export const defaultSettings: SmartDownloadSettings = {
  subtitle: "chinese",
  preferBaha: false,
  windowHours: 48,
  timeoutMinutes: 120,
};
export interface SmartEpisode {
  id: number;
  type: string;
  number: number | null;
  sort: number | null;
  airTime: string | null;
}
export interface SmartTorrent {
  id: number;
  hash: string;
  title: string;
  publishDate: string;
  episodeInfo?: { type?: string; index?: unknown } | null;
  subtitleInfo?: { languages: string[] } | null;
  sourceType?: string | null;
  ready?: boolean;
}
export type ExclusionReason =
  | "episode"
  | "time"
  | "subtitle"
  | "title"
  | "baha"
  | "before-first"
  | "pending";
export interface Decision {
  torrentId: number;
  episodeId?: number;
  baha: boolean;
  reasons: ExclusionReason[];
}
export function validateSettings(settings: SmartDownloadSettings): void {
  if (!["chinese", "chinese-or-english", "any"].includes(settings.subtitle))
    throw new Error("请选择有效的字幕要求");
  if (
    !Number.isInteger(settings.windowHours) ||
    settings.windowHours < 1 ||
    settings.windowHours > 168
  )
    throw new Error("下载窗口必须是 1 至 168 小时的整数");
  if (
    settings.timeoutMinutes != null &&
    (!Number.isInteger(settings.timeoutMinutes) || settings.timeoutMinutes < 0)
  )
    throw new Error("下载超时必须是非负整数或留空");
}
export function titleRule(pattern: string): RegExp {
  // 配置接受 /pattern/flags 和普通正则字符串；禁止有状态的 g/y 标志。
  const literal = pattern.match(/^\/(.*)\/([a-z]*)$/s);
  const expression = literal ? literal[1] : pattern;
  const flags = literal ? literal[2] : "";
  if (/[gy]/.test(flags)) throw new Error("屏蔽规则不支持 g 或 y 标志");
  return new RegExp(expression, flags);
}
export function isMainEpisode(episode: SmartEpisode): boolean {
  return (
    episode.type.toLowerCase() === "episode" &&
    episode.number != null &&
    Number.isInteger(episode.number) &&
    episode.number > 0
  );
}
export function isCollection(torrent: SmartTorrent): boolean {
  const index = torrent.episodeInfo?.index;
  return index != null && typeof index === "object";
}
export function isBaha(torrent: Pick<SmartTorrent, "title">): boolean {
  return /baha/i.test(torrent.title);
}
function timestamp(value: string | null): number {
  return value == null ? NaN : Date.parse(value);
}
export function evaluateTorrents(
  episodes: readonly SmartEpisode[],
  torrents: readonly SmartTorrent[],
  settings: SmartDownloadSettings,
  now: number,
  excludes: readonly string[] = []
): Decision[] {
  const rules = excludes.map(titleRule);
  const main = episodes.filter(isMainEpisode);
  const first = Math.min(
    ...main.map((episode) => timestamp(episode.airTime)).filter(Number.isFinite)
  );
  const decisions = torrents.map((torrent): Decision => {
    const reasons: ExclusionReason[] = [];
    if (torrent.ready === false) reasons.push("pending");
    const baha = isBaha(torrent);
    const published = timestamp(torrent.publishDate);
    const info = torrent.episodeInfo;
    const raw = info?.index;
    const number =
      typeof raw === "number" || (typeof raw === "string" && /^\d+$/.test(raw))
        ? Number(raw)
        : NaN;
    // 全季度消歧，再检查时间。不能让窗口隐藏编号冲突。
    const targets = main.filter(
      (episode) => episode.number === number || episode.sort === number
    );
    const target =
      info?.type === "episode" &&
      Number.isInteger(number) &&
      number > 0 &&
      targets.length === 1
        ? targets[0]
        : undefined;
    if (!target) reasons.push("episode");
    if (Number.isFinite(first) && published < first) {
      // 第一集之前的资源整体置灰，不额外将字段标红。
      return {
        torrentId: torrent.id,
        episodeId: target?.id,
        baha,
        reasons: ["before-first"],
      };
    }
    if (
      !Number.isFinite(published) ||
      published > now ||
      (target &&
        (!Number.isFinite(timestamp(target.airTime)) ||
          timestamp(target.airTime) > now ||
          published < timestamp(target.airTime) ||
          published - timestamp(target.airTime) >
            settings.windowHours * 3600000))
    )
      reasons.push("time");
    const languages = torrent.subtitleInfo?.languages ?? [];
    const chinese =
      baha ||
      languages.some(
        (language) => language === "zh" || language.startsWith("zh-")
      );
    if (
      (settings.subtitle === "chinese" && !chinese) ||
      (settings.subtitle === "chinese-or-english" &&
        !chinese &&
        !languages.includes("en"))
    )
      reasons.push("subtitle");
    if (
      rules.some((rule) => rule.test(torrent.title)) ||
      ["BD", "BDRIP", "DVD", "DVDRIP"].includes(
        torrent.sourceType?.toUpperCase() ?? ""
      ) ||
      /(?:(?:\d|\b)v[2-9]\d*\b|\brepack\b|\bproper\b|修正|修复)/i.test(
        torrent.title
      )
    )
      reasons.push("title");
    return { torrentId: torrent.id, episodeId: target?.id, baha, reasons };
  });
  if (settings.preferBaha) {
    const preferred = new Set(
      decisions
        .filter((d) => d.baha && !d.reasons.length)
        .map((d) => d.episodeId)
    );
    for (const decision of decisions)
      if (!decision.baha && preferred.has(decision.episodeId))
        decision.reasons.push("baha");
  }
  return decisions;
}

/** 时间相同使用 ID 作为第二排序键，避免分页重叠或漏项。 */
export function compareTorrents(a: SmartTorrent, b: SmartTorrent): number {
  return Date.parse(a.publishDate) - Date.parse(b.publishDate) || a.id - b.id;
}

export interface PreviewRow {
  key: string;
  torrent?: SmartTorrent;
  decision?: Decision;
  release?: string;
}
export function formatEpisodeNumbers(numbers: number[]): string {
  const sorted = [...new Set(numbers)].sort((a, b) => a - b);
  const groups: string[] = [];
  for (let i = 0; i < sorted.length; i++) {
    const start = sorted[i];
    while (i + 1 < sorted.length && sorted[i + 1] === sorted[i] + 1) i++;
    groups.push(start === sorted[i] ? `${start}` : `${start}-${sorted[i]}`);
  }
  return `#${groups.join(",")} 发布`;
}

/** 只展示完整获取的发布区间；未取完整的旧区间暂时置灰。 */
export function previewRows(
  episodes: readonly SmartEpisode[],
  torrents: readonly SmartTorrent[],
  settings: SmartDownloadSettings,
  now: number,
  excludes: readonly string[],
  completeSince: number
): PreviewRow[] {
  if (!torrents.length) return [];
  const ordered = [...torrents].sort((a, b) => -compareTorrents(a, b));
  const decisions = new Map(
    evaluateTorrents(episodes, ordered, settings, now, excludes).map((d) => [
      d.torrentId,
      d,
    ])
  );
  const rows: PreviewRow[] = ordered.map((torrent) => ({
    key: `torrent-${torrent.id}`,
    torrent,
    decision:
      Date.parse(torrent.publishDate) < completeSince
        ? {
            torrentId: torrent.id,
            baha: isBaha(torrent),
            reasons: ["before-first"],
          }
        : decisions.get(torrent.id),
  }));
  const releases = new Map<number, number[]>();
  for (const episode of episodes.filter(isMainEpisode)) {
    const at = timestamp(episode.airTime);
    if (!Number.isFinite(at) || at > now || at < completeSince) continue;
    releases.set(at, [...(releases.get(at) ?? []), episode.number!]);
  }
  // 在各个发布区间内找到最早的种子，空区间独立补行。
  let next = Infinity;
  const emptyTimes = new Map<string, number>();
  for (const [at, numbers] of [...releases].sort((a, b) => b[0] - a[0])) {
    const interval = rows.filter(
      (row) =>
        row.torrent &&
        Date.parse(row.torrent.publishDate) >= at &&
        Date.parse(row.torrent.publishDate) < next
    );
    const release = formatEpisodeNumbers(numbers);
    if (interval.length) interval[interval.length - 1].release = release;
    else {
      const key = `release-${at}`;
      rows.push({ key, release });
      emptyTimes.set(key, at);
    }
    next = at;
  }
  return rows.sort((a, b) => {
    const time = (row: PreviewRow) =>
      row.torrent
        ? Date.parse(row.torrent.publishDate)
        : emptyTimes.get(row.key)!;
    return time(b) - time(a) || (b.torrent?.id ?? 0) - (a.torrent?.id ?? 0);
  });
}

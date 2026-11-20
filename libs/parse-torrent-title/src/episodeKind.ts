import { EpisodeInfo } from "./types";

/** S00 表示非正片；S01E00 等第零话不属于这一信号。 */
export function hasSeasonZero(title: string): boolean {
  return /(?<![A-Za-z0-9])S0+(?=[ ._-]*E\d|[^A-Za-z0-9]|$)/i.test(title);
}

/** 只消费独立发行标签，避免把作品名中的 Special、OVA 等词当作片种。 */
export function explicitEpisodeKind(
  title: string
): Exclude<EpisodeInfo["type"], "episode"> | undefined {
  if (hasSeasonZero(title)) return "sp";
  const token = title.match(
    /(?:\[(特别篇|特別篇|特別編|SP|OVA|OAD)\]|【(特别篇|特別篇|特別編|SP|OVA|OAD)】)/i
  );
  const kind = (token?.[1] ?? token?.[2])?.toLowerCase();
  return kind === undefined
    ? undefined
    : kind === "ova" || kind === "oad"
    ? kind
    : "sp";
}

/** 明确附带短篇的混合包不作为普通单集；独立短篇作品仍可有自己的正片。 */
export function isMixedEpisodePackage(title: string): boolean {
  return /(?:\d+(?:\.\d+)?\s*[+＋]\s*|附(?:赠|贈)?\s*)(?:小剧场|小劇場|SP\b|Mini\b|Omake\b)/i.test(
    title
  );
}

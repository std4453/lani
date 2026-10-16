import { EpisodeInfo } from "./types";

export interface ImportEpisodeCandidate {
  type: string;
  number: number;
  available: boolean;
  active: boolean;
}
export interface OffsetCandidate {
  offset: number;
  score: number;
  components: {
    missingHit: number;
    missingCoverage: number;
    boundary: number;
    multiple: number;
    original: number;
    distance: number;
    active: number;
  };
}
export interface ImportOffsetResult {
  offset: number | null;
  reason:
    | "selected"
    | "original"
    | "insufficient"
    | "duplicate"
    | "out-of-range"
    | "small-offset"
    | "ambiguous";
  candidates: OffsetCandidate[];
}

/** 只推断表单初值，不改变输入，也不决定是否允许发布文件。 */
export function detectImportOffset(
  files: readonly (EpisodeInfo | undefined)[],
  episodes: readonly ImportEpisodeCandidate[]
): ImportOffsetResult {
  const numbers = files
    .filter((f) => f?.type === "episode" && typeof f.index === "number")
    .map((f) => f!.index as number)
    .filter(Number.isFinite);
  const result = (
    reason: ImportOffsetResult["reason"],
    candidates: OffsetCandidate[] = [],
    offset: number | null = null
  ): ImportOffsetResult => ({ reason, candidates, offset });
  if (new Set(numbers).size !== numbers.length) return result("duplicate");
  if (files.length < 6 || numbers.length < 6) return result("insufficient");
  const normal = episodes.filter(
    (e) => e.type === "episode" && Number.isFinite(e.number)
  );
  const byNumber = new Map(normal.map((e) => [e.number, e]));
  if (byNumber.size !== normal.length) return result("ambiguous");
  if (!normal.length) return result("out-of-range");
  const missing = normal.filter((e) => !e.available && !e.active).length;
  const low = Math.min(...byNumber.keys()),
    high = Math.max(...byNumber.keys());
  const offsets = new Set<number>([0]);
  for (const n of numbers)
    for (const e of normal)
      if (Number.isInteger(n - e.number)) offsets.add(n - e.number);
  const candidates: OffsetCandidate[] = [];
  for (const offset of offsets) {
    const targets = numbers.map((n) => byNumber.get(n - offset));
    if (targets.some((e) => !e)) continue;
    const hits = targets.filter((e) => !e!.available && !e!.active).length;
    const distance = Math.min(
      Math.abs(offset) % 12,
      12 - (Math.abs(offset) % 12)
    );
    const components = {
      missingHit: (40 * hits) / numbers.length,
      missingCoverage: missing ? (10 * hits) / missing : 0,
      boundary:
        3 *
        (Number(numbers.includes(low + offset)) +
          Number(numbers.includes(high + offset))),
      multiple: 8 * (1 - distance / 6),
      original: offset === 0 ? 8 : 0,
      distance: -Math.min(8, Math.abs(offset) / 48),
      active: (-20 * targets.filter((e) => e!.active).length) / numbers.length,
    };
    candidates.push({
      offset,
      components,
      score: Object.values(components).reduce((a, b) => a + b, 0),
    });
  }
  candidates.sort(
    (a, b) =>
      b.score - a.score ||
      Math.abs(a.offset) - Math.abs(b.offset) ||
      a.offset - b.offset
  );
  const best = candidates[0];
  if (!best) return result("out-of-range");
  if (best.offset === 0) return result("original", candidates, 0);
  if (Math.abs(best.offset) < 6) return result("small-offset", candidates);
  if (candidates[1] && best.score - candidates[1].score < 8)
    return result("ambiguous", candidates);
  return result("selected", candidates, best.offset);
}

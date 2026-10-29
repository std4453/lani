import { TextDecoder } from "util";

export const MAX_BYTES = 16 * 1024 * 1024;

export class ProtocolError extends Error {
  constructor(readonly code: string, message: string, readonly status = 400) {
    super(message);
  }

  payload() {
    return { code: this.code, message: this.message };
  }
}

export function invalid(message: string): never {
  throw new ProtocolError("INVALID_REQUEST", message);
}

export function object(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export function text(
  value: unknown,
  name: string,
  limit = 2048,
  empty = false
) {
  if (
    typeof value !== "string" ||
    [...value].length > limit ||
    (!empty && !value) ||
    Buffer.from(value).toString("utf8") !== value
  )
    return invalid(`${name} 无效`);
  return value;
}

function titles(value: unknown, limit: number) {
  if (!Array.isArray(value) || value.length > limit)
    return invalid("名称列表无效");
  return value.map((v) => text(v, "名称", 2048, true));
}

function integer(value: unknown, low: number, high: number) {
  return (
    value === null ||
    (typeof value === "number" &&
      Number.isSafeInteger(value) &&
      value >= low &&
      value <= high)
  );
}

export interface CatalogRow {
  id: string;
  aliases: string[];
  y: number | null;
  q: number | null;
  count: number | null;
  premiere: string | null;
}

export function catalogRows(catalog: unknown): ReadonlyMap<string, CatalogRow> {
  if (!Array.isArray(catalog) || catalog.length > 10000)
    return invalid("目录无效或超过 10000 项");
  const rows = new Map<string, CatalogRow>();
  for (const item of catalog) {
    if (!object(item)) return invalid("目录条目必须是对象");
    const id = text(item.id, "季度 ID", 200);
    if (rows.has(id)) return invalid("季度 ID 重复");
    const aliases = [
      ...new Set(
        [
          text(item.title, "标题", 2048, true),
          ...titles(item.aliases, 256),
        ].filter(Boolean)
      ),
    ];
    if (aliases.length > 256) return invalid("名称列表超过 256 项");
    if (!integer(item.year, 1, 9999)) return invalid("年份无效");
    if (!integer(item.quarter, 1, 4)) return invalid("季度无效");
    const count = item.declaredEpisodeCount ?? null;
    if (!integer(count, 1, 2147483647)) return invalid("声明集数无效");
    const premiere = item.premiereDate ?? null;
    if (premiere !== null) {
      text(premiere, "首播日期", 10);
      const date = new Date(`${premiere}T00:00:00.000Z`);
      if (
        !/^\d{4}-\d{2}-\d{2}$/.test(premiere as string) ||
        (premiere as string).startsWith("0000") ||
        !Number.isFinite(date.getTime()) ||
        date.toISOString().slice(0, 10) !== premiere
      )
        return invalid("首播日期无效");
    }
    rows.set(id, {
      id,
      aliases,
      y: item.year as number | null,
      q: item.quarter as number | null,
      count: count as number | null,
      premiere: premiere as string | null,
    });
  }
  return rows;
}

export interface Query {
  rawTitle: string;
  aliases: string[];
  publishedAt: string;
  episode: number | null;
  publisherSeason: number | null;
}

export function queryInput(value: unknown): Query {
  if (!object(value)) return invalid("query 必须是对象");
  const rawTitle = text(value.rawTitle, "原标题", 2048, true);
  const aliases = titles(value.aliases, 32).filter(Boolean);
  const publishedAt = text(value.publishedAt, "发布时间");
  const parts =
    /^(\d{4}-\d{2}-\d{2})[Tt ](\d{2}):(\d{2})(?::(\d{2})(?:\.\d+)?)?(?:Z|[+-]\d{2}:?\d{2})$/.exec(
      publishedAt
    );
  const calendarDay = parts ? new Date(`${parts[1]}T00:00:00.000Z`) : null;
  if (
    !parts ||
    parts[1].startsWith("0000") ||
    !calendarDay ||
    !Number.isFinite(calendarDay.getTime()) ||
    calendarDay.toISOString().slice(0, 10) !== parts[1] ||
    Number(parts[2]) > 23 ||
    Number(parts[3]) > 59 ||
    Number(parts[4] ?? 0) > 59 ||
    !Number.isFinite(Date.parse(publishedAt))
  )
    return invalid("发布时间必须是带时区的日期");
  const episode = value.episode ?? null;
  if (
    episode !== null &&
    (typeof episode !== "number" || !Number.isFinite(episode) || episode < 0)
  )
    return invalid("单集编号无效");
  const publisherSeason = value.publisherSeason ?? null;
  if (!integer(publisherSeason, 0, 2147483647))
    return invalid("发布者季数无效");
  return {
    rawTitle,
    aliases,
    publishedAt,
    episode: episode as number | null,
    publisherSeason: publisherSeason as number | null,
  };
}

export function candidateIds(
  value: unknown,
  rows: ReadonlyMap<string, CatalogRow>
) {
  if (!Array.isArray(value) || value.length > 10000)
    return invalid("候选列表无效");
  const ids = value.map((v) => text(v, "候选 ID", 200));
  if (new Set(ids).size !== ids.length || ids.some((id) => !rows.has(id)))
    return invalid("候选 ID 重复或不在目录中");
  return ids;
}

export function decode(value: string | Buffer): unknown {
  try {
    return JSON.parse(
      typeof value === "string"
        ? value
        : new TextDecoder("utf-8", { fatal: true }).decode(value)
    );
  } catch {
    return invalid("JSON 无效");
  }
}

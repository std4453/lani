import { Subtitle, SubtitleDelivery, SubtitleInfo } from "@/types";

const separators = "\\s_\\[\\]【】()&+/.,;|\\-";

function normalize(input: string): string {
  return input
    .replace(/[Ａ-Ｚａ-ｚ０-９]/g, (character) =>
      String.fromCharCode(character.charCodeAt(0) - 0xfee0)
    )
    .replace(/[＆＋]/g, "&")
    .replace(/[／\\]/g, "/")
    .replace(/_/g, " ")
    .replace(/[，、]/g, ",")
    .replace(/[；]/g, ";")
    .replace(/[｜]/g, "|")
    .toLowerCase();
}

function parseTag(input: string): SubtitleInfo | null | undefined {
  const tag = normalize(input).trim();
  if (!tag) return undefined;

  if (
    /^(?:no\s*[-_ ]?\s*(?:subs?|subtitles?)|无字幕|無字幕)(?:版)?$/i.test(tag)
  ) {
    return null;
  }
  // These phrases deny only one delivery/language and cannot establish total absence.
  if (
    /^(?:无|無)(?:外挂|外掛|内封|內封|内挂|內掛|内嵌|內嵌|中文字幕)/.test(tag)
  ) {
    return undefined;
  }

  let rest = tag;
  const languages: string[] = [];
  const delivery: SubtitleDelivery[] = [];
  let multi = false;
  let recognized = false;
  const addLanguage = (language: string): void => {
    recognized = true;
    if (!languages.includes(language)) languages.push(language);
  };
  const consume = (
    pattern: RegExp,
    callback: (match: string) => void
  ): void => {
    rest = rest.replace(pattern, (match) => {
      callback(match);
      return " ";
    });
  };

  consume(/(?:multi(?:ple)?\s*[-_ ]?\s*(?:subtitles?|subs?))/gi, () => {
    multi = true;
    recognized = true;
  });
  consume(/多国语|多國語|多语言|多語言|多国字幕|多國字幕/g, () => {
    multi = true;
    recognized = true;
  });

  consume(/(?:zh\s*[-_]?\s*hans|chs|gb)/gi, () => addLanguage("zh-Hans"));
  consume(/(?:zh\s*[-_]?\s*hant|cht|big5)/gi, () => addLanguage("zh-Hant"));
  consume(/\bzh\b/gi, () => addLanguage("zh"));
  consume(/\b(?:jp|ja)\b/gi, () => addLanguage("ja"));
  consume(/\b(?:en|eng)\b/gi, () => addLanguage("en"));
  consume(/\b(?:ko|kor)\b/gi, () => addLanguage("ko"));

  consume(/(?:中文[简簡][体體]|[简簡][体體](?:中文)?|[简簡]中|[简簡])/g, () =>
    addLanguage("zh-Hans")
  );
  consume(/(?:中文繁[体體]|繁[体體](?:中文)?|繁中|繁)/g, () =>
    addLanguage("zh-Hant")
  );
  consume(/(?:中文字幕|中文|chinese)/gi, () => addLanguage("zh"));
  consume(/(?:日本語|日文|日语|日語|日)/g, () => addLanguage("ja"));
  consume(/(?:英文|英语|english)/gi, () => addLanguage("en"));
  consume(/(?:韓文|韩文|韓語|韩语|korean)/gi, () => addLanguage("ko"));

  consume(/(?:内嵌|內嵌|硬字幕|hardsub)/gi, () => {
    recognized = true;
    if (!delivery.includes("burned-in")) delivery.push("burned-in");
  });
  consume(/(?:内封|內封|内挂|內掛|内置字幕|软字幕|softsub|muxed)/gi, () => {
    recognized = true;
    if (!delivery.includes("muxed")) delivery.push("muxed");
  });
  consume(/(?:外挂|外掛|外置字幕|external\s*subs?)/gi, () => {
    recognized = true;
    if (!delivery.includes("external")) delivery.push("external");
  });

  // These are metadata suffixes; other residue means the bracket was likely a
  // group name, title, audio description, or prose rather than a subtitle tag.
  consume(
    /(?:双字幕|雙字幕|字幕|双语|雙語|双語|雙语|subtitles?|subs?)/gi,
    () => {
      recognized = true;
    }
  );
  consume(
    /(?:mp4|mkv|mka|avi|(?:2160|1080|720|480)p|(?:1920x1080|1280x720|3840x2160)|hevc|avc|av1|[hx]26[45]|(?:8|10)bit|flac|aac|(?:ass|srt|pgs)(?:x\d+)?|bdrip|bd|webrip|web-?dl|试看版|試看版)/gi,
    () => {}
  );
  rest = rest.replace(new RegExp(`[${separators}]+`, "g"), "").trim();
  if (!recognized || rest) return undefined;

  return {
    languages,
    multi: multi || languages.length >= 2,
    delivery,
  };
}

function parseMixedTag(input: string): Array<SubtitleInfo | null | undefined> {
  const parsed = parseTag(input);
  if (parsed !== undefined) return [parsed];
  const tag = normalize(input);
  const results: Array<SubtitleInfo | null | undefined> = [];
  // Audio and subtitles often share a bracket, separated by +. Only retain
  // clauses that explicitly describe subtitles; do not infer subs from audio.
  for (const part of tag.split(/[+&]/)) {
    if (/(?:字幕|内[封挂嵌]|內[封掛嵌]|外[挂掛]|subs?)/i.test(part)) {
      results.push(parseTag(part));
    }
  }
  // Strong release aliases remain useful beside codecs/platform names. Short
  // language words (EN/JA) alone are deliberately excluded from this fallback.
  if (
    /(?:\d{3,4}p|\d{3,4}x\d{3,4}|[hx]26[45]|hevc|avc|av1|web.?rip|bd.?rip|mkv|mp4)/i.test(
      tag
    )
  ) {
    for (const match of tag.matchAll(
      /\b(?:chs|cht|big5|gb)(?:[ /-]+(?:jp|ja))?\b/g
    )) {
      if (/^gb\b/.test(match[0]) && /\d\s*$/.test(tag.slice(0, match.index)))
        continue;
      results.push(parseTag(match[0]));
    }
    for (const match of tag.matchAll(
      /(?:^|[\s+&/,])([简簡繁](?:[简簡繁日])*(?:[体體中])?(?:双语|雙語)?(?:内[封挂嵌]|內[封掛嵌]|外[挂掛]|字幕)?)(?=$|[\s+&/,])/g
    )) {
      results.push(parseTag(match[1]));
    }
  }
  return results;
}

function extractTagContents(input: string): string[] {
  const contents: string[] = [];
  const pattern = /\[([^\]]+)\]|【([^】]+)】|\(([^)]+)\)/g;
  for (const match of input.matchAll(pattern)) {
    const content = match[1] || match[2] || match[3];
    if (content) contents.push(content);
  }
  return contents;
}

/**
 * 从整条资源标题中提取明确的字幕元数据，与集数解析相互独立。
 * 返回 undefined 表示没有足够证据，null 表示标题明确声明无字幕。
 */
export function parseSubtitleInfo(
  input: string
): SubtitleInfo | null | undefined {
  if (!input.trim()) return undefined;

  const info: SubtitleInfo = { languages: [], multi: false, delivery: [] };
  let foundMetadata = false;
  let explicitlyNoSubtitles = false;

  for (const parsed of extractTagContents(input).flatMap(parseMixedTag)) {
    if (parsed === null) {
      explicitlyNoSubtitles = true;
      continue;
    }
    if (!parsed) continue;

    foundMetadata = true;
    info.multi ||= parsed.multi;
    for (const language of parsed.languages) {
      if (!info.languages.includes(language)) info.languages.push(language);
    }
    for (const item of parsed.delivery) {
      if (!info.delivery.includes(item)) info.delivery.push(item);
    }
  }

  // A few unbracketed phrases explicitly describe subtitle presence. Keep this
  // list narrow so title and group words such as “简繁字幕组” cannot match.
  if (
    /自带中文字幕|自帶中文字幕|提供中文字幕/.test(input) &&
    !/(?:无|無|没有|沒有)(?:自带|自帶|提供)?中文字幕/.test(input)
  ) {
    foundMetadata = true;
    if (!info.languages.includes("zh")) info.languages.push("zh");
  }
  const outsideTags = normalize(
    input.replace(/\[[^\]]+\]|【[^】]+】|\([^)]+\)/g, " ")
  );
  if (
    /(?:^|[\s[\]()【】])(?:multi(?:ple)?[ -]?(?:subs?|subtitles?)|多国字幕|多國字幕|多国语字幕|多國語字幕)(?=$|[\s[\]()【】])/i.test(
      outsideTags
    )
  ) {
    foundMetadata = true;
    info.multi = true;
  }
  for (const match of outsideTags.matchAll(
    /\b(big5|chs|cht|gb)(?:[ /-]+(cn|jp|ja))?\b(?=[\s.,;|/-]*(?:\d{3,4}p|mp4|mkv|hevc|avc|av1|bdrip|webrip|web-?dl)\b)/gi
  )) {
    if (
      /^gb$/i.test(match[1]) &&
      /\d\s*$/.test(outsideTags.slice(0, match.index))
    )
      continue;
    const language = /^(?:big5|cht)$/i.test(match[1]) ? "zh-Hant" : "zh-Hans";
    foundMetadata = true;
    if (!info.languages.includes(language)) info.languages.push(language);
    if (/^(?:jp|ja)$/i.test(match[2] ?? "") && !info.languages.includes("ja"))
      info.languages.push("ja");
  }
  for (const match of outsideTags.matchAll(
    /(?:^|[\s_])([简簡繁](?:[简簡繁日])*(?:[体體中])?(?:字幕|内[封挂嵌]|內[封掛嵌]|外[挂掛])?)(?=$|[\s_])/g
  )) {
    const parsed = parseTag(match[1]);
    if (!parsed) continue;
    foundMetadata = true;
    for (const language of parsed.languages) {
      if (!info.languages.includes(language)) info.languages.push(language);
    }
    for (const item of parsed.delivery) {
      if (!info.delivery.includes(item)) info.delivery.push(item);
    }
  }
  if (foundMetadata) {
    info.multi ||= info.languages.length >= 2;
    return info;
  }
  if (explicitlyNoSubtitles || /(?:无字幕版?|無字幕版?)/.test(input)) {
    return null;
  }
  return undefined;
}

/** 将新字幕结构投影到旧字段，便于现有调用方平滑迁移。 */
export function toLegacySubtitle(
  info: SubtitleInfo | null | undefined
): Subtitle {
  const subtitle: Subtitle = {};
  if (!info) return subtitle;

  if (info.languages.includes("zh-Hans")) subtitle.hasCHS = true;
  if (info.languages.includes("zh-Hant")) subtitle.hasCHT = true;
  if (info.languages.includes("ja")) subtitle.hasJP = true;

  const legacyDelivery: Partial<Record<SubtitleDelivery, Subtitle["type"]>> = {
    "burned-in": "内嵌",
    muxed: "内挂",
    external: "外挂",
  };
  const firstDelivery = info.delivery.find((item) => legacyDelivery[item]);
  if (firstDelivery) subtitle.type = legacyDelivery[firstDelivery];
  return subtitle;
}

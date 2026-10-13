import { Index } from "@/types";

export interface EpisodeMatch {
  start: number;
  end: number;
  value: Index;
}

// Normalize only single-character forms, preserving offsets into the raw title.
function normalize(input: string): string {
  return input
    .replace(/[！-～]/g, (char) =>
      String.fromCharCode(char.charCodeAt(0) - 0xfee0)
    )
    .replace(/[–—−]/g, "-")
    .replace(/〜/g, "~");
}

function chineseNumber(input: string): number {
  const digits = "零一二三四五六七八九";
  const units: Record<string, number> = { 十: 10, 百: 100, 千: 1000 };
  let value = 0;
  let digit = 0;
  for (const char of input.replace(/〇/g, "零").replace(/两/g, "二")) {
    if (units[char]) {
      value += (digit || 1) * units[char];
      digit = 0;
    } else {
      digit = digit * 10 + digits.indexOf(char);
    }
  }
  return value + digit;
}

const number = "\\d{1,4}(?:\\.5)?";
// A hyphenated revision is deliberately limited to the usual single digit.
// Do not let a version such as v2.1 become an episode range or a partial index.
const revision = "(?:\\s*(?:_?v\\d+|-v[1-9]))?";
const episode = `${number}${revision}`;
const rangeOnly = `${episode}\\s*[-~]\\s*(?:EP?\\.?\\s*)?${episode}`;
const range = `${episode}(?:\\s*[-~]\\s*(?:EP?\\.?\\s*)?${episode})?`;
const completion = "(?:\\s*[_-]?\\s*(?:END|FIN|完[结結]?|(?:精校)?合集|全集))?";
const boundary = "(?=$|[\\s.\\[\\]【】()_+])";

// All rules capture the complete marker in group 2 and its episode in group 3.
// Semantic markers take precedence over the numeric bracket/dash conventions.
type RuleKind =
  | "explicit"
  | "bracket"
  | "annotated-index"
  | "dash"
  | "annotated-range"
  | "chinese"
  | "bare-range"
  | "bare-single"
  | "fallback-range"
  | "complete"
  | "sequence";
const rules: Array<{ kind: RuleKind; pattern: RegExp }> = [
  {
    kind: "bracket",
    pattern: new RegExp(
      `()([\\[【]\\s*(${rangeOnly})\\s*\\(\\s*(?:EP)?${rangeOnly}\\s*\\)${completion}\\s*[\\]】])`,
      "gi"
    ),
  },
  {
    kind: "bracket",
    pattern: new RegExp(
      `()([\\[【]\\s*(${episode})\\s*-\\s*总第${number}(?:话|話|集)?\\s*[\\]】])`,
      "gi"
    ),
  },
  // In dual numbering, retain the primary (season-relative) range. The
  // parenthesized absolute range is an annotation, not a replacement index.
  {
    kind: "bracket",
    pattern: new RegExp(
      `(^|[^\\d.])((${rangeOnly})${completion})(?=\\s*\\(\\s*(?:EP)?${rangeOnly}\\s*\\))`,
      "gi"
    ),
  },
  {
    kind: "explicit",
    pattern: new RegExp(
      `(^|[^A-Za-z0-9])(S\\d{1,3}[ ._-]?E(${range})${completion})${boundary}`,
      "gi"
    ),
  },
  {
    kind: "explicit",
    pattern: new RegExp(
      `(^|[^A-Za-z0-9])((?:EP\\.?|Episode)\\s*(${range})${completion})${boundary}`,
      "gi"
    ),
  },
  {
    kind: "explicit",
    pattern: new RegExp(
      `(^|[^A-Za-z0-9])(Chapter\\.?\\s*(${rangeOnly})${completion})${boundary}`,
      "gi"
    ),
  },
  {
    kind: "explicit",
    pattern: new RegExp(
      `(^|[^A-Za-z0-9])(E(${rangeOnly})(?:\\.(?:END|FIN)|${completion}))${boundary}`,
      "gi"
    ),
  },
  {
    kind: "explicit",
    pattern: new RegExp(
      `(^|[^A-Za-z0-9])(E(\\d{2,4}(?:\\.5)?${revision})${completion})${boundary}`,
      "gi"
    ),
  },
  {
    kind: "bracket",
    pattern: new RegExp(
      `()([\\[【]\\s*(?:第\\s*)?(${range})\\s*(?:话|話|集)?(?:\\s*\\(\\s*(?:${number}|END|FIN|完[结結]?)\\s*\\)\\s*)?${completion}\\s*[\\]】])`,
      "gi"
    ),
  },
  // Some releases wrap an episode in decorative stars, or add a short CJK
  // annotation / small-theater extra inside the same bracket.
  {
    kind: "annotated-index",
    pattern: new RegExp(
      `()(★\\s*(${episode})(?:\\s*\\([^()\\d\\[\\]]{1,40}\\))?\\s*★)`,
      "gi"
    ),
  },
  {
    kind: "annotated-index",
    pattern: new RegExp(
      `()([\\[【]\\s*(\\d{1,3}${revision})(?:\\s*_\\s*[\\u4e00-\\u9fff][^\\]】]*|\\s*\\+\\s*小剧场)\\s*[\\]】])`,
      "gi"
    ),
  },
  {
    kind: "dash",
    pattern: new RegExp(`()(-\\s+(${range})${completion})${boundary}`, "gi"),
  },
  // Annotated packs remain ranges, never single-episode download candidates.
  {
    kind: "annotated-range",
    pattern: new RegExp(
      `()([\\[【(]\\s*(?:(?:TV|OVA|OAD)\\s*)?(${rangeOnly}))(?=\\s|[+()\\]】]|TV\\b|TV全|END\\b|FIN\\b|[全完合修精补補话話集简簡繁])`,
      "gi"
    ),
  },
  {
    kind: "sequence",
    pattern: new RegExp(`()((?:第)?((?:${number}[话話集]){2,}))`, "g"),
  },
  {
    kind: "chinese",
    pattern: new RegExp(
      `(^|[^\\dA-Za-z])((${episode}[话話集]\\s*[-~]\\s*(?:第\\s*)?${episode})\\s*[话話集])`,
      "gi"
    ),
  },
  {
    kind: "chinese",
    pattern: new RegExp(
      `()(第\\s*(${episode}[话話集]\\s*[-~]\\s*(?:第\\s*)?${episode})\\s*[话話集])`,
      "gi"
    ),
  },
  {
    kind: "chinese",
    pattern: new RegExp(
      `()(第\\s*(${range}|[零〇一二两三四五六七八九十百千]+)\\s*[话話集])`,
      "gi"
    ),
  },
  {
    kind: "chinese",
    pattern: new RegExp(`(^|[\\s_])((${number})[话話集])`, "gi"),
  },
  {
    kind: "bare-range",
    pattern: new RegExp(
      `(^|[\\s_])((${rangeOnly})${completion})(?=\\s|[\\[【(+]|$)`,
      "gi"
    ),
  },
  // Compact dashes and bare numbers are lower-confidence release conventions.
  // Try these only after explicit markers and ranges have been exhausted.
  {
    kind: "dash",
    pattern: new RegExp(
      `(^|[^\\d.])(-(${range})${completion})${boundary}`,
      "gi"
    ),
  },
  {
    kind: "bare-single",
    pattern: new RegExp(
      `(^|[\\s_])((${episode})${completion})${boundary}`,
      "gi"
    ),
  },
  {
    kind: "complete",
    pattern: new RegExp(`()((?:全|共)\\s*(${number})\\s*[话話集])`, "gi"),
  },
  {
    kind: "fallback-range",
    pattern: new RegExp(
      `(^|[^\\d])((${rangeOnly})${completion})(?=$|[^\\dA-Za-z])`,
      "gi"
    ),
  },
];

function parseNumber(input: string): number {
  return /^\d/.test(input) ? Number(input) : chineseNumber(input);
}

function parseValue(token: string): Index | undefined {
  const clean = token
    .replace(/\s*(?:_?v\d+|-v[1-9])/gi, "")
    .replace(/EP?\.?\s*/gi, "")
    .replace(/[第话話集]/g, "");
  const parts = clean.split(/[-~]/).map((part) => parseNumber(part.trim()));
  if (parts.some((part) => !Number.isInteger(part * 2) || part < 0)) {
    return undefined;
  }
  if (parts.length === 1) {
    return parts[0];
  }
  return parts[0] <= parts[1] ? { from: parts[0], to: parts[1] } : undefined;
}

function isYear(value: number): boolean {
  return value >= 1900 && value <= 2099;
}

export default function matchEpisode(
  input: string,
  allowLeadingEpisode = false
): EpisodeMatch | undefined {
  const text = normalize(input);
  let leadingEpisode: EpisodeMatch | undefined;
  for (const { kind, pattern } of rules) {
    for (const match of text.matchAll(pattern)) {
      const marker = match[2];
      let start = match.index! + match[1].length;
      let end = start + marker.length;
      const bracketStart = Math.max(
        text.lastIndexOf("[", start),
        text.lastIndexOf("【", start)
      );
      const bracketEnd = [text.indexOf("]", start), text.indexOf("】", start)]
        .filter((index) => index >= 0)
        .reduce((nearest, index) => Math.min(nearest, index), Infinity);
      if (
        bracketStart > text.lastIndexOf("]", start) &&
        bracketStart > text.lastIndexOf("】", start) &&
        bracketEnd > end
      ) {
        const bracket = text.slice(bracketStart, bracketEnd + 1);
        const independentRanges = bracket.match(
          /(?<![A-Za-z0-9])\d{1,4}\s*[-~]\s*\d{1,4}(?!\d)/g
        );
        // A bracket listing disjoint intervals plus annotations is a pack, not
        // one interval. Do not select a later segment after an earlier segment
        // was rejected as a partial parse.
        if (
          independentRanges &&
          independentRanges.length > 1 &&
          /[,，;]/.test(bracket)
        ) {
          continue;
        }
      }
      if (kind === "explicit" && /[\[【]/.test(text[start - 1] ?? "")) {
        --start;
        if (/[\]】]/.test(text[end] ?? "")) ++end;
      }
      // The lower-confidence range rules start at the first digit, but in Chinese
      // titles the preceding 第 is part of the episode marker and must be removed
      // from the title span as well.
      if (text[start - 1] === "第" && /[话話集]/.test(marker)) --start;
      const before = text.substring(0, start);
      const after = text.substring(end);
      // A single E marker must not select the tail of an invalid/reversed range.
      if (
        kind === "explicit" &&
        /^E\d/i.test(marker) &&
        /E\d+(?:\.5)?\s*[-~]\s*$/i.test(before)
      )
        continue;
      const additionalSpecials =
        /^\s*\+\s*(?:(?:\d+(?:\.\d+)?)(?:SP|OVA|OAD)|\d+\.\d+|SP|OVA|OAD)(?:x\d+)?(?:\s*\+\s*(?:(?:\d+(?:\.\d+)?)(?:SP|OVA|OAD)|\d+\.\d+|SP|OVA|OAD)(?:x\d+)?)*(?=$|[\s\[【(\]】])/i.test(
          after
        );
      const additionalRange = /^\s*[+&,]\s*\d{1,4}\s*[-~]\s*\d/i.test(after);
      // A leading numeric bracket may be the title (e.g. [86]), not an episode.
      const leading = !before.replace(/[\s\[\]【】]/g, "");
      if (leading && !allowLeadingEpisode) continue;
      if (kind === "dash") {
        const dashValue = parseValue(match[3]);
        if (
          typeof dashValue === "number" &&
          [...before.matchAll(/第\s*(\d{1,4})\s*[话話集]/g)].some(
            (semanticMatch) =>
              Number(semanticMatch[1]) === dashValue &&
              !before
                .slice(semanticMatch.index! + semanticMatch[0].length)
                .includes("/")
          )
        ) {
          continue;
        }
      }
      if (kind === "dash" && /^-\d/.test(marker) && /[\[【(]\s*$/.test(before))
        continue;
      if (
        kind === "dash" &&
        /^-\d/.test(marker) &&
        /\b(?:MPEG|AC|UTF)\s*$/i.test(before)
      )
        continue;
      if (
        kind === "dash" &&
        /^-\d/.test(marker) &&
        (/\b(?:19|20)\d{2}\s*$/.test(before) ||
          (!/(?:END|FIN|完[结結]?)$/i.test(marker) &&
            !/^\s*(?:[\[【(]|\d{3,4}p\b|CHS\b|CHT\b|BIG5\b|GB\b|WEB\b|BD\b|DVD\b|HDTV\b)/i.test(
              after
            )))
      )
        continue;
      let value = parseValue(match[3]);
      // A half episode split into multiple files is not a complete single episode.
      if (
        typeof value === "number" &&
        !Number.isInteger(value) &&
        /^\s+Part\s*\d/i.test(after)
      )
        continue;
      if (kind === "dash" && typeof value === "number" && /^_\d/.test(after))
        continue;
      if (
        kind === "dash" &&
        /^-\s+\d/.test(marker) &&
        typeof value === "number" &&
        !/(?:END|FIN|完[结結]?)$/i.test(marker) &&
        /^\s+[A-Za-z]/.test(after) &&
        !/(?:\b\d{3,4}p\b|\b(?:WEB(?:-DL|Rip)?|BD(?:Rip)?|DVD|HDTV|CHS|CHT|BIG5|GB|AVC|HEVC|x26[45]|Baha|Bglobal|AAC|AC-?3)\b|\[[^\]]*(?:WEB|BD|DVD|HDTV|CHS|CHT|BIG5|GB|AVC|HEVC|x26[45]|Baha|Bglobal|AAC|AC-?3|\d{3,4}p)[^\]]*\])/i.test(
          after
        )
      )
        continue;
      if (kind === "complete" && typeof value === "number") {
        value = value > 0 ? { from: 1, to: value } : undefined;
      }
      if (kind === "sequence") {
        const items = match[3].match(/\d+/g)!.map(Number);
        value = items.every((item, i) => i === 0 || item === items[i - 1] + 1)
          ? { from: items[0], to: items[items.length - 1] }
          : undefined;
      }
      // Do not truncate decimals, unsupported ranges or a single episode + extras.
      if (
        value === undefined ||
        /^\.\d+(?:$|[.\s\[【(\]】])/.test(after) ||
        (kind === "fallback-range" &&
          text[start - 1] === "." &&
          /\d$/.test(text.slice(0, start - 1))) ||
        (/^\s*[~\-]\s*(?:\d|EP?\d)/i.test(after) &&
          !/^\s*-\s*\d{3,4}p\b/i.test(after)) ||
        /^\d+[话話集]/.test(after) ||
        (typeof value === "number" &&
          !/第/.test(marker) &&
          /^\s*\+/.test(after))
      ) {
        continue;
      }
      const explicit = kind === "explicit" || /第|[话話集]/.test(marker);
      if (
        !explicit &&
        (typeof value === "number"
          ? isYear(value)
          : isYear(value.from) || isYear(value.to))
      ) {
        continue;
      }
      if (kind === "bare-range") {
        // A bare range inside a title bracket or without release metadata is ambiguous.
        if (
          before.lastIndexOf("[") > before.lastIndexOf("]") ||
          before.lastIndexOf("【") > before.lastIndexOf("】")
        ) {
          continue;
        }
        const metadata = after.replace(/^\s*\+[^\[【]*(?=[\[【])/, "");
        if (
          !/^\s*(?:[\[【(]|CHS\b|CHT\b|BIG5\b|GB\b|\d{3,4}p\b)/i.test(
            metadata
          ) &&
          !/^\s*\|/.test(metadata) &&
          !/(?:END|FIN|合集|全集)$/i.test(marker)
        ) {
          continue;
        }
      }
      if (
        (kind === "bare-range" || kind === "fallback-range") &&
        /(?:\bS|Season|Vol(?:ume)?\.?|Part|第)\s*$/i.test(before)
      )
        continue;
      if (kind === "fallback-range" && /^(?:季|期|部|卷|年)/.test(after))
        continue;
      if (
        typeof value !== "number" &&
        ((/^\s*[+&,]\s*\d/.test(after) && !additionalSpecials) ||
          additionalRange ||
          /\d\s*[+&,]\s*$/.test(before))
      )
        continue;
      if (kind === "bare-single") {
        const inBracket =
          before.lastIndexOf("[") > before.lastIndexOf("]") ||
          before.lastIndexOf("【") > before.lastIndexOf("】");
        const completed = /(?:END|FIN|完[结結]?)$/i.test(marker);
        const technical = /^\s*[\[【(](?:WEB|BD(?:Rip)?|DVD|\d{3,4}p\b)/i.test(
          after
        );
        // A bare integer could be part of a title. Require completion or release
        // metadata, and reject season/volume markers and numbers in title tags.
        if (
          inBracket ||
          /(?:Season|Vol\.?|第)\s*$/i.test(before) ||
          (!completed && (!technical || !/^0\d/.test(match[3])))
        )
          continue;
      }
      if (leading) {
        leadingEpisode ??= { start, end, value };
        continue;
      }
      return { start, end, value };
    }
  }
  return leadingEpisode;
}

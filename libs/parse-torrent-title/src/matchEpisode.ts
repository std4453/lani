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

const number = "\\d{1,4}";
const revision = "(?:\\s*_?v\\d+)?";
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
  | "dash"
  | "annotated-range"
  | "chinese"
  | "bare-range";
const rules: Array<{ kind: RuleKind; pattern: RegExp }> = [
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
    kind: "bracket",
    pattern: new RegExp(
      `()([\\[【]\\s*(?:第\\s*)?(${range})\\s*(?:话|話|集)?${completion}\\s*[\\]】])`,
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
    pattern: new RegExp(`(^|[\\s_])((${number})[话話集])${boundary}`, "gi"),
  },
  {
    kind: "bare-range",
    pattern: new RegExp(
      `(^|[\\s_])((${rangeOnly})${completion})(?=\\s|[\\[【(+]|$)`,
      "gi"
    ),
  },
];

function parseNumber(input: string): number {
  return /^\d/.test(input) ? Number(input) : chineseNumber(input);
}

function parseValue(token: string): Index | undefined {
  const clean = token
    .replace(/\s*_?v\d+/gi, "")
    .replace(/EP?\.?\s*/gi, "")
    .replace(/[第话話集]/g, "");
  const parts = clean.split(/[-~]/).map((part) => parseNumber(part.trim()));
  if (parts.some((part) => !Number.isInteger(part) || part < 0)) {
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

export default function matchEpisode(input: string): EpisodeMatch | undefined {
  const text = normalize(input);
  for (const { kind, pattern } of rules) {
    for (const match of text.matchAll(pattern)) {
      const marker = match[2];
      let start = match.index! + match[1].length;
      let end = start + marker.length;
      if (kind === "explicit" && /[\[【]/.test(text[start - 1] ?? "")) {
        --start;
        if (/[\]】]/.test(text[end] ?? "")) ++end;
      }
      const before = text.substring(0, start);
      const after = text.substring(end);
      // A leading numeric bracket may be the title (e.g. [86]), not an episode.
      if (!before.replace(/[\s\[\]【】]/g, "")) {
        continue;
      }
      const value = parseValue(match[3]);
      // Do not truncate decimals, unsupported ranges or a single episode + extras.
      if (
        value === undefined ||
        /^\.\d+(?:$|[.\s\]】])/.test(after) ||
        /^\s*[~\-]\s*(?:\d|EP?\d)/i.test(after) ||
        (typeof value === "number" && /^\s*\+/.test(after))
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
          !/(?:END|FIN|合集|全集)$/i.test(marker)
        ) {
          continue;
        }
      }
      return { start, end, value };
    }
  }
  return undefined;
}

import { Index } from "@/types";

export interface SpecialEpisodeMatch {
  start: number;
  end: number;
  type: "sp" | "ova" | "oad";
  index?: Index;
}

// All replacements preserve UTF-16 length, so offsets still point into input.
function normalize(input: string): string {
  return input
    .replace(/[！-～]/g, (char) =>
      String.fromCharCode(char.charCodeAt(0) - 0xfee0)
    )
    .replace(/[–—−]/g, "-")
    .replace(/〜/g, "~");
}

const marker =
  /(?<![A-Za-z0-9])(SP|OVA|OAD|Special|特别篇|特別篇)(?=[vV]?\d|[^A-Za-z0-9]|$)/gi;
const number = "\\d{1,4}(?:\\.5)?";

function releasePosition(text: string, start: number, end: number): boolean {
  const open = text[start - 1];
  const close = text[end];
  if ((open === "[" && close === "]") || (open === "【" && close === "】")) {
    return true;
  }
  const before = text.slice(0, start);
  const after = text.slice(end);
  const onlyTrailingMetadata =
    /^\s*(?:(?:\[[^\]]+\]|【[^】]+】|\([^)]*\))\s*)*$/.test(after) ||
    /^\s*(?:\d{3,4}p\b|\d{3,4}x\d{3,4}\b|(?:8|10)-?bit\b|4k\b|bdrip\b|brrip\b|web[- ]?dl\b|webrip\b|hdtv\b|hevc\b|avc\b|x26[45]\b|h26[45]\b|mkv\b)/i.test(
      after
    );
  return (
    (start === 0 || /[\s\[【(,;:|]/.test(open)) &&
    (end === text.length || /[\s\]】),;:|]/.test(close)) &&
    (before.trim() === "" || onlyTrailingMetadata)
  );
}

export default function matchSpecialEpisode(
  input: string
): SpecialEpisodeMatch | undefined {
  const text = normalize(input);

  for (const match of text.matchAll(marker)) {
    const label = match[1];
    const start = match.index!;
    const labelEnd = start + label.length;
    const lower = label.toLowerCase();
    const type: SpecialEpisodeMatch["type"] =
      lower === "ova" ? "ova" : lower === "oad" ? "oad" : "sp";
    const tail = text.slice(labelEnd);
    const version = /^(?:\s*)v\d+(?![\d.])/i.exec(tail);
    let end = labelEnd;
    let index: Index | undefined;

    if (version) {
      end += version[0].length;
    } else {
      const candidate = new RegExp(
        `^[\\s-]*(${number})(?:\\s*([-~])\\s*(${number}))?(?:\\s*(?:_?v\\d+|-v[1-9]))?(?:\\s*(?:FIN|END|完[结結]?|合集|全集)(?=$|[\\s\\]】]))?`,
        "i"
      ).exec(tail);
      if (candidate) {
        const rest = tail.slice(candidate[0].length);
        const from = Number(candidate[1]);
        const to =
          candidate[3] === undefined ? undefined : Number(candidate[3]);
        const year = from >= 1900 && from <= 2099;
        const technical = /^\s*(?:-?bit\b|p\b|x\d)/i.test(rest);
        const invalid =
          /^[\d.]|^[A-Za-z]/.test(rest) ||
          /^[\s]*[+&,/]\s*(?:\d|SP(?=\d|\b)|OVA(?=\d|\b)|OAD(?=\d|\b))/i.test(
            rest
          ) ||
          /^[\s]*[-~]\s*\d/.test(rest) ||
          (to !== undefined && from > to);
        if (technical) {
          // OVA 10-bit / SP 1080p identify quality, not special episode numbers.
        } else if (year) {
          end += candidate[0].length;
        } else {
          if (invalid) continue;
          index = to === undefined ? from : { from, to };
          end += candidate[0].length;
        }
      } else if (/^[\s-]*\d/.test(tail)) {
        // Unsupported decimal precision or malformed numeric suffix.
        continue;
      }
    }

    const before = text.slice(Math.max(0, start - 32), start);
    const after = text.slice(end, end + 32);
    if (
      /[+&,]\s*$/.test(before) ||
      /^\s*[+&,]/.test(after) ||
      /\d{1,4}(?:\.5)?\s*[-~]\s*\d{1,4}(?:\.5)?\s*\+\s*$/.test(before) ||
      /\d{1,4}(?:\.5)?\s*\+\s*$/.test(before) ||
      /(?:SP|OVA|OAD)\s*\d{1,4}(?:\.5)?\s*[+&,/]\s*$/i.test(before) ||
      /^[\s]*[+&,/]\s*(?:\d|SP(?=\d|\b)|OVA(?=\d|\b)|OAD(?=\d|\b))/i.test(after)
    ) {
      continue;
    }

    if (index === undefined && !releasePosition(text, start, end)) continue;

    // Include only the small bracketed token, never an enclosing group/name.
    if (text[start - 1] === "[" && text[end] === "]") {
      return { start: start - 1, end: end + 1, type, index };
    }
    if (text[start - 1] === "【" && text[end] === "】") {
      return { start: start - 1, end: end + 1, type, index };
    }
    return { start, end, type, index };
  }

  return undefined;
}

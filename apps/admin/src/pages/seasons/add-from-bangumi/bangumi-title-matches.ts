import { escapeRegExp } from 'lodash';

interface Match {
  index: number;
  length: number;
}
const overlaps = (a: Match, b: Match) =>
  a.index < b.index + b.length && b.index < a.index + a.length;

function exactMatches(title: string, word: string): Match[] {
  if (!word) return [];
  // 输入已转义，只作为字面量匹配。
  // eslint-disable-next-line @rushstack/security/no-unsafe-regexp
  const regex = new RegExp(escapeRegExp(word), 'giu');
  return Array.from(title.matchAll(regex))
    .filter(
      (match) =>
        !/^[0-9０-９]+$/.test(word) ||
        !/[0-9０-９]/.test(
          (title[match.index! - 1] ?? '') +
            (title[match.index! + match[0].length] ?? ''),
        ),
    )
    .map((match) => ({
      index: match.index!,
      length: match[0].length,
    }));
}

/** 带状编辑距离；只计算可能落入阈值的单元，最坏每个候选 O(词长 × 阈值)。 */
function boundedDistance(a: string[], b: string[], limit: number): number {
  let previous = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const current = Array(b.length + 1).fill(limit + 1);
    current[0] = i;
    let minimum = limit + 1;
    for (
      let j = Math.max(1, i - limit);
      j <= Math.min(b.length, i + limit);
      j++
    ) {
      current[j] = Math.min(
        previous[j] + 1,
        current[j - 1] + 1,
        previous[j - 1] + Number(a[i - 1] !== b[j - 1]),
      );
      minimum = Math.min(minimum, current[j]);
    }
    if (minimum > limit) return limit + 1;
    previous = current;
  }
  return previous[b.length];
}

function fuzzyMatches(title: string, word: string, occupied: Match[]): Match[] {
  const chars = Array.from(word);
  // 短词只精确匹配；超长输入也退回精确匹配，限制每张卡片的计算量。
  if (chars.length < 3 || chars.length > 32) return [];
  const limit = Math.min(2, Math.floor(chars.length / 3));
  const candidates: Array<
    Match & { distance: number; delta: number; text: string }
  > = [];
  for (const run of title.slice(0, 512).matchAll(/\p{Script=Han}+/gu)) {
    const text = Array.from(run[0]);
    const offsets = [run.index!];
    text.forEach((char) =>
      offsets.push(offsets[offsets.length - 1] + char.length),
    );
    for (let start = 0; start < text.length; start++) {
      for (
        let size = chars.length - limit;
        size <= chars.length + limit && start + size <= text.length;
        size++
      ) {
        const match = {
          index: offsets[start],
          length: offsets[start + size] - offsets[start],
        };
        if (occupied.some((other) => overlaps(match, other))) continue;
        const fragment = text.slice(start, start + size);
        // 中文数字同样不可插入、删除或替换，避免季数被误标为命中。
        const numbers = (value: string) =>
          value.match(/[零〇一二三四五六七八九十百千万两]/g)?.join('') ?? '';
        if (numbers(word) !== numbers(fragment.join(''))) continue;
        const distance = boundedDistance(chars, fragment, limit);
        if (distance <= limit)
          candidates.push({
            ...match,
            distance,
            delta: Math.abs(size - chars.length),
            text: fragment.join(''),
          });
      }
    }
  }
  candidates.sort(
    (a, b) => a.distance - b.distance || a.delta - b.delta || a.index - b.index,
  );
  const best = candidates[0];
  if (!best) return [];
  const ties = candidates.filter(
    (candidate) =>
      candidate.distance === best.distance && candidate.delta === best.delta,
  );
  // 同分却对应不同标题片段时，不猜测用户想命中哪一处。
  if (ties.some((candidate) => candidate.text !== best.text)) return [];
  return ties.map(({ index, length }) => ({ index, length }));
}

/** 精确命中全局优先，未命中的中文连续片段才进行至多两次编辑的容错。 */
export function bangumiTitleMatches(title: string, keywords: string): Match[] {
  if (/^(bgmid|bangumiid|bangumi_id):/i.test(keywords)) return [];
  const matches: Match[] = [];
  const unmatched: string[] = [];
  const words = [...new Set(keywords.trim().split(/\s+/).filter(Boolean))];
  for (const word of words) {
    const exact = exactMatches(title, word);
    if (exact.length) matches.push(...exact);
    else unmatched.push(word);
  }
  const fuzzy: string[] = [];
  for (const word of unmatched) {
    // 数字和季度编号独立保留，只允许整体精确匹配；不要把「第三季」拆成「第」「季」。
    const protectedParts =
      /第?[零〇一二三四五六七八九十百千万两0-9０-９]+(?:季|期|部|集|话|年|月)|[0-9０-９]+/gu;
    let cursor = 0;
    const addChinese = (part: string) => {
      for (const [fragment] of part.matchAll(/\p{Script=Han}+/gu)) {
        const exact = exactMatches(title, fragment);
        if (exact.length) matches.push(...exact);
        else fuzzy.push(fragment);
      }
    };
    for (const part of word.matchAll(protectedParts)) {
      addChinese(word.slice(cursor, part.index));
      matches.push(...exactMatches(title, part[0]));
      cursor = part.index! + part[0].length;
    }
    addChinese(word.slice(cursor));
  }
  for (const word of [...new Set(fuzzy)].sort((a, b) => b.length - a.length)) {
    matches.push(...fuzzyMatches(title, word, matches));
  }
  return matches.sort((a, b) => a.index - b.index || b.length - a.length);
}

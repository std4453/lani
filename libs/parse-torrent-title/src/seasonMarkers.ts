import matchEpisode from "./matchEpisode";

/** 发布标题中的季数标记；只提供语法提示，不推断元数据季度或作品身份。 */
const explicitSeason =
  /(?:\bS\d{1,2}(?:E\d|\b)|\b\d{1,2}(?:st|nd|rd|th)\b|\bSeason\s+\d{1,2}\b|第[一二三四五六七八九十0-9]+[季期]|\b(?:first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth)\s+season\b|シーズン\s*\d+)/i;

export function hasExplicitSeason(title: string): boolean {
  return explicitSeason.test(title);
}

/** 只识别明确列出不同季数的合集；附赠 OVA 或同季重复标记不算跨季。 */
export function hasMultipleSeasons(title: string): boolean {
  const multipleSeasons = [
    /\bS(\d{1,2})\s*(?:\+|&|\/|~|-|to|and)\s*S(\d{1,2})\b/gi,
    // 复数或两端季标记足以确认跨季；单数连字符形式另按集号上下文判断。
    /\bSeasons\s*(\d{1,2})\s*(?:\+|&|\/|~|-|to|and)\s*(?:Seasons?\s*)?(\d{1,2})\b/gi,
    /\bSeason\s*(\d{1,2})\s*(?:\+|&|\/|~|to|and)\s*(?:Season\s*)?(\d{1,2})\b/gi,
    /\bSeason\s*(\d{1,2})\s*-\s*Season\s*(\d{1,2})\b/gi,
    /第\s*(\d{1,2})\s*[-~+、]\s*(\d{1,2})\s*季/g,
  ];
  if (
    multipleSeasons.some((pattern) =>
      [...title.matchAll(pattern)].some(
        (match) => Number(match[1]) !== Number(match[2])
      )
    )
  )
    return true;

  return [...title.matchAll(/\bSeason\s*(\d{1,2})\s*-\s*(\d{1,2})\b/gi)].some(
    (match) => {
      if (Number(match[1]) === Number(match[2])) return false;
      // 仅在这个连字符确实引出集号时解除跨季拦截。截到别名边界，避免后方
      // SxxExx 的优先级遮住当前集号，或用其他别名的编号放行 Season 1-4 合集。
      const clause = title.slice(match.index!).split(/[|｜/／]/, 1)[0];
      const episode = matchEpisode(clause);
      return !(
        episode &&
        episode.start === match[0].indexOf("-") &&
        episode.end >= match[0].length
      );
    }
  );
}

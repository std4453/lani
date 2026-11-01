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
    /\bSeasons?\s*(\d{1,2})\s*(?:\+|&|\/|~|-|to|and)\s*(\d{1,2})\b/gi,
    /第\s*(\d{1,2})\s*[-~+、]\s*(\d{1,2})\s*季/g,
  ];
  return multipleSeasons.some((pattern) =>
    [...title.matchAll(pattern)].some(
      (match) => Number(match[1]) !== Number(match[2])
    )
  );
}

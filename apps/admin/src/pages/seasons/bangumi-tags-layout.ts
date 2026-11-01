// 为 +X 预留位置，标签与隐藏数量共同限制在一行内。
export function visibleTagCount(
  widths: number[],
  available: number,
  moreWidth: (hidden: number) => number,
  gap: number = 4,
): number {
  const total = (count: number) =>
    widths.slice(0, count).reduce((sum, width) => sum + width, 0) +
    Math.max(0, count - 1) * gap;
  if (total(widths.length) <= available) return widths.length;
  for (let count = widths.length - 1; count >= 0; count--) {
    if (
      total(count) + (count ? gap : 0) + moreWidth(widths.length - count) <=
      available
    )
      return count;
  }
  return 0;
}

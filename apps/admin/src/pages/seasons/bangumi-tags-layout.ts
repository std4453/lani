// 为 +X 预留位置，使标签和隐藏数量一起限制在两行内。
export function visibleTagCount(
  widths: number[],
  available: number,
  moreWidth: (hidden: number) => number,
  gap: number = 4,
): number {
  const fits = (items: number[]) => {
    let row = 1;
    let used = 0;
    for (const width of items) {
      const next = used ? used + gap + width : width;
      if (next > available && used) {
        row++;
        used = width;
      } else {
        used = next;
      }
      if (row > 2) return false;
    }
    return true;
  };
  if (fits(widths)) return widths.length;
  for (let count = widths.length - 1; count >= 0; count--) {
    if (fits([...widths.slice(0, count), moreWidth(widths.length - count)])) {
      return count;
    }
  }
  return 0;
}

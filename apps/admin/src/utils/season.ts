/**
 * 获取季度搜索用关键词，考虑到季度后面可能会有“第二季”这种，只提取空格分隔的第一部分
 */
export function getSeasonKeyword(title: string) {
  return title.split(/\s+/)[0];
}

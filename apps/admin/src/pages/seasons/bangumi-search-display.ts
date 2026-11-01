import { SearchBangumiQuery } from '@/generated/types';

export type BangumiSearchItem = SearchBangumiQuery['searchBangumi'][number];
export const platformColors: Record<string, string> = {
  TV: 'blue',
  WEB: 'cyan',
  剧场版: 'orange',
  OVA: 'purple',
};
const normalize = (value: string) =>
  value.normalize('NFKC').trim().toLowerCase();

export function isBangumiResultVisible(
  item: BangumiSearchItem,
  options: { hideDoujin: boolean; hideUnknown: boolean; useNewApi: boolean },
) {
  return (
    !(options.hideDoujin && item.tags.some((tag) => tag.trim() === '同人')) &&
    !(
      options.useNewApi &&
      options.hideUnknown &&
      !Object.hasOwnProperty.call(platformColors, item.platform ?? '')
    )
  );
}

// 只隐藏独立时间标签，保留标题或普通词中的数字（例如「86」「四月是你的谎言」）。
export function isCalendarTag(value: string) {
  const tag = normalize(value).replace(/\s+/g, '');
  return /^(?:\d{4}(?:年)?(?:[-/.]?(?:0?[1-9]|1[0-2])月?|[春夏秋冬](?:季|番)?|第?[一二三四1-4]季度|q[1-4])?|(?:0?[1-9]|1[0-2])月(?:番|新番)?|[春夏秋冬](?:季|番)|第?[一二三四1-4]季度|q[1-4])$/.test(
    tag,
  );
}

export function bangumiDisplayTags(item: BangumiSearchItem): string[] {
  const names = new Set([item.name, ...item.aliases].map(normalize));
  const hiddenPlatforms = new Set(Object.keys(platformColors).map(normalize));
  if (item.platform) hiddenPlatforms.add(normalize(item.platform));
  return item.tags.filter(
    (tag) =>
      !isCalendarTag(tag) &&
      !names.has(normalize(tag)) &&
      !hiddenPlatforms.has(normalize(tag)),
  );
}

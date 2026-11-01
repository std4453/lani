import {
  bangumiDisplayTags,
  BangumiSearchItem,
  isBangumiResultVisible,
  isCalendarTag,
} from './bangumi-search-display';
const item: BangumiSearchItem = {
  id: '1',
  added: false,
  name: '葬送的芙莉莲',
  aliases: ['葬送のフリーレン', 'Frieren'],
  platform: 'TV',
  tags: [
    'TV',
    'WEB',
    'OVA',
    '剧场版',
    '2023年10月',
    '2023',
    '秋季',
    '葬送的芙莉莲',
    '葬送のフリーレン',
    'frieren',
    '奇幻',
  ],
};
it('时间、名称、别名和分类标签不再重复展示', () => {
  expect(bangumiDisplayTags(item)).toEqual(['奇幻']);
  expect(bangumiDisplayTags({ ...item, platform: null })).toEqual(['奇幻']);
  expect(
    bangumiDisplayTags({
      ...item,
      platform: '动态漫画',
      tags: ['动态漫画', '漫画改'],
    }),
  ).toEqual(['漫画改']);
});
it.each([
  '2024年',
  '2024年4月',
  '2024-04',
  '2024年春季',
  '2024第四季度',
  '4月',
  '4月新番',
  '春季',
  'Q1',
])('隐藏时间标签 %s', (tag) => expect(isCalendarTag(tag)).toBe(true));
it.each(['86', '四月是你的谎言', '夏目友人帐', '2024号作品', '第二季'])(
  '保留普通标签 %s',
  (tag) => expect(isCalendarTag(tag)).toBe(false),
);
it('新版过滤同人与未知分类，旧版忽略未知分类，筛选可独立关闭', () => {
  const options = { hideDoujin: true, hideUnknown: true, useNewApi: true };
  expect(isBangumiResultVisible(item, options)).toBe(true);
  expect(isBangumiResultVisible({ ...item, tags: ['同人'] }, options)).toBe(
    false,
  );
  for (const platform of [null, '', '动态漫画'])
    expect(isBangumiResultVisible({ ...item, platform }, options)).toBe(false);
  expect(
    isBangumiResultVisible(
      { ...item, platform: null },
      { ...options, useNewApi: false },
    ),
  ).toBe(true);
  expect(
    isBangumiResultVisible(
      { ...item, platform: '动态漫画' },
      { ...options, hideUnknown: false },
    ),
  ).toBe(true);
  expect(
    isBangumiResultVisible(
      { ...item, tags: ['同人'] },
      { ...options, hideDoujin: false },
    ),
  ).toBe(true);
});

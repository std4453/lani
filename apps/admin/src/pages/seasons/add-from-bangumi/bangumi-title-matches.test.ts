import { bangumiTitleMatches } from './bangumi-title-matches';
const highlighted = (title: string, query: string) =>
  bangumiTitleMatches(title, query).map(({ index, length }) =>
    title.slice(index, index + length),
  );

it('多关键词、大小写、重复词及正则字符均按字面量精确命中', () => {
  expect(
    highlighted('Fate/stay night [TV] 第二季', 'fate [TV] 第二季 无关'),
  ).toEqual(['Fate', '[TV]', '第二季']);
  expect(highlighted('芙利莲与芙莉莲', '芙利莲 芙利莲')).toEqual(['芙利莲']);
  expect(highlighted('芙莉莲 芙莉莲', '芙莉莲')).toEqual(['芙莉莲', '芙莉莲']);
});
it('中文替换、插入和删除高亮完整片段', () => {
  expect(highlighted('葬送的芙莉莲', '芙利莲')).toEqual(['芙莉莲']);
  expect(highlighted('葬送的芙莉莲', '葬送芙莉莲')).toEqual(['葬送的芙莉莲']);
  expect(highlighted('葬送的芙莉莲', '芙莉莉莲')).toEqual(['芙莉莲']);
  expect(highlighted('葬送的芙莉莲', '葬送 芙利莲')).toEqual([
    '葬送',
    '芙莉莲',
  ]);
});
it('短词只精确匹配，年份和季度数字不模糊替换或拆开误标', () => {
  expect(highlighted('芙莉莲', '芙利')).toEqual([]);
  expect(highlighted('芙莉莲', '莉')).toEqual(['莉']);
  expect(highlighted('芙莉莲 第二季 2023', '芙利莲第三季 2024')).toEqual([
    '芙莉莲',
  ]);
  expect(highlighted('芙莉莲 第12季', '第2季 2')).toEqual([]);
  expect(highlighted('20240', '2024')).toEqual([]);
  expect(highlighted('2024 第一季', '2024 第一季')).toEqual(['2024', '第一季']);
});
it('别名、无关词、同分歧义以及跨标点的片段允许不高亮', () => {
  expect(highlighted('葬送的芙莉莲', 'Frieren')).toEqual([]);
  expect(highlighted('葬送的芙莉莲', '机动战士')).toEqual([]);
  expect(highlighted('芙莉莲与芙丽莲', '芙利莲')).toEqual([]);
  expect(highlighted('芙·莉·莲', '芙利莲')).toEqual([]);
  expect(highlighted('作品 400602', 'bgmid:400602')).toEqual([]);
});
it('Unicode 下标和重叠精确片段正确，超长输入仅精确匹配', () => {
  expect(highlighted('🌸葬送的芙莉莲', '芙利莲')).toEqual(['芙莉莲']);
  expect(highlighted('葬送的芙莉莲', '芙莉莲 莉莲')).toEqual([
    '芙莉莲',
    '莉莲',
  ]);
  expect(highlighted('甲'.repeat(50), '甲'.repeat(35) + '乙')).toEqual([]);
  expect(highlighted('甲'.repeat(50), '甲'.repeat(40))).toEqual([
    '甲'.repeat(40),
  ]);
});

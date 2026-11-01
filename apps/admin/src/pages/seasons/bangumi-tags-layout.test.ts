import { visibleTagCount } from './bangumi-tags-layout';
it('整行能容纳时不折叠，空标签不占位', () => {
  expect(visibleTagCount([48, 48], 100, () => 24)).toBe(2);
  expect(visibleTagCount([], 100, () => 24)).toBe(0);
});
it('为 +X 预留宽度，不把左侧内容顶高', () => {
  expect(visibleTagCount([48, 48, 48], 100, () => 24)).toBe(1);
  expect(visibleTagCount([100, 100], 100, () => 24)).toBe(0);
});
it('窄屏、长标签、多位隐藏数量和零宽度', () => {
  const more = (hidden: number) => (hidden >= 10 ? 32 : 24);
  expect(visibleTagCount(Array(15).fill(40), 128, more)).toBe(2);
  expect(visibleTagCount(Array(15).fill(40), 84, more)).toBe(1);
  expect(visibleTagCount([84, 20], 84, more)).toBe(0);
  expect(visibleTagCount([20], 0, more)).toBe(0);
});

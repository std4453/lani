import { visibleTagCount } from './bangumi-tags-layout';

it('完整两行容纳时不折叠', () => {
  expect(visibleTagCount([48, 48, 48, 48], 100, () => 24)).toBe(4);
  expect(visibleTagCount([], 100, () => 24)).toBe(0);
});

it('为 +X 留出位置，数量包含被挤出的标签', () => {
  expect(visibleTagCount([48, 48, 48, 48, 48], 100, () => 24)).toBe(3);
  expect(visibleTagCount([100, 100, 100], 100, () => 24)).toBe(1);
});

it('随容器宽度重新排布，支持长标签和多位隐藏数量', () => {
  const widths = Array(15).fill(40);
  const moreWidth = (hidden: number) => (hidden >= 10 ? 32 : 24);
  expect(visibleTagCount(widths, 128, moreWidth)).toBe(5);
  expect(visibleTagCount(widths, 84, moreWidth)).toBe(3);
  expect(visibleTagCount([84, 20, 20, 20, 20], 84, moreWidth)).toBe(3);
});

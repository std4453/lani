import { hasExplicitSeason, hasMultipleSeasons } from "./index";

test.each([
  "Anime S02E03",
  "Anime S2 - 03",
  "Anime 2nd Season",
  "Anime Season 2",
  "Anime Second Season",
  "Anime シーズン 2",
  "动画 第二季",
  "动画 第二期",
  "动画 第2季",
])("recognizes explicit season markers: %s", (title) => {
  expect(hasExplicitSeason(title)).toBe(true);
  expect(hasMultipleSeasons(title)).toBe(false);
});

test.each([
  "Anime 1080p",
  "Anime - 13.5",
  "Anime Part 2",
  "Anime 2026",
  "Anime STUDIO",
  "动画 第2集",
])("does not infer season markers from unrelated numbers: %s", (title) => {
  expect(hasExplicitSeason(title)).toBe(false);
  expect(hasMultipleSeasons(title)).toBe(false);
});

test.each([
  "Anime S01-S03",
  "Anime S1 + S2",
  "Anime Seasons 1 + 2",
  "Anime Season 1 to 3",
  "动画 第1-3季",
])("recognizes distinct seasons in collections: %s", (title) => {
  expect(hasMultipleSeasons(title)).toBe(true);
  // 连续调用不得受全局正则的 lastIndex 影响。
  expect(hasMultipleSeasons(title)).toBe(true);
});

test.each([
  "Anime S01-S01 E03",
  "Anime S1+OVA",
  "Anime 01-12",
  "Anime Seasons 1 + 1",
  "动画 第1-1季",
])("keeps same-season releases and extras: %s", (title) => {
  expect(hasMultipleSeasons(title)).toBe(false);
});

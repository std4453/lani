import {
  detectImportOffset,
  ImportEpisodeCandidate,
} from "./detectImportOffset";
import { EpisodeInfo } from "./types";
const range = (a: number, b: number) =>
  Array.from({ length: b - a + 1 }, (_, i) => a + i);
const files = (numbers: number[]): EpisodeInfo[] =>
  numbers.map((index) => ({ type: "episode", index }));
const season = (
  numbers: number[],
  missing = numbers
): ImportEpisodeCandidate[] =>
  numbers.map((number) => ({
    type: "episode",
    number,
    available: !missing.includes(number),
    active: false,
  }));
it.each([
  [
    "动物狂想曲历史映射",
    range(13, 24),
    range(1, 12),
    range(1, 12),
    12,
    "selected",
  ],
  ["刃牙道历史映射", range(14, 25), range(1, 12), range(1, 12), 13, "selected"],
  ["十一集结构派生", range(12, 22), range(1, 11), range(1, 11), 11, "selected"],
  ["大偏移构造", range(61, 72), range(1, 12), range(1, 12), 60, "selected"],
  ["缺集覆盖零偏移", range(1, 6), range(1, 24), range(13, 18), -12, "selected"],
  ["补齐后半季", range(19, 24), range(1, 12), range(7, 12), 12, "selected"],
  [
    "不连续缺集",
    [13, 14, 16, 19, 21, 24],
    range(1, 12),
    [1, 2, 4, 7, 9, 12],
    12,
    "selected",
  ],
  [
    "全缺定位不明确",
    range(13, 18),
    range(1, 12),
    range(1, 12),
    null,
    "ambiguous",
  ],
  [
    "两段缺集",
    range(25, 30),
    range(1, 24),
    [...range(1, 6), ...range(13, 18)],
    null,
    "ambiguous",
  ],
  [
    "危险偏移一",
    range(2, 13),
    range(1, 12),
    range(1, 12),
    null,
    "small-offset",
  ],
  ["完整原编号", range(13, 18), range(1, 25), range(1, 25), 0, "original"],
  ["小鲨鱼元数据只有一集", range(61, 72), [1], [1], null, "out-of-range"],
  [
    "离群文件",
    [...range(13, 24), 99],
    range(1, 12),
    range(1, 12),
    null,
    "out-of-range",
  ],
  [
    "元数据空洞",
    range(13, 24),
    range(1, 12).filter((n) => n !== 5),
    [],
    null,
    "out-of-range",
  ],
  ["不足六集", range(13, 17), range(1, 12), range(1, 12), null, "insufficient"],
  [
    "重复编号",
    [13, 14, 15, 16, 17, 17],
    range(1, 12),
    range(1, 12),
    null,
    "duplicate",
  ],
  ["无季度记录", range(13, 24), [], [], null, "out-of-range"],
  ["无缺集", range(1, 12), range(1, 12), [], 0, "original"],
  ["负偏移", range(1, 12), range(13, 24), range(13, 24), -12, "selected"],
  [
    "危险负偏移",
    range(1, 12),
    range(2, 13),
    range(2, 13),
    null,
    "small-offset",
  ],
  [
    "六个小数编号",
    range(13, 18).map((n) => n + 0.5),
    range(1, 6).map((n) => n + 0.5),
    range(1, 6).map((n) => n + 0.5),
    12,
    "selected",
  ],
  [
    "不允许小数偏移",
    range(13, 18).map((n) => n + 0.5),
    range(1, 6),
    range(1, 6),
    null,
    "out-of-range",
  ],
] as const)("%s", (_label, input, numbers, missing, offset, reason) => {
  const result = detectImportOffset(
    files([...input]),
    season([...numbers], [...missing])
  );
  expect(result.offset).toBe(offset);
  expect(result.reason).toBe(reason);
});
it("范围、无法解析、特别篇不增加普通编号证据", () => {
  expect(
    detectImportOffset(
      [
        ...files(range(13, 17)),
        undefined,
        { type: "sp", index: 1 },
        { type: "ova", index: 2 },
        { type: "oad", index: 3 },
        { type: "episode", index: { from: 18, to: 24 } },
      ],
      season(range(1, 12))
    ).reason
  ).toBe("insufficient");
  expect(
    detectImportOffset(
      [...files(range(13, 24)), { type: "sp", index: 99 }],
      season(range(1, 12))
    ).offset
  ).toBe(12);
});
it("进行中任务不计缺集且扣冲突分", () => {
  const episodes = season(range(1, 12));
  episodes[0].active = true;
  const candidate = detectImportOffset(files(range(13, 24)), episodes)
    .candidates[0];
  expect(candidate.components.missingHit).toBeCloseTo((40 * 11) / 12);
  expect(candidate.components.missingCoverage).toBe(10);
  expect(candidate.components.active).toBeCloseTo(-20 / 12);
});
it("打乱顺序不改变结果且不修改输入", () => {
  const input = files(range(13, 24));
  const episodes = season(range(1, 12));
  const before = JSON.stringify({ input, episodes });
  expect(
    detectImportOffset([...input].reverse(), [...episodes].reverse())
  ).toEqual(detectImportOffset(input, episodes));
  expect(JSON.stringify({ input, episodes })).toBe(before);
});
it("29568 组边界组合均不越界、不开小偏移或低置信偏移", () => {
  let count = 0;
  for (const length of [6, 11, 12, 13, 24, 25, 26])
    for (let start = -24; start <= 63; start++)
      for (let size = 1; size <= 48; size++) {
        const input = range(start, start + size - 1);
        const episodes = season(range(1, length));
        const result = detectImportOffset(files(input), episodes);
        if (result.offset !== null && result.offset !== 0) {
          expect(size).toBeGreaterThanOrEqual(6);
          expect(Math.abs(result.offset)).toBeGreaterThanOrEqual(6);
          expect(
            input.every((n) =>
              episodes.some((e) => e.number === n - result.offset!)
            )
          ).toBe(true);
          if (result.candidates[1])
            expect(
              result.candidates[0].score - result.candidates[1].score
            ).toBeGreaterThanOrEqual(8);
        }
        count++;
      }
  expect(count).toBe(29568);
});

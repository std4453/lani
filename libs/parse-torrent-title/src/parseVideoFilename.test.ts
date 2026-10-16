import { parseVideoFilename } from "./parseVideoFilename";
it.each([
  ["/media/062-标题.mkv", "episode", 62],
  ["/media/13.mkv", "episode", 13],
  ["/media/13.5.mkv", "episode", 13.5],
  ["/media/[Group] Anime - 13 [1080p].mkv", "episode", 13],
  ["/media/Anime SP01.mkv", "sp", 1],
  ["/media/Anime OVA02.mkv", "ova", 2],
  ["/media/Anime OAD03.mkv", "oad", 3],
] as const)("从文件名识别 %s 并保留位置", (name, type, index) => {
  const result = parseVideoFilename(name)!;
  expect(result.episodeInfo).toEqual({ type, index });
  expect(
    name.slice(
      result.position.index,
      result.position.index + result.position.length
    )
  ).toMatch(/\d/);
});
it.each(["unknown.mkv", "1080p.mkv", "2026-title.mkv", "10-bit.mkv"])(
  "不把 %s 当集数",
  (name) => expect(parseVideoFilename(name)).toBeUndefined()
);
it("范围不退化成首集编号", () =>
  expect(
    typeof parseVideoFilename("Anime - 01-12.mkv")?.episodeInfo.index
  ).not.toBe("number"));

it.each([
  ["/media/[Group] Anime - 13 [1080p].mkv", "13"],
  ["/media/Anime - 13.5 [1080p].mkv", "13.5"],
  ["/media/Anime S02E02 [1080p].mkv", "02"],
  ["/media/Anime [13v2].mkv", "13"],
  ["/media/Anime - １３ [1080p].mkv", "１３"],
])("%s 仅高亮普通单集编号", (filename, expected) => {
  const result = parseVideoFilename(filename)!;
  expect(
    filename.slice(
      result.position.index,
      result.position.index + result.position.length
    )
  ).toBe(expected);
});

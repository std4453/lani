import parse from "./parseTorrentTitle";
import {
  explicitEpisodeKind,
  hasSeasonZero,
  isMixedEpisodePackage,
} from "./episodeKind";

it.each([
  ["S00E04", "sp", 4],
  ["[SP][08]", "sp", 8],
  ["【特别篇】【04】", "sp", 4],
  ["[OVA][04]", "ova", 4],
  ["[OAD][04]", "oad", 4],
])(
  "keeps separated release markers in their own namespace: %s",
  (marker, kind, index) => {
    const title = `[Group] Anime ${marker} [1080p][CHT]`;
    expect(explicitEpisodeKind(title)).toBe(kind);
    expect(parse(title)?.episodeInfo).toEqual({ type: kind, index });
    expect(parse(title)?.index).toBeUndefined();
  }
);

it.each([
  "Anime S01E00",
  "Special 7 - 03",
  "Nijiyon Animation - 04",
  "OVAtion - 05",
  "AS00E03",
])(
  "does not classify a normal title or episode zero as season zero: %s",
  (title) => {
    expect(hasSeasonZero(title)).toBe(false);
    expect(explicitEpisodeKind(title)).toBeUndefined();
  }
);

it.each([
  "[Anime][05+小剧场][CHT]",
  "[Anime][附小剧场][07]",
  "Anime 03 + Mini",
])("identifies an explicitly attached short: %s", (title) => {
  expect(isMixedEpisodePackage(title)).toBe(true);
});

it("preserves ranges and the ordinary episode zero", () => {
  expect(parse("[Group] Anime S01E00 [1080p]")?.episodeInfo).toEqual({
    type: "episode",
    index: 0,
  });
  expect(parse("[Group] Anime [01-12][SP][1080p]")?.episodeInfo).toEqual({
    type: "episode",
    index: { from: 1, to: 12 },
  });
  expect(isMixedEpisodePackage("Mini Anime - 03")).toBe(false);
});

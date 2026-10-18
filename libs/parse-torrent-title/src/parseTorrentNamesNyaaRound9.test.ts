import { parseTorrentNames } from "@/parseTorrentNames";
import parseTorrentTitle from "@/parseTorrentTitle";

const aliases = (input: string) => parseTorrentNames(input).title.aliases;

describe("Nyaa 第九轮完整发行字段", () => {
  test.each([
    "BD-BOX",
    "ThaiBD",
    "VHS DivX5 MP3",
    "Volume 1",
    "rev3",
    "Dub+Sub",
    "2026, TV, 03 из 12",
    "特别话",
    "特別話",
  ])("完整发行块不成为另名：%s", (tag) => {
    expect(aliases(`[Publisher] First Tale - 03 [1080p] [${tag}]`)).toEqual([
      "First Tale",
    ]);
  });

  test.each([
    ["[Publisher] First Tale - 16 HD [DE4D1F85].mp4", ["First Tale"]],
    ["[Publisher] First Tale - 20 FHD [DE4D1F85].mp4", ["First Tale"]],
    ["[Publisher] HD Adventures - 03 [1080p]", ["HD Adventures"]],
    ["[Publisher] Volume Adventures - 03 [1080p]", ["Volume Adventures"]],
    [
      "[Publisher] Revision rev3 Adventures - 03 [1080p]",
      ["Revision rev3 Adventures"],
    ],
    ["[Publisher] First Tale BDRemux", ["First Tale"]],
    [
      "[Publisher] First Tale (Another Tale) [1080p]_rev3",
      ["First Tale", "Another Tale"],
    ],
    [
      "[Publisher] First Tale | 第一物語 | Volume 1 (Blu-ray Remux)",
      ["First Tale", "第一物語"],
    ],
    ["[Publisher] First Tale Subs for Example-Raws [BD].zip", ["First Tale"]],
    [
      "[Publisher] First Tale Subs+Fonts for Example-Raws [BD].zip",
      ["First Tale"],
    ],
    ["[Publisher] First Tale for You - 03 [1080p]", ["First Tale for You"]],
  ] as Array<[string, string[]]>)("%s", (input, expected) => {
    expect(aliases(input)).toEqual(expected);
  });
});

describe("Nyaa 第九轮收录列表和单季限定", () => {
  test.each([
    ["[Publisher] First Tale (Season 1,2,3 + Movie) [BD]", ["First Tale"]],
    ["[Publisher] First Tale (Episodes 3,4,5,12) [BD]", ["First Tale"]],
    ["[Publisher] First Tale (Episodes 3-5, 8, 12) [BD]", ["First Tale"]],
    ["[Publisher] First Tale (Season 1) [BD]", ["First Tale (Season 1)"]],
    ["[Publisher] First Tale - 01,06,08-10,31 [1080p]", ["First Tale"]],
    ["[Publisher] First Tale 01,06,08-10,31 [1080p]", ["First Tale"]],
    ["[Publisher] First Tale 100,000 [BDRip]", ["First Tale 100,000"]],
    [
      "[Publisher] First Tale 100,000 Miles - 03 [1080p]",
      ["First Tale 100,000 Miles"],
    ],
    [
      "[Publisher] First Tale + OAD (BD HEVC 1080p FLAC) | Another Tale",
      ["First Tale", "Another Tale"],
    ],
    [
      "[Publisher] First Tale + Another Tale [BDRip]",
      ["First Tale + Another Tale"],
    ],
    ["[Publisher] First Tale (S1+OVA+Sp) [BDRip]", ["First Tale (S1)"]],
    ["[Publisher] First Tale (S1+OVA+Sp) - 03 [1080p]", ["First Tale (S1)"]],
    ["[Publisher] First Tale [BDRip] (S1+OVA+SP)", ["First Tale"]],
    ["[Publisher] First Tale [English] (S2+OVA)", ["First Tale"]],
    [
      "[Publisher] First Tale / (S2+OVA) 第二物語 - 03 [1080p]",
      ["First Tale", "第二物語"],
    ],
    [
      "[Publisher] First Tale / 第二物語 (S2+OVA) - 03 [1080p]",
      ["First Tale", "第二物語 (S2)"],
    ],
    [
      "[Publisher] First Tale (S2+OVA) / 第二物語 - 03 [1080p]",
      ["First Tale (S2)", "第二物語"],
    ],
  ] as Array<[string, string[]]>)("%s", (input, expected) => {
    expect(aliases(input)).toEqual(expected);
  });

  test("名称清理不改变公共解析器的剧集编号", () => {
    const parsed = parseTorrentTitle(
      "[Publisher] First Tale - 03 [1080p] [BD-BOX]"
    );
    expect(parsed?.title?.aliases).toEqual(["First Tale"]);
    expect(parsed?.episodeInfo).toEqual({ type: "episode", index: 3 });
  });
});

describe("Nyaa 第九轮名称内部符号与缩写另名", () => {
  test.each([
    [
      "[Publisher] Animatica「第一物語」 / First Tale - 03 [1080p]",
      ["Animatica「第一物語」", "First Tale"],
    ],
    ["[Publisher] Unknown「第一物語」 - 03 [1080p]", ["Unknown「第一物語」"]],
    [
      "[Publisher] First Tale - Question//answer (WEB 1080p AAC)",
      ["First Tale - Question//answer"],
    ],
    [
      "[Publisher] First Tale // Another Tale - 03 [1080p]",
      ["First Tale", "Another Tale"],
    ],
    [
      "[Publisher] First Tale//Another / 第一物語 - 03 [1080p]",
      ["First Tale//Another", "第一物語"],
    ],
    [
      "[Publisher] First Tale (First ga Last made no Story, FirstLast) - 03 [1080p]",
      ["First Tale", "First ga Last made no Story", "FirstLast"],
    ],
    [
      "[Publisher] First Tale (VOSTFR, First ga Last made no Story, FirstLast) - 03 [1080p]",
      ["First Tale", "First ga Last made no Story", "FirstLast"],
    ],
    [
      "[Publisher] First Tale (First ga Last made no Story, FirstLight) - 03 [1080p]",
      ["First Tale", "First ga Last made no Story, FirstLight"],
    ],
    [
      "[Publisher] First Tale (First no Story, Return) - 03 [1080p]",
      ["First Tale", "First no Story, Return"],
    ],
  ] as Array<[string, string[]]>)("%s", (input, expected) => {
    expect(aliases(input)).toEqual(expected);
  });
});

describe("第九轮历史复审的名称续接保护", () => {
  test.each([
    ["[Publisher] First Tale.BDRemux", ["First Tale"]],
    ["[Publisher] First Tale_BDRemux", ["First Tale"]],
    [
      "[Publisher] First Tale.BDRemux Another Name - 03 [1080p]",
      ["First Tale.BDRemux Another Name"],
    ],
    [
      "[Publisher] First Tale_BDRemux Another Name - 03 [1080p]",
      ["First Tale_BDRemux Another Name"],
    ],
    [
      "[Publisher] 第一物語 第二季//First Tale S2/Another Tale [1080p]",
      ["第一物語 第二季", "First Tale S2", "Another Tale"],
    ],
    [
      "[Publisher] First Tale S2//第一物語 第二季 [1080p]",
      ["First Tale S2", "第一物語 第二季"],
    ],
    [
      "[Publisher] First Tale//Another Tale [1080p]",
      ["First Tale//Another Tale"],
    ],
    [
      "[Publisher] 第一物語 (First Tale) (Season 1 + OVA) [BDRip]",
      ["第一物語", "First Tale (Season 1)"],
    ],
    [
      "[Publisher] First Tale (Season 1 + OVA + Sp) [BDRip]",
      ["First Tale (Season 1)"],
    ],
    ["[Publisher] First Tale [English] (Season 1 + OVA)", ["First Tale"]],
    [
      "[Publisher] First Tale / (Season 1 + OVA) 第二物語 - 03 [1080p]",
      ["First Tale", "第二物語"],
    ],
    ["[Publisher] First Tale BDRemux", ["First Tale"]],
    ["[Publisher] First Tale BDRemux 1080p x265", ["First Tale"]],
    [
      "[Publisher] First Tale BDRemux 第二物語 别名 1-11 [1080p]",
      ["First Tale BDRemux 第二物語 别名"],
    ],
    [
      "[Publisher] First Tale BDRemux Another Name - 03 [1080p]",
      ["First Tale BDRemux Another Name"],
    ],
  ] as Array<[string, string[]]>)("%s", (input, expected) => {
    expect(aliases(input)).toEqual(expected);
  });
});

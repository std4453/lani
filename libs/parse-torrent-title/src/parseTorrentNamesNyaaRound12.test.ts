import { parseTorrentNames } from "@/parseTorrentNames";
import parseTorrentTitle from "@/parseTorrentTitle";

describe("最近十天第十二轮名称边界", () => {
  test.each([
    [
      "[Publisher] Aurora S03 PART I MULTi 1080p CR WEBRiP AAC 2.0 (Hoshi no Monogatari, VF, VOSTFR)",
      ["Aurora S03 PART I", "Hoshi no Monogatari"],
    ],
    ["[Publisher] Aurora S03 PART II [1080p]", ["Aurora S03 PART II"]],
    ["[Publisher] Aurora S03 Part IV - 03 [1080p]", ["Aurora S03 Part IV"]],
    ["[Publisher] Aurora S01+S02 [BD 1080p]", ["Aurora"]],
    ["[Publisher] Aurora S01 - S03 [BD 1080p]", ["Aurora"]],
    ["[Publisher] A Part of Aurora - 03 [1080p]", ["A Part of Aurora"]],
    [
      "[Publisher] - Azure Temple - S789012E12 [4K BILIBILI COM WEB-DL] [Golden Curse]",
      ["Azure Temple", "Golden Curse"],
    ],
    [
      "[Publisher] Azure Temple S789012E12 [1080p HEVC] [Golden Curse]",
      ["Azure Temple", "Golden Curse"],
    ],
    [
      "[Publisher] Archive S789012E12 Adventure [1080p]",
      ["Archive S789012E12 Adventure"],
    ],
    ["[Publisher] Archive XS789012E12 [1080p]", ["Archive XS789012E12"]],
    [
      "[Publisher] Archive - S789012E12 [Golden Curse]",
      ["Archive - S789012E12 [Golden Curse]"],
    ],
  ] as Array<[string, string[]]>)("%s", (input, expected) => {
    expect(parseTorrentNames(input).title.aliases).toEqual(expected);
    const integrated = parseTorrentTitle(input);
    if (integrated) expect(integrated.title.aliases).toEqual(expected);
  });

  test("超长季号不会创建普通集数解析结果", () => {
    const input =
      "[Publisher] - Azure Temple - S789012E12 [4K BILIBILI COM WEB-DL] [Golden Curse]";
    expect(parseTorrentTitle(input)).toBeUndefined();
    expect(parseTorrentNames(input).title.aliases).toEqual([
      "Azure Temple",
      "Golden Curse",
    ]);
  });
});

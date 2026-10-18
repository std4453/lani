import { parseTorrentNames } from "@/parseTorrentNames";
import * as organizationParser from "@/parseTorrentOrganization";

const aliases = (input: string) => parseTorrentNames(input).title.aliases;

describe("Nyaa 第八轮完整发行字段", () => {
  test.each([
    "3 Discs",
    "NoLogo",
    "Honorific",
    "HD",
    "1213 HD",
    "Dual JPN+VIE",
    "Multi Japanese+Vietnamese Audio",
    "UHDrip",
    "286-287-288",
  ])("完整技术块不成为另名：%s", (tag) => {
    expect(aliases(`[Publisher] First Tale - 03 [1080p] [${tag}]`)).toEqual([
      "First Tale",
    ]);
  });

  test.each([
    ["[Publisher] NoLogo (2025) [1080p]", ["NoLogo (2025)"]],
    ["[Publisher] Honorific - 03 [1080p]", ["Honorific"]],
    ["[Publisher] First Tale [NoLogo]", ["First Tale [NoLogo]"]],
    ["[Publisher] First Tale NoLogo - 03 [1080p]", ["First Tale NoLogo"]],
    ["[Publisher] First Tale NCOP NCED DVDRIP", ["First Tale"]],
    ["[Publisher] NCOP World - 03 [1080p]", ["NCOP World"]],
    ["[Publisher] First Tale UHDRip HEVC", ["First Tale"]],
    ["[Publisher] First Tale S01 NF WEB-DL H264", ["First Tale S01"]],
    ["[Publisher] The NF Adventures - 03 [1080p]", ["The NF Adventures"]],
    ["[Publisher] First Tale 01-06, 08-12 [BDRip]", ["First Tale"]],
    ["[Publisher] First Tale TV 01-06, 34 [BDRip]", ["First Tale"]],
    ["[Publisher] 21 First Tale 01-06, 34 [BDRip]", ["21 First Tale"]],
    ["[Publisher] First Tale s 01-07 [BDRip]", ["First Tale"]],
    ["[Publisher] First Tale S1+Sp [BDRip]", ["First Tale S1"]],
    [
      "[Publisher] First Tale I-II Subs+Fonts for Example-Subs.zip",
      ["First Tale"],
    ],
    ["[Publisher] First Tale I-II [BDRip]", ["First Tale I-II"]],
  ] as Array<[string, string[]]>)("%s", (input, expected) => {
    expect(aliases(input)).toEqual(expected);
  });
});

describe("Nyaa 第八轮显式另名边界", () => {
  test.each([
    ["첫 이야기 (Director's version)", "첫 이야기 (Director's version)"],
    ["첫 이야기 (Island arc)", "첫 이야기 (Island arc)"],
    ["First Tale (한국어 version)", "First Tale (한국어 version)"],
    ["First Tale - [A New Dawn] Returns", "First Tale - [A New Dawn] Returns"],
    ["First Tale - [A New Dawn] Part 2", "First Tale - [A New Dawn] Part 2"],
  ])("既有篇章、版本和后续正文保护优先于另名：%s", (name, expected) => {
    expect(aliases(`[Publisher] ${name} - 03 [1080p]`)).toEqual([expected]);
  });

  test.each([
    [
      "[Publisher] First Tale - [A New Dawn] / Another Tale - 03 [1080p]",
      ["First Tale", "A New Dawn", "Another Tale"],
    ],
    [
      "[Publisher] First Tale - [A New Dawn] (2024) - 03 [1080p]",
      ["First Tale", "A New Dawn (2024)"],
    ],
    [
      "[Publisher] First Tale (첫 이야기) - 03 [1080p]",
      ["First Tale", "첫 이야기"],
    ],
    [
      "[Publisher] 첫 이야기 (First Tale) - 03 [1080p]",
      ["첫 이야기", "First Tale"],
    ],
    [
      "[Publisher] 첫 이야기 (새 이야기) - 03 [1080p]",
      ["첫 이야기 (새 이야기)"],
    ],
    ["[Publisher] Re _ 첫 이야기 4기 - 03 [1080p]", ["Re _ 첫 이야기 4기"]],
    [
      "[Publisher] First Tale - [A New Dawn] - 03 [1080p]",
      ["First Tale", "A New Dawn"],
    ],
    [
      "[Publisher] First Tale [Some Name] - 03 [1080p]",
      ["First Tale [Some Name]"],
    ],
    [
      "[Publisher] [The Long Name -] [Some Name] - 03 [1080p]",
      ["The Long Name - [Some Name]"],
    ],
    ["[Publisher] First + First Festa [BDRip]", ["First", "First Festa"]],
    ["[Publisher] Love + Peace [BDRip]", ["Love + Peace"]],
    ["[Publisher] First + First [BDRip]", ["First + First"]],
    ["[Publisher] First+First Festa [BDRip]", ["First+First Festa"]],
    [
      "[Publisher] FIRST 1.11 / 2.22 / 3.333 / 3.0+1.11 [BDRip]",
      ["FIRST 1.11", "2.22", "3.333", "3.0+1.11"],
    ],
    ["[Publisher] First Tale / 01 / 02 [BDRip]", ["First Tale"]],
  ] as Array<[string, string[]]>)("%s", (input, expected) => {
    expect(aliases(input)).toEqual(expected);
  });
});

describe("Nyaa 第八轮已识别署名的原文位置", () => {
  test("括号前署名与技术块后裸署名仅删除实际署名段", () => {
    const organization = jest
      .spyOn(organizationParser, "parseTorrentOrganization")
      .mockReturnValue({
        raw: "Example Publisher",
        parts: ["Example Publisher"],
      });
    try {
      expect(aliases("(Example Publisher) First Tale - 03 [1080p]")).toEqual([
        "First Tale",
      ]);
      expect(
        aliases("[Publisher] First Tale [BDRip] - Example Publisher")
      ).toEqual(["First Tale"]);
      expect(
        aliases("[Example Publisher] Example Publisher - 03 [1080p]")
      ).toEqual(["Example Publisher"]);
      expect(aliases("[Publisher] First Tale - Example Publisher")).toEqual([
        "First Tale - Example Publisher",
      ]);
    } finally {
      organization.mockRestore();
    }
  });
});

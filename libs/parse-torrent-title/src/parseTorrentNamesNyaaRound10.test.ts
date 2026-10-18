import { parseTorrentNames } from "@/parseTorrentNames";
import parseTorrentTitle from "@/parseTorrentTitle";

const aliases = (input: string) => parseTorrentNames(input).title.aliases;

describe("Nyaa 第十轮完整发行说明", () => {
  test.each([
    "Matching Soft Subs",
    "ES/LAT",
    "ES-LAT",
    "Dual-Subs",
    "台配",
    "臺配版",
    "國配",
    "韩配版",
    "Repair",
    "new stream",
  ])("完整发行字段不成为名称：%s", (label) => {
    expect(aliases(`[Publisher] First Tale - 03 [1080p] [${label}]`)).toEqual([
      "First Tale",
    ]);
  });

  test.each([
    ["[Publisher] First Tale Dual Audio BD Remux", ["First Tale"]],
    ["[Publisher] First Tale - ONA [1080p NF WEB-DL AAC]", ["First Tale"]],
    ["[Publisher] First Tale Seasons 1-5 BD_1080p FLAC", ["First Tale"]],
    ["[Publisher] The Seasons - 03 [1080p]", ["The Seasons"]],
    ["[Publisher] Repair - 03 [1080p]", ["Repair"]],
    ["[Publisher] New Stream (2025) [1080p]", ["New Stream (2025)"]],
    ["[Publisher] First Tale for You - 03 [1080p]", ["First Tale for You"]],
    ["[台配字幕组] First Tale - 03 [1080p]", ["First Tale"]],
  ] as Array<[string, string[]]>)("%s", (input, expected) => {
    expect(aliases(input)).toEqual(expected);
  });
});

describe("Nyaa 第十轮句内括注与逗号", () => {
  test.each([
    [
      "[Publisher] Futsuu no Worker desu (Pride) - 03 [1080p]",
      ["Futsuu no Worker desu (Pride)"],
    ],
    [
      "[Publisher] Futsuu no Worker desu (First Tale) - 03 [1080p]",
      ["Futsuu no Worker desu", "First Tale"],
    ],
    ["[Publisher] First Tale (Pride) - 03 [1080p]", ["First Tale", "Pride"]],
    [
      "[Publisher] First Tale (And Another Thing) - 03 [1080p]",
      ["First Tale (And Another Thing)"],
    ],
    [
      "[Publisher] First Tale (OrAnotherTitle) - 03 [1080p]",
      ["First Tale", "OrAnotherTitle"],
    ],
    [
      "[Publisher] 第一物語 (And Another Thing) - 03 [1080p]",
      ["第一物語", "And Another Thing"],
    ],
    [
      "[Publisher] First Tale (Hero? Angel? Iie, Futsuu no Worker desu (Pride)!, Multi-Subs) - 03 [1080p]",
      ["First Tale", "Hero? Angel? Iie, Futsuu no Worker desu (Pride)!"],
    ],
    [
      "[Publisher] First Tale (VOSTFR, Hero Angel Iie, Futsuu no Worker desu (Pride)) - 03 [1080p]",
      ["First Tale", "Hero Angel Iie, Futsuu no Worker desu (Pride)"],
    ],
    [
      "[Publisher] First Tale (First no Story: Second no Tensei, S-Rank Another Path, Multi-Subs) - 03 [1080p]",
      ["First Tale", "First no Story: Second no Tensei, S-Rank Another Path"],
    ],
    [
      "[Publisher] First Tale (First no Story ~Second no Story, Third Path~, Multi-Subs) - 03 [1080p]",
      ["First Tale", "First no Story ~Second no Story, Third Path~"],
    ],
    [
      "[Publisher] First Tale (VOSTFR, A Hero: A Long Tale, Dai no Monogatari) - 03 [1080p]",
      ["First Tale", "A Hero: A Long Tale", "Dai no Monogatari"],
    ],
    [
      "[Publisher] First Tale (First no Story: Second no Story, 第二物語, Multi-Subs) - 03 [1080p]",
      ["First Tale", "First no Story: Second no Story", "第二物語"],
    ],
    [
      "[Publisher] First Tale (And Another Thing)! S01E12 1080p CR WEB-DL AAC | Seito? Tenshi? Iie, Futsuu no Worker desu (Pride)!",
      [
        "First Tale (And Another Thing)!",
        "Seito? Tenshi? Iie, Futsuu no Worker desu (Pride)!",
      ],
    ],
  ] as Array<[string, string[]]>)("%s", (input, expected) => {
    expect(aliases(input)).toEqual(expected);
  });
});

describe("Nyaa 第十轮数字与版本边界", () => {
  test.each([
    [
      "[Publisher] 第一物語 (魔力解放版) / First Tale - 03 [1080p]",
      ["第一物語 (魔力解放版)", "First Tale"],
    ],
    [
      "[Publisher] 第一物語（全解放版） / First Tale - 03 [1080p]",
      ["第一物語", "First Tale"],
    ],
    ["[Publisher] 第一物語 [1080p] (魔力解放版)", ["第一物語"]],
    ["[Publisher] 第一物語 [年齡限制版] - 03 [1080p]", ["第一物語"]],
    ["[Publisher] First Tale 999 2026 S01E12 [1080p]", ["First Tale 999"]],
    ["[Publisher] First Tale 1 2 2026 S03E01 [1080p]", ["First Tale 1 2 2026"]],
    ["[Publisher] First Tale 1/2 2026 S03E01 [1080p]", ["First Tale 1/2 2026"]],
    ["[Publisher] First Tale 2023 - 03 [1080p]", ["First Tale 2023"]],
    [
      "[Publisher] First Tale 1.0 (1.11) You Are (Not) Here [BDRip 1080p]",
      ["First Tale 1.0 (1.11) You Are (Not) Here"],
    ],
    [
      "[Publisher] First Tale (1.11) You Are (Not) Here [BDRip 1080p]",
      ["First Tale", "You Are (Not) Here"],
    ],
    [
      "[Publisher] First Tale - 44-Cloudy Beach [480p CR WEB-DL AVC AAC]",
      ["First Tale"],
    ],
    [
      "[Publisher] First Tale 100 - To Be Remembered 10-bit 1080p HEVC BDRip [Fin]",
      ["First Tale 100 - To Be Remembered"],
    ],
  ] as Array<[string, string[]]>)("%s", (input, expected) => {
    expect(aliases(input)).toEqual(expected);
  });

  test("名称边界调整不改变公共集号", () => {
    const parsed = parseTorrentTitle(
      "[Publisher] Futsuu no Worker desu (Pride) - 03 [1080p]"
    );
    expect(parsed?.title?.aliases).toEqual(["Futsuu no Worker desu (Pride)"]);
    expect(parsed?.episodeInfo).toEqual({ type: "episode", index: 3 });
  });
});

describe("第十轮括注绑定遵守独立名称边界", () => {
  test.each([
    [
      "[Publisher] First Tale / (And Another Story) - 03 [1080p]",
      ["First Tale", "And Another Story"],
    ],
    [
      "[Publisher] First Tale | (And Another Story) - 03 [1080p]",
      ["First Tale", "And Another Story"],
    ],
    [
      "[Publisher] Futsuu no Worker desu / (Pride) - 03 [1080p]",
      ["Futsuu no Worker desu", "Pride"],
    ],
    [
      "[Publisher] Futsuu no Worker desu ／ (Pride) - 03 [1080p]",
      ["Futsuu no Worker desu", "Pride"],
    ],
    [
      "[Publisher] First Tale / (魔力解放版) Another Tale - 03 [1080p]",
      ["First Tale", "Another Tale"],
    ],
    ["[Publisher] First Tale [English] (魔力解放版)", ["First Tale"]],
    [
      "[Publisher] Futsuu no Worker desu [English] (Pride)",
      ["Futsuu no Worker desu", "Pride"],
    ],
    [
      "[Publisher] First Tale 1.0 (1.11) You Are / Another Tale - 03 [1080p]",
      ["First Tale 1.0 (1.11) You Are", "Another Tale"],
    ],
  ] as Array<[string, string[]]>)("%s", (input, expected) => {
    expect(aliases(input)).toEqual(expected);
  });

  test.each([
    ["| Another Tale", "Another Tale"],
    ["/ Another Tale", "Another Tale"],
    ["／ 第二物語", "第二物語"],
  ])("集号后的括注别名保留后续显式字段：%s", (suffix, followingName) => {
    expect(
      aliases(
        `[Publisher] First Tale - 03 [1080p] | Futsuu no Worker desu (Pride)! ${suffix}`
      )
    ).toEqual(["First Tale", "Futsuu no Worker desu (Pride)!", followingName]);
  });

  test("没有分隔符的尾部正文不另造独立名称", () => {
    expect(
      aliases(
        "[Publisher] First Tale - 03 [1080p] | Futsuu no Worker desu (Pride)! Another Story"
      )
    ).not.toContain("Another Story");
  });

  test.each(["/", "／", "|"])("无标点括注后仍保留显式另名：%s", (separator) => {
    expect(
      aliases(
        `[Publisher] First Tale - 03 [1080p] | Futsuu no Worker desu (Pride) ${separator} Another Tale`
      )
    ).toEqual(["First Tale", "Futsuu no Worker desu (Pride)", "Another Tale"]);
  });

  test("括注后的普通横杠正文不成为另名", () => {
    expect(
      aliases(
        "[Publisher] First Tale - 03 [1080p] | Futsuu no Worker desu (Pride) - Another Tale"
      )
    ).not.toContain("Another Tale");
  });

  test.each([
    "S01E03 1080p WEB-DL AAC",
    "- 03 1080p WEB-DL AAC",
    "S01E03 [1080p WEB-DL AAC]",
    "- 03 [1080p WEB-DL AAC]",
  ])("版本续接不会吞掉集号后的显式别名：%s", (release) => {
    expect(
      aliases(
        `[Publisher] First Tale 1.0 (1.11) You Are ${release} | Another Tale`
      )
    ).toEqual(["First Tale 1.0 (1.11) You Are", "Another Tale"]);
  });
});

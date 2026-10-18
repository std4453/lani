import { parseTorrentNames } from "@/parseTorrentNames";
import * as organizationParser from "@/parseTorrentOrganization";

const aliases = (input: string) => parseTorrentNames(input).title.aliases;

describe("Nyaa 第六轮发行标签与名称标点", () => {
  test.each([
    "Mini-Batch",
    "Complete",
    "Complete Batch",
    "OAV",
    "Betamax",
    "BDISO",
    "BD-RMSTR",
    "Sub_Esp-XviD",
    "VERSION_LIGHT",
    "preliminary version",
    "JP Dub and Sub",
  ])("独立发行标签不作为名称：%s", (tag) => {
    expect(aliases(`[Example-Subs] First Tale - 03 [1080p] [${tag}]`)).toEqual([
      "First Tale",
    ]);
  });

  test.each([
    [
      "[Example-Subs] First Tale S01E03 (Dai Ichi no Chikara, Korean Premiere)",
      ["First Tale", "Dai Ichi no Chikara"],
    ],
    [
      "[Example-Subs] First Tale (Island arc) - 1178 [1080p].mkv",
      ["First Tale (Island arc)"],
    ],
    [
      "[Example-Subs] 第一物语 (First;Gate) - 01 [1080p]",
      ["第一物语", "First;Gate"],
    ],
    [
      "[Example-Subs] First Tale S01E03 (First;Gate; 第一物语; Another Tale) [1080p]",
      ["First Tale", "First;Gate", "第一物语", "Another Tale"],
    ],
    [
      "[Example-Subs] First Tale S01E03 (第一物语;Dai Ichi Monogatari) [1080p]",
      ["First Tale", "第一物语", "Dai Ichi Monogatari"],
    ],
    ["[Example-Subs] First Tale (2001) [Complete]", ["First Tale (2001)"]],
    [
      "[Example-Subs] First Tale S01E03 [ZPLAT.WEB-DL 1080P AVC, AAC, HARD SUB (EN)]",
      ["First Tale"],
    ],
    [
      "[Example-Subs] First Tale S01 REMASTERED MULTi 1080p WEB-DL (Dai Ichi, VF)",
      ["First Tale S01", "Dai Ichi"],
    ],
    [
      "[Example-Subs] First Tale 15th Anniversary Remastered S01E03 [1080p]",
      ["First Tale 15th Anniversary Remastered"],
    ],
    [
      "[Example-Subs] First Tale (15th Anniv. Remastered) - 03 [1080p]",
      ["First Tale (15th Anniv. Remastered)"],
    ],
    [
      "[Example-Subs] First Tale S01E03 (VOSTFR, Dai Ichi no Ossan, Kensei ni Naru)",
      ["First Tale", "Dai Ichi no Ossan, Kensei ni Naru"],
    ],
    [
      "[Example-Subs] First Tale S01E03 (VOSTFR, Dai Ichi sama, Tadaima Isekai e Tabi II, Another World II)",
      [
        "First Tale",
        "Dai Ichi sama, Tadaima Isekai e Tabi II",
        "Another World II",
      ],
    ],
    [
      "[Example-Subs] First Tale S01E03 (VOSTFR, Yoru no Tabi, Yoru no Tabi 2nd Season)",
      ["First Tale", "Yoru no Tabi", "Yoru no Tabi 2nd Season"],
    ],
    [
      "[Example-Subs] First Tale S01E03 (VOSTFR, Fuyu no Mori, Haru no Michi)",
      ["First Tale", "Fuyu no Mori", "Haru no Michi"],
    ],
    [
      "[Example-Subs] First Tale Subs+Fonts for Example-Raws [BD].zip",
      ["First Tale"],
    ],
    [
      "[Example-Subs] First Tale X 134 - The Final Future.mkv",
      ["First Tale X"],
    ],
    ["First Tale TV 07-15,18-33 [ARR][LD]", ["First Tale"]],
    [
      "[BDMV][250101-250601][第一物语 / First Tale][BDMV][Vol.1-6 FIN][JPN]-ExampleRaws",
      ["第一物语", "First Tale"],
    ],
    [
      "[Example-Subs] Fictional Animation Study Group - 1988 Animation Theatre (Betamax)",
      ["1988 Animation Theatre"],
    ],
  ] as Array<[string, string[]]>)("%s", (input, expected) => {
    expect(aliases(input)).toEqual(expected);
  });
});

describe("名称中的下划线、季号与收录范围", () => {
  test.each([
    ["[Example-Subs]_First_Tale_1180_[VOSTFR][FHD_1080p].mkv", ["First_Tale"]],
    ["[Example-Subs]_First_Tale_05_[239AD6BF].mkv", ["First_Tale"]],
    [
      "[Example-Subs]First_Tale_4th_18_[1920x1080][HEVC].mkv",
      ["First_Tale_4th"],
    ],
    ["[Example-Subs] First_Tale_2024_ [1080p]", ["First_Tale_2024"]],
    ["[Example-Subs] First_Tale_42 [1080p]", ["First_Tale_42"]],
    [
      "[Example-Subs] First Tale 日本語。S1+OVA [BDRip 1080p] (Dai Ichi │ Another Tale)",
      ["First Tale 日本語。S1", "Dai Ichi", "Another Tale"],
    ],
    [
      "[Example-Subs] First Tale 日本語 S2+OVA [BDRip 1080p]",
      ["First Tale 日本語 S2"],
    ],
    [
      "[Example-Subs] First Tale - S01 [1080p] (Multi-Audio) (German/Deutsch) (Season 1)",
      ["First Tale - S01"],
    ],
    [
      "[Example-Subs] First Tale S01E03 [1080p] | Dai Ichi Monogatari (Season 2)",
      ["First Tale", "Dai Ichi Monogatari (Season 2)"],
    ],
    [
      "[Example-Subs] First Tale / Dai Ichi Monogatari (Season 2) [1080p]",
      ["First Tale", "Dai Ichi Monogatari (Season 2)"],
    ],
    [
      "[Example-Subs] First Tale S01>S03+FILM BDRIP 1080p X265 VOSTFR",
      ["First Tale"],
    ],
  ] as Array<[string, string[]]>)("%s", (input, expected) => {
    expect(aliases(input)).toEqual(expected);
  });
});

describe("同名署名、版本后续名称与明确发行尾缀", () => {
  test.each(["SharedName", "Shared Name", "Fictional Animation Study Group"])(
    "制作组与作品同名仍保留名称：%s",
    (name) => {
      expect(aliases(`[${name}] ${name} - 01 [1080p]`)).toEqual([name]);
    }
  );

  test.each([
    [
      "[Example-Subs] First Tale (2023) Wonder Voyage Latest PV (Post-150 Extra) (1080p Opus)",
      ["First Tale (2023) Wonder Voyage"],
    ],
    [
      "[Example-Subs] First Tale (2023) Wonder Voyage - 03 [1080p]",
      ["First Tale (2023) Wonder Voyage"],
    ],
    [
      "[Example-Subs] First Tale (2023) / Another Tale - 03 [1080p]",
      ["First Tale (2023)", "Another Tale"],
    ],
    [
      "[Example-Subs] First Tale (2023) 第二物语 - 03 [1080p]",
      ["First Tale (2023)", "第二物语"],
    ],
    [
      "Dai Ichi Monogatari - First Tale - 第一物语 720 / 480",
      ["Dai Ichi Monogatari", "First Tale", "第一物语"],
    ],
    ["[Example-Subs] First Tale 1080 / 720 / 480", ["First Tale"]],
    ["First Tale 720", ["First Tale 720"]],
    ["[Example-Subs] First Tale - 24 Sub valencià-español", ["First Tale"]],
    ["[Example-Subs] First Tale - 24 Sub Spanish-English", ["First Tale"]],
    [
      "[Example-Subs] Sub English Adventures - 03 [1080p]",
      ["Sub English Adventures"],
    ],
    [
      "第一物语 R170「迷路的旅人（デジタルリマスター）」 (1080p TVer WEB-DL)",
      ["第一物语"],
    ],
    ["[Example-Subs] Project R170 - 03 [1080p]", ["Project R170"]],
    ["[Example-Subs] ProjectR170 - 03 [1080p]", ["ProjectR170"]],
    ["[Example-Subs] 第一物语 - 特别篇 [1080p]", ["第一物语 - 特别篇"]],
  ] as Array<[string, string[]]>)("%s", (input, expected) => {
    expect(aliases(input)).toEqual(expected);
  });
});

describe("历史标题中的符号与版本后发行信息", () => {
  test.each([
    [
      "[Example-Subs] First Tale / ダイイチ剧场版:│▌ / Dai Ichi:|| [BDRip 1080p]",
      ["First Tale", "ダイイチ剧场版:│▌", "Dai Ichi:||"],
    ],
    [
      "[Example-Subs] First Tale S01E03 (Dai Ichi │ Another Tale) [1080p]",
      ["First Tale", "Dai Ichi", "Another Tale"],
    ],
    [
      "[Example-Subs] 第一物语1／2 (だいいち1／2；Dai Ichi 1／2) [1080p]",
      ["第一物语1／2", "だいいち1／2", "Dai Ichi 1／2"],
    ],
    [
      "[Example-Subs] 第一物语 (First;Gate 0) [1080p]",
      ["第一物语", "First;Gate 0"],
    ],
  ] as Array<[string, string[]]>)("%s", (input, expected) => {
    expect(aliases(input)).toEqual(expected);
  });

  test.each([
    "VOL01-VOL8 DVDR NTSC",
    "S\u200b01 - S\u200b03 [1080p]",
    "Mp3.3.1G",
  ])("年份后发行字段不回拼名称：%s", (releaseTail) => {
    expect(aliases(`First Tale (1991) ${releaseTail}`)[0]).toBe(
      "First Tale (1991)"
    );
  });

  test("年份后已识别的署名不回拼名称", () => {
    const organization = jest
      .spyOn(organizationParser, "parseTorrentOrganization")
      .mockReturnValue({
        raw: "Example Publisher",
        parts: ["Example Publisher"],
      });
    try {
      expect(aliases("First Tale (1980) Example Publisher")[0]).toBe(
        "First Tale (1980)"
      );
    } finally {
      organization.mockRestore();
    }
  });
});

describe("俄语发布的编号电视版本", () => {
  test.each([
    [
      "First Tale | Первая история [ТВ-2] [2026] [12 of 26] [WEBRip] [1080p] [RUS + JAP]",
      ["First Tale", "Первая история [ТВ-2]"],
    ],
    [
      "First Tale | Первая история [TV-1] [2026] [12 of 26] [WEBRip] [1080p]",
      ["First Tale", "Первая история [TV-1]"],
    ],
    [
      "First Tale | Первая история | Another Tale [TV-3] - 03 [1080p]",
      ["First Tale", "Первая история", "Another Tale [TV-3]"],
    ],
    [
      "First Tale | Первая история  [ТВ-12] [1080p]",
      ["First Tale", "Первая история  [ТВ-12]"],
    ],
    [
      "First Tale | Первая история[ТВ-2] [1080p]",
      ["First Tale", "Первая история[ТВ-2]"],
    ],
    [
      "First Tale | Первая история [TV] [1080p]",
      ["First Tale", "Первая история"],
    ],
    [
      "First Tale | Первая история [1080p] [ТВ-2]",
      ["First Tale", "Первая история"],
    ],
    [
      "First Tale | Первая история [1080p] [TV-2]",
      ["First Tale", "Первая история"],
    ],
    [
      "First Tale | Первая история [1080p] | [TV-2]",
      ["First Tale", "Первая история"],
    ],
    ["[Example-Subs] First Tale [TV-12] [1080p]", ["First Tale"]],
    ["[Example-Subs] 第一物语 [TV-12] [1080p]", ["第一物语"]],
    ["[Переводчики] First Tale [TV-12] [1080p]", ["First Tale"]],
    ["First Tale [RUS + JAP] [TV-12] [1080p]", ["First Tale"]],
  ] as Array<[string, string[]]>)("%s", (input, expected) => {
    expect(aliases(input)).toEqual(expected);
  });
});

describe("编号电视版本不得跨过分隔或署名", () => {
  test.each(["|", "｜", "│", "/", "／"])(
    "独立字段中的编号TV不绑定前名：%s",
    (separator) => {
      expect(
        aliases(`First Tale | Первая история ${separator} [TV-2]`)
      ).toEqual(["First Tale", "Первая история"]);
    }
  );

  test("中间署名不成为标题组成部分，也不允许版本号跨过署名绑定", () => {
    const organization = jest
      .spyOn(organizationParser, "parseTorrentOrganization")
      .mockReturnValue({
        raw: "Example Publisher",
        parts: ["Example Publisher"],
      });
    try {
      const parsed = parseTorrentNames(
        "First Tale | Первая история [Example Publisher] [TV-2] - 03 [1080p]"
      );
      expect(parsed.title.aliases).toEqual(["First Tale", "Первая история"]);
      expect(parsed.organization?.parts).toEqual(["Example Publisher"]);
    } finally {
      organization.mockRestore();
    }
  });

  test("完整作品名内部的双竖线仍允许绑定版本", () => {
    expect(aliases("First Tale | Первая история:|| [TV-2] [1080p]")).toEqual([
      "First Tale",
      "Первая история:|| [TV-2]",
    ]);
  });
});

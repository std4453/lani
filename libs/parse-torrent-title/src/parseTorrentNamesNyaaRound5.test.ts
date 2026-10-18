import { parseTorrentNames } from "@/parseTorrentNames";

const aliases = (input: string) => parseTorrentNames(input).title.aliases;

describe("Nyaa 第五轮交付标签与名称边界", () => {
  test.each([
    "Censored",
    "Censored Version",
    "CUSTOM",
    "더빙",
    "Audio_Fixed",
    "Audio Fixed",
    "HDR 10bits",
    "總第67~85",
    "37/NCOPED_02",
    "MULTi-FRENCH/VOSTFR",
    "305 à 336",
  ])("完整元信息块不成为标题：%s", (tag) => {
    expect(aliases(`[Demo] First Tale - 03 [1080p] (${tag})`)).toEqual([
      "First Tale",
    ]);
  });

  test.each([
    [
      "[Demo] First Tale 中文名称 S1+OVAs [BDRip 1080p x265]",
      ["First Tale 中文名称 S1"],
    ],
    [
      "[Demo] First Tale 2 日本語 S2+Sp [BDRip 1080p x265]",
      ["First Tale 2 日本語 S2"],
    ],
    ["First Tale - CUSTOM DVDRIP - VOSTFR - x264 AC3", ["First Tale"]],
    [
      "[Demo] First Tale S01 Part1 1080p CR WEB-DL AAC",
      ["First Tale S01 Part1"],
    ],
    ["[Demo] First Tale S01Part1 [1080p]", ["First Tale S01Part1"]],
    ["[Demo] First Tale S2 Part 2 - 20 [1080p]", ["First Tale S2 Part 2"]],
    [
      "[Demo] First Tale S01E01 (Dai Ichi Monogatari!, Multi-Subs, Censored)",
      ["First Tale", "Dai Ichi Monogatari!"],
    ],
    ["[Demo] - 蓝色星球 - 第番外话 - [1080p WEB-DL]", ["蓝色星球"]],
    ["First Tale sub only", ["First Tale"]],
    [
      "[Demo]First_Tale_~Tenri-hen~_OVAs_-_01~02[DVD-Rip][1280x720]",
      ["First_Tale_~Tenri-hen~"],
    ],
    [
      "[Demo] First Tale (2025) CUSTOM VOSTFR 2160p (4K) HDR 10bits BluRay x265",
      ["First Tale (2025)"],
    ],
    [
      "[Demo] First Tale S01E03 (Wanmei Shijie 6, 完美世界 第六季)",
      ["First Tale", "Wanmei Shijie 6", "完美世界 第六季"],
    ],
    [
      "[Demo] First Tale S01E03 (日本語の物語; Mouse Cursor, I'm Gonna Click Away!) [1080p]",
      ["First Tale", "日本語の物語", "Mouse Cursor, I'm Gonna Click Away!"],
    ],
    [
      "[Demo-Subs] First Tale S5 ep 01-13 END (1080p+hardsub) [Other-Raws&Third-Subs]",
      ["First Tale S5"],
    ],
    [
      "REPACK First.Tale.Movie.2010.MULTI.1080p.BDRip.x264-Example-Raws",
      ["First.Tale"],
    ],
    ["first tale s4 cour 2 hq", ["first tale s4"]],
    ["[Demo] First Tale 1180 [2160p][x265].mp4", ["First Tale"]],
    ["[Demo] First Tale 380 [1080p]", ["First Tale"]],
    [
      "Text Editor 4 Build 4142 (x64) + Crack",
      ["Text Editor 4 Build 4142", "x64", "+ Crack"],
    ],
    ["Text Editor Version 4142 [1080p]", ["Text Editor Version 4142"]],
    ["Text Editor Build 42 [1080p]", ["Text Editor Build 42"]],
    ["Text Editor 4142 (x64)", ["Text Editor 4142", "x64"]],
    ["Text Editor 380 (x64)", ["Text Editor 380", "x64"]],
    ["Text Editor 4142", ["Text Editor 4142"]],
    ["[Demo] First Tale 2023 - 03 [1080p]", ["First Tale 2023"]],
    [
      "[DVDISO] First Tale (1979-1980) [R2JP] | A Different Tale / 星の物語",
      ["First Tale (1979-1980)", "A Different Tale", "星の物語"],
    ],
    ["[Demo] First_Tale_(1983-1986)_001-128_[DVD]", ["First_Tale"]],
    ["[Demo] First Tale Season 1-5 (2013-2021)", ["First Tale Season"]],
    ["[Demo] First Tale Season 1-2 (1983-1984)", ["First Tale Season"]],
    [
      "[Demo] First Tale The Complete Series (2009–2015)",
      ["First Tale The Complete Series"],
    ],
    [
      "[Demo] 第一物语 第四季合集 全（前篇+后篇+小剧场） / First Tale 4th [總第67~85][1080p]",
      ["第一物语 第四季", "First Tale 4th"],
    ],
    ["[Demo] Custom World - 03 [1080p]", ["Custom World"]],
    ["[Demo] Audio Fixed Adventures - 03 [1080p]", ["Audio Fixed Adventures"]],
  ] as Array<[string, string[]]>)("%s", (input, expected) => {
    expect(aliases(input)).toEqual(expected);
  });
});

describe("新口径：季号只绑定原文紧邻的名称", () => {
  test.each([
    [
      "[Demo] First Tale / Dai Ichi Monogatari (Season 2) - 03 [1080p]",
      ["First Tale", "Dai Ichi Monogatari (Season 2)"],
    ],
    [
      "[Demo] First Tale Season 2 / Dai Ichi Monogatari - 03 [1080p]",
      ["First Tale Season 2", "Dai Ichi Monogatari"],
    ],
    [
      "[Demo] First Tale (Season 2) / Dai Ichi Monogatari - 03 [1080p]",
      ["First Tale (Season 2)", "Dai Ichi Monogatari"],
    ],
    [
      "[Demo] First Tale / Dai Ichi Monogatari - Season 3 Episode 1 [1080p]",
      ["First Tale", "Dai Ichi Monogatari - Season 3"],
    ],
    [
      "[Demo] First Tale (Dai Ichi Monogatari) (Season 01) [1080p]",
      ["First Tale", "Dai Ichi Monogatari (Season 01)"],
    ],
    [
      "[Demo] First Tale (Dai Ichi Monogatari) Season 2 - 03 [1080p]",
      ["First Tale", "Dai Ichi Monogatari Season 2"],
    ],
    [
      "[Demo] First Tale (Dai Ichi Monogatari) - Season 2 Episode 1 [1080p]",
      ["First Tale", "Dai Ichi Monogatari - Season 2"],
    ],
    [
      "[Demo] First Tale / Dai Ichi Monogatari [Season 2] - 03 [1080p]",
      ["First Tale", "Dai Ichi Monogatari [Season 2]"],
    ],
    [
      "[Demo] First Tale [Season 2] / Dai Ichi Monogatari - 03 [1080p]",
      ["First Tale [Season 2]", "Dai Ichi Monogatari"],
    ],
    [
      "[Demo] First Tale (Dai Ichi Monogatari)  (Season 02) [1080p]",
      ["First Tale", "Dai Ichi Monogatari  (Season 02)"],
    ],
    ["[Demo] First Tale S01E03 [1080p] | Season 2 | S2", ["First Tale"]],
    ["[Demo] First Tale [1080p] | (Season 2)", ["First Tale"]],
    [
      "[Demo] First Tale S01E03 [1080p] | Dai Ichi Monogatari (Season 2)",
      ["First Tale", "Dai Ichi Monogatari (Season 2)"],
    ],
    [
      "[Demo] First Tale S01E03 [1080p] | Dai Ichi Monogatari - Season 2",
      ["First Tale", "Dai Ichi Monogatari - Season 2"],
    ],
  ] as Array<[string, string[]]>)("%s", (input, expected) => {
    expect(aliases(input)).toEqual(expected);
  });
});

import { parseTorrentNames } from "@/parseTorrentNames";
import parseTorrentTitle from "@/parseTorrentTitle";
const aliases = (input: string) => parseTorrentNames(input).title.aliases;
const integratedAliases = (input: string) =>
  (parseTorrentTitle(input) ?? parseTorrentNames(input)).title.aliases;

describe("组合收录标签与发行参数", () => {
  test.each([
    ["Blue Planet S1+S2+Movie", ["Blue Planet"]],
    ["Blue Planet TV+剧场版合集", ["Blue Planet"]],
    ["Blue Planet 剧场版合集", ["Blue Planet 剧场版"]],
    ["蓝色行星合集", ["蓝色行星"]],
    ["Blue Planet - 合集", ["Blue Planet"]],
    ["Blue Planet - Ocean - 合集", ["Blue Planet - Ocean"]],
    ["Blue Planet - Vol.7 END", ["Blue Planet"]],
    ["Blue Planet - Vol.8 FIN", ["Blue Planet"]],
    ["Blue Planet - EX", ["Blue Planet"]],
    [
      "蓝色行星.Blue Planet S02 FRENCH 1080p WEB-DL",
      ["蓝色行星", "Blue Planet S02"],
    ],
    ["Blue Planet FRENCH S03 1080p", ["Blue Planet S03"]],
    ["蓝色行星KJ File 01 GB 1090P 内挂字幕", ["蓝色行星KJ File"]],
    ["蓝色行星 086 1090P 内挂字幕", ["蓝色行星"]],
    ["蓝色行星 86 GB 1090P 内挂字幕", ["蓝色行星 86"]],
    [
      "Animatica「蓝色行星」 / Blue Planet Part 2 - 03 [1080p]",
      ["Animatica「蓝色行星」", "Blue Planet Part 2"],
    ],
  ])("可靠尾标签与完整标题前缀：%s", (title, expected) => {
    expect(parseTorrentNames(`[Release Subs] ${title}`).title.aliases).toEqual(
      expected
    );
  });
});

describe("Nyaa 数字与版本边界", () => {
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
});

describe("字幕附件与预告发行说明", () => {
  test("技术后的重复季号不跨说明字段拼接名称", () => {
    const actual = integratedAliases(
      "[Publisher] 星空物語 第二季 / Starry Tale 2 / 星の物語2 [13-24][WEBRip 1080p HEVC AAC]【Platform官译】（Season 2 S2）"
    );
    expect(actual).toEqual(
      expect.arrayContaining(["星空物語 第二季", "Starry Tale 2", "星の物語2"])
    );
    expect(actual.some((name) => /官译.*Season|Season 2 S2/.test(name))).toBe(
      false
    );
  });
});

describe("Nyaa 发行参数与版本边界", () => {
  test.each([
    [
      "[Demo] First Tale - S01E01 (星の物語; Hoshi no Monogatari.) [MW.WEB-DL 1080p AVC AAC]",
      ["First Tale", "星の物語", "Hoshi no Monogatari."],
    ],
    [
      "[Demo] First_Tale_(2026)_-_Ep_01[Hi10p][1920x1080][X264-AAC][WEB][Sub_Esp]",
      ["First_Tale_(2026)"],
    ],
    [
      "[Demo] First Tale 1997 REMASTERED MULTi 1080p WEB-DL H.265 (Dai Ichi Monogatari, VF, VOSTFR)",
      ["First Tale", "Dai Ichi Monogatari"],
    ],
    [
      "First Tale 1997.CUSTOM.MULTi.DVDRip.x264-Example-Raws (Dai Ichi Monogatari) (VF/VOSTFR)",
      ["First Tale", "Dai Ichi Monogatari"],
    ],
    [
      "[Demo] First Tale S01E03 (Dai Ichi Monogatari 4th Season Part 1 & 2, Multi-Subs)",
      ["First Tale", "Dai Ichi Monogatari 4th Season"],
    ],
    [
      "[Demo] First Tale S04 PART I MULTi 1080p WEBRip AAC (Dai Ichi Monogatari, VF, VOSTFR)",
      ["First Tale S04 PART I", "Dai Ichi Monogatari"],
    ],
    ["[DVDISO] A-7 (2006) [R2JP] | A-七", ["A-7 (2006)", "A-七"]],
    [
      "[Demo] First Tale {Even the First Story Has Its Holes) [Uncensored] - S01E02 [1080p]",
      ["First Tale", "Even the First Story Has Its Holes"],
    ],
    [
      "[Demo] First Tale - Season 03 (S03) (BD Remux 1080p H.264 TrueHD) [Dual Audio]",
      ["First Tale - Season 03 (S03)"],
    ],
    [
      "[Demo] First Tale - Season 05 (S05) (WEB 1080p H.264 AAC) [Dual Audio] (Dai Ichi Monogatari / Final Season)",
      ["First Tale - Season 05 (S05)", "Dai Ichi Monogatari"],
    ],
    [
      "[Demo] firstsand the animation - S01E40 (firstsand animation; Firstsand) [ABEMA.WEB-DL 1080p AVC AAC]",
      ["firstsand the animation", "firstsand animation", "Firstsand"],
    ],
    [
      "[Demo][4K HBR HQ] First Tale / 星の物語 / Hoshi no Monogatari - S01E12",
      ["First Tale", "星の物語", "Hoshi no Monogatari"],
    ],
    [
      "[Demo] 第一物语 序章 + 终章 / First Tale Part 1+2 10-bit 1080p HEVC BDRip [Fin]",
      ["第一物语 序章 + 终章", "First Tale Part 1+2"],
    ],
    [
      "[搬运][Example-Raws] First Tale (1989) - OVA (JPN Blu-ray Remux | 1080p x264 | FLAC 2.0 | English / .ASS) | 星の物語 OVA",
      ["First Tale (1989)", "星の物語"],
    ],
    [
      "First Tale OVA - 01–03 (1080p AV1 AAC) | Dai Ichi Monogatari OVA (1997) Remastered",
      ["First Tale OVA", "Dai Ichi Monogatari OVA (1997)"],
    ],
    [
      "[Demo] First Tale (Dai Ichi Monogatari) - Episodes 1 - 10",
      ["First Tale", "Dai Ichi Monogatari"],
    ],
    [
      "First.Tale.S01.v2.1080p.BluRay.Dual-Audio.Opus.x265-Example-Raws (Dai Ichi Monogatari)",
      ["First.Tale.S01", "Dai Ichi Monogatari"],
    ],
    [
      "First Tale | Dai Ichi Monogatari BD (Bluray 1080p, dual audio) [Example-Raws / Trial-Subs]",
      ["First Tale", "Dai Ichi Monogatari"],
    ],
  ] as Array<[string, string[]]>)("%s", (input, expected) => {
    expect(aliases(input)).toEqual(expected);
  });
  test("年份范围包装边界的下划线仍按分隔清理", () => {
    expect(aliases("[Demo] First_Tale_(1983-1986)_001-128_[DVD]")).toEqual([
      "First_Tale",
    ]);
  });
});

describe("Nyaa 名称与交付说明边界", () => {
  test("没有普通集号的多季归档仍过滤尾部语言说明", () => {
    expect(
      aliases(
        "城市物语.日语.英文字幕.City Story 1-3 and 91 and films dvdrip (JPN audio ENG sub)"
      )
    ).toEqual(["城市物语", "City Story"]);
  });
});

describe("Nyaa 交付标签与名称边界", () => {
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

describe("季号只绑定原文紧邻的名称", () => {
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
    "VOL01-VOL8 DVDR NTSC",
    "S\u200b01 - S\u200b03 [1080p]",
    "Mp3.3.1G",
  ])("年份后发行字段不回拼名称：%s", (releaseTail) => {
    expect(aliases(`First Tale (1991) ${releaseTail}`)[0]).toBe(
      "First Tale (1991)"
    );
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
  test("完整作品名内部的双竖线仍允许绑定版本", () => {
    expect(aliases("First Tale | Первая история:|| [TV-2] [1080p]")).toEqual([
      "First Tale",
      "Первая история:|| [TV-2]",
    ]);
  });
});

describe("Nyaa 收录列表和单季限定", () => {
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
});

describe("发行年份只在明确收录清单边界删除", () => {
  test.each([
    [
      "[Release Subs]蓝色行星 / Blue Planet 2023 | 01-04 [1080p]",
      ["蓝色行星", "Blue Planet"],
    ],
    [
      "[Release Subs]蓝色行星 / Blue Planet (2023) | 01-04 [1080p]",
      ["蓝色行星", "Blue Planet (2023)"],
    ],
    [
      "[Release Subs]蓝色行星 2023年版 / Blue Planet - 03 [1080p]",
      ["蓝色行星 2023年版", "Blue Planet"],
    ],
  ] as Array<[string, string[]]>)("%s", (input, expected) => {
    expect(parseTorrentNames(input).title.aliases).toEqual(expected);
    expect(parseTorrentTitle(input)?.title?.aliases).toEqual(expected);
  });
});

import { parseTorrentNames } from "@/parseTorrentNames";
import parseTorrentTitle from "@/parseTorrentTitle";
const aliases = (input: string) => parseTorrentNames(input).title.aliases;
const integratedAliases = (input: string) =>
  (parseTorrentTitle(input) ?? parseTorrentNames(input)).title.aliases;

describe("字幕附件与预告发行说明", () => {
  test.each([
    [
      "Aurora Studio v6.2.0 (x64) Lifetime Edition Portable",
      ["Aurora Studio v6.2.0", "x64", "Lifetime Edition Portable"],
    ],
    [
      "Nova Studio - v8.1.2 (x64) Lifetime Edition Portable",
      ["Nova Studio - v8.1.2", "x64", "Lifetime Edition Portable"],
    ],
    [
      "Nova Studio - Essential Edition v8.1.2",
      ["Nova Studio - Essential Edition v8.1.2"],
    ],
    [
      "星空工作室收藏.Hayao Aurora and Studio Collection",
      ["星空工作室收藏", "Hayao Aurora and Studio Collection"],
    ],
    [
      "【Example汉化组】[Starry Episode.0][动画短片][SP][繁体][4K][x264 AAC]",
      ["Starry Episode.0"],
    ],
    [
      "[2002] First Tale_星空物語(星の物語 THE ANIMATION EPISODE.0)_OVA",
      ["First Tale", "星空物語", "星の物語 THE ANIMATION EPISODE.0"],
    ],
    [
      "[Example-Raws][星空 联动特别篇 银矿篇/Starry Film Specials - Silver Mine Arc/スターリーフィルム シルバーマイン][0747-0750TV][1080P][BDRip][HEVC-10bit][FLAC][MKV]",
      [
        "星空 联动特别篇 银矿篇",
        "Starry Film Specials - Silver Mine Arc",
        "スターリーフィルム シルバーマイン",
      ],
    ],
    [
      "[Publisher] First Tale Specials - Starry Classroom - 03 [1080p]",
      ["First Tale Specials - Starry Classroom"],
    ],
    [
      "[Publisher] Galactic Audio Drama 2 - Azure Mine Arc - 03 [1080p]",
      ["Galactic Audio Drama 2 - Azure Mine Arc"],
    ],
  ] as Array<[string, string[]]>)(
    "完整作品词与独立子项目的安全边界：%s",
    (input, expected) => {
      expect(integratedAliases(input)).toEqual(expected);
    }
  );
});

describe("Nyaa 发行参数与版本边界", () => {
  test.each([
    "Hulu Adventures",
    "MW Story",
    "Retimed Odyssey",
    "First Tale (15th Anniv. Remastered)",
  ])("名称中的同形词与版本限定保留：%s", (title) => {
    expect(aliases(`[Demo] ${title} - 03 [1080p]`)).toEqual([title]);
  });
});

describe("Nyaa 名称与交付说明边界", () => {
  test.each([
    "Audio Story",
    "Sub World",
    "English Audio Adventure",
    "Audio and Sub",
  ])("包含Audio或Sub的真实正文不按纯说明块过滤：%s", (title) => {
    expect(aliases(`[Demo] ${title} - 03 [1080p]`)).toEqual([title]);
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
});

describe("Nyaa 完整发行标签", () => {
  test.each([
    ["[Example-Subs] Fixed World - 03 [1080p]", ["Fixed World"]],
    ["[Example-Subs] HDR Adventure - 03 [1080p]", ["HDR Adventure"]],
    ["First Tale Complete Series (Dual-Audio)", ["First Tale"]],
    ["The Example Batch (BD 1080p)", ["The Example Batch"]],
    [
      "[Example-Subs] First Tale The Complete Series (2009-2015)",
      ["First Tale The Complete Series"],
    ],
    [
      "[Example-Subs] First Tale (Dai Ichi: First Chronicle) Seasons S1 + S2 [BD][1080p][Multi Dual Audio]",
      ["First Tale", "Dai Ichi: First Chronicle"],
    ],
    ["First.Tale.2024.MULTi.1080p.BluRay.x265-ExampleRaws", ["First.Tale"]],
    [
      "First.Tale.S01.1998.Hybrid.FR-DVDRip.Multi.Audio.x264-ExampleRaws",
      ["First.Tale.S01"],
    ],
    [
      "First.Tale.Movie.2010.MULTI.1080p.BDRip.x264-ExampleRaws",
      ["First.Tale"],
    ],
    ["[Example-Subs] First.Tale.2024 - 03 [1080p]", ["First.Tale.2024"]],
    ["[Example-Subs] Hybrid Worlds - 03 [1080p]", ["Hybrid Worlds"]],
  ] as Array<[string, string[]]>)("%s", (input, expected) => {
    expect(aliases(input)).toEqual(expected);
  });
});

describe("发行说明不能吞主名称或改变标题标点", () => {
  test.each([
    ["[Publisher] Fixed (2025) [1080p]", ["Fixed (2025)"]],
    ["[Publisher] Fixed - 01 [1080p]", ["Fixed"]],
    ["[Publisher] Fixed -01 [1080p]", ["Fixed"]],
    [
      "[Publisher] First Tale (2017) [BDRip][1080p] (Fixed)",
      ["First Tale (2017)"],
    ],
    [
      "[Publisher] My First Star - To the Future - 01 [1080p]",
      ["My First Star - To the Future"],
    ],
    [
      "[Publisher] Your Story - No Way Home - 01 [1080p]",
      ["Your Story - No Way Home"],
    ],
    [
      "[Publisher] Our Last Journey - To the Moon - 01 [1080p]",
      ["Our Last Journey - To the Moon"],
    ],
    [
      "[Publisher] First Tale (Partie 2) -01 [1080p]",
      ["First Tale (Partie 2)"],
    ],
    [
      "[Publisher] First Tale [Partie 2] -01 [1080p]",
      ["First Tale [Partie 2]"],
    ],
    [
      "[Publisher] First Tale  [Partie 2] -01 [1080p]",
      ["First Tale  [Partie 2]"],
    ],
    [
      "[Publisher] First Tale (Partie 2) / Another Tale -01 [1080p]",
      ["First Tale (Partie 2)", "Another Tale"],
    ],
    ["[Publisher] First Tale - 1213 FHD [B0602EC1].mp4", ["First Tale"]],
  ] as Array<[string, string[]]>)("%s", (input, expected) => {
    expect(aliases(input)).toEqual(expected);
  });
});

describe("不足以证明裸集号或独立别名时保留完整名称", () => {
  test.each([
    [
      "[Example-Subs] 第一物语100～ 做完100件事～ / First 100 - Hajime ni Shitai 100 no Koto 10-bit 1080p HEVC BDRip [Fin]",
      [
        "第一物语100～ 做完100件事～",
        "First 100 - Hajime ni Shitai 100 no Koto",
      ],
    ],
    [
      "[Example-Subs] First World 100 - The Last Journey 10-bit 1080p HEVC BDRip [Fin]",
      ["First World 100 - The Last Journey"],
    ],
    [
      "[Example-Subs] First World Collection NTSC DVD5 DVD9 [Example Films]",
      ["First World Collection NTSC DVD5 DVD9 [Example Films]"],
    ],
    ["First World [Example Group]", ["First World [Example Group]"]],
    [
      "[Example-Subs] First Tale 13 - Les voyageurs - 480p.MULTISUB.x264",
      ["First Tale 13 - Les voyageurs"],
    ],
  ] as Array<[string, string[]]>)("%s", (input, expected) => {
    expect(aliases(input)).toEqual(expected);
  });
});

describe("Nyaa 完整发行字段", () => {
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

describe("名称续接保护", () => {
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

describe("中文集号前保留副标题闭合横线", () => {
  test.each([
    [
      "[Example Subs]English 中文 -SUBTITLE- 第01集 [1080p]",
      "English 中文 -SUBTITLE-",
    ],
    [
      "[Example Subs]English 中文 –ANOTHER SUBTITLE– 第02集 [1080p]",
      "English 中文 –ANOTHER SUBTITLE–",
    ],
    ["[Example Subs]蓝色行星-第40话 [1080p]", "蓝色行星"],
    ["[Example Subs]蓝色行星–第40话 [1080p]", "蓝色行星"],
  ])("%s", (input, expected) => {
    expect(parseTorrentNames(input).title.aliases).toEqual([expected]);
    expect(parseTorrentTitle(input)?.title?.aliases).toEqual([expected]);
  });
});

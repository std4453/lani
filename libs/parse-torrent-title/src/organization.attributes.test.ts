import { parseTorrentOrganization } from "@/parseTorrentOrganization";
const groups = (input: string) => parseTorrentOrganization(input)?.parts;

describe("Nyaa 制作署名：配音属性、已核实联合与音轨尾签", () => {
  it.each([
    "[台配] First Tale (Mandarin Chinese Dub)",
    "[臺配] 第一物语 - 01 [1080p]",
    "[中配版] First Tale - 01",
    "[粤配] 第一物语 - 01",
    "[Dual-Subs] First Tale - 01",
    "First Tale - 01 [Dual-Subs]",
    "First Tale - 01 [dual_subs]",
    "First Tale - 01 [Dual Subs]",
    "First Tale - 01 [A Fictional Story, Dual-Subs]",
  ])("完整配音或字幕交付属性不作为发布者：%s", (input) => {
    expect(groups(input)).toBeUndefined();
  });
  it.each([
    ["[Publisher] [台配] First Tale - 01", ["Publisher"]],
    ["[Publisher] First Tale [Dual-Subs]", ["Publisher"]],
    ["[台配字幕组] First Tale - 01", ["台配字幕组"]],
    ["[Nova-DualSubs] First Tale - 01", ["Nova-DualSubs"]],
    ["[Nova-Delta] First Tale - 01", ["Nova-Delta"]],
    ["[STE-MeruMeru] First Tale - 34 [HEVC]", ["STE", "MeruMeru"]],
    ["[AS-NKWT] First Tale - 23 [1080p]", ["AS", "NKWT"]],
    ["First Tale - 01 [STE-MeruMeru]", ["STE", "MeruMeru"]],
    ["First Tale - 01 [AS-NKWT]", ["AS", "NKWT"]],
    ["First Tale (2021) [BluRay.1080p.x265.AAC] [12.8GB] [stress]", ["stress"]],
    ["[Publisher] First Tale [stress]", ["Publisher", "stress"]],
    ["First Tale 2160p BluRay x265 ATMOS-Nova.24", ["Nova.24"]],
    ["First Tale x265 ATMOS-GundamGuy", ["GundamGuy"]],
    ["First Tale 1080p ATMOS7.1-Nova.24.mkv", ["Nova.24"]],
    ["First Tale 1080p ATMOS-Nova264", ["Nova264"]],
    ["First Tale 1080p ATMOS-JPN-Nova", ["JPN-Nova"]],
    ["[Publisher] First Tale [1080p ATMOS-Nova.24]", ["Publisher", "Nova.24"]],
    ["First Tale 1080p x264-Ita", ["Ita"]],
  ])("保留明确原文身份与品牌标点：%s", (input, expected) => {
    expect(groups(input as string)).toEqual(expected);
  });
  it.each([
    "Dual-Subs-Team",
    "DualSubs-Team",
    "Dual-Subs Studio",
    "DualSubs Studio",
    "Nova Dual Subs Team",
    "Dual-Subs Nova Team",
    "Dual-Subs HEVC Team",
    "Dual-Subs-1080p-Team",
  ])("字幕交付词只是完整品牌的一部分时保留：%s", (identity) => {
    expect(groups(`[${identity}] First Tale - 03 [1080p]`)).toEqual([identity]);
    expect(groups(`[Publisher] First Tale - 03 [${identity}]`)).toEqual([
      "Publisher",
      identity,
    ]);
    expect(
      groups(
        `[Publisher] First Tale Subs by ${identity} for ReinForce [BD].zip`
      )
    ).toEqual(["Publisher", identity]);
  });
  it.each([
    "Dual-Subs",
    "DualSubs",
    "Dual Subs",
    "Dual-Subs, English",
    "Dual-Subs-1080p",
    "Dual-Subs 1080p",
    "Dual-Subs HEVC",
    "Dual-Subs 1080p HEVC",
    "Dual-Subs-1080p-HEVC",
    "Dual-Subs English",
    "Dual-Subs-English-Japanese",
    "Dual-Subs.1080p.HEVC",
    "Dual-Subs AAC2.0 x265.10bit",
    "Dual-Subs 1080p DDP5.1",
    "Dual-Subs DTS-HD-MA",
    "Dual-Subs 1080p DTS-HD-MA",
    "Dual-Subs-1080p-DTS-HD-HRA",
    "A Fictional Story, Dual-Subs",
    "Multi-Subs",
    "Hard Subs",
    "Soft Subs",
    "A Fictional Story, Multi-Subs",
    "A Fictional Story, Hard Subs",
    "A Fictional Story, Soft Subs",
  ])("完整字幕属性字段仍不作为身份：%s", (attribute) => {
    expect(groups(`[Publisher] First Tale - 03 [${attribute}]`)).toEqual([
      "Publisher",
    ]);
    expect(groups(`[${attribute}] First Tale - 03 [1080p]`)).toBeUndefined();
    expect(
      groups(`[Publisher] First Tale Subs by ${attribute} [BD].zip`)
    ).toEqual(["Publisher"]);
  });
  it("字幕交付字段的长空白和换行只作为字段分隔", () => {
    const spacing = " ".repeat(16384);
    expect(
      groups(`[Dual-Subs ${spacing}\nHEVC] First Tale - 03`)
    ).toBeUndefined();
    expect(
      groups(`[Publisher] First Tale - 03 [Dual-Subs ${spacing}HEVC]`)
    ).toEqual(["Publisher"]);
    expect(groups("[Dual-Subs \nNova Team] First Tale - 03")).toEqual([
      "Dual-Subs \nNova Team",
    ]);
  });
  it("未知品牌尾段不因出现Dual属性词就整体丢失", () => {
    expect(groups("[Dual-Subs-Nova-Team] First Tale - 03")).toEqual([
      "Dual-Subs-Nova-Team",
    ]);
    expect(groups("[Dual-Subs HEVC Nova Team] First Tale - 03")).toEqual([
      "Dual-Subs HEVC Nova Team",
    ]);
  });
});

it.each([
  // Nyaa 制作署名：旧式文件名、职责来源与联合身份
  "[OCR] Morning Story - 02.ass",
  "[XML chapter files] Morning Story",
  "Morning Story - 02 (English fansub).ass",
  "Morning Story (Netflix Subs)",
  "[Daisuki] Morning Story - 02 Subs",
  "Seto no Hanayome subs [ENG]",
  "Morning Story subs [ENG]",
  "Morning Story - 02 [RippedSubs].ass",
  "Morning Story - 02 [Subtitle-Ohys_Raws].ass",
  "Morning Story Multi-Subs + chapters for DCP (Beatrice-Raws)",
  "[Honorifics] Morning Story - 02.ass",
  // Nyaa 制作身份：字幕来源与适配目标、商品信息和补充署名
  "[BATCH]First Tale 1-19 English Subbed",
  "[BDMV][ANZX-17451][First Tale][JP][BD-BOX]",
  "[BDMV][ANZB-24680][First Tale][JP][BD-BOX]",
  "First Tale (1999) [UnknownChocolate]",
  "First Tale - 03 [Unknown Fans]",
  "First Tale [NOVA-17451][1234ABCD].mkv",
  "First Tale Subs for ReinForce [BD].zip",
  "First Tale Subs for [ReinForce] [BD].zip",
])("制作署名与发布属性边界: %s", (input) => {
  expect(groups(input)).toBeUndefined();
});

describe("Nyaa 制作组：字幕说明和后置联合署名", () => {
  it.each([
    "虚构航海 sub only",
    "Fictional Voyage SUB ONLY",
    "[FIXED-AUDIO] 虚构航海 - 01 v3 (BD 960x720 x265 10bit AAC)",
    "[CORRECTED_AUDIO] 虚构航海 - 01",
    "[REPAIRED-VIDEO] 虚构航海 - 01",
    "[SUBTITLES-FIXED] 虚构航海 - 01",
    "虚构航海 S5 ep 01-13 END (1080p+hardsub)",
    "虚构航海 S5 ep 01-13 END (1080p+softsub)",
  ])("字幕交付和修复标记不创建身份：%s", (input) => {
    expect(groups(input)).toBeUndefined();
  });
  it.each([
    "[Publisher] 虚构航海 S5 (1080p) [Japanese&English]",
    "[Publisher] 虚构航海 S5 (1080p) [CHS+CHT]",
    "[Publisher] 虚构航海 S5 (1080p) [AVC&AAC]",
    "[Publisher] 虚构航海 [03] [U-NEXTDL+NetflixSub][1080p]",
    "[Publisher] 虚构航海 [03] [BahaRip+CRSub][1080p]",
    "[Publisher] 虚构航海 [03] [Remastered&Uncensored][1080p]",
    "[Publisher] 虚构航海 [03] [OP&ED][1080p]",
    "[Publisher] 虚构航海 [03] [TV+MOVIE][1080p]",
    "[Publisher] 虚构航海 [03] [TV01-89+OAD01-08][1080p]",
    "[Publisher] 虚构航海 [03] [HEVC2+VVC-12bit][1080p]",
    "[Publisher] 虚构航海 [03] [俄&英内封][1080p]",
    "[Publisher] 虚构航海 [03] [01-52TV全集+花絮][1080p]",
    "[Publisher] 虚构航海 [03] [附官方MV+预告+正片外挂字幕与字体包]",
    "[Publisher] 虚构航海 [03] [流云＆暮雨]",
    "[Publisher] 虚构航海 S5 (1080p) [A Different & Another Alias]",
    "[Publisher] 虚构航海 S5 (1080p) (Nova&Orion)",
    "[Publisher] 虚构航海 [Nova&Orion] Another Title - 03",
  ])("语言、技术和别名不按尾部联合署名处理：%s", (input) => {
    expect(groups(input)).toEqual(["Publisher"]);
  });
});

describe("Nyaa 制作署名：交付说明、来源贡献与裸前缀边界", () => {
  it.each([
    "[Publisher] Fictional Voyage [JP Dub and Sub] [Complete Batch]",
    "[Publisher] Fictional Voyage [Japanese Dub & Sub]",
    "[Publisher] Fictional Voyage [English Sub and Dub]",
  ])("语言交付说明不成为制作身份：%s", (input) => {
    expect(groups(input)).toEqual(["Publisher"]);
  });
  it("技术块内多语言列表不在已有发布者后追加身份", () => {
    expect(
      groups(
        "[Publisher] Fictional Voyage [1080p Multi-Audio-English-Japanese]"
      )
    ).toEqual(["Publisher"]);
  });
});

describe("Nyaa 制作署名：已核实联合身份与补包来源", () => {
  it.each([
    "AAC2.0",
    "DDP5.1",
    "AVC10bit",
    "AAC2.0_24bit",
    "DTSHDMA7.1",
    "H.26410bit",
  ])("补包适配目标中的技术字段不扩充制作身份：%s", (technical) => {
    expect(
      groups(
        `[Publisher] First Tale Subs+Fonts for ReinForce & ${technical} [BD].zip`
      )
    ).toEqual(["Publisher"]);
  });
});

it.each([
  // 制作组识别：元信息和多处署名边界
  "[BDMV][虚构航海 / Fictional Voyage]",
  "虚构航海 [1080P@60FPS][简繁内封]",
  "[虚构航海][全15集][国语中字][WEB-MKV][2160P]",
  "[转] 虚构航海 - 03",
  "[转运] 虚构航海 - 03",
  "[个人汉化] 虚构航海 - 03",
  "[TV版&轻微修正版&无修版] 虚构航海 - 03",
  "[全遮版&修正版&无修版] 虚构航海 - 03",
  "[完全无修版] 虚构航海 - 03",
  "[人物幻想全开ver.] 虚构航海 - 03",
  "虚构航海 [MultiSub][GerSub][EngSub]",
  "虚构航海 (WebRip AV1 简繁内封)",
  "虚构航海 - The Paper Sea (CUSTOM)",
  // 制作组识别：联合署名和技术词边界
  "[虚构航海][全26集][国英中字][WEB-MKV][2160P]",
  "[虚构航海][1080p][全集]",
  "【剩三集完结】虚构航海[03][1080p]",
  "[自购]《虚构航海 / Fictional Voyage》[01-52][26DVDISO]",
  "[TV版&轻柔版&超轻柔版] 虚构航海 - EP11",
  "虚构航海 [CHS-Sub][CHT_Sub][ENG-Subs]",
  "虚构航海.1080p.WEB-DL.H.264-NOGRP",
])("制作署名与发布属性边界: %s", (input) => {
  expect(parseTorrentOrganization(input)).toBeUndefined();
});

describe("制作组识别：显式字幕来源与发布署名", () => {
  it.each([
    "[个人制作合集] 虚构航海 [03]",
    "[网盘下载][国漫][虚构航海][03][1080p]",
    "[img]https://example.invalid/image.png[/img]",
    "「虚构航海」[03][1080p]",
    "虚构航海 (采用自制字幕)",
    "虚构航海 (个人汉化)",
    "[星舟字幕组][森][03][1080p]",
  ])("元信息、匿名职责与作品短名不新增身份：%s", (input) => {
    const expected = input.startsWith("[星舟字幕组]")
      ? ["星舟字幕组"]
      : undefined;
    expect(groups(input)).toEqual(expected);
  });
});

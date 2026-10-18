import { parseTorrentOrganization } from "@/parseTorrentOrganization";
const groups = (input: string) => parseTorrentOrganization(input)?.parts;

describe("Nyaa 制作署名：配音属性、已核实联合与音轨尾签", () => {
  it.each([
    "stress First Tale - 01",
    "First Tale stress",
    "First Tale - 01 [UnknownCaption]",
    "First Tale - 01 [Unknown-Another][1234ABCD].mkv",
    "First Tale AS",
    "AS First Tale - 01",
    "First Tale Atmospheric-Nova",
    "First Tale Caption-Nova",
    "First Tale ATMOS-AAC2.0",
    "First Tale ATMOS-AVC10bit",
    "First Tale ATMOS-NOGRP",
    "First Tale ATMOS-Japanese",
    "First Tale ATMOS-JPN-ENG",
    "First Tale ATMOS-English-Japanese",
    "First Tale ATMOS-ITA-JPN [1080p]",
    "First Tale ATMOS-10bit",
    "First Tale x265-ATMOS",
  ])("普通标题、未知另名和技术字段不升级为署名：%s", (input) => {
    expect(groups(input)).toBeUndefined();
  });
});

describe("Nyaa 制作署名：旧式文件名、职责来源与联合身份", () => {
  it.each([
    ["[sheline][sage]_Morning_Story_-_02_[BD][720p].mp4", ["sheline", "sage"]],
    [
      "[AstralDzastr][ASW] Morning Story - 02 [1080p].ass",
      ["AstralDzastr", "ASW"],
    ],
    [
      "[Publisher]_Morning_Story_-_02_[Shani-san]_[1234ABCD].ass",
      ["Publisher", "Shani-san"],
    ],
    [
      "[Publisher] Morning Story - 02 [HorribleSubs][FavriteFixNames].ass",
      ["Publisher", "HorribleSubs", "FavriteFixNames"],
    ],
    ["[NF]_Morning_Story_-_02.ass", ["NF"]],
    ["[TW] Morning Story - 02 [720p]", ["TW"]],
    ["Morning Story Episode 02[GRZ]", ["GRZ"]],
    ["Morning Story (DVD X265 Dual Audio)[BobP]", ["BobP"]],
    ["Morning Story 1080p BluRay x265 [CTR] (Dual Audio)", ["CTR"]],
    ["Morning Story - v3 Patches [Kirakira].zip", ["Kirakira"]],
    ["[SUBS][Zero-Raws] Morning Story - 02 (DVD).zip", ["Zero-Raws"]],
    ["[Publisher] Morning Story [Hi10p][WEBSTEAM][SUB]", ["Publisher"]],
  ])("文件名分隔和连续已知署名不依赖作品：%s", (input, expected) => {
    expect(groups(input as string)).toEqual(expected);
  });
  it.each([
    "Nova Subs [Orbit at Dawn] - 03 [1080p]",
    "Nova Subs ★ Orbit at Dawn - 03 [1080p]",
    "Nova Subs - Orbit at Dawn - 03 [1080p]",
  ])("未知多词字幕品牌在明确作品边界前保留：%s", (input) => {
    expect(groups(input)).toEqual(["Nova Subs"]);
  });
  it.each([
    "Morning Story - 02 [UnknownCaption]",
    "Morning Story - 02 [NF]",
    "Morning Story - 02 [TW]",
    "Morning Story by Morning",
    "Morning Story_Karaoke Nights - 02",
    "Morning Story - 02 [Unknown-Another]",
    "Morning Story Subs",
    "Nova Subs [ENG]",
    "Morning Story subs [ENG].ass",
    "Morning Story subs [subs only]",
    "Morning Story subs [ASS scripts]",
    "Nova Subs First Tale - 03 [1080p]",
    "A Story about Fork - 02",
    "A Song by Autem",
  ])("普通标题词与未知别名不自动变为署名：%s", (input) => {
    expect(groups(input)).toBeUndefined();
  });
  it.each([
    "[Publisher][Orbit] Dawn - 03 [1080p]",
    "[Publisher][虚构航海] Fictional Voyage - 03",
    "[Publisher][Virtual Voyage][Fictional Voyage][03]",
    "[Publisher][小市民系列_Shoushimin Series][10 END][1080p]",
    "[Publisher][我推的孩子] / Oshi no Ko - 02",
  ])("已有发布者后的独立作品包装不能吞作连续署名：%s", (input) => {
    expect(groups(input)).toEqual(["Publisher"]);
  });
});

describe("Nyaa 制作组：字幕说明和后置联合署名", () => {
  it.each([
    ["[SweetSub] 虚构航海 - 03", ["SweetSub"]],
    ["[Inka-Subs] 虚构航海 - 03", ["Inka-Subs"]],
    ["[NovaSub] 虚构航海 - 03", ["NovaSub"]],
    ["NovaSub only an English title - 03", ["NovaSub"]],
    ["[HardSubTeam] 虚构航海 - 03", ["HardSubTeam"]],
    ["[FIXED-AUDIO][Unknown] 虚构航海 - 03", ["Unknown"]],
    [
      "[TAKEOVER_RUS.DUB] 虚构航海 S5 ep 01-13 END (1080p+hardsub) [GAR&Esmeralda]",
      ["TAKEOVER_RUS.DUB", "GAR", "Esmeralda"],
    ],
    ["虚构航海 [03] [Nova&Orion]", ["Nova", "Orion"]],
    ["虚构航海 - 03 [Nova&Orion].mkv", ["Nova", "Orion"]],
    ["虚构航海 - 03 [Nova+Orion][1080p][AAC]", ["Nova", "Orion"]],
    ["虚构航海 - 03 [流云字幕组＆暮雨字幕社]", ["流云字幕组", "暮雨字幕社"]],
  ])("保留品牌和未知联合发布者：%s", (input, expected) => {
    expect(groups(input as string)).toEqual(expected);
  });
});

describe("Nyaa 制作署名：交付说明、来源贡献与裸前缀边界", () => {
  it.each([
    ["Fictional Voyage - S01 [DVD 480p HEVC AAC] [ThanksBB]", ["ThanksBB"]],
    ["虚构航海 - 03 [SCV]", ["SCV"]],
    ["Fictional Voyage TV 01-04 [Asuka♥Shinji]", ["Asuka♥Shinji"]],
    [
      "Fictional Voyage TV 01-49 [ARR-JE-XenoCrypt][720p]",
      ["ARR-JE-XenoCrypt"],
    ],
    ["虚构航海 R170 (1080p TVer Web-DL) [Lord Karasuma]", ["Lord Karasuma"]],
    ["Fictional.Voyage.S01.Bluray.1080p.AV1.DualAudio-Pi13", ["Pi13"]],
    ["虚构航海.1080p.Multi-Audio-Nova.24.mkv", ["Nova.24"]],
    [
      "[Publisher] 虚构航海 [1080p Multi-Audio-Nova.24]",
      ["Publisher", "Nova.24"],
    ],
    ["虚构航海.1080p.DualAudio-JPN-Nova", ["JPN-Nova"]],
    ["[BDMV][虚构航海][Vol.1-6 FIN][JPN]-YE", ["YE"]],
    ["[DVDISO][虚构航海][ENG]-Qyz.7-Team.iso", ["Qyz.7-Team"]],
    ["[Diogo4D-NF93] [WEB][1080p] 虚构航海 - 03", ["Diogo4D", "NF93"]],
    ["[NF93] 虚构航海 - 03", ["NF93"]],
    ["[Publisher] 虚构航海 Subs+Fonts for ReinForce [BD].zip", ["Publisher"]],
    ["[Publisher] 虚构航海 Subtitles for Nova-Raws [BD].7z", ["Publisher"]],
    [
      "[Publisher] Elm University Animation Study Group - 1988 Fictional Theatre (Betamax)",
      ["Publisher", "Elm University Animation Study Group"],
    ],
  ])("提取原文明示的身份并保留内部标点：%s", (input, expected) => {
    expect(groups(input as string)).toEqual(expected);
  });
  it.each([
    "Earth Maiden Fictional Voyage - 01 [1080p]",
    "Doki Doki Fictional Club - 01 [1080p]",
    "AMF Another Fictional Voyage - 01",
    "虚构航海 - 03 [UnknownAlias]",
    "虚构航海 - 03 [A Different Alias]",
    "虚构航海 - 03 [JP Dub and Sub]",
    "虚构航海.S01.1080p.DualAudio-AAC",
    "虚构航海.S01.1080p.DualAudio-Japanese",
    "虚构航海.S01.1080p.MultiAudio-English",
    "Fictional Voyage.S01.1080p.DualAudio-JPN-ENG",
    "虚构航海.S01.1080p.DualAudio-JPN_ENG",
    "虚构航海.S01.1080p.MultiAudio-English.Japanese",
    "虚构航海.S01.1080p.MultiAudio-JPN+ENG",
    "虚构航海.S01.1080p.MultiAudio-NOGRP",
    "虚构航海 [JPN]-YE",
    "[BDMV][虚构航海][JPN]-CHS",
    "[BDMV][虚构航海][JPN]-NOGRP",
    "虚构航海 Subs+Fonts for Everyone [BD].zip",
    "Fictional Study Group - 03 (1080p)",
  ])("无独立署名证据时不从标题和说明猜测身份：%s", (input) => {
    expect(groups(input)).toBeUndefined();
  });
  it.each([
    ["Earth - 虚构航海 [03]", ["Earth"]],
    ["Doki [虚构航海][03]", ["Doki"]],
    ["[Doki] 虚构航海 [03]", ["Doki"]],
    ["NovaSub 虚构航海 - 03", ["NovaSub"]],
    ["虚构航海 - Earth [1080p][AAC].mkv", ["Earth"]],
  ])("明确分隔及组名词仍可使用裸署名：%s", (input, expected) => {
    expect(groups(input as string)).toEqual(expected);
  });
});

describe("Nyaa 制作署名：联合横线、音轨边界与已核实署名", () => {
  it.each([
    "First Tale [UnknownCaption][1234ABCD].mkv",
    "First Tale [Spider-Man][1234ABCD].mkv",
    "(UnknownCaption) First Tale - 01",
    "First Tale [Kira]",
    "First Tale - 04 [UnknownTV]",
    "Kira First Tale - 01",
    "First Tale FLAC 2.0 Kira Another Caption [1080p]",
    "First Tale FLAC 2.0 Kira [UnknownCaption]",
    "First Tale LPCM 2.0-AAC2.0",
    "First Tale LPCM2.0-FLAC2.0",
    "First Tale LPCM 2.0-10bit",
    "First Tale LPCM 2.0-NOGRP",
    "First Tale LPCM2.0-JPN-ENG",
    "First Tale LPCM 2.0-English-Japanese",
    "First Tale LPCM 2.0-ITA-JPN [1080p]",
    "First Tale LPCM2.0-Japanese",
    "First Tale - 01 [ARR-LPCM2.0].mkv",
    "First Tale [A Different - Another Alias][1234ABCD].mkv",
  ])("未知别名、语言与技术字段不产生制作身份：%s", (input) => {
    expect(groups(input)).toBeUndefined();
  });
  it("已核实普通署名不会扩张为无括号的标题首词", () => {
    expect(groups("Chika First Tale - 01")).toBeUndefined();
    expect(groups("Egao First Tale - 01")).toBeUndefined();
  });
});

describe("制作组识别：元信息和多处署名边界", () => {
  it.each([
    ["[V2][星舟字幕组][虚构航海][03][1080p]", ["星舟字幕组"]],
    ["[ver.3][陌生星舟][虚构航海][03]", ["陌生星舟"]],
    ["[网盘资源][Qxz-GM][虚构航海][1080p]", ["Qxz-GM"]],
    ["[转][陌生星舟][虚构航海][03]", ["陌生星舟"]],
    ["[TV版&无修版][陌生星舟][虚构航海][03]", ["陌生星舟"]],
    ["[动漫星桥][虚构航海][03]", ["动漫星桥"]],
    ["[星舟字幕组十三周年][虚构航海][03]", ["星舟字幕组"]],
    ["[星舟字幕组20周年纪念][虚构航海][03]", ["星舟字幕组"]],
    ["[星舟字幕组新年献礼][虚构航海][03]", ["星舟字幕组"]],
    ["[星舟字幕组新春獻禮][虚构航海][03]", ["星舟字幕组"]],
    ["[Qxz个人汉化] 虚构航海 - 03", ["Qxz"]],
    ["[Qxz個人漢化] 虚构航海 - 03", ["Qxz"]],
    ["[星舟字幕组feat.月湾压制] 虚构航海 - 03", ["星舟字幕组", "月湾压制"]],
    ["[星舟字幕组 FEAT. Moon-Raws] 虚构航海 - 03", ["星舟字幕组", "Moon-Raws"]],
    ["[波洛咖啡厅\\PCSUB][虚构航海][03]", ["波洛咖啡厅\\PCSUB"]],
    ["[星舟字幕组\\月湾汉化组][虚构航海][03]", ["星舟字幕组", "月湾汉化组"]],
    ["虚构航海 (Amazing Dubbing)", ["Amazing Dubbing"]],
    ["[动漫萌][4月新番][虚构航海][03]", ["动漫萌"]],
    [
      "[幸花压制] 虚构航海 - 03 (WebRip AV1 简繁内封 Aliciä)",
      ["幸花压制", "Aliciä"],
    ],
    ["虚构航海 - 03 [WEB-DL AAC ANi]", ["ANi"]],
    ["虚构航海[GerSub][collected_by_nerv87]", ["nerv87"]],
    ["虚构航海 [translated_by_Nova-7]", ["Nova-7"]],
    ["虚构航海 [Moon@Archive42][BDMV]", ["Moon@Archive42"]],
    ["虚构航海 WEB x264 AAC -Nova.7-Raws (CUSTOM)", ["Nova.7-Raws"]],
    ["虚构航海 1080p x264-New-Galaxy.42", ["New-Galaxy.42"]],
    ["[星舟字幕组] 虚构航海 [MultiSub][GerSub]", ["星舟字幕组"]],
    [
      "[New Galactic Guild] 虚构航海 / Fictional Voyage - 03",
      ["New Galactic Guild"],
    ],
  ])("提取完整身份：%s", (input, expected) => {
    expect(groups(input as string)).toEqual(expected);
  });
});

import { parseTorrentNames } from "@/parseTorrentNames";
import parseTorrentTitle from "@/parseTorrentTitle";
const aliases = (input: string) => parseTorrentNames(input).title.aliases;
const integratedAliases = (input: string) =>
  (parseTorrentTitle(input) ?? parseTorrentNames(input)).title.aliases;

test.each([
  // 括注列表与跨语种边界
  [
    "[字幕组] Star Child_星之子(星空的孩子,ほしのこ) [02][1080p]",
    ["Star Child", "星之子", "星空的孩子", "ほしのこ"],
  ],
  [
    "[字幕组] 星之子(星空的孩子，ほしのこ) [02][1080p]",
    ["星之子", "星空的孩子", "ほしのこ"],
  ],
  ["[字幕组] 星空，与你同行 [02][1080p]", ["星空，与你同行"]],
  ["[字幕组] 星之子(今天，去星空) [02][1080p]", ["星之子(今天，去星空)"]],
  [
    "[字幕组] Blue Planet (Blue, My Planet) [02][1080p]",
    ["Blue Planet (Blue, My Planet)"],
  ],
  [
    "[字幕组] 星球勇者GOAL.Planet.Guardians [02][1080p]",
    ["星球勇者GOAL", "Planet.Guardians"],
  ],
  [
    "[字幕组] 小魔女LaLiLu.Magical Little Witch S02 [02][1080p]",
    ["小魔女LaLiLu", "Magical Little Witch S02"],
  ],
  ["[字幕组] Dr. Planet [02][1080p]", ["Dr. Planet"]],
  ["[字幕组] Blue.Planet.Guardians [02][1080p]", ["Blue.Planet.Guardians"]],
  [
    "[字幕组] 星球勇者「星球勇者 THE PLANET GUARDIAN」 [02][1080p]",
    ["星球勇者", "星球勇者 THE PLANET GUARDIAN"],
  ],
  ["[字幕组] 星球勇者「心中的星球」 [02][1080p]", ["星球勇者「心中的星球」"]],
  [
    "[字幕组] 星球勇者「星球勇者」的冒险 [02][1080p]",
    ["星球勇者「星球勇者」的冒险"],
  ],
  ["[字幕组] 少年足球_U-19_锦标赛 [02][1080p]", ["少年足球_U-19_锦标赛"]],
  ["[字幕组] 少年足球_U-17_世界杯 [02][1080p]", ["少年足球_U-17_世界杯"]],
  [
    "[字幕组] 少年足球_U-19_Galaxy Cup [02][1080p]",
    ["少年足球", "U-19_Galaxy Cup"],
  ],
  ["[字幕组] Blue Planet (TV Special) [1080p]", ["Blue Planet (TV Special)"]],
  [
    "[字幕组] Blue Planet (Blue Special) [1080p]",
    ["Blue Planet", "Blue Special"],
  ],
  [
    "[字幕组] 星球勇者(台) / Planet Guardian [02][1080p]",
    ["星球勇者", "Planet Guardian"],
  ],
  ["[字幕组] 星球勇者(台上的我) [02][1080p]", ["星球勇者(台上的我)"]],
  // 明确别名分隔与标题限定
  [
    "[字幕组] 星猫1/3「ほしねこ1/3」Hoshineko1/3 2025年版 第二季 S02E01 [1080p]",
    ["星猫1/3", "ほしねこ1/3", "Hoshineko1/3 2025年版 第二季"],
  ],
  [
    "[字幕组] 星猫「ほしねこ」STAR CAT 2026年版 S01E02 [1080p]",
    ["星猫", "ほしねこ", "STAR CAT 2026年版"],
  ],
  ["[字幕组] 蓝色行星 ｜ 苍蓝星球 [02][1080p]", ["蓝色行星", "苍蓝星球"]],
  ["[字幕组] Blue｜Planet [02][1080p]", ["Blue", "Planet"]],
  ["[字幕组] 蓝色行星 & BLUE×PLANET [02][1080p]", ["蓝色行星", "BLUE×PLANET"]],
  ["[字幕组] BLUE×PLANET & 蓝色行星 [02][1080p]", ["BLUE×PLANET", "蓝色行星"]],
  ["[字幕组] Blue & Planet [02][1080p]", ["Blue & Planet"]],
  ["[字幕组] 银河 外传 & 第怪季 [02][1080p]", ["银河 外传 & 第怪季"]],
  [
    "[字幕组] Blue Planet: Off & Monster Season [02][1080p]",
    ["Blue Planet: Off & Monster Season"],
  ],
  ["[字幕组] 星猫_NEW_～♡ [02][1080p]", ["星猫_NEW_～♡"]],
  ["[字幕组] 星猫_New Sky [02][1080p]", ["星猫", "New Sky"]],
  ["[字幕组] Blue Planet (Season 3) [02][1080p]", ["Blue Planet (Season 3)"]],
  ["[字幕组] 蓝色行星（第三季） [02][1080p]", ["蓝色行星（第三季）"]],
  [
    "[字幕组] Blue Planet (3rd Season) [02][1080p]",
    ["Blue Planet (3rd Season)"],
  ],
  ["[字幕组] 蓝色行星 - S1 [02][1080p]", ["蓝色行星 - S1"]],
  ["[字幕组] 蓝色行星 - Season 3 [02][1080p]", ["蓝色行星 - Season 3"]],
  ["[字幕组] 蓝色行星 (Blue Planet) [02][1080p]", ["蓝色行星", "Blue Planet"]],
  ["[字幕组] Blue Planet - 特别编 [1080p]", ["Blue Planet - 特别编"]],
  ["[字幕组] Blue Planet - 特别篇 [1080p]", ["Blue Planet - 特别篇"]],
  ["[字幕组] Blue Planet - 蓝色行星 [02][1080p]", ["Blue Planet", "蓝色行星"]],
  [
    "[字幕组] 苍蓝星球「青い惑星」/ Blue Planet [02][1080p]",
    ["苍蓝星球", "青い惑星", "Blue Planet"],
  ],
  ["[字幕组] 公主「青い惑星」的冒险 [02][1080p]", ["公主「青い惑星」的冒险"]],
  ["[字幕组] 公主「拷问」的时间 [02][1080p]", ["公主「拷问」的时间"]],
  [
    "[字幕组] Blue Planet [02][1080p]（搜索用：苍蓝星球）",
    ["Blue Planet", "苍蓝星球"],
  ],
  ["[字幕组] 搜索星空的旅人 [02][1080p]", ["搜索星空的旅人"]],
  // Nyaa 句内括注与逗号
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
  // Nyaa 通用发行结构
  [
    "[Demo]蓝色星球电影版_[电影][中文电影][Bahamut][WEB-DL][1080p]",
    ["蓝色星球电影版", "中文电影"],
  ],
  [
    "[Demo] First Collection of Short Stories_(Historias Cortas de Primera )1 -Movie .(Jap.sub.Chino ).avi",
    [
      "First Collection of Short Stories",
      "Historias Cortas de Primera",
      "1 -Movie .",
      "Jap.sub.Chino",
    ],
  ],
  [
    "[Demo] First Collection of Short Stories_(Historias Cortas de Primera )2 -Movie .(Jap.sub.Chino ).avi",
    [
      "First Collection of Short Stories",
      "Historias Cortas de Primera",
      "2 -Movie .",
      "Jap.sub.Chino",
    ],
  ],
  [
    "[Demo]_蓝色星球.First_Planet_(1983-1986)_001-128_[DVD]",
    ["蓝色星球", "First_Planet"],
  ],
  [
    "蓝色星球.First Planet - Extra Stage 1 俄语_(Example Dubbing)",
    ["蓝色星球", "First Planet", "Extra Stage 1 俄语", "Example Dubbing"],
  ],
  [
    "蓝色星球.First Planet - Extra Stage 2 俄语_(Example Dubbing)",
    ["蓝色星球", "First Planet", "Extra Stage 2 俄语", "Example Dubbing"],
  ],
  // Nyaa 名称与交付说明边界
  [
    "[Demo] First Tale S01E01 (VOSTFR, Love Elixir, la sorciere triste, Doumo, Suki na Hito ni Kusuri wo Irai sareta Majo desu, Majochan)",
    [
      "First Tale",
      "Love Elixir, la sorciere triste",
      "Doumo, Suki na Hito ni Kusuri wo Irai sareta Majo desu",
      "Majochan",
    ],
  ],
  [
    "[Demo] First Tale S01E01 (VOSTFR, Kanata kara, From the Other Side)",
    ["First Tale", "Kanata kara", "From the Other Side"],
  ],
  [
    "[Demo] First Tale - S03E11 [WEB-DL 1080p AAC] | Dai Ichi Monogatari III | A First Story (Season 3)",
    ["First Tale", "Dai Ichi Monogatari III", "A First Story (Season 3)"],
  ],
  [
    "[Demo] First Tale 10 - Fierce Fight! Battle of the Spirit (1080p).mkv",
    ["First Tale"],
  ],
  [
    "[Demo] First Tale Movie - A Battle of Heroes - 蓝色星球 英雄之战",
    ["First Tale Movie - A Battle of Heroes", "蓝色星球 英雄之战"],
  ],
  [
    "[Demo] Saijo no Osewa ~Meimonkou de, Ojou-sama (Seikatsu Nouryoku Kaimu) wo Kagenagara Osewa Suru~ - 12 (BS-EX 1440x1080 MPEG2 AAC).ts",
    [
      "Saijo no Osewa ~Meimonkou de, Ojou-sama (Seikatsu Nouryoku Kaimu) wo Kagenagara Osewa Suru~",
    ],
  ],
  ["[Demo] First Tale (Seasons 01-02) [1080p][HEVC][Batch]", ["First Tale"]],
  [
    "[Demo] First Tale (Season 1 & 2) [BD][1080p][Batch] Dai Ichi Monogatari",
    ["First Tale", "Dai Ichi Monogatari"],
  ],
  [
    "[Demo] Ushiro no Monogatari (A Story: It's behind you) - S01E12 [1080p]",
    ["Ushiro no Monogatari", "A Story: It's behind you"],
  ],
  ["[Demo][435] First Tale 03 [1080p][C9E0CD24].mkv", ["First Tale"]],
  ["[Demo]First_Tale_-_Menu[BDRip][1920x1080].torrent", ["First_Tale"]],
  ["[Demo]First_Tale_-_Scans[BDRip]", ["First_Tale"]],
  ["[Demo] First Tale - OP+ED [1280x720 x264 AAC][Sub_Esp]", ["First Tale"]],
  [
    "[Demo] Animation Studio: Meiji-hen - Dai Ichi Monogatari cm (WEB 1080p)",
    ["Animation Studio: Meiji-hen - Dai Ichi Monogatari"],
  ],
  [
    "[Demo] First Tale (1996) Remastered 0701 ~ 0800 [1080p WEBRip HEVC AAC]",
    ["First Tale (1996)"],
  ],
  [
    "First Tale 2019 S01.CUSTOM.MULTi.1080p.BluRay.AV1-Example-Raws (VF/VOSTFR)",
    ["First Tale S01"],
  ],
  [
    "[Demo] First Show! - 2026 Fall -Part 1- (BS11 1920x1080 MPEG2 AAC).ts",
    ["First Show! - 2026 Fall"],
  ],
  [
    "[Demo]蓝色星球4K.First.Planet.S01.2160p.GBR.UHD.Blu-ray.SDR.HEVC.AAC",
    ["蓝色星球", "First.Planet.S01"],
  ],
  ["[Demo] First Tale [2] - Re [1080p][Baha][WEB-DL][AAC]", ["First Tale"]],
  [
    "City.Story.S01.&.S02.German.DUBBED.AC3.1080p.BluRay.10bit.x264-Example-Raws",
    ["City.Story"],
  ],
  [
    "Détective Story - Inédits VF (230-231) [WEBrip 1080p NF MULTI] (Detective Story)",
    ["Détective Story", "Detective Story"],
  ],
  ["AssetArchive.moe - OP/ED Collection Video Backup [2026.10.01]", []],
  [
    "[Demo] First Tale S4 - Break Time Vol. 1 & Vol. 2 - Episode 1-8 [BD 1920x1080 x264 FLAC]",
    ["First Tale S4 - Break Time"],
  ],
  [
    "[Demo] First Tale Complete BD_1080p Dolby TrueHD Dual Audio",
    ["First Tale"],
  ],
  [
    "[Demo] First Tale + Specials & Extras (2010-2011) [Dual Audio] (BD x264 1080p)",
    ["First Tale"],
  ],
  [
    "星の物語.First.Tale.1988-1993.TV+2SP.BDRip.1080p.x265.FLAC-Example-Subs",
    ["星の物語", "First.Tale"],
  ],
  [
    "[Demo] First Tale 2 - Ouji no Kikan [1080p]",
    ["First Tale 2 - Ouji no Kikan"],
  ],
  [
    "[Demo] First Tale Movie 12 - New World [1080p]",
    ["First Tale Movie 12 - New World"],
  ],
  [
    "[Demo] First Tale (15th Anniv. Remastered) - 21 [1080p]",
    ["First Tale (15th Anniv. Remastered)"],
  ],
  ["[Demo] First Tale（2023）[22] [1080p]", ["First Tale（2023）"]],
  // Nyaa 名称、集号和版本边界
  [
    "[Example-Subs] First Tale S01E03 (VOSTFR, Toumei na Yoru ni Kakeru Kimi to, Me ni Mienai Tabi wo Shita)",
    [
      "First Tale",
      "Toumei na Yoru ni Kakeru Kimi to, Me ni Mienai Tabi wo Shita",
    ],
  ],
  [
    "[Example-Subs] First Tale S01E03 (VOSTFR, First Lane Bisoku Zenshin Ni, First Lane Slow Ahead Season 2)",
    [
      "First Tale",
      "First Lane Bisoku Zenshin Ni",
      "First Lane Slow Ahead Season 2",
    ],
  ],
  [
    "[Example-Subs] First Tale S01E03 (A Hero's Week at Work, Yuusha no Heijitsu, Multi-Audio, Multi-Subs)",
    ["First Tale", "A Hero's Week at Work", "Yuusha no Heijitsu"],
  ],
  [
    "[Example-Subs] First Tale S01E03 (VOSTFR, Tensei Hero, Kantei Skill de Nariagaru, Tensei Hero, Kantei Skill de Nariagaru 3rd Season)",
    [
      "First Tale",
      "Tensei Hero, Kantei Skill de Nariagaru",
      "Tensei Hero, Kantei Skill de Nariagaru 3rd Season",
    ],
  ],
  [
    "[Example-Subs] First Tale no Sekai (Some Ability) wo Kagenagara Saseru - S01E12 [1080p]",
    ["First Tale no Sekai (Some Ability) wo Kagenagara Saseru"],
  ],
  [
    "[Example-Subs] First Tale (2024) - Partie 03 - S17E27-40 [1080p]",
    ["First Tale (2024) - Partie 03"],
  ],
  [
    "[Example-Subs] The First Queen 1-36 (2005) (720p)",
    ["The First Queen (2005)"],
  ],
  ["[Example-Subs] First Tale 01-12 (TV) [1080p]", ["First Tale"]],
  ["[Example-Subs] First Tale [Voyage] (BD 1080p)", ["First Tale [Voyage]"]],
  [
    "[Example-Subs] Mahou wa [Payment Plan] de Kaesu - 03 [1080p]",
    ["Mahou wa [Payment Plan] de Kaesu"],
  ],
  [
    "[Example-Subs] Hajime no Tabi - The First Fighting! (2000) [1080p]",
    ["Hajime no Tabi - The First Fighting! (2000)"],
  ],
  [
    "[Example-Subs] Gekijouban First Tale - Saishuu Gakushou Zenpen 第一の物語 前編 [BDRemux 1080p AVC]",
    ["Gekijouban First Tale - Saishuu Gakushou Zenpen 第一の物語 前編"],
  ],
  [
    "[Example-Subs] First Tale - The Counterfeit Case of Ultra 30 (1080p) [6BD3ED0A].mkv",
    ["First Tale - The Counterfeit Case of Ultra 30"],
  ],
  ["[Example-Subs] First Tale - 30 [1080p]", ["First Tale"]],
  ["First Tale 13 - Les voyageurs", ["First Tale 13 - Les voyageurs"]],
  [
    "[第一物语][导演剪辑版（上）][国语中字][WEB-MKV][2160P]",
    ["第一物语[导演剪辑版（上）]"],
  ],
  // Nyaa 名称内部符号与缩写另名
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
])("完整别名集合: %s", (input, expected) => {
  expect(aliases(input as string)).toEqual(expected);
});

describe("括注绑定遵守独立名称边界", () => {
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

describe("字幕附件与预告发行说明", () => {
  test("括号语言字段不拆开带强调括注的逗号复句", () => {
    expect(
      integratedAliases(
        "[Publisher] First Tale S01E03 [1080p] (Hoshi ni Narenai, Muri Muri! (※Muri ja Nakatta!?), Multi-Subs)"
      )
    ).toEqual([
      "First Tale",
      "Hoshi ni Narenai, Muri Muri! (※Muri ja Nakatta!?)",
    ]);
  });
});

describe("Nyaa 显式另名边界", () => {
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

describe("结构规则的保留负例", () => {
  test("集号后技术参数前的独立括号译名仍可保留", () => {
    const input =
      "[Release Subs]蓝色行星 / Blue Planet [12](蓝色星球)[1080p][HEVC]";
    expect(parseTorrentNames(input).title.aliases).toEqual([
      "蓝色行星",
      "Blue Planet",
      "蓝色星球",
    ]);
    expect(parseTorrentTitle(input)?.title?.aliases).toEqual([
      "蓝色行星",
      "Blue Planet",
      "蓝色星球",
    ]);
  });
});

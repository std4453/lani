import { parseTorrentNames } from "@/parseTorrentNames";

const aliases = (input: string) => parseTorrentNames(input).title.aliases;

describe("Nyaa 第四轮名称与交付说明边界", () => {
  test.each(["中文配音", "国语配音", "粤语配音", "日语配音"])(
    "正文尾部的配音说明剥离：%s",
    (audio) => {
      expect(
        aliases(`[Demo] - 蓝色星球 ${audio} - 第33话 - [1080p WEB-DL]`)
      ).toEqual(["蓝色星球"]);
    }
  );

  test.each(["KA", "Prerelease", "Remastered", "總第85"])(
    "完整元信息标签不成为标题：%s",
    (tag) => {
      expect(aliases(`[Demo] First Tale - 03 [1080p] (${tag})`)).toEqual([
        "First Tale",
      ]);
    }
  );

  test.each([
    "JPN audio ENG sub",
    "CN EN JP Audio",
    "CHS CHT ENCC JP SUB",
    "Japanese Audio / English Sub",
  ])("混合音轨与字幕语言纯说明块不成为标题：%s", (tag) => {
    expect(aliases(`[Demo] First Tale - 03 [1080p] (${tag})`)).toEqual([
      "First Tale",
    ]);
  });

  test.each([
    "Audio Story",
    "Sub World",
    "English Audio Adventure",
    "Audio and Sub",
  ])("包含Audio或Sub的真实正文不按纯说明块过滤：%s", (title) => {
    expect(aliases(`[Demo] ${title} - 03 [1080p]`)).toEqual([title]);
  });

  test("没有普通集号的多季归档仍过滤尾部语言说明", () => {
    expect(
      aliases(
        "城市物语.日语.英文字幕.City Story 1-3 and 91 and films dvdrip (JPN audio ENG sub)"
      )
    ).toEqual(["城市物语", "City Story"]);
  });

  test.each(["Go", "Run", "Hi"])("短集名不按长度回拼作品名：%s", (caption) => {
    expect(aliases(`[Demo] Blue Planet [02] - ${caption} [1080p]`)).toEqual([
      "Blue Planet",
    ]);
  });

  test.each([
    [
      "[Demo] Blue Planet - OP/ED Collection Video Backup [2026.10.01]",
      ["Blue Planet"],
    ],
    [
      "AssetArchive - OP/ED Collection Video Backup [2026.10.01]",
      ["AssetArchive"],
    ],
    [
      "https://archive.example/backup - OP/ED Collection Video Backup [2026.10.01]",
      [],
    ],
    ["[Demo] 蓝色星球 - Blue Planet CM [1080p]", ["蓝色星球", "Blue Planet"]],
    ["[Demo] Title A - Title B CM [1080p]", ["Title A - Title B"]],
  ] as Array<[string, string[]]>)(
    "备份说明或CM类型词不吞掉明确名称：%s",
    (input, expected) => {
      expect(aliases(input)).toEqual(expected);
    }
  );

  test.each([
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
  ] as Array<[string, string[]]>)("%s", (input, expected) => {
    expect(aliases(input)).toEqual(expected);
  });
});

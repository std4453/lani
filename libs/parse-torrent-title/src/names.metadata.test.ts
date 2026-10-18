import { parseTorrentNames } from "@/parseTorrentNames";
import parseTorrentTitle from "@/parseTorrentTitle";
const aliases = (input: string) => parseTorrentNames(input).title.aliases;

describe("组合收录标签与发行参数", () => {
  test.each([
    "全三集",
    "全十二话",
    "共四部",
    "TV+4SP",
    "TV+2OVA+3SP",
    "09+sp09",
    "11+SP11",
    "S1+S2+Movie",
    "TV+剧场版合集",
    "BT下载",
    "磁力下载",
    "HDR版本",
    "HDR10+版",
    "SDR版本",
    "精校版",
    "校对版",
    "补发",
    "補發",
    "恭贺春节",
    "恭賀新年！",
    "TV.U2",
    "TV.V3",
    "TV480P",
    "TVB儿童台",
    "原始配音",
    "原版音轨",
    "按年份合集",
    "依季度整理合集",
    "Pre-Air",
    "Pre Air",
    "简繁日内封PGS",
    "简繁日内封PGSx2",
    "繁日外挂ASS",
    "Animatica",
    "ParkTV",
    "ZeroTV",
    "Vol.7 END",
    "OST 原声音乐",
  ])("完整元信息块不成为别名：%s", (tag) => {
    const input = `[Release Subs] 蓝色行星 / Blue Planet - 03 [${tag}] [1080p]`;
    expect(parseTorrentNames(input).title.aliases).toEqual([
      "蓝色行星",
      "Blue Planet",
    ]);
    expect(parseTorrentTitle(input)?.title.aliases).toEqual([
      "蓝色行星",
      "Blue Planet",
    ]);
  });
  test("元信息在发布组前也不抢占其位置", () => {
    const result = parseTorrentNames(
      "[BT下载][ZeroTV][Release Subs][蓝色行星][03][1080p]"
    );
    expect(result.organization?.parts).toEqual(["ZeroTV", "Release Subs"]);
    expect(result.organization?.raw).toEqual("ZeroTV & Release Subs");
    expect(result.title.aliases).toEqual(["蓝色行星"]);
  });
  test.each([
    "Blue Planet French Connection",
    "Blue Planet Animatica",
    "Blue Planet 2023",
    "蓝色行星10周年纪念 Blue Planet -FULLDIVE-",
    "蓝色行星合集之谜",
    "Blue Planet Movie",
    "蓝色行星 剧场版",
    "蓝色行星 特别篇",
    "Blue Planet S02",
    "Blue Planet Volume 7",
    "Blue Planet EX Adventure",
    "Blue Planet TV + Dreams",
    "Blue Planet 1090P Adventure",
    "Blue Planet 4K Adventure",
    "蓝色行星的原始配音之旅",
    "蓝色行星恭贺春节的故事",
    "Blue Planet HDR Adventure",
    "Blue Planet - Ocean",
  ])("元信息同形词与数字仍保留在正文：%s", (title) => {
    expect(
      parseTorrentNames(`[Release Subs] ${title} - 03 [1080p]`).title.aliases
    ).toEqual([title]);
  });
  test("完整非标题块不会在去除合集后残留半个标签", () => {
    expect(
      parseTorrentNames("[个人制作合集][Release Subs] Blue Planet [03][1080p]")
        .title.aliases
    ).toEqual(["Blue Planet"]);
  });
  test("双语合集的分隔横杠不残留到英文名", () => {
    const input =
      "[Release Subs] 蓝色行星 / Blue Planet - 合集 [1080P][CHT&CHS&EN&FR&DE&PL][MKV]";
    expect(parseTorrentNames(input).title.aliases).toEqual([
      "蓝色行星",
      "Blue Planet",
    ]);
  });
});

describe("发行标签、声轨字幕与多季收录范围", () => {
  test.each([
    "内封英俄文字幕",
    "内挂德法文字幕",
    "OADs Fin",
    "MOVIEx2 fin",
    "4K AI Upscale",
    "AI Remastered",
    "CH个人作品",
    "重发",
    "代发",
    "下周番外，敬请期待",
    "AT-X",
    "HDTC",
    "WEBeip",
    "TVRip先行",
    "Rev",
    "代理商再版粤语",
    "台配 国粤日多音轨+简繁英字幕",
    "台配 國粵日多音軌+簡繁英字幕",
    "含短篇",
    "含短片",
    "阿拉伯语",
    "ArabicDub",
    "Arabic Audio",
    "Raw",
    "STTV",
    "囯日双语",
    "公映前特典 第二弹",
    "放送后特典 第三弹",
    "热爱星空的人们的座谈会",
    "座談會",
  ])("完整发行块不成为作品别名：%s", (tag) => {
    const input = `[Release Subs] Blue Planet - 03 [${tag}] [1080p]`;
    expect(parseTorrentNames(input).title.aliases).toEqual(["Blue Planet"]);
    expect(parseTorrentTitle(input)?.title.aliases).toEqual(["Blue Planet"]);
  });
  test("发行标签在发布组前面也不会抢占其位置", () => {
    const result = parseTorrentNames(
      "[重发][AT-X][Release Subs] 蓝色行星 / Blue Planet - 03 [1080p]"
    );
    expect(result.organization?.raw).toEqual("Release Subs");
    expect(result.title.aliases).toEqual(["蓝色行星", "Blue Planet"]);
  });
  test.each([
    "Blue Planet 2020 LIVE",
    "Blue Planet 3000",
    "Blue Planet S1",
    "Blue Planet OAD Adventure",
    "蓝色行星2季全新冒险",
    "Blue Planet Arabic Dreams",
    "Blue Planet Raw Adventure",
    "Blue Planet: Rev of the Ocean",
    "蓝色行星 座谈会之谜",
    "蓝色行星 公映前特典之谜",
    "蓝色行星重发之旅",
  ])("保留正文中的数字、限定和元信息同形词：%s", (title) => {
    expect(
      parseTorrentNames(`[Release Subs] ${title} - 03 [1080p]`).title.aliases
    ).toEqual([title]);
  });
});

describe("Nyaa 完整发行说明", () => {
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

test.each([
  // Nyaa 通用发行结构
  "480i DVD MPEG-2 AC-3",
  "576i DVD MPEG-2 MP2",
  "HDTV 960 x 402",
  "DCP 1152p",
  "Blu-ray",
  "DVD1",
  "Triple Audio",
  "Fixed Audio",
  "Corrected Names",
  "IDN",
  "YouTube",
  "JEI TV",
  "Déclic Images",
  "Film/Movie",
  // Nyaa 发行参数与版本边界
  "Hulu",
  "MW",
  "retimed",
  "Dublado",
  "EN,ES,PT",
  "eng. sub.",
  "Unofficial Batch",
  "Tri Audio",
  "TriAudio",
  "Hi10p",
  "4K HBR HQ",
  "Encore broadcast",
  "TRUEFRENCH",
  "Ajout OAV",
  "80p PVD RAW PCM",
  "VideoNow",
  // Nyaa 交付标签与名称边界
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
  // Nyaa 完整发行标签
  "BATCH Complete Season",
  "PARTIAL BATCH",
  "Fixed",
  "HDR",
  "BD FHD",
  "Multi Dual Audio",
  "CH",
  "Hardsubs",
  "SEASON1996 年度TV合集",
  "1213 FHD",
])("完整发行字段不成为标题: %s", (tag) => {
  expect(aliases(`[Demo] First Tale - 03 [1080p] (${tag})`)).toEqual([
    "First Tale",
  ]);
});

describe("Nyaa 名称与交付说明边界", () => {
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
});

describe("Nyaa 发行标签与名称标点", () => {
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

describe("Nyaa 完整发行字段", () => {
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
    "BD-BOX",
    "ThaiBD",
    "VHS DivX5 MP3",
    "Volume 1",
    "rev3",
    "Dub+Sub",
    "2026, TV, 03 из 12",
    "特别话",
    "特別話",
  ])("完整发行块不成为另名：%s", (tag) => {
    expect(aliases(`[Publisher] First Tale - 03 [1080p] [${tag}]`)).toEqual([
      "First Tale",
    ]);
  });
  test.each([
    ["[Publisher] First Tale - 16 HD [DE4D1F85].mp4", ["First Tale"]],
    ["[Publisher] First Tale - 20 FHD [DE4D1F85].mp4", ["First Tale"]],
    ["[Publisher] HD Adventures - 03 [1080p]", ["HD Adventures"]],
    ["[Publisher] Volume Adventures - 03 [1080p]", ["Volume Adventures"]],
    [
      "[Publisher] Revision rev3 Adventures - 03 [1080p]",
      ["Revision rev3 Adventures"],
    ],
    ["[Publisher] First Tale BDRemux", ["First Tale"]],
    [
      "[Publisher] First Tale (Another Tale) [1080p]_rev3",
      ["First Tale", "Another Tale"],
    ],
    [
      "[Publisher] First Tale | 第一物語 | Volume 1 (Blu-ray Remux)",
      ["First Tale", "第一物語"],
    ],
    ["[Publisher] First Tale Subs for Example-Raws [BD].zip", ["First Tale"]],
    [
      "[Publisher] First Tale Subs+Fonts for Example-Raws [BD].zip",
      ["First Tale"],
    ],
  ] as Array<[string, string[]]>)("%s", (input, expected) => {
    expect(aliases(input)).toEqual(expected);
  });
});

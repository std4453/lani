import { parseTorrentNames } from "@/parseTorrentNames";
import parseTorrentTitle from "@/parseTorrentTitle";

const aliases = (input: string) =>
  (parseTorrentTitle(input) ?? parseTorrentNames(input)).title.aliases;

describe("第十一轮字幕附件与预告发行说明", () => {
  test.each([
    ["[Publisher]_First_Tale_178.ass", ["First_Tale"]],
    ["[Publisher] First Tale - 03 English subtitles", ["First Tale"]],
    ["[Publisher] First Tale - 03 eng subtitle", ["First Tale"]],
    ["First Tale - 03 uncut.ass", ["First Tale"]],
    ["First Tale 03.ass", ["First Tale"]],
    ["First Tale 2.5.ass", ["First Tale"]],
    ["First Tale.en.srt", ["First Tale"]],
    ["First Tale English Sub File.srt", ["First Tale"]],
    ["First Tale English Subs for BD", ["First Tale"]],
    ["First Tale - 03 Subs (Uncensored)", ["First Tale"]],
    ["First Tale 03 ASS only", ["First Tale"]],
    ["First Tale 03 - English ASS format", ["First Tale"]],
    ["First Tale Scripts+Fonts for Publisher [BD].zip", ["First Tale"]],
    ["First Tale I-II Subs+Fonts for Publisher [BD].zip", ["First Tale"]],
    [
      "[Publisher] Subtitle Patch for Origin's First Tale - 03 [BD 1080p]",
      ["First Tale"],
    ],
    ["Subs for First Tale BD", ["First Tale"]],
    ["V2 Patch - First Tale [1080p].mkv.rar", ["First Tale"]],
    [
      "V2 Patch - First Tale [Unknown Source Muxed with Another Raw Source raw] [1080p].mkv.rar",
      ["First Tale"],
    ],
    ["First Tale - 03 Patch.zip", ["First Tale"]],
    [
      "First Tale - 03 [Origin-Raws v3] to [Target-Team].xdelta3",
      ["First Tale"],
    ],
    ["First Tale - 03 Origin-Raws to Target-Team.xdelta3", ["First Tale"]],
    ["[Publisher] First Tale - 03 [1080p] [subs only]", ["First Tale"]],
    ["(SUBS ONLY) [Publisher] First Tale", ["First Tale"]],
    ["[Publisher] First Tale - 03 (Softsubs)", ["First Tale"]],
    ["[Publisher] First Tale - 03 (script).ass", ["First Tale"]],
    [
      "[Publisher] First Tale (2007) Unofficial English Subtitle [Credits].7z",
      ["First Tale (2007)"],
    ],
    [
      "[Publisher] First Tale - 03 [ASS][EN-ESE-ES-BZ-DE-IT-RU-FR-AR]",
      ["First Tale"],
    ],
    ["[Publisher] First Tale - 03 [POR-BR]", ["First Tale"]],
    ["[Publisher] First Tale Latest PV [1080p]", ["First Tale"]],
    ["[Publisher] First Tale - PV2v2 [1080p]", ["First Tale"]],
    ["[Publisher] First Tale - Teaser Trailer 2 [1080p]", ["First Tale"]],
    ["[Publisher] First Tale - English Trailer [1080p]", ["First Tale"]],
    ["[Publisher]_First_Tale_-_Promo_[720p].avi", ["First_Tale"]],
    ["[Publisher] First Tale PV.mkv", ["First Tale"]],
    ["[Publisher] First Tale - Textless ED1", ["First Tale"]],
    ["[Publisher] First Tale - OP [720p].mkv", ["First Tale"]],
    ["[Publisher] First Tale - 03 [1080p][AS-DL]", ["First Tale"]],
    ["[Publisher] First Tale - 03 [720p].avi", ["First Tale"]],
    ["[Publisher] First_Tale_02.mkv", ["First_Tale"]],
    ["[Publisher].First.Tale.10.[A1C27EE3].mkv", ["First.Tale"]],
    ["[Publisher] First Tale 023.mkv", ["First Tale"]],
    ["[Publisher] First Tale - Episode 3.3 [A1C27EE3].mkv", ["First Tale"]],
    ["[Publisher] First_Tale_Chapter_5_[A1C27EE3].mkv", ["First_Tale"]],
    ["[Publisher] First Tale #9 [360p].mkv", ["First Tale"]],
    ["[Publisher] First Tale Eps 373 (End).mp4", ["First Tale"]],
    ["[Publisher] First Tale (Seasons 1-2 + OVAs) [BD 1080p]", ["First Tale"]],
    [
      "[Publisher] First Tale Complete Series (Season 01 to 09+Movies+OVAs+OST) [BD 1080p]",
      ["First Tale"],
    ],
    [
      "[Publisher] First Tale [Series + Movies 2013/2015] [BD 1080p]",
      ["First Tale"],
    ],
    ["[Studio Team][1-7] First Tale [1080p]", ["First Tale"]],
    ["[Publisher] First Tale OVA (1986) [A1C27EE3].srt", ["First Tale (1986)"]],
    ["[Publisher] First Tale + Special [BD 1080p]", ["First Tale"]],
    [
      "[Publisher] FTL - First Tale Legend [1080p]",
      ["FTL", "First Tale Legend"],
    ],
    [
      "[Publisher] First_Tale_OVA_v2_(DVD_720x480_x264_FLAC)_Patch.zip",
      ["First_Tale_OVA"],
    ],
    [
      "[Publisher] First Tale CM ( 1280x720 H.264 ][ English Translation ][ CRC 49DFBD39 ].mp4",
      ["First Tale"],
    ],
    ["First Tale Volume 1 - Credit [2015.03.16][v0.3].pdf", ["First Tale"]],
    [
      "[Publisher] First Tale volume 3 (14-19) – editor's cut (corrected and styled)",
      ["First Tale"],
    ],
    [
      "[Publisher] First Tale S1+S2 | Natural, Origin, Promise | [BD 1080p]",
      ["First Tale", "Natural", "Origin", "Promise"],
    ],
    [
      "[Publisher] First Tale (Dub) Dub Preview A New Encounter! [720p].mp4",
      ["First Tale"],
    ],
    [
      "[Publisher] First Tale (Other Name) - (Season 1) [BD 1080p]",
      ["First Tale", "Other Name - (Season 1)"],
    ],
    [
      "[Publisher] First Tale (BD 1080p) - Kimi no Monogatari - The Story of You - VOSTFR",
      ["First Tale", "Kimi no Monogatari", "The Story of You"],
    ],
    [
      "[Publisher] First Tale - Season 1 S01 (BD 1080p) | FIRST OVA",
      ["First Tale - Season 1 S01", "FIRST OVA"],
    ],
  ] as Array<[string, string[]]>)("%s", (input, expected) => {
    expect(aliases(input)).toEqual(expected);
  });

  test.each([
    "Patch Notes",
    "First Tale Patch Notes",
    "Muxed with Memories",
    "Audio and Sub",
    "Scripts of the Stars",
    "First Tale Episode.0",
    "Subtitles of Dawn",
    "PV Adventure",
    "Preview of Tomorrow",
    "Trailer Park",
    "Orbit.ass Adventures",
    "Orbit.pdf Story",
    "Orbit.avi Adventures",
    "Fat-Ass",
    "The Seasons",
    "Should Be Special",
    "English 中文 –ANOTHER SUBTITLE–",
  ])("作品正文保留：%s", (title) => {
    expect(aliases(`[Publisher] ${title} - 03 [1080p]`)).toEqual([title]);
  });

  test.each(["Grand Opening", "Final Teaser", "A Long Trailer"])(
    "完整标题包装保留：%s",
    (title) => {
      expect(aliases(`[Publisher][${title}] - 03 [1080p]`)).toEqual([title]);
    }
  );

  test.each(["", " / "])("字幕附件保留显式尾部译名：%s", (separator) => {
    expect(
      aliases(`[Publisher] 星空 - 03 [1080p] ${separator}[Starry Sky].ass`)
    ).toEqual(["星空", "Starry Sky"]);
  });

  test("字幕扩展后括注中的完整别名保留", () => {
    expect(
      aliases(
        "[Publisher] First.Tale.S01E03 OriginCaption.ass (Hoshi no Monogatari)"
      )
    ).toEqual(["First.Tale", "Hoshi no Monogatari"]);
  });

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
      expect(aliases(input)).toEqual(expected);
    }
  );

  test.each([
    ["[Publisher] Fork Dawn - 03 [1080p] #Fork", ["Fork Dawn"]],
    ["[Fork] Dawn of Fork - 03 [1080p]", ["Dawn of Fork"]],
  ] as Array<[string, string[]]>)(
    "署名与标题同形时按实际位置保留：%s",
    (input, expected) => {
      expect(aliases(input)).toEqual(expected);
    }
  );

  test("括号语言字段不拆开带强调括注的逗号复句", () => {
    expect(
      aliases(
        "[Publisher] First Tale S01E03 [1080p] (Hoshi ni Narenai, Muri Muri! (※Muri ja Nakatta!?), Multi-Subs)"
      )
    ).toEqual([
      "First Tale",
      "Hoshi ni Narenai, Muri Muri! (※Muri ja Nakatta!?)",
    ]);
  });

  test("技术后的重复季号不跨说明字段拼接名称", () => {
    const actual = aliases(
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

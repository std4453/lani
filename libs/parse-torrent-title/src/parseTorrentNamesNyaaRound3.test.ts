import { parseTorrentNames } from "@/parseTorrentNames";

const aliases = (input: string) => parseTorrentNames(input).title.aliases;

describe("Nyaa 第三轮发行参数与版本边界", () => {
  test.each([
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
  ])("完整发行块不成为标题：%s", (tag) => {
    expect(aliases(`[Demo] First Tale - 03 [1080p] (${tag})`)).toEqual([
      "First Tale",
    ]);
  });

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

  test.each([
    "Hulu Adventures",
    "MW Story",
    "Retimed Odyssey",
    "First Tale (15th Anniv. Remastered)",
  ])("名称中的同形词与版本限定保留：%s", (title) => {
    expect(aliases(`[Demo] ${title} - 03 [1080p]`)).toEqual([title]);
  });

  test("年份范围包装边界的下划线仍按分隔清理", () => {
    expect(aliases("[Demo] First_Tale_(1983-1986)_001-128_[DVD]")).toEqual([
      "First_Tale",
    ]);
  });
});

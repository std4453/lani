import { parseTorrentNames } from "@/parseTorrentNames";

const aliases = (input: string) => parseTorrentNames(input).title.aliases;

describe("Nyaa 发行结构的名称边界", () => {
  test.each<[string, string[]]>([
    [
      "[Demo] First Tale S01E03 1080p CR WEB-DL AAC H.264 | Dai Ichi Monogatari",
      ["First Tale", "Dai Ichi Monogatari"],
    ],
    [
      "[Demo] First Tale S01 1080p CR WEB-DL Dual-Audio AAC H.264 | Dai Ichi Monogatari",
      ["First Tale S01", "Dai Ichi Monogatari"],
    ],
    [
      "[Demo] First Tale S01E03 [WEBRip 1080p AV1 Opus] (Multi Subs, VOSTFR) | Dai Ichi Monogatari (Weekly)",
      ["First Tale", "Dai Ichi Monogatari"],
    ],
    [
      "[Demo] First Tale - S01E03 [1080p][HEVC x265 10bit][Multi-Subs][weekly][BATCH]",
      ["First Tale"],
    ],
    ["[Demo] - 蓝色星球 - 第12话 - [1080p BILIBILI COM WEB-DL]", ["蓝色星球"]],
    [
      "[Demo] First.Tale.S01E03.VOSTFR.1080p.WEBRiP.x265-Example-Raws",
      ["First.Tale"],
    ],
    [
      "[Demo] First Tale S01E03 (VOSTFR, Dai Ichi Monogatari, A Different Tale, Another Story)",
      [
        "First Tale",
        "Dai Ichi Monogatari",
        "A Different Tale",
        "Another Story",
      ],
    ],
    [
      "[Demo] First Tale S01E03 (VF, FRENCH, SUBFRENCH, VOSTFR, Dai Ichi Monogatari)",
      ["First Tale", "Dai Ichi Monogatari"],
    ],
    [
      "[Demo] First Tale S01E03 (Seijo wa, Mahou wo Tsukau, Dual-Audio, Multi-Subs)",
      ["First Tale", "Seijo wa, Mahou wo Tsukau"],
    ],
    [
      "[Demo] First Tale S01E03 (VOSTFR, Seijo wa, Mahou wo Tsukau, Another Tale)",
      ["First Tale", "Seijo wa, Mahou wo Tsukau", "Another Tale"],
    ],
    [
      "[Demo] First Tale S01E03 (VOSTFR, Sekai no Mahou, Hajimemashita, Another Tale)",
      ["First Tale", "Sekai no Mahou, Hajimemashita", "Another Tale"],
    ],
    [
      "[Demo] First Tale S01E03 (VOSTFR, Hero no Monogatari, HNM)",
      ["First Tale", "Hero no Monogatari", "HNM"],
    ],
    [
      "[Demo] First Tale S01E03 (VOSTFR, Hero no Monogatari 2, Monogatari)",
      ["First Tale", "Hero no Monogatari 2", "Monogatari"],
    ],
    [
      "[Demo] First Tale S01E03 [CR WEB-DL 1080p AVC AAC] (Dai Ichi Monogatari, English-Sub)",
      ["First Tale", "Dai Ichi Monogatari"],
    ],
    [
      "[Demo] First Tale S01E03 (Dai Ichi Monogatari | Season 2 | S2)",
      ["First Tale", "Dai Ichi Monogatari"],
    ],
    [
      "[Demo] First Tale S01E03 (First/Order 星の物語; First/Order: Hoshi no Monogatari) [YTB.WEB-DL 1080p AVC AAC]",
      [
        "First Tale",
        "First/Order 星の物語",
        "First/Order: Hoshi no Monogatari",
      ],
    ],
    [
      "[Demo] First Tale - S01 (제일 이야기; Dai Ichi Monogatari) [VIKI.WEB-DL 1080p AVC AAC][BATCH]",
      ["First Tale - S01", "제일 이야기", "Dai Ichi Monogatari"],
    ],
    [
      "[Demo] First Tale (CR WEB-DL 1080p AVC AAC) | Dai Ichi Monogatari (Part 1)",
      ["First Tale", "Dai Ichi Monogatari (Part 1)"],
    ],
    [
      "[Demo] First Tale S01E03 [WEB.1080p.AV1] | First Tale (2026) (Multi-Subs) (Weekly)",
      ["First Tale", "First Tale (2026)"],
    ],
    [
      "[Demo] First Tale [Re]: Another World - S01E03 [1080p][weekly]",
      ["First Tale [Re]: Another World"],
    ],
    [
      "[Demo] Mahou wa [Payment Plan] de Kaesu - 02 (AT-X 1440x1080 MPEG2 AAC).ts",
      ["Mahou wa [Payment Plan] de Kaesu"],
    ],
    [
      "[Demo] 蓝色星球 First Tale [Re] / First Tale [Re]: Another World - 02 [1080p]",
      ["蓝色星球 First Tale [Re]", "First Tale [Re]: Another World"],
    ],
    ["[Demo] C-24 (BD 1280x720 x265 AAC)", ["C-24"]],
    [
      "[Demo][星海/Nebula/NEBULA -ネビュラ-][01-12][1080p]",
      ["星海", "Nebula", "NEBULA -ネビュラ-"],
    ],
    ["[Demo][X/Project X/「X」][01-12][1080p]", ["X", "Project X"]],
    [
      "[Demo] Friendship wa Seiritsu suru? (Iya, Shinai!!) - 01 [1080p]",
      ["Friendship wa Seiritsu suru? (Iya, Shinai!!)"],
    ],
    [
      "[2160p][Demo] 星海物语(※不是不可能！？) 2160p",
      ["星海物语(※不是不可能！？)"],
    ],
    [
      "[Demo][TVB粤语]星海物语（友爱的天空） / Nebula Tale [BD 1080p]",
      ["星海物语（友爱的天空）", "Nebula Tale"],
    ],
    ["[Demo][Nebula Tale 2000][1080p][BDRip]", ["Nebula Tale"]],
    [
      "[Demo] 星海 Nebula Tale [1080p][U-NEXT][Digital Remaster]",
      ["星海 Nebula Tale"],
    ],
    ["[Demo] 星海 / Nebula | 01-12(Part 1) [1080p]", ["星海", "Nebula"]],
    [
      "怀旧游戏 (128款游戏; 简中,英文菜单; Demo_1.25 模拟器)",
      ["怀旧游戏 (128款游戏; 简中,英文菜单; Demo_1.25 模拟器)"],
    ],
    [
      "[Demo] 单人房, 光照尚好 - 01 [1080p] (单间,光照尚好,简中)",
      ["单人房, 光照尚好", "单间,光照尚好"],
    ],
    [
      "[Demo] 星海物语 (Nebula Tale 2023) - 12 [1080p]",
      ["星海物语", "Nebula Tale 2023"],
    ],
    [
      "[Demo] A-7 (2006) - OVA + Interviews (R2JP DVD-Remux ENG) | A-七",
      ["A-7 (2006)", "A-七"],
    ],
    [
      "[Demo] First Tale S01 German, English, Japanese AC3 FLAC 720p BluRay x264-Example-Raws",
      ["First Tale S01"],
    ],
    [
      "[Demo] First Tale (4Kids ENG) 01-12 (480i DVD ISO) (Discotek Media)",
      ["First Tale"],
    ],
    [
      "[Demo] First Tale - 03 (JA) [1080p CR WEB-DL AVC AAC][PT-BR][Sub_Esp]",
      ["First Tale"],
    ],
    [
      "[Demo] 星の物語 第37話 劇情の説明 (TVer 1080p) <First Tale!>",
      ["星の物語", "First Tale!"],
    ],
    [
      "First.Tale.Movie.2017.MULTI.1080p.BDRip.x264-Example-Raws VOSTFR First Tale 星の物語",
      ["First.Tale", "First Tale 星の物語"],
    ],
  ])("%s", (input, expected) => {
    expect(aliases(input)).toEqual(expected);
  });

  test.each([
    "Weekly Adventures",
    "Batch of Heroes",
    "Blue Planet 2023",
    "UNIT_3072",
  ])("发行标签同形词在标题正文中保留：%s", (title) => {
    expect(aliases(`[Demo] ${title} - 03 [1080p]`)).toEqual([title]);
  });
});

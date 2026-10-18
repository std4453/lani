import { parseTorrentNames } from "@/parseTorrentNames";
import parseTorrentTitle from "@/parseTorrentTitle";

const aliases = (input: string) => parseTorrentNames(input).title.aliases;

describe("Nyaa 第七轮完整发行标签", () => {
  test.each([
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
  ])("完整发行块不成为名称：%s", (tag) => {
    expect(aliases(`[Example-Subs] First Tale - 03 [1080p] [${tag}]`)).toEqual([
      "First Tale",
    ]);
  });

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

describe("Nyaa 第七轮名称、集号和版本边界", () => {
  test.each(["", " Extended"])(
    "覆盖码后的本地集数只用来划分名称：%s",
    (edition) => {
      const input = `[Example-Subs][1012-1013] First World 62${edition} [1080p][562018E8].mkv`;
      expect(aliases(input)).toEqual(["First World"]);
      const parsed = parseTorrentTitle(input);
      expect(parsed?.title?.aliases).toEqual(["First World"]);
      expect(parsed?.episodeInfo).toEqual({
        type: "episode",
        index: { from: 1012, to: 1013 },
      });
    }
  );

  test.each([
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

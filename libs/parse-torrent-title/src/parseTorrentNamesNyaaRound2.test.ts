import { parseTorrentNames } from "@/parseTorrentNames";
import parseTorrentTitle from "@/parseTorrentTitle";

const aliases = (input: string) => parseTorrentNames(input).title.aliases;

describe("Nyaa 第二轮通用发行结构", () => {
  test.each([
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
  ])("独立交付说明不成为标题：%s", (tag) => {
    expect(aliases(`[Demo] First Tale - 03 [1080p] (${tag})`)).toEqual([
      "First Tale",
    ]);
  });

  test.each([
    [
      "[Demo] First Tale S04 E13 (178) [1080p AAC2.0] (Dai Ichi Monogatari).mkv",
      ["First Tale S04", "Dai Ichi Monogatari"],
    ],
    ["First.Tale.S01v2.1080p.BluRay.AV1.Opus-Example-Raws", ["First.Tale.S01"]],
    ["First Tale S01E138-S01E198 (WEBDL 1080p x264 AAC)", ["First Tale"]],
    [
      "[Demo] First Tale 1-2 2024 S03E02 1080p NF WEB-DL AAC H.264",
      ["First Tale 1-2 2024"],
    ],
    [
      "[Demo] First Tale 17 (1987) (BD 1080p HEVC Opus)",
      ["First Tale 17 (1987)"],
    ],
    [
      "[Demo] First Tale (Season 01 pt.2) [1080p][HEVC x265][Batch]",
      ["First Tale (Season 01 pt.2)"],
    ],
    [
      "[Demo] First Tale - S00 Specials [BD 1080p] | Dai Ichi Monogatari OVA / OAD",
      ["First Tale - S00", "Dai Ichi Monogatari"],
    ],
    ["[Demo]_First_Tale_41_ger_sub[HDTV][720p]", ["First_Tale"]],
    ["[Demo] First Tale 01 a 12 Sub valencià-español", ["First Tale"]],
    [
      "[Demo] - First Tale - Season Movie + Special - [1080p USBD]",
      ["First Tale"],
    ],
    [
      "[Demo] First Tale - Convention 2016 Special [BD 1080p]",
      ["First Tale - Convention 2016 Special"],
    ],
    ["[Demo] First Tale - TV (2018) + MOVIE (2021) [JP]", ["First Tale"]],
    [
      "[Demo] First Tale Movie 3 - Another World (AT-X 1440x1080 MPEG2 AAC).ts",
      ["First Tale Movie 3 - Another World"],
    ],
    [
      "[Demo] First Tale - 03 [1080p][Multi Sub][Weekly] Dai Ichi Monogatari",
      ["First Tale", "Dai Ichi Monogatari"],
    ],
    [
      "[Demo] First Tale [Re] THE NEW WORLD S01E02 1080p CR WEB-DL AAC H.264 | First Tale [Re] The New World",
      ["First Tale [Re] THE NEW WORLD", "First Tale [Re] The New World"],
    ],
    [
      "[Demo] First Tale S01E03 (VF, VOSTFR, First Zero kara Hajimeru 4th Season, First Life in another world, FirstZero)",
      [
        "First Tale",
        "First Zero kara Hajimeru 4th Season",
        "First Life in another world",
        "FirstZero",
      ],
    ],
    [
      "[Demo] First Tale S01E03 (VOSTFR, Tensei Hero, Kantei Skill de Nariagaru, Tensei Hero, Kantei Skill de Nariagaru 3rd Season)",
      [
        "First Tale",
        "Tensei Hero, Kantei Skill de Nariagaru",
        "Tensei Hero, Kantei Skill de Nariagaru 3rd Season",
      ],
    ],
    [
      "[Demo] First Tale - Box 17 Remastered (V3.1) [The War] (1080p x265 AAC Multi) - Example Encoder",
      ["First Tale", "The War"],
    ],
    ["[Demo] - 첫 번째 이야기_ - 03 [1080p WEB-DL]", ["첫 번째 이야기_"]],
    ["[Demo] - First Tale_ - 03 [1080p WEB-DL]", ["First Tale_"]],
    [
      "First Great Tale : Tale Ultimate Survivor - (Season 01-02) [BD 1080p]",
      ["First Great Tale", "Tale Ultimate Survivor"],
    ],
  ] as Array<[string, string[]]>)("%s", (input, expected) => {
    expect(aliases(input)).toEqual(expected);
  });

  test("紧贴编号包装的下划线按分隔符清理", () => {
    expect(
      aliases("[Demo]蓝色星球_[9][特别篇][Bahamut][WEB-DL][1080p]")
    ).toEqual(["蓝色星球"]);
  });

  test.each([
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
        ".avi",
      ],
    ],
    [
      "[Demo] First Collection of Short Stories_(Historias Cortas de Primera )2 -Movie .(Jap.sub.Chino ).avi",
      [
        "First Collection of Short Stories",
        "Historias Cortas de Primera",
        "2 -Movie .",
        "Jap.sub.Chino",
        ".avi",
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
  ] as Array<[string, string[]]>)(
    "相邻包装边界的下划线属于分隔：%s",
    (input, expected) => {
      expect(aliases(input)).toEqual(expected);
    }
  );

  test("前置归档范围只跳过名称定位，不改变主解析器剧集结果", () => {
    const input = "[Demo][605-606] First Tale 02 [1080p][9727A1C7].mkv";
    expect(aliases(input)).toEqual(["First Tale"]);
    const result = parseTorrentTitle(input);
    expect(result?.title.aliases).toEqual(["First Tale"]);
    expect(result?.episodeInfo).toEqual({
      type: "episode",
      index: { from: 605, to: 606 },
    });
  });
});

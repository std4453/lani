import { parseTorrentNames } from "@/parseTorrentNames";
import parseTorrentTitle from "@/parseTorrentTitle";
const aliases = (input: string) => parseTorrentNames(input).title.aliases;

describe("发行标签、声轨字幕与多季收录范围", () => {
  test.each([
    ["蓝色行星 084 4K HEVC", ["蓝色行星"]],
    ["蓝色行星 86 4K HEVC", ["蓝色行星 86"]],
    [
      "蓝色行星.Blue.Planet.2017.BluRay.1080p.DTS.HDMA5.1.x265",
      ["蓝色行星", "Blue.Planet"],
    ],
    ["蓝色行星2季全 / Blue_Planet_S1+S2_FIN", ["蓝色行星", "Blue_Planet"]],
    [
      "蓝色行星.Blue.Planet.1983.S1-S2.EP01-EP73.BDrip.1080p",
      ["蓝色行星", "Blue.Planet"],
    ],
    ["Blue Planet_S1+S2+S3_END", ["Blue Planet"]],
    [
      "蓝色行星 超后宫版 / Blue Planet - 03 [1080p]",
      ["蓝色行星", "Blue Planet"],
    ],
  ])("只清理明确技术尾部和完整收录范围：%s", (title, expected) => {
    expect(parseTorrentNames(`[Release Subs] ${title}`).title.aliases).toEqual(
      expected
    );
  });
});

describe("Nyaa 数字与版本边界", () => {
  test("名称边界调整不改变公共集号", () => {
    const parsed = parseTorrentTitle(
      "[Publisher] Futsuu no Worker desu (Pride) - 03 [1080p]"
    );
    expect(parsed?.title?.aliases).toEqual(["Futsuu no Worker desu (Pride)"]);
    expect(parsed?.episodeInfo).toEqual({ type: "episode", index: 3 });
  });
});

describe("名称边界", () => {
  test.each([
    [
      "[Publisher] Aurora S03 PART I MULTi 1080p CR WEBRiP AAC 2.0 (Hoshi no Monogatari, VF, VOSTFR)",
      ["Aurora S03 PART I", "Hoshi no Monogatari"],
    ],
    ["[Publisher] Aurora S03 PART II [1080p]", ["Aurora S03 PART II"]],
    ["[Publisher] Aurora S03 Part IV - 03 [1080p]", ["Aurora S03 Part IV"]],
    ["[Publisher] Aurora S01+S02 [BD 1080p]", ["Aurora"]],
    ["[Publisher] Aurora S01 - S03 [BD 1080p]", ["Aurora"]],
    ["[Publisher] A Part of Aurora - 03 [1080p]", ["A Part of Aurora"]],
    [
      "[Publisher] - Azure Temple - S789012E12 [4K BILIBILI COM WEB-DL] [Golden Curse]",
      ["Azure Temple", "Golden Curse"],
    ],
    [
      "[Publisher] Azure Temple S789012E12 [1080p HEVC] [Golden Curse]",
      ["Azure Temple", "Golden Curse"],
    ],
    [
      "[Publisher] Archive S789012E12 Adventure [1080p]",
      ["Archive S789012E12 Adventure"],
    ],
    ["[Publisher] Archive XS789012E12 [1080p]", ["Archive XS789012E12"]],
    ["[Publisher] Archive S12345E12 [HEVC-Team]", ["Archive S12345E12"]],
    [
      "[Publisher] Archive - S789012E12 [Golden Curse]",
      ["Archive - S789012E12 [Golden Curse]"],
    ],
  ] as Array<[string, string[]]>)("%s", (input, expected) => {
    expect(parseTorrentNames(input).title.aliases).toEqual(expected);
    const integrated = parseTorrentTitle(input);
    if (integrated) expect(integrated.title.aliases).toEqual(expected);
  });
  test("超长季号不会创建普通集数解析结果", () => {
    const input =
      "[Publisher] - Azure Temple - S789012E12 [4K BILIBILI COM WEB-DL] [Golden Curse]";
    expect(parseTorrentTitle(input)).toBeUndefined();
    expect(parseTorrentNames(input).title.aliases).toEqual([
      "Azure Temple",
      "Golden Curse",
    ]);
  });
});

describe("Nyaa 通用发行结构", () => {
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

describe("Nyaa 名称与交付说明边界", () => {
  test.each(["Go", "Run", "Hi"])("短集名不按长度回拼作品名：%s", (caption) => {
    expect(aliases(`[Demo] Blue Planet [02] - ${caption} [1080p]`)).toEqual([
      "Blue Planet",
    ]);
  });
});

describe("Nyaa 名称、集号和版本边界", () => {
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
});

describe("Nyaa 收录列表和单季限定", () => {
  test("名称清理不改变公共解析器的剧集编号", () => {
    const parsed = parseTorrentTitle(
      "[Publisher] First Tale - 03 [1080p] [BD-BOX]"
    );
    expect(parsed?.title?.aliases).toEqual(["First Tale"]);
    expect(parsed?.episodeInfo).toEqual({ type: "episode", index: 3 });
  });
});

describe("名称结构通用回归", () => {
  test.each([
    [
      "重复语种的多语剧情块不作为作品",
      "[Release Subs][蓝色行星/Blue Planet/ブループラネット][805][失踪的星星/消えた星][后篇][1080p][HEVC]",
      ["蓝色行星", "Blue Planet", "ブループラネット"],
    ],
    [
      "混合语言单集题不作为作品",
      "[Release Subs]蓝色行星 / Blue Planet [32][我回来了 Blue·事务所][1080p][HEVC]",
      ["蓝色行星", "Blue Planet"],
    ],
    [
      "集号后独立短篇章说明不回拼",
      "[Release Subs]蓝色行星 / Blue Planet - 23 (未来篇)[1080p][HEVC]",
      ["蓝色行星", "Blue Planet"],
    ],
    [
      "集号与剧情名同块划分边界",
      "[Release Subs][蓝色行星_Blue Planet][12 逃离的尽头][1080p][HEVC]",
      ["蓝色行星", "Blue Planet"],
    ],
    [
      "误写宽度的范围仍划分名称",
      "[Release Subs][蓝色行星][1128-11129][星星失踪事件（前后篇）][1080p][HEVC]",
      ["蓝色行星"],
    ],
    [
      "技术块后的真实尾部译名保留",
      "[Release Subs]蓝色行星 / Blue Planet [12][1080p][HEVC](蓝色星球)",
      ["蓝色行星", "Blue Planet", "蓝色星球"],
    ],
    [
      "技术块前显式检索别名保留",
      "[Release Subs]蓝色行星 / Blue Planet [12](检索用：蓝色星球)[1080p][HEVC]",
      ["蓝色行星", "Blue Planet", "蓝色星球"],
    ],
    [
      "首英文长标题带内部横线保留",
      "[The Blue Planet - Adventures of the Lost Star -][蓝色行星][01-11][HEVC][MKV]",
      ["The Blue Planet - Adventures of the Lost Star -", "蓝色行星"],
    ],
    [
      "短组前缀不能据标题规则保留",
      "[Example Media Lab][蓝色行星][03][1080p]",
      ["蓝色行星"],
    ],
    [
      "原声发布保留首混合名并提取官方原名",
      "[蓝色行星 Blue Planet][OST 原声音乐][FLAC][TVアニメ「ブループラネット」オリジナルサウンドトラック]",
      ["蓝色行星 Blue Planet", "ブループラネット"],
    ],
    [
      "作品内音乐词不自动剔除",
      "[Release Subs]Blue Planet Original Soundtrack Adventure - 03 [1080p]",
      ["Blue Planet Original Soundtrack Adventure"],
    ],
    [
      "别名列表中间的发行组块删除",
      "蓝色行星/ブループラネット/[Example-Raws] Blue Planet (DVD 640x480 x264 AAC)",
      ["蓝色行星", "ブループラネット", "Blue Planet"],
    ],
    [
      "集号连接另一独立作品名称",
      "[Release Subs]蓝色行星 - 1156-1170＆星星们的故事 [WebRip 1080p HEVC AAC]",
      ["蓝色行星", "星星们的故事"],
    ],
    [
      "额外SP标签不构成另一部作品",
      "[Release Subs]蓝色行星 - 01-12&SP [1080p][HEVC]",
      ["蓝色行星"],
    ],
    [
      "TV Special保持版本括注",
      "[Release Subs]蓝色行星 TVSP / Blue Planet (TV Special) [1080p][HEVC]",
      ["蓝色行星 TVSP", "Blue Planet (TV Special)"],
    ],
    [
      "独立台地区标记删除",
      "[Release Subs]蓝色行星(台) / Blue Planet [1080p][HEVC]",
      ["蓝色行星", "Blue Planet"],
    ],
  ] as Array<[string, string, string[]]>)("%s", (_name, input, expected) => {
    expect(parseTorrentNames(input).title.aliases).toEqual(expected);
    const withoutLegacyEpisode =
      /12 逃离|1128-11129|OST 原声|Example-Raws|TV Special|行星\(台\)/.test(
        input
      );
    if (withoutLegacyEpisode) {
      expect(parseTorrentTitle(input)).toBeUndefined();
      expect(
        parseTorrentTitle(input + " - 03 [1080p]")?.title?.aliases
      ).toEqual(expected);
    } else {
      expect(parseTorrentTitle(input)?.title?.aliases).toEqual(expected);
    }
  });
});

describe("inline特别篇与后续集号分别处理", () => {
  test("名称后的普通dash集号不吞inline特别篇", () => {
    const input = "[Release Subs] 蓝色行星 特别篇 - 03 [1080p]";
    expect(parseTorrentNames(input).title.aliases).toEqual(["蓝色行星 特别篇"]);
    const result = parseTorrentTitle(input);
    expect(result?.title?.aliases).toEqual(["蓝色行星 特别篇"]);
    expect(result?.episodeInfo).toEqual({ type: "sp", index: 3 });
  });
  test("无编号inline特别篇仍作为名称保留", () => {
    expect(
      parseTorrentNames("[Release Subs] 蓝色行星 特别篇 [1080p]").title.aliases
    ).toEqual(["蓝色行星 特别篇"]);
  });
});

describe("名称结构通用回归", () => {
  test.each([
    ["零补齐集号后接裸技术参数", "蓝色行星 084 4K HEVC", ["蓝色行星"]],
    ["作品数字不按裸集号删除", "海洋 86 4K HEVC", ["海洋 86"]],
    [
      "相对集号与绝对集号紧连",
      "[国漫]蓝色行星远航篇07第152集无水印高清迅雷下载",
      ["蓝色行星远航篇"],
    ],
    [
      "重复集号的另一实例",
      "[国漫]蓝色行星远航篇06第151集无水印高清迅雷下载",
      ["蓝色行星远航篇"],
    ],
    [
      "作品本身的数字不随集号删除",
      "[国漫]银河铁道999第152集无水印高清下载",
      ["银河铁道999"],
    ],
    ["中文集号前紧贴横线", "[国漫]蓝色行星-第40话 一场旅途", ["蓝色行星"]],
    [
      "合集说明紧贴中文集号",
      "[国漫]蓝色行星合集第06集无水印高清下载",
      ["蓝色行星"],
    ],
    [
      "子集编号后剧情题名删除",
      "[Example Subs]Blue Planet 蓝色行星[722-1][失踪的礼物][2022.09.03][AVC][1080P]",
      ["Blue Planet 蓝色行星"],
    ],
    [
      "装饰符分名并绑定独立季数",
      "[Example Subs]  ⯎ ブルー ⯎ Blue Planet ⯎  S01 (BD 1080p HEVC FLAC)",
      ["ブルー", "Blue Planet S01"],
    ],
    [
      "横线季数限定不能吞掉",
      "[Example Subs]蓝色行星 / 蓝色星球 - S1 [粤日双语][1080p]",
      ["蓝色行星", "蓝色星球 - S1"],
    ],
    [
      "英文季度括注绑定前名",
      "[Example Subs]Blue Planet (Season 3) / 蓝色行星 [1080p]",
      ["Blue Planet (Season 3)", "蓝色行星"],
    ],
    [
      "序数季度括注绑定前名",
      "[Example Subs]Blue Planet (3rd Season) / 蓝色行星 [1080p]",
      ["Blue Planet (3rd Season)", "蓝色行星"],
    ],
    [
      "无编号inline特别篇为名称限定",
      "[Example Subs]Blue Planet - 特别篇 [1080p]",
      ["Blue Planet - 特别篇"],
    ],
    [
      "无编号inline特别编为名称限定",
      "[Example Subs]Blue Planet - 特别编 [1080p]",
      ["Blue Planet - 特别编"],
    ],
    [
      "独立特别篇标签仍删除",
      "[Example Subs][Blue Planet][特别篇][1080p]",
      ["Blue Planet"],
    ],
    [
      "有编号特别篇仍划分集数",
      "[Example Subs]Blue Planet - 特别篇 02 [1080p]",
      ["Blue Planet"],
    ],
    [
      "尾部代发说明不绑定作品",
      "[Example Subs]蓝色行星 完结篇 第1章 [BDRip][1080p]（代发）",
      ["蓝色行星 完结篇 第1章"],
    ],
  ] as Array<[string, string, string[]]>)("%s", (_name, input, expected) => {
    expect(parseTorrentNames(input).title.aliases).toEqual(expected);
  });
});

describe("生产入口保留名称限定且保持剧集结果", () => {
  test("无编号inline特别篇保留名称，episodeInfo仍为sp", () => {
    const input = "[Example Subs]Blue Planet - 特别篇 [1080p]";
    const result = parseTorrentTitle(input);
    expect(result?.title?.aliases).toEqual(["Blue Planet - 特别篇"]);
    expect(result?.episodeInfo).toEqual({ type: "sp" });
    expect(
      parseTorrentNames(input, {
        episode: { index: input.indexOf("特别篇"), length: "特别篇".length },
      }).title.aliases
    ).toEqual(["Blue Planet - 特别篇"]);
  });
});

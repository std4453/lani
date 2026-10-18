import { parseTorrentNames } from "@/parseTorrentNames";
import parseTorrentTitle from "@/parseTorrentTitle";

describe("名称结构第九轮通用回归", () => {
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

describe("中文集号前保留副标题闭合横线", () => {
  test.each([
    [
      "[Example Subs]English 中文 -SUBTITLE- 第01集 [1080p]",
      "English 中文 -SUBTITLE-",
    ],
    [
      "[Example Subs]English 中文 –ANOTHER SUBTITLE– 第02集 [1080p]",
      "English 中文 –ANOTHER SUBTITLE–",
    ],
    ["[Example Subs]蓝色行星-第40话 [1080p]", "蓝色行星"],
    ["[Example Subs]蓝色行星–第40话 [1080p]", "蓝色行星"],
  ])("%s", (input, expected) => {
    expect(parseTorrentNames(input).title.aliases).toEqual([expected]);
    expect(parseTorrentTitle(input)?.title?.aliases).toEqual([expected]);
  });
});

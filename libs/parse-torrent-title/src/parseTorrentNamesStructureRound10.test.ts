import { parseTorrentNames } from "@/parseTorrentNames";
import parseTorrentTitle from "@/parseTorrentTitle";

describe("名称结构第十轮通用回归", () => {
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

describe("发行年份只在明确收录清单边界删除", () => {
  test.each([
    [
      "[Release Subs]蓝色行星 / Blue Planet 2023 | 01-04 [1080p]",
      ["蓝色行星", "Blue Planet"],
    ],
    [
      "[Release Subs]蓝色行星 / Blue Planet (2023) | 01-04 [1080p]",
      ["蓝色行星", "Blue Planet (2023)"],
    ],
    [
      "[Release Subs]蓝色行星 2023年版 / Blue Planet - 03 [1080p]",
      ["蓝色行星 2023年版", "Blue Planet"],
    ],
  ] as Array<[string, string[]]>)("%s", (input, expected) => {
    expect(parseTorrentNames(input).title.aliases).toEqual(expected);
    expect(parseTorrentTitle(input)?.title?.aliases).toEqual(expected);
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

describe("结构规则的保留负例", () => {
  test("集号前置长英文组不能仅因词多而保留", () => {
    const input =
      "[The Example Translation and Media Lab][蓝色行星][03][1080p]";
    expect(parseTorrentNames(input).title.aliases).toEqual(["蓝色行星"]);
    expect(parseTorrentTitle(input)?.title?.aliases).toEqual(["蓝色行星"]);
  });
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

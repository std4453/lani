import { parseTorrentNames } from "@/parseTorrentNames";
import parseTorrentTitle from "@/parseTorrentTitle";

const aliases = (input: string) => parseTorrentNames(input).title.aliases;

describe("独立的作品名称识别", () => {
  test.each([
    ["[Release Subs] Blue Planet - 01_x264_1080p", ["Blue Planet"]],
    ["[Release Subs] 蓝色行星 08 BD [1080p]", ["蓝色行星"]],
    [
      "[Release Subs] Blue Planet Volume 6 BD（单剧集+电影合集）",
      ["Blue Planet Volume 6"],
    ],
    [
      "[Release Subs] 蓝色行星（蓝色星球） / Blue Planet 02（Onair） GB 720P MP4",
      ["蓝色行星", "蓝色星球", "Blue Planet"],
    ],
    [
      "[Release Subs] Blue Planet - 01 [AMZN WebRip 暴力1080p HEVC-10bit E-AC-3]",
      ["Blue Planet"],
    ],
    [
      "[Release Subs][Blue Planet][03][国韩双语][VideoVer][NETFLIX][Multi-Audio, Multi-Subs]",
      ["Blue Planet"],
    ],
    [
      "[Release Subs][Blue Planet][03][完全wonderful版][简繁内封jianfannf]",
      ["Blue Planet"],
    ],
    [
      "[Release Subs] Blue Planet (2000) [S01] [1080p]",
      ["Blue Planet (2000) [S01]"],
    ],
    [
      "[Release Subs][Blue Planet][蓝色行星]章标题[2024.04.14][1080p]",
      ["Blue Planet", "蓝色行星"],
    ],
    [
      "[Release Subs][Blue Planet][03]（检索用：蓝星球）",
      ["Blue Planet", "蓝星球"],
    ],
    [
      "[Release Subs][Blue Planet][03]（检索用：青箱）",
      ["Blue Planet", "青箱"],
    ],
    [
      "[Release Subs] ★SP★ 蓝色行星 / Blue Planet SP01 GB 1080P MP4",
      ["蓝色行星", "Blue Planet"],
    ],
    [
      "[Release Subs] Blue Planet -A New World- 05 (BS11 1280x720 x264 AAC) 蓝色星球 -全新世界- 05",
      ["Blue Planet -A New World-", "蓝色星球 -全新世界-"],
    ],
    ["[Release Subs] 蓝色行星.全50集.法语.罗马尼亚字幕+英文字幕", ["蓝色行星"]],
    [
      "[Release Subs] 蓝色行星TV.日语.内挂英文字幕.Blue Planet (Blue World!) WEB-DL 1080p",
      ["蓝色行星", "Blue Planet", "Blue World!"],
    ],
    [
      "[Release Subs] 蓝色行星.第三季.波兰语.无字幕.Blue.Planet.S03.PLDUB.1080p",
      ["蓝色行星.第三季", "Blue.Planet.S03"],
    ],
    [
      "[Release Subs] Blue.Planet.Road.to.2002.Ep1-52.Complete",
      ["Blue.Planet.Road.to.2002"],
    ],
    [
      "[Release Subs][五彩星球英雄/Five Color Planet Heroes][03](检索:英雄/Heroes)",
      ["五彩星球英雄", "Five Color Planet Heroes"],
    ],
    [
      "[Release Subs][ブループラネット/Blue_Planet/蓝色星球][03][1080p]",
      ["ブループラネット", "Blue_Planet", "蓝色星球"],
    ],
    ["[Release Subs] Blue Planet - S1+S2+S3 [BD]", ["Blue Planet"]],
    [
      "[Release Subs] 蓝色星球 生肉第十三集 [蓝色星球/Blue Planet][13]",
      ["蓝色星球", "Blue Planet"],
    ],
    [
      "[Release Subs] 蓝色星球 英配中字 Blue Planet S02E05 [1080p]",
      ["蓝色星球", "Blue Planet"],
    ],
    ["Blue Planet [m1080p] (1985)", ["Blue Planet"]],
    [
      "[Release Subs] 蓝色行星 / Blue Planet [03][1080p][简繁内封]",
      ["蓝色行星", "Blue Planet"],
    ],
    [
      "[Release Subs] 蓝色行星 Blue Planet [03][1080p]",
      ["蓝色行星 Blue Planet"],
    ],
    [
      "[Release Subs] BLUE PLANET 蓝色行星 / Blue Planet [03]",
      ["BLUE PLANET 蓝色行星", "Blue Planet"],
    ],
    [
      "[Release Subs][国漫][蓝色行星][Blue Planet][2025][03][HEVC_AAC]",
      ["蓝色行星", "Blue Planet"],
    ],
    [
      "[Release Subs] Blue Planet [BDRip][HEVC 1080p AAC] [01-12]",
      ["Blue Planet"],
    ],
    [
      "[Release Subs] 蓝色行星 / Blue Planet 10-bit 1080p HEVC BDRip [Fin]",
      ["蓝色行星", "Blue Planet"],
    ],
    [
      "[Release Subs] Blue Planet [03][1080p]（检索用：蓝色星球）",
      ["Blue Planet", "蓝色星球"],
    ],
    [
      "[Release Subs] Blue Planet - 03 (CR 1080p AAC) {ブループラネット}",
      ["Blue Planet", "ブループラネット"],
    ],
    [
      "[Release Subs][蓝色行星(Blue Planet)][03][1080p]",
      ["蓝色行星", "Blue Planet"],
    ],
    [
      "[Release Subs] 蓝色行星【远航】篇 / Blue Planet [Voyage] - 03 [1080p]",
      ["蓝色行星【远航】篇", "Blue Planet [Voyage]"],
    ],
    ["[Release Subs] Brand/subtitle - 03 [1080p]", ["Brand/subtitle"]],
    [
      "[Release Subs] A Name / Brand/subtitle - 03 [1080p]",
      ["A Name", "Brand/subtitle"],
    ],
    [
      "[Release Subs][甲/乙/丙/丁/戊][03][1080p]",
      ["甲", "乙", "丙", "丁", "戊"],
    ],
    [
      "[Release Subs][蓝色行星_Blue_Planet][03][1080p]",
      ["蓝色行星", "Blue_Planet"],
    ],
    [
      "[Release Subs][蓝色行星 Blue_Planet][03][1080p]",
      ["蓝色行星 Blue_Planet"],
    ],
    [
      "[Release Subs][蓝色行星！_Blue_Planet][03][1080p]",
      ["蓝色行星！", "Blue_Planet"],
    ],
    [
      "[Release Subs] 蓝色行星 (远航) / Blue Planet - 03 [1080p]",
      ["蓝色行星 (远航)", "Blue Planet"],
    ],
    [
      "[Release Subs] 蓝色（30岁）行星 / Blue Planet - 03 [1080p]",
      ["蓝色（30岁）行星", "Blue Planet"],
    ],
    [
      "[Release Subs] 蓝色行星 - 03 [1080p] 蓝色星球／Blue Planet",
      ["蓝色行星", "蓝色星球", "Blue Planet"],
    ],
    [
      "[Release Subs] 蓝色行星 - 03 [1080p].Blue.Planet",
      ["蓝色行星", "Blue.Planet"],
    ],
    ["[网盘资源][Release Subs][蓝色行星][1080p]", ["蓝色行星"]],
    [
      "[Release Subs] Blue Planet - 03 [Ani-One Asia][Multiple Subtitle](repack)",
      ["Blue Planet"],
    ],
    [
      "蓝色行星.Blue Planet - 3000 Miles Across the Sky",
      ["蓝色行星", "Blue Planet", "3000 Miles Across the Sky"],
    ],
    ["[Release Subs] Blue Planet 024 720P [GB]", ["Blue Planet"]],
    ["[Release Subs] OVA 蓝色行星 [1080p][简体]", ["蓝色行星"]],
    ["[V2][Release Subs] Blue Planet - 03 [HDTVRIP]", ["Blue Planet"]],
    ["[个人制作合集][Release Subs] Blue Planet - 03 [1080p]", ["Blue Planet"]],
    [
      "[Release Subs] Blue Planet (2022) 2nd Season - 03 [1080p]",
      ["Blue Planet (2022) 2nd Season"],
    ],
    ["[Release Subs] 蓝色行星(第三季) - 03 [1080p]", ["蓝色行星(第三季)"]],
    [
      "[Release Subs] 蓝色行星（不，不存在！！） - 03 [1080p]",
      ["蓝色行星（不，不存在！！）"],
    ],
    [
      "[Release Subs] Blue Planet (※A New Journey!?) - 03 [1080p]",
      ["Blue Planet (※A New Journey!?)"],
    ],
    [
      "[Release Subs] Blue Planet - 03 [1080p] ブループラネット",
      ["Blue Planet", "ブループラネット"],
    ],
    [
      "[Release Subs] Blue Planet - 03 [1080p]（字幕社招人内详）",
      ["Blue Planet"],
    ],
    ["[Release Subs] 爱招人喜欢的行星 第03集 [1080p]", ["爱招人喜欢的行星"]],
    [
      "[Release Subs] 蓝色行星（仅限港澳台地区） Blue Planet - 03 [1080p]",
      ["蓝色行星 Blue Planet"],
    ],
    ["[Release Subs] Blue Planet. - 03 [1080p]", ["Blue Planet."]],
    ["[Release Subs] 2.5 Dimensions - 03 [1080p]", ["2.5 Dimensions"]],
    ["[Release Subs] Blue Planet [DVD][HEVC][1080p]", ["Blue Planet"]],
    [
      "[Release Subs] 蓝色行星 U123_THE BLUE PLANET U123 [03]",
      ["蓝色行星 U123", "THE BLUE PLANET U123"],
    ],
    [
      "[Release Subs] 蓝色行星 Blue Planet - A New World [03]",
      ["蓝色行星 Blue Planet - A New World"],
    ],
    [
      "[Release Subs] 蓝色行星.日语.英文字幕.Blue Planet [BD]",
      ["蓝色行星", "Blue Planet"],
    ],
    ["OVA 蓝色行星.1998.DVD720P.日语中字", ["蓝色行星"]],
    ["[1080p][HEVC][AAC]", []],
    ["[蓝色行星][Blue Planet][Movie][1080p]", ["蓝色行星", "Blue Planet"]],
  ] as Array<[string, string[]]>)("%s", (input, expected) => {
    expect(aliases(input)).toEqual(expected);
  });

  describe("发布包装与名称本体的边界", () => {
    test.each([
      [
        "独立中文季数块绑定前名",
        "[Release Subs][蓝色行星][第二季][12][1080p]",
        ["蓝色行星[第二季]"],
      ],
      [
        "独立英文季数块保留括号",
        "[Release Subs][Blue Planet][S02][12][1080p]",
        ["Blue Planet[S02]"],
      ],
      [
        "无包装季数前的空格保留",
        "[Release Subs] Blue Planet S01 - 03 [1080p]",
        ["Blue Planet S01"],
      ],
      [
        "短中文名与英文别名使用横杠分隔",
        "[Release Subs] 蓝星 - Blue Planet - 03 [1080p]",
        ["蓝星", "Blue Planet"],
      ],
      [
        "四字母品牌与中文副标题保持整体",
        "[Release Subs] BLUE - 蓝色行星 - 03 [1080p]",
        ["BLUE - 蓝色行星"],
      ],
      [
        "名称中的内嵌篇章括号保留",
        "[Release Subs] 蓝色行星【世纪篇】 / Blue Planet - 03 [1080p]",
        ["蓝色行星【世纪篇】", "Blue Planet"],
      ],
      [
        "普通括号副标题不误当季数删除",
        "[Release Subs] 星际旅程（未来的日期） - 03 [1080p]",
        ["星际旅程（未来的日期）"],
      ],
      [
        "新番标签后的标题包装删除",
        "[Release Subs]★07月新番★[蓝色行星 第二季][03][1080p]",
        ["蓝色行星 第二季"],
      ],
      [
        "同语种下划线与副标题长音符保留",
        "[Release Subs] 蓝色行星_ー世纪篇ー[03][1080p]",
        ["蓝色行星_ー世纪篇ー"],
      ],
      [
        "检索中的明确系列短昵称过滤",
        "[Release Subs][蓝色行星 / Blue Planet][03][1080p](检索:Q娃/precure)",
        ["蓝色行星", "Blue Planet"],
      ],
      [
        "正文中的短作品名不按检索昵称过滤",
        "[Release Subs] c团地 / Housing Complex C - 03 [1080p]",
        ["c团地", "Housing Complex C"],
      ],
      [
        "检索中的单字英文名和短中文名保留",
        "[Release Subs] Blue Planet - 03 [1080p](检索:K/青箱)",
        ["Blue Planet", "K", "青箱"],
      ],
      [
        "外层书名号包装在拆分别名前删除",
        "[Release Subs]《蓝色行星 / Blue Planet》[03][1080p]",
        ["蓝色行星", "Blue Planet"],
      ],
      [
        "作品内部的书名号保留",
        "[Release Subs] 蓝色行星《名词》 / Blue Planet - 03 [1080p]",
        ["蓝色行星《名词》", "Blue Planet"],
      ],
      ["井号发布包装删除", "#蓝色行星# 第03集 [1080p]", ["蓝色行星"]],
      [
        "前置剧场版标签后的两个标题块均保留",
        "[剧场版][蓝色行星][蓝色行星 Blue Planet][1080p]",
        ["蓝色行星", "蓝色行星 Blue Planet"],
      ],
    ] as Array<[string, string, string[]]>)("%s", (_name, input, expected) => {
      expect(aliases(input)).toEqual(expected);
    });
  });

  test("电影名称不要求存在剧集编号", () => {
    const input =
      "[Release Subs] 蓝色行星 / Blue Planet [Movie][BDRip][简繁内封]";
    expect(parseTorrentTitle(input)).toBeUndefined();
    expect(aliases(input)).toEqual(["蓝色行星", "Blue Planet"]);
  });

  test("技术块和括号跟在副标题后面不会抛出异常", () => {
    expect(() =>
      aliases(
        "Blue Planet (New World) DVDRip MULTi (VF + VOSTFR) + Bonus 蓝色星球"
      )
    ).not.toThrow();
  });

  test("更新默认解析器别名而不改变编号和字幕", () => {
    const result = parseTorrentTitle(
      "[Release Subs][国漫][蓝色行星][Blue Planet][2025][03][1080p][简繁内封]"
    );
    expect(result?.title.aliases).toEqual(["蓝色行星", "Blue Planet"]);
    expect(result?.episodeInfo).toEqual({ type: "episode", index: 3 });
    expect(result?.subtitleInfo).toEqual({
      languages: ["zh-Hans", "zh-Hant"],
      multi: true,
      delivery: ["muxed"],
    });
  });

  test.each(["SP01", "OVA02", "OAD03"])(
    "特别篇 %s 使用已有位置划分名称",
    (marker) => {
      const input = `[Release Subs] Blue Planet ${marker} [1080p][简体]`;
      expect(parseTorrentTitle(input)?.title.aliases).toEqual(["Blue Planet"]);
      expect(aliases(input)).toEqual(["Blue Planet"]);
    }
  );
});

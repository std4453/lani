import { parseTorrentNames } from "@/parseTorrentNames";

describe("作品名称上层结构的通用边界", () => {
  test.each<[string, string, string[]]>([
    [
      "标题后的 BBcode 说明不作为名称",
      "[Release Subs] 蓝色行星 / Blue Planet - 03 [1080p][img]https://example.test/poster.jpg[/img][b][size=3]这是一段发布说明[/size][/b]",
      ["蓝色行星", "Blue Planet"],
    ],
    [
      "前置角括号字幕组完整去除",
      "「某某字幕组」Blue Planet（蓝色行星）[03][1080p]",
      ["Blue Planet", "蓝色行星"],
    ],
    [
      "内联数学公式保留括号及内部空格",
      "[Release Subs] 蓝色行星[x=1-sinθ ] - 03 [1080p]",
      ["蓝色行星[x=1-sinθ ]"],
    ],
    [
      "无组名时首个英文名称块保留",
      "[The Blue Planet][蓝色行星][HEVC][MKV]",
      ["The Blue Planet", "蓝色行星"],
    ],
    [
      "带集号的发布结构不保留前置英文组名",
      "[Example Media Lab][蓝色行星][03][1080p]",
      ["蓝色行星"],
    ],
    [
      "地区限定删除后两侧名称重新连接",
      "[Release Subs] BLUE PLANET（仅限港澳台地区） 蓝色行星 [01-12][1080p]",
      ["BLUE PLANET 蓝色行星"],
    ],
    [
      "尾部中文别名再次出现的集号删除",
      "[Release Subs] Blue Planet - 03 [1080p] 蓝色行星 01 ts档",
      ["Blue Planet", "蓝色行星"],
    ],
    [
      "中文名称后的局部与累计编号一起删除",
      "[Release Subs] 蓝色行星 05(49) / Blue Planet - 49 [1080p]",
      ["蓝色行星", "Blue Planet"],
    ],
    [
      "累计集号前的英文季数保留",
      "[Release Subs] 蓝色行星 / Blue Planet Season 2 - 11(23) [1080p]",
      ["蓝色行星", "Blue Planet Season 2"],
    ],
    [
      "独立集号和单集标题块不作为别名",
      "[Release Subs][蓝色行星][Blue Planet][05 中文单集名][1080p]",
      ["蓝色行星", "Blue Planet"],
    ],
    [
      "同块中文片名之后的集号与单集标题删除",
      "[Release Subs][蓝色行星 1028 中文单集名][1080p]",
      ["蓝色行星"],
    ],
    [
      "电影序号之后的中文副题保留",
      "[Release Subs][蓝色行星 Blue Planet Movie 27 海洋之谜][BDRip][1080p]",
      ["蓝色行星 Blue Planet Movie 27 海洋之谜"],
    ],
    [
      "残缺括号中的集号残片删除",
      "[Release Subs] 蓝色行星 Blue Planet [02 [1080p] [简日内嵌]",
      ["蓝色行星 Blue Planet"],
    ],
    [
      "标题包装外的中文季数绑定前名",
      "[Release Subs][蓝色行星] 第三季 /Blue Planet [03][1080p]",
      ["蓝色行星 第三季", "Blue Planet"],
    ],
    [
      "中文集号后继续读取英文别名与括号年份",
      "《蓝色行星》第六季 第十集 Blue Planet Season 6 (2022) 英语外加各种小语种",
      ["蓝色行星第六季", "Blue Planet Season 6 (2022)"],
    ],
    [
      "技术块后的工作室署名不作为名称",
      "[Release Subs][蓝色行星][03][1080p][某某工作室]",
      ["蓝色行星"],
    ],
  ])("%s", (_name, input, expected) => {
    expect(parseTorrentNames(input).title.aliases).toEqual(expected);
  });
});

describe("尾部附带媒体与独立标题块", () => {
  test.each<[string, string, string[]]>([
    [
      "尾部别名括号中只剥除字幕元信息",
      "[Release Subs] 蓝色行星 S01E01 [1080p] (Blue Planet, Multi-Subs)",
      ["蓝色行星", "Blue Planet"],
    ],
    [
      "附带歌集提取引用作品名而不带入发布说明",
      "[Release Subs][蓝色行星][03][1080p]附『ブループラネット』剧中歌集10首Hi-Res",
      ["蓝色行星", "ブループラネット"],
    ],
    [
      "无发布组的长中文首标题不被吞掉",
      "[蓝色行星与遥远星际之间的冒险故事][Blue Planet][ブループラネット][05][1080p]",
      ["蓝色行星与遥远星际之间的冒险故事", "Blue Planet", "ブループラネット"],
    ],
    [
      "中间画质修复说明不阻断后续英文名称和季数",
      "蓝色行星.4K.AI画质修复版.Blue Planet.S2 [4K AI Upscale]",
      ["蓝色行星", "Blue Planet.S2"],
    ],
    [
      "未知集号块不删除电影名称中的零",
      "[Group]剧场版_蓝色行星_0[-1][1080p]",
      ["剧场版_蓝色行星_0"],
    ],
  ])("%s", (_name, input, expected) => {
    expect(parseTorrentNames(input).title.aliases).toEqual(expected);
  });
});

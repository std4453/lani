import { parseTorrentNames } from "@/parseTorrentNames";
import parseTorrentTitle from "@/parseTorrentTitle";

describe("发行标签、声轨字幕与多季收录范围", () => {
  test.each([
    "内封英俄文字幕",
    "内挂德法文字幕",
    "OADs Fin",
    "MOVIEx2 fin",
    "4K AI Upscale",
    "AI Remastered",
    "CH个人作品",
    "重发",
    "代发",
    "下周番外，敬请期待",
    "AT-X",
    "HDTC",
    "WEBeip",
    "TVRip先行",
    "Rev",
    "代理商再版粤语",
    "台配 国粤日多音轨+简繁英字幕",
    "台配 國粵日多音軌+簡繁英字幕",
    "含短篇",
    "含短片",
    "阿拉伯语",
    "ArabicDub",
    "Arabic Audio",
    "Raw",
    "STTV",
    "囯日双语",
    "公映前特典 第二弹",
    "放送后特典 第三弹",
    "热爱星空的人们的座谈会",
    "座談會",
  ])("完整发行块不成为作品别名：%s", (tag) => {
    const input = `[Release Subs] Blue Planet - 03 [${tag}] [1080p]`;
    expect(parseTorrentNames(input).title.aliases).toEqual(["Blue Planet"]);
    expect(parseTorrentTitle(input)?.title.aliases).toEqual(["Blue Planet"]);
  });

  test("发行标签在发布组前面也不会抢占其位置", () => {
    const result = parseTorrentNames(
      "[重发][AT-X][Release Subs] 蓝色行星 / Blue Planet - 03 [1080p]"
    );
    expect(result.organization?.raw).toEqual("Release Subs");
    expect(result.title.aliases).toEqual(["蓝色行星", "Blue Planet"]);
  });

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

  test.each([
    "蓝色行星10周年纪念 Blue Planet -FULLDIVE-",
    "Blue Planet 2020 LIVE",
    "Blue Planet 3000",
    "Blue Planet 4K Adventure",
    "Blue Planet S02",
    "Blue Planet S1",
    "Blue Planet OAD Adventure",
    "蓝色行星2季全新冒险",
    "Blue Planet Arabic Dreams",
    "Blue Planet Raw Adventure",
    "Blue Planet: Rev of the Ocean",
    "蓝色行星 座谈会之谜",
    "蓝色行星 公映前特典之谜",
    "蓝色行星重发之旅",
  ])("保留正文中的数字、限定和元信息同形词：%s", (title) => {
    expect(
      parseTorrentNames(`[Release Subs] ${title} - 03 [1080p]`).title.aliases
    ).toEqual([title]);
  });
});

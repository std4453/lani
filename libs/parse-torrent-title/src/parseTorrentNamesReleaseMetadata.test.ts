import { parseTorrentNames } from "@/parseTorrentNames";
import parseTorrentTitle from "@/parseTorrentTitle";

describe("发行说明与载体规格", () => {
  test.each([
    "星空文化发行",
    "星空影业出品",
    "云盘补帧",
    "R-ESRGAN 温柔2160P",
    "20周年4K数字重制版",
    "AI画质修复版",
    "JPBD Vol.1-7 Re-encode",
    "13DISC",
    "DVD5",
    "VCDRAR",
    "MPG2-MP2",
    "MPG2-PCM",
    "THD+PCM",
    "Main12",
    "Disney+",
    "TVHD",
    "Mandarin Chinese Dub",
    "JPN Dub",
    "Thai version",
    "中配版",
    "泰配版",
    "普通话版",
    "官方简繁内封字幕",
    "内挂英文VobSub字幕",
    "上卷",
    "BD-RIP 下卷",
    "冒头映像",
    "Trial Version",
    "特典动画",
    "第七集",
    "4月",
    "Part.3",
    "第3クール",
    "Vol.1-4 Fin,DEU",
    "全支线+特典",
  ])("忽略完整元信息块 %s", (tag) => {
    const input = `[Release Subs] Blue Planet - 03 [${tag}] [1080p]`;
    expect(parseTorrentNames(input).title.aliases).toEqual(["Blue Planet"]);
    expect(parseTorrentTitle(input)?.title.aliases).toEqual(["Blue Planet"]);
  });

  test("发行方和处理标签不抢占发布组位置", () => {
    expect(
      parseTorrentNames(
        "[云盘补帧][Release Subs][星空文化发行][Blue Planet][03][1080p]"
      ).title.aliases
    ).toEqual(["Blue Planet"]);
  });

  test.each([
    ["Blue Planet OVA BDRip_1920x1080_CHS", "Blue Planet"],
    ["Blue Planet_OVA", "Blue Planet"],
    ["蓝色行星 日配版", "蓝色行星"],
    ["蓝色行星 普通话版", "蓝色行星"],
    ["Blue Planet TV 剪辑版", "Blue Planet"],
    ["Blue Planet S01 > S06 BDRIP 1080p", "Blue Planet"],
    ["Blue Planet - 01Remake", "Blue Planet"],
    ["Blue Planet WEB-720p x264 AAC", "Blue Planet"],
    ["蓝色行星全集无水印高清迅雷下载", "蓝色行星"],
  ])("清理明确尾部说明 %s", (input, expected) => {
    expect(parseTorrentNames(`[Release Subs] ${input}`).title.aliases).toEqual([
      expected,
    ]);
  });

  test.each([
    "蓝色行星10周年纪念 Blue Planet -FULLDIVE-",
    "Blue Planet 2020 LIVE",
    "Blue Planet (2020)",
    "Blue Planet 3000",
    "Blue Planet S02",
    "蓝色行星全集冒险",
    "蓝色行星 日配版之谜",
    "Blue Planet: Trial Version Adventure",
    "蓝色行星的文化发行之旅",
    "Blue Planet Main12 Adventure",
  ])("保留正文中的纪念、年份、数字和同形词 %s", (title) => {
    expect(
      parseTorrentNames(`[Release Subs] ${title} - 03 [1080p]`).title.aliases
    ).toEqual([title]);
  });
});

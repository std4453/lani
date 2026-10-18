import { parseTorrentNames } from "@/parseTorrentNames";
import parseTorrentTitle from "@/parseTorrentTitle";

describe("作品名称中的发行元数据", () => {
  test.each([
    "Crunchyroll",
    "Bili-HMT",
    "BDBOX",
    "24DVDISO",
    "SDR",
    "REPACK2",
    "Recode",
    "Premium",
    "MX-TVRip",
    "Japanese+English",
    "ENSUB+PLSUB",
    "LAT-FRE-JAP+Subs",
    "正片+特别动画",
    "TV Rev + OVA Rev + MOVIE Fin",
    "第1+2季度合集",
    "TIME.1",
    "中日双字",
    "H265编码",
    "新字幕",
    "内附发布说明",
    "纯净版",
    "典藏版",
    "小剧场",
    "ALL",
    "下周完结",
    "双版本臻享级画质",
    "发行六周年！",
    "Deepseek中文",
    "シーズン1 エピソード1 - 次の朝。",
  ])("忽略独立标签 %s", (tag) => {
    const input = `[Release Subs] Blue Planet - 03 [${tag}] [1080p]`;
    expect(parseTorrentNames(input).title.aliases).toEqual(["Blue Planet"]);
    expect(parseTorrentTitle(input)?.title.aliases).toEqual(["Blue Planet"]);
  });

  test.each([
    [
      "[Release Subs] 蓝色行星（放送版） / Blue Planet (On-air version) - 03 [1080p]",
      ["蓝色行星", "Blue Planet"],
    ],
    [
      "[Release Subs] 蓝色行星（全解放版） / Blue Planet - 03 [1080p]",
      ["蓝色行星", "Blue Planet"],
    ],
    ["[Release Subs] 蓝色行星 日语版：第3话 [1080p]", ["蓝色行星"]],
    ["[Release Subs] 蓝色行星 繁中 BDRip FLAC HEVC", ["蓝色行星"]],
    ["[Release Subs] 蓝色行星 整合版", ["蓝色行星"]],
    ["[Release Subs] 蓝色行星2024年度[1080p]", ["蓝色行星"]],
    [
      "[Release Subs] Blue Planet German ver S03 1080p WEB-DL",
      ["Blue Planet S03"],
    ],
    [
      "蓝色行星.Blue.Planet.TV.1991–1992.丹麦语&芬兰语&挪威语&瑞典语.7DVD-ISO",
      ["蓝色行星", "Blue.Planet"],
    ],
    [
      "蓝色行星.Blue.Planet.1992.OVA.新的星球.简繁英意德字幕.DVDRip.1080p",
      ["蓝色行星", "Blue.Planet", "新的星球"],
    ],
  ])("清理名称尾部元数据：%s", (input, expected) => {
    expect(parseTorrentNames(input).title.aliases).toEqual(expected);
  });

  test.each([
    "Blue Planet Premium Adventure",
    "Blue Planet: Japanese Dreams",
    "蓝色行星的典藏版故事",
    "Blue.Planet.German.Story",
    "Blue Planet Volume 6",
  ])("保留与元数据语汇重合的完整名称：%s", (title) => {
    expect(
      parseTorrentNames(`[Release Subs] ${title} - 03 [1080p]`).title.aliases
    ).toEqual([title]);
  });
});

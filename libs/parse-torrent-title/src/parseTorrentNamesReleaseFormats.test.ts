import { parseTorrentNames } from "@/parseTorrentNames";
import parseTorrentTitle from "@/parseTorrentTitle";

describe("发行元信息家族的名称边界", () => {
  test.each([
    "CAM-RIP",
    "BDRemux",
    "HIDIVE",
    "Sentai",
    "CATCHPLAY",
    "宣传动画",
    "アニメ",
    "广播剧",
    "直播",
    "LIVE",
    "间日双语",
    "Human Audio",
    "汉语普通话",
    "TVB外判粤语",
    "TVB+发行商粤语",
    "CHT&CHS&EN&FR&DE&PL",
    "24xAAC 3xSRT",
    "HEVC10bit",
    "88EC1C2B",
    "B3205C33",
    "IPFS服务器种",
    "院线版+完全版",
    "未删减",
    "自嗨版",
    "加流重灌",
    "Modded Blu-rays",
    "加流重灌 (Modded Blu-rays)",
    "新年快乐",
    "全歌曲特效",
    "Vol.1",
    "Vol.1_3",
    "3收藏版",
    "TV+Movie+Live+感谢祭 Fin",
    "S1-S2",
    "1～3季",
    "Part2完 2023-Part3完结篇",
    "第二季度完",
    "合集(含序章)",
    "+特别篇",
    "+小说+漫画+音乐；",
    "发行五周年礼包 其一",
    "聊一下下季",
    "size=3",
    "size",
    "color=red",
    "part1",
  ])("排除独立元信息块 %s", (tag) => {
    const input = `[Release Subs] Blue Planet - 03 [${tag}] [1080p]`;
    expect(parseTorrentNames(input).title.aliases).toEqual(["Blue Planet"]);
    expect(parseTorrentTitle(input)?.title.aliases).toEqual(["Blue Planet"]);
  });
  test.each([
    ["Blue Planet TV+Movie+Live+感谢祭 Fin", "Blue Planet"],
    ["Blue Planet S1-S2", "Blue Planet"],
    ["蓝色行星 1～3季", "蓝色行星"],
    ["Blue Planet: HD Remastered Edition", "Blue Planet"],
    ["蓝色行星 高清重制版", "蓝色行星"],
    ["蓝色行星 HDリセット版", "蓝色行星"],
    ["Blue Planet 01 ts档", "Blue Planet"],
    ["Blue Planet Vol.1", "Blue Planet"],
  ])("剔除明确的尾部发行说明 %s", (title, expected) => {
    expect(
      parseTorrentNames(`[Release Subs] ${title} [1080p]`).title.aliases
    ).toEqual([expected]);
  });
  test.each([
    "Blue Planet 2020 LIVE",
    "Blue Planet (2020)",
    "Blue Planet 2020",
    "Blue Planet S02",
    "Blue Planet Volume 1",
    "Blue Planet: Live Dreams",
    "Blue Planet Uncut Adventure",
    "蓝色行星广播剧之谜",
    "蓝色行星周年的故事",
    "Blue Planet TV+Movie Adventure",
    "Blue Planet A3205C3Z",
  ])("保留标题正文及版本年份 %s", (title) => {
    expect(
      parseTorrentNames(`[Release Subs] ${title} - 03 [1080p]`).title.aliases
    ).toEqual([title]);
  });
  test("BBCode说明不产生额外别名", () => {
    const input =
      "[Release Subs] Blue Planet - 03 [1080p][img]https://example.test/a.jpg[/img][b][size=3]发行说明[/size][/b]";
    expect(parseTorrentNames(input).title.aliases).toEqual(["Blue Planet"]);
  });
  test("节日问候不抢占发布组位置", () => {
    expect(
      parseTorrentNames("[新年快乐][Release Subs][Blue Planet][03][1080p]")
        .title.aliases
    ).toEqual(["Blue Planet"]);
  });
  test("周年纪念后有作品正文时保留完整名称", () => {
    const input =
      "[Release Subs] 蓝色行星10周年纪念 Blue Planet -FULLDIVE- / Blue Planet -FULLDIVE- [1080p]";
    expect(parseTorrentNames(input).title.aliases).toEqual([
      "蓝色行星10周年纪念 Blue Planet -FULLDIVE-",
      "Blue Planet -FULLDIVE-",
    ]);
  });
  test("标题括注不因另一侧是元信息而整段删除", () => {
    expect(
      parseTorrentNames(
        "[Release Subs] Blue Planet (Modded Blu-rays) - 03 [1080p]"
      ).title.aliases
    ).toEqual(["Blue Planet"]);
  });
});

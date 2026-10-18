import { parseTorrentNames } from "@/parseTorrentNames";
import parseTorrentTitle from "@/parseTorrentTitle";

describe("组合收录标签与发行参数", () => {
  test.each([
    "全三集",
    "全十二话",
    "共四部",
    "TV+4SP",
    "TV+2OVA+3SP",
    "09+sp09",
    "11+SP11",
    "S1+S2+Movie",
    "TV+剧场版合集",
    "BT下载",
    "磁力下载",
    "HDR版本",
    "HDR10+版",
    "SDR版本",
    "精校版",
    "校对版",
    "补发",
    "補發",
    "恭贺春节",
    "恭賀新年！",
    "TV.U2",
    "TV.V3",
    "TV480P",
    "TVB儿童台",
    "原始配音",
    "原版音轨",
    "按年份合集",
    "依季度整理合集",
    "Pre-Air",
    "Pre Air",
    "简繁日内封PGS",
    "简繁日内封PGSx2",
    "繁日外挂ASS",
    "Animatica",
    "ParkTV",
    "ZeroTV",
    "Vol.7 END",
    "OST 原声音乐",
  ])("完整元信息块不成为别名：%s", (tag) => {
    const input = `[Release Subs] 蓝色行星 / Blue Planet - 03 [${tag}] [1080p]`;
    expect(parseTorrentNames(input).title.aliases).toEqual([
      "蓝色行星",
      "Blue Planet",
    ]);
    expect(parseTorrentTitle(input)?.title.aliases).toEqual([
      "蓝色行星",
      "Blue Planet",
    ]);
  });

  test.each([
    ["Blue Planet S1+S2+Movie", ["Blue Planet"]],
    ["Blue Planet TV+剧场版合集", ["Blue Planet"]],
    ["Blue Planet 剧场版合集", ["Blue Planet 剧场版"]],
    ["蓝色行星合集", ["蓝色行星"]],
    ["Blue Planet - 合集", ["Blue Planet"]],
    ["Blue Planet - Ocean - 合集", ["Blue Planet - Ocean"]],
    ["Blue Planet - Vol.7 END", ["Blue Planet"]],
    ["Blue Planet - Vol.8 FIN", ["Blue Planet"]],
    ["Blue Planet - EX", ["Blue Planet"]],
    [
      "蓝色行星.Blue Planet S02 FRENCH 1080p WEB-DL",
      ["蓝色行星", "Blue Planet S02"],
    ],
    ["Blue Planet FRENCH S03 1080p", ["Blue Planet S03"]],
    ["蓝色行星KJ File 01 GB 1090P 内挂字幕", ["蓝色行星KJ File"]],
    ["蓝色行星 086 1090P 内挂字幕", ["蓝色行星"]],
    ["蓝色行星 86 GB 1090P 内挂字幕", ["蓝色行星 86"]],
    [
      "Animatica「蓝色行星」 / Blue Planet Part 2 - 03 [1080p]",
      ["Animatica「蓝色行星」", "Blue Planet Part 2"],
    ],
  ])("可靠尾标签与完整标题前缀：%s", (title, expected) => {
    expect(parseTorrentNames(`[Release Subs] ${title}`).title.aliases).toEqual(
      expected
    );
  });

  test("元信息在发布组前也不抢占其位置", () => {
    const result = parseTorrentNames(
      "[BT下载][ZeroTV][Release Subs][蓝色行星][03][1080p]"
    );
    expect(result.organization?.parts).toEqual(["ZeroTV", "Release Subs"]);
    expect(result.organization?.raw).toEqual("ZeroTV & Release Subs");
    expect(result.title.aliases).toEqual(["蓝色行星"]);
  });

  test.each([
    "Blue Planet French Connection",
    "Blue Planet Animatica",
    "Blue Planet 2023",
    "蓝色行星10周年纪念 Blue Planet -FULLDIVE-",
    "蓝色行星合集之谜",
    "Blue Planet Movie",
    "蓝色行星 剧场版",
    "蓝色行星 特别篇",
    "Blue Planet S02",
    "Blue Planet Volume 7",
    "Blue Planet EX Adventure",
    "Blue Planet TV + Dreams",
    "Blue Planet 1090P Adventure",
    "Blue Planet 4K Adventure",
    "蓝色行星的原始配音之旅",
    "蓝色行星恭贺春节的故事",
    "Blue Planet HDR Adventure",
    "Blue Planet - Ocean",
  ])("元信息同形词与数字仍保留在正文：%s", (title) => {
    expect(
      parseTorrentNames(`[Release Subs] ${title} - 03 [1080p]`).title.aliases
    ).toEqual([title]);
  });

  test("完整非标题块不会在去除合集后残留半个标签", () => {
    expect(
      parseTorrentNames("[个人制作合集][Release Subs] Blue Planet [03][1080p]")
        .title.aliases
    ).toEqual(["Blue Planet"]);
  });

  test("双语合集的分隔横杠不残留到英文名", () => {
    const input =
      "[Release Subs] 蓝色行星 / Blue Planet - 合集 [1080P][CHT&CHS&EN&FR&DE&PL][MKV]";
    expect(parseTorrentNames(input).title.aliases).toEqual([
      "蓝色行星",
      "Blue Planet",
    ]);
  });
});

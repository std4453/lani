import { parseTorrentNames } from "@/parseTorrentNames";

const aliases = (input: string) => parseTorrentNames(input).title.aliases;

describe("第九轮明确别名分隔与标题限定", () => {
  test.each([
    [
      "[字幕组] 星猫1/3「ほしねこ1/3」Hoshineko1/3 2025年版 第二季 S02E01 [1080p]",
      ["星猫1/3", "ほしねこ1/3", "Hoshineko1/3 2025年版 第二季"],
    ],
    [
      "[字幕组] 星猫「ほしねこ」STAR CAT 2026年版 S01E02 [1080p]",
      ["星猫", "ほしねこ", "STAR CAT 2026年版"],
    ],
    ["[字幕组] 蓝色行星 ｜ 苍蓝星球 [02][1080p]", ["蓝色行星", "苍蓝星球"]],
    ["[字幕组] Blue｜Planet [02][1080p]", ["Blue", "Planet"]],
    [
      "[字幕组] 蓝色行星 & BLUE×PLANET [02][1080p]",
      ["蓝色行星", "BLUE×PLANET"],
    ],
    [
      "[字幕组] BLUE×PLANET & 蓝色行星 [02][1080p]",
      ["BLUE×PLANET", "蓝色行星"],
    ],
    ["[字幕组] Blue & Planet [02][1080p]", ["Blue & Planet"]],
    ["[字幕组] 银河 外传 & 第怪季 [02][1080p]", ["银河 外传 & 第怪季"]],
    [
      "[字幕组] Blue Planet: Off & Monster Season [02][1080p]",
      ["Blue Planet: Off & Monster Season"],
    ],
    ["[字幕组] 星猫_NEW_～♡ [02][1080p]", ["星猫_NEW_～♡"]],
    ["[字幕组] 星猫_New Sky [02][1080p]", ["星猫", "New Sky"]],
    ["[字幕组] Blue Planet (Season 3) [02][1080p]", ["Blue Planet (Season 3)"]],
    ["[字幕组] 蓝色行星（第三季） [02][1080p]", ["蓝色行星（第三季）"]],
    [
      "[字幕组] Blue Planet (3rd Season) [02][1080p]",
      ["Blue Planet (3rd Season)"],
    ],
    ["[字幕组] 蓝色行星 - S1 [02][1080p]", ["蓝色行星 - S1"]],
    ["[字幕组] 蓝色行星 - Season 3 [02][1080p]", ["蓝色行星 - Season 3"]],
    [
      "[字幕组] 蓝色行星 (Blue Planet) [02][1080p]",
      ["蓝色行星", "Blue Planet"],
    ],
    ["[字幕组] Blue Planet - 特别编 [1080p]", ["Blue Planet - 特别编"]],
    ["[字幕组] Blue Planet - 特别篇 [1080p]", ["Blue Planet - 特别篇"]],
    [
      "[字幕组] Blue Planet - 蓝色行星 [02][1080p]",
      ["Blue Planet", "蓝色行星"],
    ],
    [
      "[字幕组] 苍蓝星球「青い惑星」/ Blue Planet [02][1080p]",
      ["苍蓝星球", "青い惑星", "Blue Planet"],
    ],
    ["[字幕组] 公主「青い惑星」的冒险 [02][1080p]", ["公主「青い惑星」的冒险"]],
    ["[字幕组] 公主「拷问」的时间 [02][1080p]", ["公主「拷问」的时间"]],
    [
      "[字幕组] Blue Planet [02][1080p]（搜索用：苍蓝星球）",
      ["Blue Planet", "苍蓝星球"],
    ],
    ["[字幕组] 搜索星空的旅人 [02][1080p]", ["搜索星空的旅人"]],
  ])("%s", (input, expected) => {
    expect(aliases(input as string)).toEqual(expected);
  });
});

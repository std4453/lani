import { parseTorrentNames } from "@/parseTorrentNames";

const aliases = (input: string) => parseTorrentNames(input).title.aliases;

describe("别名分隔与作品标点", () => {
  test.each<[string, string[]]>([
    [
      "[字幕组][【支持的【星星】的孩子】_追星的孩子_Star Child][01][1080p]",
      ["【支持的【星星】的孩子】_追星的孩子", "Star Child"],
    ],
    ["[字幕组] 星际旅人_A [02][1080p]", ["星际旅人_A"]],
    ["[字幕组] 蓝色_行星 [02][1080p]", ["蓝色_行星"]],
    ["[字幕组] Blue_Planet [02][1080p]", ["Blue_Planet"]],
    ["[字幕组] 剧场版_蓝色行星_0 [02][1080p]", ["剧场版_蓝色行星_0"]],
    [
      "[字幕组] 银河卫士 UNIT_3072 第二季 Galaxy Guard UNIT_3072 S2 [05][1080p]",
      ["银河卫士 UNIT_3072 第二季 Galaxy Guard UNIT_3072 S2"],
    ],
    [
      "[字幕组] 银河卫士_3000 Leagues in Space [05][1080p]",
      ["银河卫士", "3000 Leagues in Space"],
    ],
    ["[字幕组] UNIT_3072 [05][1080p]", ["UNIT_3072"]],
    ["[字幕组] 蓝色行星_Blue Planet [02][1080p]", ["蓝色行星", "Blue Planet"]],
    [
      "[字幕组] 星际旅人_The_Final_Season [02][1080p]",
      ["星际旅人_The_Final_Season"],
    ],
    [
      "[字幕组] 星际旅人_Final Journey [02][1080p]",
      ["星际旅人", "Final Journey"],
    ],
    ["[字幕组] 晚安，Blue Planet [02][1080p]", ["晚安，Blue Planet"]],
    ["[字幕组] Helios -  太阳勇者 - 13 [1080p]", ["Helios", "太阳勇者"]],
    ["[字幕组] BLUE - 晴空之歌 - 13 [1080p]", ["BLUE - 晴空之歌"]],
    [
      "[字幕组] 蓝色行星 - Another Sky / Blue Planet - Another Sky [02][1080p]",
      ["蓝色行星 - Another Sky", "Blue Planet - Another Sky"],
    ],
    [
      "[字幕组] 蓝色行星 - Blue Planet [02][1080p]",
      ["蓝色行星", "Blue Planet"],
    ],
    ["[字幕组] 蓝色行星. Blue Planet [02][1080p]", ["蓝色行星", "Blue Planet"]],
    ["[字幕组] Dr. Planet [02][1080p]", ["Dr. Planet"]],
    ["[字幕组] 最强鉴定士(暂定) [02][1080p]", ["最强鉴定士(暂定)"]],
    ["[字幕组] Kanteishi (Kari) [02][1080p]", ["Kanteishi (Kari)"]],
    [
      "[字幕组] 最强的鉴定士(暂定)的日常 [02][1080p]",
      ["最强的鉴定士(暂定)的日常"],
    ],
    ["[字幕组] Blue (Kari) Planet [02][1080p]", ["Blue (Kari) Planet"]],
    [
      "[字幕组] 蓝色行星 (Blue Planet) [02][1080p]",
      ["蓝色行星", "Blue Planet"],
    ],
    ["[字幕组] 「星际旅人」 [02][1080p]", ["星际旅人"]],
    ["[字幕组] 『星际旅人』 [02][1080p]", ["星际旅人"]],
    ["[字幕组] 公主「拷问」的时间 [02][1080p]", ["公主「拷问」的时间"]],
    ["[字幕组] 星际旅人☆ [02][1080p]", ["星际旅人☆"]],
    ["[字幕组] 《蓝色行星》 第六季 [02][1080p]", ["蓝色行星 第六季"]],
    ["[字幕组] 蓝色《行星》 第六季 [02][1080p]", ["蓝色《行星》 第六季"]],
    [
      "[字幕组][「星际旅人」/『Star Traveler』][02][1080p]",
      ["星际旅人", "Star Traveler"],
    ],
    [
      "[字幕组] 蓝色行星 – Another Sky / Blue Planet – Another Sky [02][1080p]",
      ["蓝色行星 – Another Sky", "Blue Planet – Another Sky"],
    ],
  ])("%s", (input, expected) => {
    expect(aliases(input)).toEqual(expected);
  });
});

describe("不同语言名称的共享副题", () => {
  test.each<[string, string[]]>([
    [
      "[Release Subs] 蓝色行星 - DAWN FALL / Blue Planet - Dawn Fall [03][1080p]",
      ["蓝色行星 - DAWN FALL", "Blue Planet - Dawn Fall"],
    ],
    [
      "[Release Subs] Blue Planet - 蓝色行星 - Third World - 03 [1080p]",
      ["Blue Planet", "蓝色行星 - Third World"],
    ],
  ])("%s", (input, expected) => {
    expect(aliases(input)).toEqual(expected);
  });
});

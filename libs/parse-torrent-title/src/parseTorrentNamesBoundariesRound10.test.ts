import { parseTorrentNames } from "@/parseTorrentNames";
const aliases = (input: string) => parseTorrentNames(input).title.aliases;

describe("第十轮括注列表与跨语种边界", () => {
  test.each([
    [
      "[字幕组] Star Child_星之子(星空的孩子,ほしのこ) [02][1080p]",
      ["Star Child", "星之子", "星空的孩子", "ほしのこ"],
    ],
    [
      "[字幕组] 星之子(星空的孩子，ほしのこ) [02][1080p]",
      ["星之子", "星空的孩子", "ほしのこ"],
    ],
    ["[字幕组] 星空，与你同行 [02][1080p]", ["星空，与你同行"]],
    ["[字幕组] 星之子(今天，去星空) [02][1080p]", ["星之子(今天，去星空)"]],
    [
      "[字幕组] Blue Planet (Blue, My Planet) [02][1080p]",
      ["Blue Planet (Blue, My Planet)"],
    ],
    [
      "[字幕组] 星球勇者GOAL.Planet.Guardians [02][1080p]",
      ["星球勇者GOAL", "Planet.Guardians"],
    ],
    [
      "[字幕组] 小魔女LaLiLu.Magical Little Witch S02 [02][1080p]",
      ["小魔女LaLiLu", "Magical Little Witch S02"],
    ],
    ["[字幕组] Dr. Planet [02][1080p]", ["Dr. Planet"]],
    ["[字幕组] Blue.Planet.Guardians [02][1080p]", ["Blue.Planet.Guardians"]],
    [
      "[字幕组] 星球勇者「星球勇者 THE PLANET GUARDIAN」 [02][1080p]",
      ["星球勇者", "星球勇者 THE PLANET GUARDIAN"],
    ],
    ["[字幕组] 星球勇者「心中的星球」 [02][1080p]", ["星球勇者「心中的星球」"]],
    [
      "[字幕组] 星球勇者「星球勇者」的冒险 [02][1080p]",
      ["星球勇者「星球勇者」的冒险"],
    ],
    ["[字幕组] 少年足球_U-19_锦标赛 [02][1080p]", ["少年足球_U-19_锦标赛"]],
    ["[字幕组] 少年足球_U-17_世界杯 [02][1080p]", ["少年足球_U-17_世界杯"]],
    [
      "[字幕组] 少年足球_U-19_Galaxy Cup [02][1080p]",
      ["少年足球", "U-19_Galaxy Cup"],
    ],
    ["[字幕组] Blue Planet (TV Special) [1080p]", ["Blue Planet (TV Special)"]],
    [
      "[字幕组] Blue Planet (Blue Special) [1080p]",
      ["Blue Planet", "Blue Special"],
    ],
    [
      "[字幕组] 星球勇者(台) / Planet Guardian [02][1080p]",
      ["星球勇者", "Planet Guardian"],
    ],
    ["[字幕组] 星球勇者(台上的我) [02][1080p]", ["星球勇者(台上的我)"]],
  ])("%s", (input, expected) => {
    expect(aliases(input as string)).toEqual(expected);
  });
});

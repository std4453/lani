import { parseTorrentOrganization } from "./parseTorrentOrganization";

const groups = (input: string) => parseTorrentOrganization(input)?.parts;

describe("制作组识别：联合署名和技术词边界", () => {
  it.each([
    [
      "[奶²&LoliHouse] 剧场版虚构航海 / Fictional Voyage the Movie [1080p]",
      ["奶²", "LoliHouse"],
    ],
    [
      "[Moon²&StarHouse] 电影虚构航海 / Fictional Voyage [1080p]",
      ["Moon²", "StarHouse"],
    ],
    [
      "[AKito搬运][GalaxyRailroad-888] 虚构航海 EP116 [GB-720P]",
      ["AKito", "GalaxyRailroad-888"],
    ],
    ["[Nova搬运&转载][Moon-Team] 虚构航海 [03]", ["Nova", "Moon-Team"]],
    ["[WIKIRIP] 虚构航海 - 03 [1080p]", ["WIKIRIP"]],
    ["虚构航海 [DVD9][ITA][WIKIRIP]", ["WIKIRIP"]],
    ["【恭喜复播】虚构航海[08] 荒原ZERO", ["荒原ZERO"]],
    ["[陌生星舟] OPUS.Stories / 声音里的故事 - 03 [1080p]", ["陌生星舟"]],
    ["[陌生星舟] FLAC.Stories / 声音里的故事 - 03 [1080p]", ["陌生星舟"]],
    ["[推しの子] Opus.Stories / 声音里的故事 - 03 [1080p]", ["推しの子"]],
    ["虚构航海.1080p.WEB-DL.H.264-Moon.7-Team", ["Moon.7-Team"]],
    ["虚构航海.1080p.WEB-DL.H.265-Moon.7-Team", ["Moon.7-Team"]],
    ["[星舟字幕组] 虚构航海 [CHS-Sub][CHT_Sub][ENG-Subs]", ["星舟字幕组"]],
    ["[TV版&轻微版&加强版][陌生星舟][虚构航海][03]", ["陌生星舟"]],
    ["[ViuTV粤语][陌生星舟][虚构航海][03]", ["陌生星舟"]],
  ])("保留全部可识别身份：%s", (input, expected) => {
    expect(groups(input as string)).toEqual(expected);
  });

  it.each([
    "[虚构航海][全26集][国英中字][WEB-MKV][2160P]",
    "[虚构航海][1080p][全集]",
    "【剩三集完结】虚构航海[03][1080p]",
    "[自购]《虚构航海 / Fictional Voyage》[01-52][26DVDISO]",
    "[TV版&轻柔版&超轻柔版] 虚构航海 - EP11",
    "虚构航海 [CHS-Sub][CHT_Sub][ENG-Subs]",
    "虚构航海.1080p.WEB-DL.H.264-NOGRP",
  ])("不把进度、版本、语言和匿名说明当组：%s", (input) => {
    expect(parseTorrentOrganization(input)).toBeUndefined();
  });

  it("相邻搬运署名和源发布组的raw只保留两个发布片段", () => {
    expect(
      parseTorrentOrganization("[AKito搬运][GalaxyRailroad-888] 虚构航海 - 03")
    ).toEqual({
      raw: "AKito搬运 & GalaxyRailroad-888",
      parts: ["AKito", "GalaxyRailroad-888"],
    });
  });
});

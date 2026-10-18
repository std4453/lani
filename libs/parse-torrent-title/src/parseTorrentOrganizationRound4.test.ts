import { parseTorrentOrganization } from "./parseTorrentOrganization";

const groups = (input: string) => parseTorrentOrganization(input)?.parts;

describe("制作组识别：显式字幕来源与发布署名", () => {
  it.each([
    [
      "星舟字幕组★虚构航海★01-13★外挂繁体中文(采用千夏+樱都+自制字幕)",
      ["星舟字幕组", "千夏", "樱都"],
    ],
    [
      "[星舟字幕组] 虚构航海 [03] (采用流云+暮雨+自制字幕)",
      ["星舟字幕组", "流云", "暮雨"],
    ],
    ["虚构航海 [03] (字幕来源：Nova&Orion字幕组)", ["Nova", "Orion字幕组"]],
    [
      "[星舟字幕组][虚构航海][ReinForce] Fictional Voyage [03]",
      ["星舟字幕组", "ReinForce"],
    ],
    ["[转发][RBN&DanteW][虚构航海][03][1080p]", ["RBN", "DanteW"]],
    ["[转发][Moon-Q7&Star-E9][虚构航海][03][1080p]", ["Moon-Q7", "Star-E9"]],
    ["[个人制作合集][ANi] 虚构航海 [03]", ["ANi"]],
    ["[盲僧自购][原碟发行方][虚构航海][03]", ["盲僧"]],
    ["[Nova自购] 虚构航海 [03]", ["Nova"]],
    ["【熔岩动画搬运】虚构航海 [03]", ["熔岩动画"]],
    ["「星舟字幕组」虚构航海 [03]", ["星舟字幕组"]],
    ["虚构航海.03（清笛个人汉化）.mp4.torrent", ["清笛"]],
    ["虚构航海.03（Nova個人漢化）.mp4.torrent", ["Nova"]],
    ["虚构航海.1080p.H.264.MULTi-Unknown.24", ["Unknown.24"]],
    ["虚构航海 1080p H 264 DUAL-Unknown.24 (多国语含中文)", ["Unknown.24"]],
    ["虚构航海.BDMV.1080p.AVC.TW.YoungCloud", ["YoungCloud"]],
    ["虚构航海 (480p DVD x265 HEVC 10bit AAC 2.0 Langbard)", ["Langbard"]],
    ["小鱼儿呼唤爱-虚构航海03-1080P-简体内嵌", ["小鱼儿呼唤爱"]],
    ["[星舟字幕组] 虚构航海 [03] [1080p]", ["星舟字幕组"]],
  ])("完整提取署名：%s", (input, expected) => {
    expect(groups(input as string)).toEqual(expected);
  });

  it.each([
    "[个人制作合集] 虚构航海 [03]",
    "[网盘下载][国漫][虚构航海][03][1080p]",
    "[img]https://example.invalid/image.png[/img]",
    "「虚构航海」[03][1080p]",
    "虚构航海 (采用自制字幕)",
    "虚构航海 (个人汉化)",
    "[星舟字幕组][森][03][1080p]",
  ])("元信息、匿名职责与作品短名不新增身份：%s", (input) => {
    const expected = input.startsWith("[星舟字幕组]")
      ? ["星舟字幕组"]
      : undefined;
    expect(groups(input)).toEqual(expected);
  });

  it("多处署名raw不包含中间作品与技术信息", () => {
    expect(
      parseTorrentOrganization(
        "[星舟字幕组] 虚构航海 [03] (采用流云+暮雨+自制字幕)"
      )
    ).toEqual({
      raw: "星舟字幕组 & 采用流云+暮雨+自制字幕",
      parts: ["星舟字幕组", "流云", "暮雨"],
    });
  });
});

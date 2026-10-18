import { parseTorrentOrganization } from "./parseTorrentOrganization";

const groups = (input: string) => parseTorrentOrganization(input)?.parts;

describe("制作组识别：元信息和多处署名边界", () => {
  it.each([
    ["[V2][星舟字幕组][虚构航海][03][1080p]", ["星舟字幕组"]],
    ["[ver.3][陌生星舟][虚构航海][03]", ["陌生星舟"]],
    ["[网盘资源][Qxz-GM][虚构航海][1080p]", ["Qxz-GM"]],
    ["[转][陌生星舟][虚构航海][03]", ["陌生星舟"]],
    ["[TV版&无修版][陌生星舟][虚构航海][03]", ["陌生星舟"]],
    ["[动漫星桥][虚构航海][03]", ["动漫星桥"]],
    ["[星舟字幕组十三周年][虚构航海][03]", ["星舟字幕组"]],
    ["[星舟字幕组20周年纪念][虚构航海][03]", ["星舟字幕组"]],
    ["[星舟字幕组新年献礼][虚构航海][03]", ["星舟字幕组"]],
    ["[星舟字幕组新春獻禮][虚构航海][03]", ["星舟字幕组"]],
    ["[Qxz个人汉化] 虚构航海 - 03", ["Qxz"]],
    ["[Qxz個人漢化] 虚构航海 - 03", ["Qxz"]],
    ["[星舟字幕组feat.月湾压制] 虚构航海 - 03", ["星舟字幕组", "月湾压制"]],
    ["[星舟字幕组 FEAT. Moon-Raws] 虚构航海 - 03", ["星舟字幕组", "Moon-Raws"]],
    ["[波洛咖啡厅\\PCSUB][虚构航海][03]", ["波洛咖啡厅\\PCSUB"]],
    ["[星舟字幕组\\月湾汉化组][虚构航海][03]", ["星舟字幕组", "月湾汉化组"]],
    ["虚构航海 (Amazing Dubbing)", ["Amazing Dubbing"]],
    ["[动漫萌][4月新番][虚构航海][03]", ["动漫萌"]],
    [
      "[幸花压制] 虚构航海 - 03 (WebRip AV1 简繁内封 Aliciä)",
      ["幸花压制", "Aliciä"],
    ],
    ["虚构航海 - 03 [WEB-DL AAC ANi]", ["ANi"]],
    ["虚构航海[GerSub][collected_by_nerv87]", ["nerv87"]],
    ["虚构航海 [translated_by_Nova-7]", ["Nova-7"]],
    ["虚构航海 [Moon@Archive42][BDMV]", ["Moon@Archive42"]],
    ["虚构航海 WEB x264 AAC -Nova.7-Raws (CUSTOM)", ["Nova.7-Raws"]],
    ["虚构航海 1080p x264-New-Galaxy.42", ["New-Galaxy.42"]],
    ["[星舟字幕组] 虚构航海 [MultiSub][GerSub]", ["星舟字幕组"]],
    [
      "[New Galactic Guild] 虚构航海 / Fictional Voyage - 03",
      ["New Galactic Guild"],
    ],
  ])("提取完整身份：%s", (input, expected) => {
    expect(groups(input as string)).toEqual(expected);
  });

  it.each([
    "[BDMV][虚构航海 / Fictional Voyage]",
    "虚构航海 [1080P@60FPS][简繁内封]",
    "[虚构航海][全15集][国语中字][WEB-MKV][2160P]",
    "[转] 虚构航海 - 03",
    "[转运] 虚构航海 - 03",
    "[个人汉化] 虚构航海 - 03",
    "[TV版&轻微修正版&无修版] 虚构航海 - 03",
    "[全遮版&修正版&无修版] 虚构航海 - 03",
    "[完全无修版] 虚构航海 - 03",
    "[人物幻想全开ver.] 虚构航海 - 03",
    "虚构航海 [MultiSub][GerSub][EngSub]",
    "虚构航海 (WebRip AV1 简繁内封)",
    "虚构航海 - The Paper Sea (CUSTOM)",
  ])("匿名职责、版本及语言不是身份：%s", (input) => {
    expect(parseTorrentOrganization(input)).toBeUndefined();
  });

  it("发布源尾签的raw不包含作品名和技术信息", () => {
    expect(
      parseTorrentOrganization(
        "[星舟搬运组] 虚构航海 WEB x264 AAC -Nova.7-Raws (CUSTOM)"
      )
    ).toEqual({
      raw: "星舟搬运组 & Nova.7-Raws",
      parts: ["星舟搬运组", "Nova.7-Raws"],
    });
  });
});

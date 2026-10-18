import { parseTorrentOrganization } from "./parseTorrentOrganization";

const groups = (input: string) => parseTorrentOrganization(input)?.parts;

describe("独立制作组识别", () => {
  it.each<[string, string[]]>([
    ["[星舟字幕组] 虚构航海 / Fictional Voyage - 01 [1080p]", ["星舟字幕组"]],
    [
      "[BT下载][ZeroTV][Release Subs][虚构航海][03][1080p]",
      ["ZeroTV", "Release Subs"],
    ],
    ["[个人字幕组] 虚构航海 [01]", ["个人字幕组"]],
    ["[jibaketa] 虚构航海 [01]", ["jibaketa"]],
    ["[jibaketa个人翻译] 虚构航海 [01]", ["jibaketa"]],
    ["[新署名翻译&转载] 虚构航海 [01]", ["新署名"]],
    [
      "[星舟搬运组] 虚构航海 1080p FLAC-Qxz.7-Raws.mkv",
      ["星舟搬运组", "Qxz.7-Raws"],
    ],
    ["虚构航海 - 01 1080p HEVC-Unknown.24-Team 1.2GB", ["Unknown.24-Team"]],
    [
      "[星舟搬运组] 虚构航海 - 01 [WEB-DL 1080p AVC AAC-Xyz.7-Team]",
      ["星舟搬运组", "Xyz.7-Team"],
    ],
    ["[墨竹压制] 虚构航海 [01]", ["墨竹压制"]],
    ["[萤桥制作] 虚构航海 [01]", ["萤桥制作"]],
    ["[Qxyv] 虚构航海 / Fictional Voyage - 01 [1080p]", ["Qxyv"]],
    ["[陌星舟][虚构航海][01][1080p]", ["陌星舟"]],
    ["[4月新番][陌星舟][虚构航海][01]", ["陌星舟"]],
    ["【星舟字幕组】★4月新番[虚构航海][01]", ["星舟字幕组"]],
    ["（2004年OVA）[Qxyv-Raws] 虚构航海 [01]", ["Qxyv-Raws"]],
    [
      "[星舟字幕组＆月湾汉化组×Qxyv-Raws+虹桥Sub、Z7-Team] 虚构航海 - 01",
      ["星舟字幕组", "月湾汉化组", "Qxyv-Raws", "虹桥Sub", "Z7-Team"],
    ],
    ["[星舟字幕组][月湾汉化组] 虚构航海 - 01", ["星舟字幕组", "月湾汉化组"]],
    ["[星舟字幕组 &] 虚构航海 [01]", ["星舟字幕组"]],
    ["[Z.q-Raws&Q7 Meta Studio] 虚构航海 [01]", ["Z.q-Raws", "Q7 Meta Studio"]],
    ["[Qxyv合成&音频压制] 虚构航海 [01]", ["Qxyv"]],
    ["[星舟字幕组合成＆二次压制] 虚构航海 [01]", ["星舟字幕组"]],
    ["星舟字幕组★虚构航海★01★1080p", ["星舟字幕组"]],
    ["星舟字幕组『虚构航海/Fictional Voyage』[01]", ["星舟字幕组"]],
    ["[虚构航海][01][字幕组：星舟与月]", ["星舟与月"]],
    ["虚构航海 - 01 [星舟字幕组] [1080p]", ["星舟字幕组"]],
    ["[星舟字幕组(Kamigami)] 虚构航海 [01]", ["星舟字幕组(Kamigami)"]],
    ["[星舟搬运组] 虚构航海 1080p AAC-ZeroTV", ["星舟搬运组", "ZeroTV"]],
    ["星舟字幕组 虚构航海 - 01 [1080p]", ["星舟字幕组"]],
    ["[星舟搬运组] 虚构航海 1080p AAC-ZeroTV 0.54GB", ["星舟搬运组", "ZeroTV"]],
    ["[星舟搬运组] 虚构航海 1080p AAC-ZeroTV.mkv", ["星舟搬运组", "ZeroTV"]],
  ])("提取 %s", (input, expected) => {
    expect(groups(input)).toEqual(expected);
  });

  it.each([
    "",
    "[推しの子][01][1080p]",
    "[个人翻译] 虚构航海 - 01",
    "虚构航海 - Rain-Garden.mkv",
    "虚构航海 - 01 [H265 DTS-HD]",
    "虚构航海 - 01 [HEVC-10bit]",
    "虚构航海 - 01 AAC-LC",
    "虚构航海 - 01 (CN,HK,TW,JP sub)[1080p]",
    "虚构航海 - Qxz.7-Raws 1080p.mkv",
    "[个人压制] 虚构航海 - 01",
    "[自压] 虚构航海 - 01",
    "[转载] 虚构航海 - 01",
    "[整理搬运] 虚构航海 - 01",
    "[个人翻译&个人压制] 虚构航海 - 01",
    "[虚构航海][01][1080p]",
    "[Fictional Voyage][01][HEVC]",
    "虚构航海 - 01 [1080p][Baha][WEB-DL][CHS]",
    "[国漫]虚构航海第01集无水印高清下载",
    "[整理搬运] 虚构航海 (Fictional Voyage) TV动画全集",
    "[1080p][Baha][HEVC][AAC][MKV]",
    "[Fictional Voyage][HEVC][MKV][英语字幕]",
    "虚构航海 [简体+繁体] [1080p]",
    "虚构航海 [音频压制] [01]",
  ])("不把作品、类别、职责或技术信息当组：%s", (input) => {
    expect(parseTorrentOrganization(input)).toBeUndefined();
  });

  it("保留原始发布片段并移除职责，保留组名内部连字符", () => {
    const input = "[  Qxyv-Raws合成&音频压制  ] 虚构航海 [01]";
    expect(parseTorrentOrganization(input)).toEqual({
      raw: "Qxyv-Raws合成&音频压制",
      parts: ["Qxyv-Raws"],
    });
  });

  it("元信息前缀后的相邻发布者保留完整原始署名", () => {
    expect(
      parseTorrentOrganization(
        "[BT下载][ZeroTV][Release Subs][虚构航海][03][1080p]"
      )
    ).toEqual({
      raw: "ZeroTV & Release Subs",
      parts: ["ZeroTV", "Release Subs"],
    });
  });

  it("非连续署名片段不包含中间的作品和技术信息", () => {
    expect(
      parseTorrentOrganization("[星舟搬运组] 虚构航海 1080p AAC-ZeroTV")
    ).toEqual({
      raw: "星舟搬运组 & ZeroTV",
      parts: ["星舟搬运组", "ZeroTV"],
    });
  });

  it("同一发布者重复标记只返回一次", () => {
    expect(groups("[星舟字幕组&星舟字幕组] 虚构航海 - 01")).toEqual([
      "星舟字幕组",
    ]);
  });
});

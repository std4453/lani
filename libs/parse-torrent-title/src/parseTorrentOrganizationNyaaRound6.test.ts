import { parseTorrentOrganization } from "./parseTorrentOrganization";

const groups = (input: string) => parseTorrentOrganization(input)?.parts;

describe("Nyaa 制作署名：交付说明、来源贡献与裸前缀边界", () => {
  it.each([
    "[Publisher] Fictional Voyage [JP Dub and Sub] [Complete Batch]",
    "[Publisher] Fictional Voyage [Japanese Dub & Sub]",
    "[Publisher] Fictional Voyage [English Sub and Dub]",
  ])("语言交付说明不成为制作身份：%s", (input) => {
    expect(groups(input)).toEqual(["Publisher"]);
  });

  it.each([
    ["Fictional Voyage - S01 [DVD 480p HEVC AAC] [ThanksBB]", ["ThanksBB"]],
    ["虚构航海 - 03 [SCV]", ["SCV"]],
    ["Fictional Voyage TV 01-04 [Asuka♥Shinji]", ["Asuka♥Shinji"]],
    [
      "Fictional Voyage TV 01-49 [ARR-JE-XenoCrypt][720p]",
      ["ARR-JE-XenoCrypt"],
    ],
    ["虚构航海 R170 (1080p TVer Web-DL) [Lord Karasuma]", ["Lord Karasuma"]],
    ["Fictional.Voyage.S01.Bluray.1080p.AV1.DualAudio-Pi13", ["Pi13"]],
    ["虚构航海.1080p.Multi-Audio-Nova.24.mkv", ["Nova.24"]],
    [
      "[Publisher] 虚构航海 [1080p Multi-Audio-Nova.24]",
      ["Publisher", "Nova.24"],
    ],
    ["虚构航海.1080p.DualAudio-JPN-Nova", ["JPN-Nova"]],
    ["[BDMV][虚构航海][Vol.1-6 FIN][JPN]-YE", ["YE"]],
    ["[DVDISO][虚构航海][ENG]-Qyz.7-Team.iso", ["Qyz.7-Team"]],
    ["[Diogo4D-NF93] [WEB][1080p] 虚构航海 - 03", ["Diogo4D", "NF93"]],
    ["[NF93] 虚构航海 - 03", ["NF93"]],
    [
      "[Publisher] 虚构航海 Subs+Fonts for ReinForce [BD].zip",
      ["Publisher", "ReinForce"],
    ],
    [
      "[Publisher] 虚构航海 Subtitles for Nova-Raws [BD].7z",
      ["Publisher", "Nova-Raws"],
    ],
    [
      "[Publisher] Elm University Animation Study Group - 1988 Fictional Theatre (Betamax)",
      ["Publisher", "Elm University Animation Study Group"],
    ],
  ])("提取原文明示的身份并保留内部标点：%s", (input, expected) => {
    expect(groups(input as string)).toEqual(expected);
  });

  it.each([
    "Earth Maiden Fictional Voyage - 01 [1080p]",
    "Doki Doki Fictional Club - 01 [1080p]",
    "AMF Another Fictional Voyage - 01",
    "虚构航海 - 03 [UnknownAlias]",
    "虚构航海 - 03 [A Different Alias]",
    "虚构航海 - 03 [JP Dub and Sub]",
    "虚构航海.S01.1080p.DualAudio-AAC",
    "虚构航海.S01.1080p.DualAudio-Japanese",
    "虚构航海.S01.1080p.MultiAudio-English",
    "Fictional Voyage.S01.1080p.DualAudio-JPN-ENG",
    "虚构航海.S01.1080p.DualAudio-JPN_ENG",
    "虚构航海.S01.1080p.MultiAudio-English.Japanese",
    "虚构航海.S01.1080p.MultiAudio-JPN+ENG",
    "虚构航海.S01.1080p.MultiAudio-NOGRP",
    "虚构航海 [JPN]-YE",
    "[BDMV][虚构航海][JPN]-CHS",
    "[BDMV][虚构航海][JPN]-NOGRP",
    "虚构航海 Subs+Fonts for Everyone [BD].zip",
    "Fictional Study Group - 03 (1080p)",
  ])("无独立署名证据时不从标题和说明猜测身份：%s", (input) => {
    expect(groups(input)).toBeUndefined();
  });

  it("技术块内多语言列表不在已有发布者后追加身份", () => {
    expect(
      groups(
        "[Publisher] Fictional Voyage [1080p Multi-Audio-English-Japanese]"
      )
    ).toEqual(["Publisher"]);
  });

  it.each([
    ["Earth - 虚构航海 [03]", ["Earth"]],
    ["Doki [虚构航海][03]", ["Doki"]],
    ["[Doki] 虚构航海 [03]", ["Doki"]],
    ["NovaSub 虚构航海 - 03", ["NovaSub"]],
    ["虚构航海 - Earth [1080p][AAC].mkv", ["Earth"]],
  ])("明确分隔及组名词仍可使用裸署名：%s", (input, expected) => {
    expect(groups(input as string)).toEqual(expected);
  });

  it("补包署名的 raw 只含原文身份", () => {
    expect(
      parseTorrentOrganization(
        "[Publisher] 虚构航海 Subs+Fonts for ReinForce [BD].zip"
      )
    ).toEqual({
      raw: "Publisher & ReinForce",
      parts: ["Publisher", "ReinForce"],
    });
  });
});

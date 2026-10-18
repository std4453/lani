import { parseTorrentOrganization } from "./parseTorrentOrganization";

const groups = (input: string) => parseTorrentOrganization(input)?.parts;

describe("Nyaa 制作署名：联合横线、音轨边界与已核实署名", () => {
  it.each([
    [
      "[Naruto-Kun.Hu - UraharaShop] First Tale - 46 [1080p].mkv",
      ["Naruto-Kun.Hu", "UraharaShop"],
    ],
    ["[ReinForce - Nova Studio] First Tale - 01", ["ReinForce", "Nova Studio"]],
    ["First Tale (2016) [1080p x264 Opus] [1234ABCD] [Chika]", ["Chika"]],
    [
      "First Tale - 001 - A Fictional Episode Caption [Egao][1234ABCD].mkv",
      ["Egao"],
    ],
    [
      "First Tale S01 [2024-2025] 1080p BDRip x265 FLAC 2.0 Kira [SEV]",
      ["Kira", "SEV"],
    ],
    ["First Tale S01 1080p BluRay REMUX AVC LPCM 2.0-Jiisan", ["Jiisan"]],
    ["Another Fictional Film S01 1080p BluRay AVC LPCM2.0-Fugou", ["Fugou"]],
    ["First Tale 1080p LPCM 5.1-Nova.24.mkv", ["Nova.24"]],
    ["First Tale 1080p LPCM2.0-JPN-Nova", ["JPN-Nova"]],
    ["First Tale 1080p x264-Ita", ["Ita"]],
    ["(shiteater) First Tale 190 [1234ABCD]", ["shiteater"]],
    ["（shiteater）Another Fictional Film - 01", ["shiteater"]],
    ["First Tale - 04 [HawaiianTV]", ["HawaiianTV"]],
  ])("保留原文身份及内部标点：%s", (input, expected) => {
    expect(groups(input as string)).toEqual(expected);
  });

  it.each([
    "First Tale [UnknownCaption][1234ABCD].mkv",
    "First Tale [Spider-Man][1234ABCD].mkv",
    "(UnknownCaption) First Tale - 01",
    "First Tale [Kira]",
    "First Tale - 04 [UnknownTV]",
    "Kira First Tale - 01",
    "First Tale FLAC 2.0 Kira Another Caption [1080p]",
    "First Tale FLAC 2.0 Kira [UnknownCaption]",
    "First Tale LPCM 2.0-AAC2.0",
    "First Tale LPCM2.0-FLAC2.0",
    "First Tale LPCM 2.0-10bit",
    "First Tale LPCM 2.0-NOGRP",
    "First Tale LPCM2.0-JPN-ENG",
    "First Tale LPCM 2.0-English-Japanese",
    "First Tale LPCM 2.0-ITA-JPN [1080p]",
    "First Tale LPCM2.0-Japanese",
    "First Tale - 01 [ARR-LPCM2.0].mkv",
    "First Tale [A Different - Another Alias][1234ABCD].mkv",
  ])("未知别名、语言与技术字段不产生制作身份：%s", (input) => {
    expect(groups(input)).toBeUndefined();
  });

  it("已核实普通署名不会扩张为无括号的标题首词", () => {
    expect(groups("Chika First Tale - 01")).toBeUndefined();
    expect(groups("Egao First Tale - 01")).toBeUndefined();
  });

  it("联合署名raw与技术链尾签仍对应准确原文", () => {
    expect(parseTorrentOrganization("First Tale FLAC 2.0 Kira [SEV]")).toEqual({
      raw: "Kira & SEV",
      parts: ["Kira", "SEV"],
    });
    expect(
      parseTorrentOrganization("[Naruto-Kun.Hu - UraharaShop] First Tale - 01")
    ).toEqual({
      raw: "Naruto-Kun.Hu - UraharaShop",
      parts: ["Naruto-Kun.Hu", "UraharaShop"],
    });
  });

  it("LPCM尾签不依赖具体作品或发布者词典", () => {
    for (let index = 0; index < 30; index++) {
      const publisher = `Nova${index}.Q-Team`;
      expect(groups(`First Tale 1080p LPCM 2.0-${publisher}`)).toEqual([
        publisher,
      ]);
    }
  });
});

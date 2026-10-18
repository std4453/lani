import { parseTorrentOrganization } from "./parseTorrentOrganization";

const groups = (input: string) => parseTorrentOrganization(input)?.parts;

describe("Nyaa 制作署名：配音属性、已核实联合与音轨尾签", () => {
  it.each([
    "[台配] First Tale (Mandarin Chinese Dub)",
    "[臺配] 第一物语 - 01 [1080p]",
    "[中配版] First Tale - 01",
    "[粤配] 第一物语 - 01",
    "[Dual-Subs] First Tale - 01",
    "First Tale - 01 [Dual-Subs]",
    "First Tale - 01 [dual_subs]",
    "First Tale - 01 [Dual Subs]",
    "First Tale - 01 [A Fictional Story, Dual-Subs]",
  ])("完整配音或字幕交付属性不作为发布者：%s", (input) => {
    expect(groups(input)).toBeUndefined();
  });

  it.each([
    ["[Publisher] [台配] First Tale - 01", ["Publisher"]],
    ["[Publisher] First Tale [Dual-Subs]", ["Publisher"]],
    ["[台配字幕组] First Tale - 01", ["台配字幕组"]],
    ["[Nova-DualSubs] First Tale - 01", ["Nova-DualSubs"]],
    ["[Nova-Delta] First Tale - 01", ["Nova-Delta"]],
    ["[STE-MeruMeru] First Tale - 34 [HEVC]", ["STE", "MeruMeru"]],
    ["[AS-NKWT] First Tale - 23 [1080p]", ["AS", "NKWT"]],
    ["First Tale - 01 [STE-MeruMeru]", ["STE", "MeruMeru"]],
    ["First Tale - 01 [AS-NKWT]", ["AS", "NKWT"]],
    ["First Tale (2021) [BluRay.1080p.x265.AAC] [12.8GB] [stress]", ["stress"]],
    ["[Publisher] First Tale [stress]", ["Publisher", "stress"]],
    ["First Tale 2160p BluRay x265 ATMOS-Nova.24", ["Nova.24"]],
    ["First Tale x265 ATMOS-GundamGuy", ["GundamGuy"]],
    ["First Tale 1080p ATMOS7.1-Nova.24.mkv", ["Nova.24"]],
    ["First Tale 1080p ATMOS-Nova264", ["Nova264"]],
    ["First Tale 1080p ATMOS-JPN-Nova", ["JPN-Nova"]],
    ["[Publisher] First Tale [1080p ATMOS-Nova.24]", ["Publisher", "Nova.24"]],
    ["First Tale 1080p x264-Ita", ["Ita"]],
  ])("保留明确原文身份与品牌标点：%s", (input, expected) => {
    expect(groups(input as string)).toEqual(expected);
  });

  it.each([
    "stress First Tale - 01",
    "First Tale stress",
    "First Tale - 01 [UnknownCaption]",
    "First Tale - 01 [Unknown-Another][1234ABCD].mkv",
    "First Tale AS",
    "AS First Tale - 01",
    "First Tale Atmospheric-Nova",
    "First Tale Caption-Nova",
    "First Tale ATMOS-AAC2.0",
    "First Tale ATMOS-AVC10bit",
    "First Tale ATMOS-NOGRP",
    "First Tale ATMOS-Japanese",
    "First Tale ATMOS-JPN-ENG",
    "First Tale ATMOS-English-Japanese",
    "First Tale ATMOS-ITA-JPN [1080p]",
    "First Tale ATMOS-10bit",
    "First Tale x265-ATMOS",
  ])("普通标题、未知另名和技术字段不升级为署名：%s", (input) => {
    expect(groups(input)).toBeUndefined();
  });

  it("新音轨格式不依赖具体作品或未知组名词典", () => {
    for (let index = 0; index < 40; index++) {
      const identity = `Nova${index}.Q-Team`;
      expect(groups(`Fictional Film 1080p x265 ATMOS-${identity}.mkv`)).toEqual(
        [identity]
      );
      expect(groups(`[${identity}] Fictional Film [Dual-Subs]`)).toEqual([
        identity,
      ]);
    }
  });

  it("字幕作者和适配目标语义保持独立", () => {
    expect(
      groups("[Publisher] First Tale Subs by Nova Subs for ReinForce [BD].zip")
    ).toEqual(["Publisher", "Nova Subs"]);
    expect(
      groups(
        "[Publisher] First Tale Subs for [ReinForce] from Nova.24 [BD].zip"
      )
    ).toEqual(["Publisher", "Nova.24"]);
    expect(
      groups(
        "[Publisher] First Tale Subs for ReinForce [1080p HEVC] [LoliHouse].zip"
      )
    ).toEqual(["Publisher", "LoliHouse"]);
  });

  it("联合署名与ATMOS尾签raw都保留原文位置", () => {
    expect(parseTorrentOrganization("[STE-MeruMeru] First Tale - 01")).toEqual({
      raw: "STE-MeruMeru",
      parts: ["STE", "MeruMeru"],
    });
    expect(parseTorrentOrganization("First Tale x265 ATMOS-Nova.24")).toEqual({
      raw: "Nova.24",
      parts: ["Nova.24"],
    });
  });

  it.each([
    "Dual-Subs-Team",
    "DualSubs-Team",
    "Dual-Subs Studio",
    "DualSubs Studio",
    "Nova Dual Subs Team",
    "Dual-Subs Nova Team",
    "Dual-Subs HEVC Team",
    "Dual-Subs-1080p-Team",
  ])("字幕交付词只是完整品牌的一部分时保留：%s", (identity) => {
    expect(groups(`[${identity}] First Tale - 03 [1080p]`)).toEqual([identity]);
    expect(groups(`[Publisher] First Tale - 03 [${identity}]`)).toEqual([
      "Publisher",
      identity,
    ]);
    expect(
      groups(
        `[Publisher] First Tale Subs by ${identity} for ReinForce [BD].zip`
      )
    ).toEqual(["Publisher", identity]);
  });

  it.each([
    "Dual-Subs",
    "DualSubs",
    "Dual Subs",
    "Dual-Subs, English",
    "Dual-Subs-1080p",
    "Dual-Subs 1080p",
    "Dual-Subs HEVC",
    "Dual-Subs 1080p HEVC",
    "Dual-Subs-1080p-HEVC",
    "Dual-Subs English",
    "Dual-Subs-English-Japanese",
    "Dual-Subs.1080p.HEVC",
    "Dual-Subs AAC2.0 x265.10bit",
    "Dual-Subs 1080p DDP5.1",
    "Dual-Subs DTS-HD-MA",
    "Dual-Subs 1080p DTS-HD-MA",
    "Dual-Subs-1080p-DTS-HD-HRA",
    "A Fictional Story, Dual-Subs",
    "Multi-Subs",
    "Hard Subs",
    "Soft Subs",
    "A Fictional Story, Multi-Subs",
    "A Fictional Story, Hard Subs",
    "A Fictional Story, Soft Subs",
  ])("完整字幕属性字段仍不作为身份：%s", (attribute) => {
    expect(groups(`[Publisher] First Tale - 03 [${attribute}]`)).toEqual([
      "Publisher",
    ]);
    expect(groups(`[${attribute}] First Tale - 03 [1080p]`)).toBeUndefined();
    expect(
      groups(`[Publisher] First Tale Subs by ${attribute} [BD].zip`)
    ).toEqual(["Publisher"]);
  });

  it("字幕交付字段的长空白和换行只作为字段分隔", () => {
    const spacing = " ".repeat(16384);
    expect(
      groups(`[Dual-Subs ${spacing}\nHEVC] First Tale - 03`)
    ).toBeUndefined();
    expect(
      groups(`[Publisher] First Tale - 03 [Dual-Subs ${spacing}HEVC]`)
    ).toEqual(["Publisher"]);
    expect(groups("[Dual-Subs \nNova Team] First Tale - 03")).toEqual([
      "Dual-Subs \nNova Team",
    ]);
  });

  it.each([
    "Dual-Subs HEVC-Nova",
    "Dual-Subs 1080p AAC2.0-Nova",
    "Dual-Subs 1080p HEVC-Nova AAC2.0",
    "Dual-Subs English x265-Nova.mkv",
  ])("交付字段里的scene身份不再与整块重复计组：%s", (field) => {
    expect(groups(`[${field}] First Tale - 03`)).toEqual(["Nova"]);
    expect(groups(`[Publisher] First Tale - 03 [${field}]`)).toEqual([
      "Publisher",
      "Nova",
    ]);
  });

  it("未知品牌尾段不因出现Dual属性词就整体丢失", () => {
    expect(groups("[Dual-Subs-Nova-Team] First Tale - 03")).toEqual([
      "Dual-Subs-Nova-Team",
    ]);
    expect(groups("[Dual-Subs HEVC Nova Team] First Tale - 03")).toEqual([
      "Dual-Subs HEVC Nova Team",
    ]);
  });

  it.each(["Dual-Subs", "DualSubs", "Dual Subs", "dual_subs"])(
    "明示作者字段也不重复计入技术scene整段：%s",
    (header) => {
      for (const role of ["Subs by", "Subs from", "Subtitle source:"]) {
        for (const scene of ["AAC2.0-Nova-Team", "HEVC-Nova.24"]) {
          const identity = scene.slice(scene.indexOf("-") + 1);
          expect(
            groups(
              `[Publisher] First Tale ${role} ${header} 1080p ${scene} for ReinForce [BD].zip`
            )
          ).toEqual(["Publisher", identity]);
        }
        expect(
          groups(
            `[Publisher] First Tale ${role} ${header} Nova Team for ReinForce [BD].zip`
          )
        ).toEqual(["Publisher", `${header} Nova Team`]);
      }
    }
  );
});

import { parseTorrentOrganization } from "./parseTorrentOrganization";

const groups = (input: string) => parseTorrentOrganization(input)?.parts;

describe("Nyaa 制作署名：旧式文件名、职责来源与联合身份", () => {
  it.each([
    ["[sheline][sage]_Morning_Story_-_02_[BD][720p].mp4", ["sheline", "sage"]],
    [
      "[AstralDzastr][ASW] Morning Story - 02 [1080p].ass",
      ["AstralDzastr", "ASW"],
    ],
    [
      "[Publisher]_Morning_Story_-_02_[Shani-san]_[1234ABCD].ass",
      ["Publisher", "Shani-san"],
    ],
    [
      "[Publisher] Morning Story - 02 [HorribleSubs][FavriteFixNames].ass",
      ["Publisher", "HorribleSubs", "FavriteFixNames"],
    ],
    ["[NF]_Morning_Story_-_02.ass", ["NF"]],
    ["[TW] Morning Story - 02 [720p]", ["TW"]],
    ["Morning Story Episode 02[GRZ]", ["GRZ"]],
    ["Morning Story (DVD X265 Dual Audio)[BobP]", ["BobP"]],
    ["Morning Story 1080p BluRay x265 [CTR] (Dual Audio)", ["CTR"]],
    ["Morning Story - v3 Patches [Kirakira].zip", ["Kirakira"]],
    ["[SUBS][Zero-Raws] Morning Story - 02 (DVD).zip", ["Zero-Raws"]],
    ["[Publisher] Morning Story [Hi10p][WEBSTEAM][SUB]", ["Publisher"]],
  ])("文件名分隔和连续已知署名不依赖作品：%s", (input, expected) => {
    expect(groups(input as string)).toEqual(expected);
  });

  it.each([
    ["HorribleSubs-ReinForce", ["HorribleSubs", "ReinForce"]],
    ["Seto Otaku-Hiryuu", ["Seto Otaku", "Hiryuu"]],
    ["PHT-KAW", ["PHT", "KAW"]],
    ["KiteSeekers-Wasurenai", ["KiteSeekers", "Wasurenai"]],
    ["UTW-THORA", ["UTW", "THORA"]],
    ["Vivid-Asenshi", ["Vivid", "Asenshi"]],
    ["Magai-Anonymoose", ["Magai", "Anonymoose"]],
    ["ANBU-umai", ["ANBU", "umai"]],
    ["BSS-Anon", ["BSS", "Anon"]],
    ["OldCastle-South Wind Subs", ["OldCastle", "South Wind Subs"]],
  ])("只拆有身份依据的联合署名：%s", (credit, expected) => {
    expect(groups(`[${credit}] Morning Story - 02 [1080p]`)).toEqual(expected);
    expect(groups(`Morning Story - 02 [${credit}].ass`)).toEqual(expected);
  });

  it.each([
    "Nova-Delta",
    "Pro-Empire",
    "Bill-Pengy",
    "M-L-M.P",
    "Naruto-Kun.Hu",
    "Edited-Raws",
    "Edited-Subs",
    "Edited-Nova Team",
    "Subtitle-Nova-Raws",
    "RippedSubs-Team",
    "Honorifics Studio",
    "AnimeXin Subs",
    "Daisuki Subs Team",
  ])("连字符及职责字样可属于完整品牌：%s", (credit) => {
    expect(groups(`[${credit}] Morning Story - 02`)).toEqual([credit]);
  });

  it.each([
    ["[edited-GJM] Morning Story - 02.ass", ["GJM"]],
    ["[Edited-HorribleSubs] Morning Story - 02.ass", ["HorribleSubs"]],
    ["[PATCH FOR CHIKI] Morning Story - 02", ["CHIKI"]],
    [
      "[Horriblesubs-Patch Nova.27] Morning Story - 02 patch",
      ["Horriblesubs", "Nova.27"],
    ],
    [
      "[Publisher] Subtitle Patch for Commie's Morning Story [BD]",
      ["Publisher", "Commie"],
    ],
    ["Morning Story [INP Muxed with SAMPLE raw]", ["INP", "SAMPLE"]],
    [
      "Morning Story [TV Season I & OVA subs - Shinsen-Subs, Neroextreme]",
      ["Shinsen-Subs", "Neroextreme"],
    ],
    ["Morning Story (Doremi subs)", ["Doremi"]],
    ["Morning Story subs (Doremi)", ["Doremi"]],
    [
      "Morning Story - THORA subs [SUBS ONLY] (re-timed for Yousei raws)",
      ["THORA"],
    ],
    ["Morning Story GKIDS English Subtitles [SRT]", ["GKIDS"]],
    ["Morning Story 01-03 DCTP OCR", ["DCTP"]],
    ["Morning Story_S01E02 NovaWorksSong&NetflixDialogue.ass", ["NovaWorks"]],
    ["DB-Style Morning Story Subs 02 - 03", ["DB-Style"]],
    ["[Publisher] TFS Morning Story Collection", ["Publisher", "TFS"]],
  ])("来源和行为职责分别处理：%s", (input, expected) => {
    expect(groups(input as string)).toEqual(expected);
  });

  it.each(["re-timed for", "retimed for", "retimed to", "timed to"])(
    "适配目标作用域在完整技术块终止：%s",
    (role) => {
      expect(
        groups(`Morning Story - 02 ${role} [Zero-Raws].ass`)
      ).toBeUndefined();
      expect(
        groups(
          `[Publisher] Morning Story ${role} [ReinForce] [1080p] [LoliHouse].ass`
        )
      ).toEqual(["Publisher", "LoliHouse"]);
      expect(
        groups(
          `[Publisher] Morning Story ${role} [Zero-Raws] (BD) [Nova Team].ass`
        )
      ).toEqual(["Publisher", "Nova Team"]);
    }
  );

  it.each([
    "[OCR] Morning Story - 02.ass",
    "[XML chapter files] Morning Story",
    "Morning Story - 02 (English fansub).ass",
    "Morning Story (Netflix Subs)",
    "[Daisuki] Morning Story - 02 Subs",
    "Seto no Hanayome subs [ENG]",
    "Morning Story subs [ENG]",
    "Morning Story - 02 [RippedSubs].ass",
    "Morning Story - 02 [Subtitle-Ohys_Raws].ass",
    "Morning Story Multi-Subs + chapters for DCP (Beatrice-Raws)",
    "[Honorifics] Morning Story - 02.ass",
  ])("无名职责和交付平台不作为身份：%s", (input) => {
    expect(groups(input)).toBeUndefined();
  });

  it.each([
    ["Morning Story - 02 #Fork", ["Fork"]],
    ["Morning Story_karaoke by Nova.avi.torrent", ["Nova"]],
    ["Morning Story karaoke by Delta.mkv", ["Delta"]],
    [
      "Morning Story Volume 2 - Baka-Tsuki [2020.01.02][v0.5].pdf",
      ["Baka-Tsuki"],
    ],
    ["μ's - Unpublished Theme English subs.ass", ["μ's"]],
    [
      "[Publisher] Takena Nagao - Unpublished Theme (384p)",
      ["Publisher", "Takena Nagao"],
    ],
  ])("具名演出、卡拉OK与文档尾签保留：%s", (input, expected) => {
    expect(groups(input as string)).toEqual(expected);
  });

  it.each([
    "Nova Subs [Orbit at Dawn] - 03 [1080p]",
    "Nova Subs ★ Orbit at Dawn - 03 [1080p]",
    "Nova Subs - Orbit at Dawn - 03 [1080p]",
  ])("未知多词字幕品牌在明确作品边界前保留：%s", (input) => {
    expect(groups(input)).toEqual(["Nova Subs"]);
  });

  it.each([
    "Morning Story - 02 [UnknownCaption]",
    "Morning Story - 02 [NF]",
    "Morning Story - 02 [TW]",
    "Morning Story by Morning",
    "Morning Story_Karaoke Nights - 02",
    "Morning Story - 02 [Unknown-Another]",
    "Morning Story Subs",
    "Nova Subs [ENG]",
    "Morning Story subs [ENG].ass",
    "Morning Story subs [subs only]",
    "Morning Story subs [ASS scripts]",
    "Nova Subs First Tale - 03 [1080p]",
    "A Story about Fork - 02",
    "A Song by Autem",
  ])("普通标题词与未知别名不自动变为署名：%s", (input) => {
    expect(groups(input)).toBeUndefined();
  });

  it.each([
    "[Publisher][Orbit] Dawn - 03 [1080p]",
    "[Publisher][虚构航海] Fictional Voyage - 03",
    "[Publisher][Virtual Voyage][Fictional Voyage][03]",
    "[Publisher][小市民系列_Shoushimin Series][10 END][1080p]",
    "[Publisher][我推的孩子] / Oshi no Ko - 02",
  ])("已有发布者后的独立作品包装不能吞作连续署名：%s", (input) => {
    expect(groups(input)).toEqual(["Publisher"]);
  });

  it("职责处理后raw仍来自原始署名范围", () => {
    expect(
      parseTorrentOrganization("[Horriblesubs-Patch Nova.27] Morning Story")
    ).toEqual({
      raw: "Horriblesubs-Patch Nova.27",
      parts: ["Horriblesubs", "Nova.27"],
    });
    expect(parseTorrentOrganization("Morning Story - THORA subs")).toEqual({
      raw: "THORA",
      parts: ["THORA"],
    });
  });
});

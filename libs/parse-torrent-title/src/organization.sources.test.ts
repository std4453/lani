import { parseTorrentOrganization } from "@/parseTorrentOrganization";
const groups = (input: string) => parseTorrentOrganization(input)?.parts;

describe("Nyaa 制作署名：配音属性、已核实联合与音轨尾签", () => {
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
});

describe("Nyaa 制作署名：旧式文件名、职责来源与联合身份", () => {
  it.each<[string, string[]]>([
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
    expect(groups(input)).toEqual(expected);
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
  it.each<[string, string[]]>([
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
    expect(groups(input)).toEqual(expected);
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

describe("Nyaa 制作署名：交付说明、来源贡献与裸前缀边界", () => {
  it("补包署名的 raw 只含原文身份", () => {
    expect(
      parseTorrentOrganization(
        "[Publisher] 虚构航海 Subs+Fonts for ReinForce [BD].zip"
      )
    ).toEqual({
      raw: "Publisher",
      parts: ["Publisher"],
    });
  });
});

describe("Nyaa 制作署名：已核实联合身份与补包来源", () => {
  it.each([
    "[Publisher] 第一物语 [First-Tale][ABCDEF12].mkv",
    "[Publisher] Fictional Voyage Subs+Fonts for Everyone & Japanese [BD].zip",
    "[Publisher] Fictional Voyage Subs+Fonts for Everyone & HEVC [BD].zip",
  ])("已知发布者后的另名与交付字段不追加为身份：%s", (input) => {
    expect(groups(input)).toEqual(["Publisher"]);
  });
  it("适配目标不写入制作署名raw", () => {
    expect(
      parseTorrentOrganization(
        "[Publisher] Fictional Voyage Subs+Fonts for 7³ACG & ktnbytes [BD].zip"
      )
    ).toEqual({
      raw: "Publisher",
      parts: ["Publisher"],
    });
  });
  it("适配目标即使包含已知组也不扩充当前制作身份", () => {
    for (let index = 0; index < 20; index++) {
      expect(
        groups(
          `Fictional Voyage Subs+Fonts for ReinForce & Nova${index}.Q [BD].zip`
        )
      ).toBeUndefined();
    }
  });
});

describe("Nyaa 制作身份：字幕来源与适配目标、商品信息和补充署名", () => {
  it.each([
    "[Publisher] First Tale Subs+Fonts for ReinForce [BD].zip",
    "[Publisher] Second Tale Subs for ReinForce [BD].zip",
    "[Publisher] Third Tale Subs+Fonts for 7³ACG & ktnbytes [BD].zip",
    "[Publisher] First Tale Subs for [ReinForce] [BD].zip",
    "[Publisher] First Tale Subs for ReinForce",
    "[Publisher] First Tale Subs for ReinForce & LoliHouse",
  ])("适配目标不作为字幕包的制作方：%s", (input) => {
    expect(groups(input)).toEqual(["Publisher"]);
  });
  it.each<[string, string[]]>([
    ["First Tale Subs by ReinForce [BD].zip", ["ReinForce"]],
    [
      "[Publisher] First Tale Subtitles by ReinForce [BD].zip",
      ["Publisher", "ReinForce"],
    ],
    [
      "[Publisher] First Tale Subs+Fonts from Nova-Raws [BD].zip",
      ["Publisher", "Nova-Raws"],
    ],
    [
      "[Publisher] First Tale Subtitle source: ReinForce [BD].zip",
      ["Publisher", "ReinForce"],
    ],
    [
      "[Publisher] First Tale Subs from NovaSub for ReinForce [BD].zip",
      ["Publisher", "NovaSub"],
    ],
    [
      "[Publisher] First Tale Subs for ReinForce by NovaSub [BD].zip",
      ["Publisher", "NovaSub"],
    ],
    ["First Tale For ReinForce - 01 [ReinForce]", ["ReinForce"]],
    ["[LonelyChaser-Inka] First Tale 24", ["LonelyChaser", "Inka"]],
    ["First Tale - 01,06,08-10,31 [DOMO][Dub+Sub]", ["DOMO"]],
    ["First Tale (1975) 01-07 [TSHS]", ["TSHS"]],
    ["First Tale - 03 [Radioactive Fanboys]", ["Radioactive Fanboys"]],
    [
      "First Tale (1999) (BD REMUX 1080p AVC FLAC) [RetroChocolate]",
      ["RetroChocolate"],
    ],
    ["[BATCH-Team] First Tale - 01", ["BATCH-Team"]],
    ["[NOVA-17451] First Tale - 01", ["NOVA-17451"]],
  ])("明确制作或原字幕提供身份仍保留：%s", (input, expected) => {
    expect(groups(input)).toEqual(expected);
  });
  it("适配目标过滤不会丢掉当前发布者或独立视频署名", () => {
    expect(
      parseTorrentOrganization("[Publisher] First Tale [BD] [ReinForce]")
    ).toEqual({
      raw: "Publisher & ReinForce",
      parts: ["Publisher", "ReinForce"],
    });
    expect(
      groups("[Publisher] First Tale Subs for ReinForce [BD] [LoliHouse].zip")
    ).toEqual(["Publisher", "LoliHouse"]);
  });
  it("明确字幕提供者可联合未知身份，不依赖适配目标或品牌名单", () => {
    for (let index = 0; index < 20; index++) {
      expect(
        groups(
          `First Tale Subtitles by ReinForce & Nova${index}.Q for RetroChocolate [BD].zip`
        )
      ).toEqual(["ReinForce", `Nova${index}.Q`]);
    }
  });
  it.each([
    "[Publisher] First Tale Subs for ReinForce from NovaSub [BD].zip",
    "[Publisher] First Tale Subs for [ReinForce] by NovaSub [BD].zip",
    "[Publisher] First Tale Subs by [NovaSub] for [ReinForce] [BD].zip",
    "[Publisher] First Tale Subs from [NovaSub] for [ReinForce] [BD].zip",
    "[Publisher] First Tale Subs for [ReinForce] from [NovaSub] [BD].zip",
    "[Publisher] First Tale Subs by 【NovaSub】 for 【ReinForce】 [BD].zip",
    "[Publisher] First Tale Subs by [NovaSub] for ReinForce [BD].zip",
    "[Publisher] First Tale Subs for 【ReinForce】 by NovaSub [BD].zip",
  ])("包装不会改变来源与适配目标的职责：%s", (input) => {
    expect(groups(input)).toEqual(["Publisher", "NovaSub"]);
  });
  it.each([
    "[Publisher] First Tale Subs for ReinForce [1080p HEVC] [LoliHouse].zip",
    "[Publisher] First Tale Subs for ReinForce (BD) [LoliHouse].zip",
    "[Publisher] First Tale Subs for ReinForce 【BD】 [LoliHouse].zip",
    "[Publisher] First Tale Subs for [ReinForce] (1080p HEVC) [LoliHouse].zip",
  ])("技术包装之后的独立制作署名不被适配范围吞掉：%s", (input) => {
    expect(groups(input)).toEqual(["Publisher", "LoliHouse"]);
  });
  it.each<[string, string[]]>([
    ["[Publisher] First Tale Subs by Nova [BD].zip", ["Publisher", "Nova"]],
    [
      "[Publisher] First Tale Subs by Nova Subs [BD].zip",
      ["Publisher", "Nova Subs"],
    ],
    ["[Publisher] First Tale Subs from Nova.24", ["Publisher", "Nova.24"]],
    [
      "[Publisher] First Tale Subs by Nova & Delta",
      ["Publisher", "Nova", "Delta"],
    ],
    ["[Publisher] First Tale Subtitles source: Nova", ["Publisher", "Nova"]],
    [
      "[Publisher] First Tale Subs from [Nova] for [ReinForce] [BD].zip",
      ["Publisher", "Nova"],
    ],
    [
      "[Publisher] First Tale Subs for [ReinForce] by [Nova] & 【Delta】 [BD].zip",
      ["Publisher", "Nova", "Delta"],
    ],
    [
      "[Publisher] First Tale Subs by Nova & AAC2.0 for ReinForce [BD].zip",
      ["Publisher", "Nova"],
    ],
  ])("明示字幕署名可保留单独未知身份：%s", (input, expected) => {
    expect(groups(input)).toEqual(expected);
  });
  it.each([
    "[Publisher] First Tale by Nova",
    "[Publisher] First Tale for Nova & Delta",
    "[Publisher] First Tale from Nova.24",
    "[Publisher] First Tale Subs for Nova & Delta [BD].zip",
    "[Publisher] First Tale Subs by English & Japanese [BD].zip",
    "[Publisher] First Tale Subs by AAC2.0 & AVC10bit [BD].zip",
  ])("普通正文、适配目标与交付属性不因紧凑拼写成为新署名：%s", (input) => {
    expect(groups(input)).toEqual(["Publisher"]);
  });
  it("长空白和包装不改变明示来源或目标字段的职责", () => {
    const spacing = " ".repeat(16384);
    expect(
      groups(`[Publisher] First Tale Subs by ${spacing}NoDestination`)
    ).toEqual(["Publisher", "NoDestination"]);
    expect(groups(`[Publisher] First Tale Subs by ${spacing}[BD].zip`)).toEqual(
      ["Publisher"]
    );
    expect(
      groups(
        `[Publisher] First Tale Subs by ${spacing}[Nova] for ${spacing}[ReinForce] [BD].zip`
      )
    ).toEqual(["Publisher", "Nova"]);
  });
  it("字幕作者名称中的说明词不重新激活子句", () => {
    for (const author of [
      "Nova Subs",
      "NovaSubtitles",
      "NovaFonts",
      "Nova Subtitles Team",
      "Nova Fonts Team",
    ]) {
      for (const wrapped of [false, true]) {
        const name = wrapped ? `[${author}]` : author;
        for (const sourceRole of ["by", "from"]) {
          expect(
            groups(
              `[Publisher] First Tale Subs ${sourceRole} ${name} for ReinForce [BD].zip`
            )
          ).toEqual(["Publisher", author]);
        }
      }
    }
    expect(
      groups(
        "[Publisher] First Tale Subs by Nova Subs for ReinForce from Delta [BD].zip"
      )
    ).toEqual(["Publisher", "Nova Subs", "Delta"]);
    expect(
      groups("[Publisher] First Tale Subs for Nova Subs by Delta [BD].zip")
    ).toEqual(["Publisher", "Delta"]);
    expect(
      groups(
        "[Publisher] First Tale Subs by Nova; Subtitles from Delta [BD].zip"
      )
    ).toEqual(["Publisher", "Nova", "Delta"]);
    expect(
      groups(
        "[Publisher] First Tale Subs by Nova [BD] Subtitles from Delta [WEB].zip"
      )
    ).toEqual(["Publisher", "Nova", "Delta"]);
  });
});

describe("制作组识别：显式字幕来源与发布署名", () => {
  it.each<[string, string[]]>([
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

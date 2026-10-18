import { parseTorrentOrganization } from "./parseTorrentOrganization";

const groups = (input: string) => parseTorrentOrganization(input)?.parts;

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

  it.each([
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
    expect(groups(input as string)).toEqual(expected);
  });

  it.each([
    "[BATCH]First Tale 1-19 English Subbed",
    "[BDMV][ANZX-17451][First Tale][JP][BD-BOX]",
    "[BDMV][ANZB-24680][First Tale][JP][BD-BOX]",
    "First Tale (1999) [UnknownChocolate]",
    "First Tale - 03 [Unknown Fans]",
    "First Tale [NOVA-17451][1234ABCD].mkv",
    "First Tale Subs for ReinForce [BD].zip",
    "First Tale Subs for [ReinForce] [BD].zip",
  ])("收录说明、目录编号和未知另名不成为发布者：%s", (input) => {
    expect(groups(input)).toBeUndefined();
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

  it.each([
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
    expect(groups(input as string)).toEqual(expected);
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

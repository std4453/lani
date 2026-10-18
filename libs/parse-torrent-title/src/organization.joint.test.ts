import { parseTorrentOrganization } from "@/parseTorrentOrganization";
const groups = (input: string) => parseTorrentOrganization(input)?.parts;

describe("Nyaa 制作署名：旧式文件名、职责来源与联合身份", () => {
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
});

describe("Nyaa 制作组：字幕说明和后置联合署名", () => {
  it("后置联合署名结构不依赖固定品牌词典", () => {
    for (let index = 0; index < 100; index++) {
      const first = `Moon${index}.Q`;
      const second = `Star${index}-Team`;
      expect(groups(`虚构航海 S5 [1080p] [${first}&${second}]`)).toEqual([
        first,
        second,
      ]);
    }
  });
});

describe("Nyaa 制作署名：已核实联合身份与补包来源", () => {
  it.each([
    ["[Inka-Orphan] Fictional Voyage (1966) (BD FHD)", ["Inka", "Orphan"]],
    [
      "[Publisher] 虚构航海 Subs+Fonts for 7³ACG & ktnbytes [BD].zip",
      ["Publisher"],
    ],
    [
      "[Publisher] Fictional Voyage Subtitles for ReinForce & Nova.24 [BD].zip",
      ["Publisher"],
    ],
    [
      "Fictional Voyage - 01 [ARR-Nova'sMechaSpot].mkv",
      ["ARR-Nova'sMechaSpot"],
    ],
    [
      "Fictional Voyage - 01 [ARR-Kyle'sMechaSpot].mkv",
      ["ARR-Kyle'sMechaSpot"],
    ],
    ["Fictional Voyage (2026) [ReinForce][EFA135E6].mkv", ["ReinForce"]],
    ["Fictional Voyage (2026) [Blu-Flash][EFA135E6].mkv", ["Blu-Flash"]],
    ["Another Fictional Film (1998) [Blu-Flash].mkv", ["Blu-Flash"]],
    ["Fictional Voyage - 01 [ARR-Nova24].mkv", ["ARR-Nova24"]],
    ["Fictional Voyage - 01 [ARR-AVC10bitTeam].mkv", ["ARR-AVC10bitTeam"]],
    [
      "[Publisher] First Tale Subs+Fonts for ReinForce & AAC2.0Crew [BD].zip",
      ["Publisher"],
    ],
    [
      "[Publisher] First Tale Subs+Fonts for ReinForce & Nova.24 [BD].zip",
      ["Publisher"],
    ],
  ])("独立身份按证据拆分，其余复合署名保留完整：%s", (input, expected) => {
    expect(groups(input as string)).toEqual(expected);
  });
  it.each([
    "Fictional Voyage (2026) [Nova-Flux].mkv",
    "Fictional Voyage (2026) [Nova-Flux][1234ABCD].mkv",
    "First Tale [Spider-Man][ABCDEF12].mkv",
    "Fictional Voyage (2026) [Nova-Flux][1234ABCD] Another Title.mkv",
    "Fictional Voyage (2026) (Nova-Flux)[1234ABCD].mkv",
    "Fictional Voyage (2026) [DTS-HD][1234ABCD].mkv",
    "Fictional Voyage (2026) [Blu-Ray][1234ABCD].mkv",
    "Fictional Voyage (2026) [English-Japanese][1234ABCD].mkv",
    "Fictional Voyage (2026) [WEB-DL][1234ABCD].mkv",
    "Fictional Voyage (2026) [1080p-HEVC][1234ABCD].mkv",
    "Fictional Voyage - 01 [ARR-CHS].mkv",
    "Fictional Voyage - 01 [ARR-DTS].mkv",
    "First Tale - 01 [ARR-AAC2.0].mkv",
    "First Tale - 01 [ARR-DDP5.1].mkv",
    "First Tale - 01 [ARR-AVC10bit].mkv",
    "First Tale - 01 [ARR-DTSHDMA7.1].mkv",
    "First Tale - 01 [ARR-x265_10bit].mkv",
    "Fictional Voyage - 01 [Doki-Doki].mkv",
    "Fictional Voyage [ARR-Nova] Another Title - 01",
    "Fictional Voyage Subs+Fonts for Everyone [BD].zip",
    "Fictional Voyage Subs+Fonts for Everyone & Anyone [BD].zip",
  ])("尾括号、技术字段与无身份依据的说明不成为制作署名：%s", (input) => {
    expect(groups(input)).toBeUndefined();
  });
});

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
    ["(shiteater) First Tale 190 [1234ABCD]", ["shiteater"]],
    ["（shiteater）Another Fictional Film - 01", ["shiteater"]],
    ["First Tale - 04 [HawaiianTV]", ["HawaiianTV"]],
  ])("保留原文身份及内部标点：%s", (input, expected) => {
    expect(groups(input as string)).toEqual(expected);
  });
});

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
  it("相邻搬运署名和源发布组的raw只保留两个发布片段", () => {
    expect(
      parseTorrentOrganization("[AKito搬运][GalaxyRailroad-888] 虚构航海 - 03")
    ).toEqual({
      raw: "AKito搬运 & GalaxyRailroad-888",
      parts: ["AKito", "GalaxyRailroad-888"],
    });
  });
});

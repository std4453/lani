import { parseTorrentOrganization } from "./parseTorrentOrganization";

const groups = (input: string) => parseTorrentOrganization(input)?.parts;

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

  it.each([
    "AAC2.0",
    "DDP5.1",
    "AVC10bit",
    "AAC2.0_24bit",
    "DTSHDMA7.1",
    "H.26410bit",
  ])("补包适配目标中的技术字段不扩充制作身份：%s", (technical) => {
    expect(
      groups(
        `[Publisher] First Tale Subs+Fonts for ReinForce & ${technical} [BD].zip`
      )
    ).toEqual(["Publisher"]);
  });

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

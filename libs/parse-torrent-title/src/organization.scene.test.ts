import { parseTorrentOrganization } from "@/parseTorrentOrganization";
const groups = (input: string) => parseTorrentOrganization(input)?.parts;

describe("Nyaa 制作署名：配音属性、已核实联合与音轨尾签", () => {
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

describe("Nyaa 制作署名：联合横线、音轨边界与已核实署名", () => {
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

describe("制作组识别：元信息和多处署名边界", () => {
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

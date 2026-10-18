import { parseTorrentOrganization } from "./parseTorrentOrganization";

const groups = (input: string) => parseTorrentOrganization(input)?.parts;

describe("Nyaa 制作组：字幕说明和后置联合署名", () => {
  it.each([
    "虚构航海 sub only",
    "Fictional Voyage SUB ONLY",
    "[FIXED-AUDIO] 虚构航海 - 01 v3 (BD 960x720 x265 10bit AAC)",
    "[CORRECTED_AUDIO] 虚构航海 - 01",
    "[REPAIRED-VIDEO] 虚构航海 - 01",
    "[SUBTITLES-FIXED] 虚构航海 - 01",
    "虚构航海 S5 ep 01-13 END (1080p+hardsub)",
    "虚构航海 S5 ep 01-13 END (1080p+softsub)",
  ])("字幕交付和修复标记不创建身份：%s", (input) => {
    expect(groups(input)).toBeUndefined();
  });

  it.each([
    ["[SweetSub] 虚构航海 - 03", ["SweetSub"]],
    ["[Inka-Subs] 虚构航海 - 03", ["Inka-Subs"]],
    ["[NovaSub] 虚构航海 - 03", ["NovaSub"]],
    ["NovaSub only an English title - 03", ["NovaSub"]],
    ["[HardSubTeam] 虚构航海 - 03", ["HardSubTeam"]],
    ["[FIXED-AUDIO][Unknown] 虚构航海 - 03", ["Unknown"]],
    [
      "[TAKEOVER_RUS.DUB] 虚构航海 S5 ep 01-13 END (1080p+hardsub) [GAR&Esmeralda]",
      ["TAKEOVER_RUS.DUB", "GAR", "Esmeralda"],
    ],
    ["虚构航海 [03] [Nova&Orion]", ["Nova", "Orion"]],
    ["虚构航海 - 03 [Nova&Orion].mkv", ["Nova", "Orion"]],
    ["虚构航海 - 03 [Nova+Orion][1080p][AAC]", ["Nova", "Orion"]],
    ["虚构航海 - 03 [流云字幕组＆暮雨字幕社]", ["流云字幕组", "暮雨字幕社"]],
  ])("保留品牌和未知联合发布者：%s", (input, expected) => {
    expect(groups(input as string)).toEqual(expected);
  });

  it.each([
    "[Publisher] 虚构航海 S5 (1080p) [Japanese&English]",
    "[Publisher] 虚构航海 S5 (1080p) [CHS+CHT]",
    "[Publisher] 虚构航海 S5 (1080p) [AVC&AAC]",
    "[Publisher] 虚构航海 [03] [U-NEXTDL+NetflixSub][1080p]",
    "[Publisher] 虚构航海 [03] [BahaRip+CRSub][1080p]",
    "[Publisher] 虚构航海 [03] [Remastered&Uncensored][1080p]",
    "[Publisher] 虚构航海 [03] [OP&ED][1080p]",
    "[Publisher] 虚构航海 [03] [TV+MOVIE][1080p]",
    "[Publisher] 虚构航海 [03] [TV01-89+OAD01-08][1080p]",
    "[Publisher] 虚构航海 [03] [HEVC2+VVC-12bit][1080p]",
    "[Publisher] 虚构航海 [03] [俄&英内封][1080p]",
    "[Publisher] 虚构航海 [03] [01-52TV全集+花絮][1080p]",
    "[Publisher] 虚构航海 [03] [附官方MV+预告+正片外挂字幕与字体包]",
    "[Publisher] 虚构航海 [03] [流云＆暮雨]",
    "[Publisher] 虚构航海 S5 (1080p) [A Different & Another Alias]",
    "[Publisher] 虚构航海 S5 (1080p) (Nova&Orion)",
    "[Publisher] 虚构航海 [Nova&Orion] Another Title - 03",
  ])("语言、技术和别名不按尾部联合署名处理：%s", (input) => {
    expect(groups(input)).toEqual(["Publisher"]);
  });

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

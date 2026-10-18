import { parseTorrentOrganization } from "./parseTorrentOrganization";

const groups = (input: string) => parseTorrentOrganization(input)?.parts;

describe("Nyaa 制作组：署名与字幕属性边界", () => {
  it.each([
    "虚构航海 [Bluray 1080p AVC Ita-Jap - DTS-HD MA 5.1 - Ita subs]",
    "[Blu-ray 1080p AVC Ita subs] 虚构航海 - 03",
    "虚构航海 (1080p x264 - Ita subs)",
    "虚构航海 (1080p x264 - Italian subtitles)",
    "虚构航海 (1080p x264 - Spa dubs)",
    "虚构航海 (1080p x264 - Fra dubbed)",
  ])("语言词后接字幕或配音职责属于属性：%s", (input) => {
    expect(groups(input)).toBeUndefined();
  });

  it.each([
    [
      "[snk] 虚构航海 - S03E11 (CR WEB-DL Majin 1080p x264 AAC 2.0)",
      ["snk", "Majin"],
    ],
    ["虚构航海 (WEB-DL MAJIN 720p AV1 AAC)", ["MAJIN"]],
    ["[4K世界]虚构航海.2160p.HEVC.DTS-HD.MA.2.0-4KSJ", ["4K世界", "4KSJ"]],
    ["虚构航海.2160p.HEVC.DTS-HD.MA.5.1-Nova", ["Nova"]],
    ["虚构航海.1080p.AVC.DTS-HD.MA-Nova", ["Nova"]],
    ["虚构航海.2160p.HEVC.DTS-HD.MA.7.1ch-Nova", ["Nova"]],
    ["虚构航海.2160p.HEVC.DTS-HD.HRA.2.0-Céleste", ["Céleste"]],
    ["虚构航海.2160p.HEVC.DTS.HD.MA.2.0-Nova", ["Nova"]],
    ["虚构航海 2160p HEVC DTS-HD MA 2.0-Nova", ["Nova"]],
  ])("技术块内部署名与完整DTS音轨：%s", (input, expected) => {
    expect(groups(input as string)).toEqual(expected);
  });

  it.each([
    "虚构航海 [Majin] [03]",
    "虚构航海 (CR WEB-DL MajinExtended 1080p x264 AAC)",
    "虚构航海 (CR WEB-DL UnknownBrand 1080p x264 AAC)",
    "[4K未知品牌] 虚构航海 [03]",
    "虚构航海.2160p.HEVC.DTS-HD.MA.2.0",
  ])("局部身份词典不扩展到普通别名或任意4K词：%s", (input) => {
    expect(groups(input)).toBeUndefined();
  });

  it.each([
    ["虚构航海 1080p BluRay DTS x265-10bit-HDS", ["HDS"]],
    ["虚构航海 1080p HEVC-12bit-NovaTeam", ["NovaTeam"]],
    ["虚构航海 1080p AV1-8bit-Céleste", ["Céleste"]],
    ["虚构航海 1080p AAC-手抄组", ["手抄组"]],
    ["虚构航海 1080p x264-Ita", ["Ita"]],
  ])("技术链后提取真实署名：%s", (input, expected) => {
    expect(groups(input as string)).toEqual(expected);
  });

  it.each([
    "虚构航海 (1971 - x264 - Ita AC3)",
    "虚构航海 (1971 - 1080p x264 - Ita Fra Spa AC3)",
    "虚构航海 (1080p AV1 - Italian French Spanish AAC2.0)",
    "虚构航海 (1080p HEVC-10bit-FLAC)",
  ])("编码后的语言列表与音轨不作为署名：%s", (input) => {
    expect(groups(input)).toBeUndefined();
  });

  it.each([
    ["虚构航海 - WEBDL - VOSTFR - x264 AAC - UwU (Ajout OAV)", ["UwU"]],
    ["虚构航海 VOSTFR 1080p WEB AV1 AAC -Báleygr", ["Báleygr"]],
    ["虚构航海 VOSTFR 1080p WEB x265 AAC - Céleste", ["Céleste"]],
    ["虚构航海 WEB x265 AAC - Café", ["Café"]],
    [
      "虚构航海 BD (Bluray 1080p, dual audio) [Chyrka / yolerejiju]",
      ["Chyrka", "yolerejiju"],
    ],
    ["虚构航海 [Nova字幕组 / OrionTeam]", ["Nova字幕组", "OrionTeam"]],
    ["虚构航海 24 SUB - Earth (854x480 YouTube).mkv", ["Earth"]],
    ["虚构航海 - Earth [1080p][AAC].mkv", ["Earth"]],
  ])("兼容空白、重音字母及尾部联合署名：%s", (input, expected) => {
    expect(groups(input as string)).toEqual(expected);
  });

  it.each([
    "[Nebula7] 虚构航海 (Fictional Voyage, Japanese Sub)",
    "[Nebula7] 虚构航海 (Fictional Voyage, Arabic Sub)",
    "[Nebula7] 虚构航海 [Fictional Voyage / Another Alias]",
    "[Nebula7] 虚构航海 WEB x265 AAC - 简体内嵌",
    "[Nebula7] 虚构航海 WEB x265 AAC - CHS",
    "[Nebula7] 虚构航海 WEB x265 AAC - 無字幕",
  ])("不把新增署名语法用于语言和别名：%s", (input) => {
    expect(groups(input)).toEqual(["Nebula7"]);
  });

  it.each([
    ["[aprm-Diogo4D][Blu-ray][1080p] 虚构航海 - 03", ["aprm", "Diogo4D"]],
    ["[AMF-SnF] 虚构航海 - 03 [1234ABCD]", ["AMF", "SnF"]],
    ["[BakeSubs-YnA] 虚构航海 - 03 [1080p]", ["BakeSubs", "YnA"]],
    ["虚构航海 - 03 [amf-snf]", ["amf", "snf"]],
    ["[AMF-SnF&NovaTeam] 虚构航海 - 03", ["AMF", "SnF", "NovaTeam"]],
    ["[字幕组：aprm-Diogo4D] 虚构航海 - 03", ["aprm", "Diogo4D"]],
    ["[One Pace][605-606] 虚构航海 02 [1080p]", ["One Pace"]],
    ["[Unknown-Team] 虚构航海 - 03", ["Unknown-Team"]],
    ["[Unknown-Raws] 虚构航海 - 03", ["Unknown-Raws"]],
    ["[AMF-Unknown] 虚构航海 - 03", ["AMF-Unknown"]],
  ])("已核实联合署名按身份拆分且保留其他连字符：%s", (input, expected) => {
    expect(groups(input as string)).toEqual(expected);
  });

  it.each([
    [
      "虚构航海.1080p.x264-Nova-Raws (Fictional Voyage, Multi-Subs)",
      ["Nova-Raws"],
    ],
    ["虚构航海.1080p.H.264-Nova.7 (VOSTFR, Multi Subs)", ["Nova.7"]],
    ["虚构航海.1080p.AV1.Dual-Audio.Opus.5.1-MoonTeam", ["MoonTeam"]],
    ["虚构航海.1080p.x264.PCM-MoonTeam VOSTFR Fictional Voyage", ["MoonTeam"]],
    ["虚构航海 1080p BluRay x265 10bit-MoonTeam", ["MoonTeam"]],
    ["虚构航海.1080p.AV1-MoonTeam.mkv (English alias)", ["MoonTeam"]],
    ["虚构航海 [x264-AC3] [1080p AV1-MoonTeam]", ["MoonTeam"]],
    ["[Fansubber] [1987] 虚构航海 --- aud[JP,EN] - sub[EN,ES]", ["Fansubber"]],
    ["[Nebula7] [1999] 虚构航海 [1080p]", ["Nebula7"]],
    ["[129.3字幕组][虚构航海][03][1080p]", ["129.3字幕组"]],
    ["[SubsPlus+] 虚构航海 S01E01 (WEB-DL 1080p AVC AAC)", ["SubsPlus+"]],
    ["[Nebula+] 虚构航海 [03]", ["Nebula+"]],
    ["[Nebula&Orion+] 虚构航海 [03]", ["Nebula", "Orion+"]],
    ["Nebula7][4K Dolby Vision] 虚构航海 - S01E03", ["Nebula7"]],
    ["搬运][Nebula7]虚构航海 [03]", ["Nebula7"]],
    ["虚构航海 - 01 [Kingmenu].mkv", ["Kingmenu"]],
    ["虚构航海 S01E03 (WEBDL 1080p x264 AAC) [S1PH3R]", ["S1PH3R"]],
    ["虚构航海 S01E03 1080p AV1 (Weekly) [Trix]", ["Trix"]],
    ["虚构航海 (2009) [Doki][1280×720 Hi10P BD FLAC]", ["Doki"]],
    ["虚构航海 - 02 [ARR]", ["ARR"]],
    ["虚构航海 - BDRIP - VOSTFR - 1080p x265 FLAC - JG666", ["JG666"]],
    ["虚构航海 (1080p x265 AAC Multi) - Ryūjin 竜神", ["Ryūjin 竜神"]],
    ["虚构航海 1080p BD Remux English Sub - D00oo00M", ["D00oo00M"]],
  ])("保留完整发布者身份：%s", (input, expected) => {
    expect(groups(input as string)).toEqual(expected);
  });

  it.each([
    "[Nebula7] 虚构航海 (Fictional Voyage, Multi-Subs)",
    "[Nebula7] 虚构航海 (Fictional Voyage, English-Sub)",
    "[Nebula7] 虚构航海 (Dual-Audio, Multi-Subs)",
    "[Nebula7] 虚构航海 [BILI.WEB-DL 1080P HEVC, AAC, M-SUB]",
    "[Nebula7] 虚构航海 [YTB.WEB-DL 1080P AVC, Opus, SUB]",
    "[Nebula7] 虚构航海 [UNCENSORED, OVEIL.WEB-DL 720P AVC, AAC, HARD SUB (EN)]",
    "[Nebula7] 虚构航海 [Spanish Sub] [BDRip 1080p]",
    "[Nebula7] 虚构航海 [French-Subs] [BDRip 1080p]",
    "[Nebula7] 虚构航海 S01E03 1080p CR WEB-DL Dual-Audio DDP 2.0 H.264",
    "[Nebula7] 虚构航海 (WebRip 1080p AV1 Multi-Subs)",
    "[Nebula7] 虚构航海 [HEVC DTS-7.1ch DOLBY ATMOS SDR 2160P]",
    "[Nebula7] 虚构航海 [1080P AVC-8Bits AAC 2.0]",
    "[Nebula7] 虚构航海 (BDrip 1080p hevc-yuv420p10 flac)",
    "[Nebula7] 虚构航海 [BDRip AVC-YUV420P AAC][1080p]",
    "[Nebula7] 虚构航海 [1080P_HEVC-10bit_FLAC]",
    "[Nebula7] 虚构航海 (BDrip x264-Trellis2 DTS-HDMA5.1ch)",
    "[Nebula7] 虚构航海 [x265-YUV420P10-FLAC 5.1]",
    "[Nebula7] 虚构航海 [AVC-8-bit DTS-HDMA]",
  ])("字幕、音轨和编码不新增署名：%s", (input) => {
    expect(groups(input)).toEqual(["Nebula7"]);
  });

  it.each([
    "[DVDISO] 虚构航海 (2014) - OVAs + CDs + SCANS",
    "虚构航海 25 SUB - Fictional Voyage (854x480 YouTube).mkv",
    "虚构航海 (1080p AV1 Dual-Audio)",
    "虚构航海 [x264-AC3] [1080p HEVC-10bit]",
    "虚构航海][1080p]",
    "[RAW] 虚构航海 (1982) [Episodes 21-28] [R2J DVDrip + Broadcast Audio]",
  ])("没有明确署名时不从元信息创建身份：%s", (input) => {
    expect(groups(input)).toBeUndefined();
  });

  it("同一通用 scene 语法适用于不同编码和未知组名", () => {
    const codecs = ["H.264", "x265", "AV1", "Opus.5.1", "PCM", "10bit"];
    const annotations = [
      " (A Different English Alias, Multi-Subs)",
      " (VOSTFR)",
      " [简繁字幕]",
      ".mkv",
      " (Weekly) [1080p]",
    ];
    for (let index = 0; index < 300; index++) {
      const publisher = `Unknown${index}.Q-Team`;
      const input = `虚构航海 S01E03 1080p ${
        codecs[index % codecs.length]
      }-${publisher}${annotations[index % annotations.length]}`;
      expect(groups(input)).toEqual([publisher]);
    }
  });
});

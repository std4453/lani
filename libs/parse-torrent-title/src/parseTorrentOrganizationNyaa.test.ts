import { parseTorrentOrganization } from "./parseTorrentOrganization";

const groups = (input: string) => parseTorrentOrganization(input)?.parts;

describe("Nyaa 制作组：署名与字幕属性边界", () => {
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

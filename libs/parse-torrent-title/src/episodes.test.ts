import parseTorrentTitle from "@/parseTorrentTitle";
import { Index } from "@/types";

describe("episode index parsing", () => {
  test.each<[string, Index]>([
    ["[Group] Series S01E03 [1080p]", 3],
    ["[Group] Series X - 01 [1080p]", 1],
    ["[Group] Series_第01集02集03集 [1080p]", { from: 1, to: 3 }],
    ["[Group] Series_61集62集无水印", { from: 61, to: 62 }],
    ["[Group] Series S01E03 - 1080P 多国字幕", 3],
    ["[Group] Series S01E03 -1080p 多国字幕", 3],
    ["[Group] Series - 01 English Name [Bglobal HEVC]", 1],
    ["[Group] Series - 02 标题 [WebRip 1080p]", 2],
    ["[Group] Series_224集-225集", { from: 224, to: 225 }],
    ["[Group] Series_242集无水印高清下载", 242],
    ["[Group] Series [02( 26) ] [1080p]", 2],
    ["[Group] Series [01(13)] [1080p]", 1],
    ["[Series][全12集][1080p]", { from: 1, to: 12 }],
    ["[Group] [86] [1080p]", 86],
    ["[Group-Raws][115][Bahamut][WEB-DL][1080p]", 115],
    ["[Group] Series [第26集 +1集][1080p]", 26],
    ["[Group] Series 第3话+特典动画SP01 [1080p]", 3],
    ["[Group] Series 3rd Season - 02 [1080p]", 2],
    ["[Group] Series 3rd Season [02][1080p]", 2],
    ["[Group] Hero's [04][1080p]", 4],
    ["[Group] Series-02 [WebRip 1080p]", 2],
    ["[Group] Series 08 [1080p][CHS][MP4]", 8],
    ["[Group] Series 12 FIN[WEBRIP AVC 1080p]", 12],
    ["[Group] Series 12 END", 12],
    ["[Group] Series S03 | 01-12(25-36) [1080p]", { from: 1, to: 12 }],
    ["[Group] Series | 17-28(EP76-87)[1080p]", { from: 17, to: 28 }],
    ["[Group] Series 第3季 01-26 (53-78) END", { from: 1, to: 26 }],
    ["[Group] Series 全12集 [1080p]", { from: 1, to: 12 }],
    ["[Group] Series [合集\\01-12END][1080p]", { from: 1, to: 12 }],
    ["[Group] Series 1-52日语中文 [1080p]", { from: 1, to: 52 }],
    ["[Group][Series 971-974 Episode Titles][1080p]", { from: 971, to: 974 }],
    ["[Group] Series [S2+S3 01-12 Fin][1080p]", { from: 1, to: 12 }],
    ["[Group] Series TV001-050 FIN [1080p]", { from: 1, to: 50 }],
    ["[Group] Series 01-13 日语.德文(BD 960x720)", { from: 1, to: 13 }],
    ["[Group] Series s01e003 [1080p]", 3],
    ["[Group] Series S02E01-E03 [1080p]", { from: 1, to: 3 }],
    ["[Group] Series S02E01-03 [1080p]", { from: 1, to: 3 }],
    ["[Group] Series EP87 [1080p]", 87],
    ["[Group] Series EP.01 [1080p]", 1],
    ["[Group] Series Episode 3 [1080p]", 3],
    ["[Group] Series [1039] [1080p]", 1039],
    ["[Group] Series 第1039集 [1080p]", 1039],
    ["[Group] Series 第1014话 [1080p]", 1014],
    ["[Group] Series [13集] [1080p]", 13],
    ["[Group] Series [13集 - END] [1080p]", 13],
    ["[Group] Series [24_END] [1080p]", 24],
    ["[Group] Series [51_完] [1080p]", 51],
    ["[Group] Series [25 FIN] [1080p]", 25],
    ["[Group] Series [25 Fin] [1080p]", 25],
    ["[Group] Series - 25 FIN", 25],
    ["[Group] Series [02 v2] [1080p]", 2],
    ["[Group] Series [01v2-02v2] [1080p]", { from: 1, to: 2 }],
    ["[Group] Series [01v2~02v3] [1080p]", { from: 1, to: 2 }],
    ["[Group] Series [17 - 20] [1080p]", { from: 17, to: 20 }],
    ["[Group] Series ★02★ 1920x1080 AVC", 2],
    ["[Group] Series ★02v2★ 1920x1080 AVC", 2],
    ["[Group] Series [03_集标题] [1080p]", 3],
    ["[Group] Series [01_英灵事件] [1080p]", 1],
    ["[Group] Series [11+小剧场] [1080p]", 11],
    ["[Group] Series ０３話 [1080p]", 3],
    ["[Group] Series 第３話 [1080p]", 3],
    ["[Group] Series 第三集 [1080p]", 3],
    ["[Group] Series 第01集-03集 [1080p]", { from: 1, to: 3 }],
    ["[Group] Series 第01话-第03话 [1080p]", { from: 1, to: 3 }],
    ["[Group] Series S2 - 12 END [1080p]", 12],
    ["[Group] Series Season 2- 04 [1080p]", 4],
    ["[Group] Series - 11 [1080p] 参考第一集简介", 11],
    ["[Series Title][01][CHT]", 1],
    ["[Series Title][第93集][1080p]", 93],
    ["[Group] Series [01-13TV全集+SP][1080p]", { from: 1, to: 13 }],
    ["[Group] Series [01-11+3SP][1080p]", { from: 1, to: 11 }],
    ["[Group] Series 1-22+20.5+21.5 [1080p]", { from: 1, to: 22 }],
    ["[Group] Series [01-13+5.5+OVAx2][1080p]", { from: 1, to: 13 }],
    ["[Group] Series E01-12.FIN [1080p]", { from: 1, to: 12 }],
    ["[Group] Series (BD REENCODE Chapter.13-24+SP Fin)", { from: 13, to: 24 }],
    ["[Group] Series.001-109.DVDRip.Ita.Mp3", { from: 1, to: 109 }],
    ["[Group] Series [TV 01-26Fin][1080p]", { from: 1, to: 26 }],
    ["[Group] Series [01-92简中合集][1080p]", { from: 1, to: 92 }],
    ["[Group] Series | 01-13+SPx1 [1080p]", { from: 1, to: 13 }],
    ["[Group] Series (BD REMUX EP01-12+SP Fin)", { from: 1, to: 12 }],
    ["[Group] Series [1328-1330][1080p]", { from: 1328, to: 1330 }],
    ["[Group] Series [13v2 FIN][1080p]", 13],
    ["[Group] [Title17-26][01-08 精校合集] [1080p]", { from: 1, to: 8 }],
    ["[Group] Series S04E15 [附注: >>内文补上第14话字幕] [1080p]", 15],
    ["[Group] [86] [01] [1080p]", 1],
  ])("parses the episode index from %s", (title, expected) => {
    expect(parseTorrentTitle(title)?.index).toEqual(expected);
  });

  test.each([
    ["[国漫]剑道第一仙第01集-06集无水印高清下载", "剑道第一仙"],
    ["[国漫]剑道第一仙第11集12集无水印高清下载", "剑道第一仙"],
  ])(
    "does not retain 第 before a Chinese episode range in %s",
    (title, expected) => {
      expect(parseTorrentTitle(title)?.title.raw).toBe(expected);
    }
  );

  test.each([
    ["[Group] Series Season 2 | 01-12 | 01-12", "01-12"],
    ["少女与战车 最终章 第3话 Girls und Panzer Das Finale - 03", "第3话"],
  ])("uses the first semantic episode span in %s", (title, excluded) => {
    expect(parseTorrentTitle(title)?.title.raw).not.toContain(excluded);
  });

  test("retains a separately delimited title alias after an embedded episode label", () => {
    const result = parseTorrentTitle(
      "[Group] 作品 第03话 / Series Finale - 03 [1080p]"
    );
    expect(result?.index).toBe(3);
    expect(result?.title.aliases).toContain("Series Finale");
  });

  test.each([
    "[Group] Film Chapter 2 [BDRip 1080p]",
    "[Group] Series [1972-1984] [1080p]",
    "[Group] Series Season 2 [WebRip 1080p]",
    "[Group] Series Vol.1-3 Fin [1080p]",
    "[Group] Series Volume 1-3 [1080p]",
    "[Group] Series [S1-2 Fin][1080p]",
    "[Group] Series [01-03+05-07][1080p]",
    "[Group] Series [旧TV1-20,21-24导剪版,25-26+剧场版][1080p]",
    "[Group] Series [S1 Fin][1080p]",
    "[Group] Series [x264-10bit][CHS]",
    "[Group] Series_01集03集 [1080p]",
    "[Group] Film [MPEG-4 AVC][AC-3][1080p][MOVIE]",
    "[Group] Film [UTF-8][MOVIE]",
    "[Group-Raws] Film[-1][WEB-DL][1080p]",
    "[Group] Series 2026-10-12 [1080p]",
    "[Group] Series 1080p 1920x1080 HEVC10bit 5.1",
    "[Group] Series 86 [1080p]",
    "[Group] Series 第304-2集 [1080p]",
    "[Group] Series 1.2-3 [1080p]",
    "[Group] Series - 1_114 [1480P][Multi][AC3 HEVC][MKV]",
    "Series - 3000 Miles in Search of Mother",
    "[Group] Series [01+SP01] [1080p]",
    "[Group] Series [01-02+04] [1080p]",
    "[Group] Series ★+02★ 1920x1080 AVC",
    "[Group] Series [1128-11129] [1080p]",
    "[Group] Jujutsu Kaisen 0 [BDRip 1080p]",
    "[Group] Karakai Jouzu no Takagi-san 3 [BDRip 1080p]",
    "[Group] New Prince of Tennis U-17 World Cup [BDRip 1080p]",
    "[Group] D-1 DEVASTATOR_OVA [BDRip 1080p]",
    "[Group] Series 13 [DVD Remastered][1080p]",
    "[Group] LGA 771硬改775 添加E0 SSE4.1 VT-X 指令集 微码",
  ])("does not infer an episode index from %s", (title) => {
    expect(parseTorrentTitle(title)?.index).toBeUndefined();
  });
});

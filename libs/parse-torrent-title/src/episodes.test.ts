import parseTorrentTitle from "@/parseTorrentTitle";
import { Index } from "@/types";

describe("episode index parsing", () => {
  test.each<[string, Index]>([
    ["[Group] Series S01E03 [1080p]", 3],
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
    ["[Group] Series [TV 01-26Fin][1080p]", { from: 1, to: 26 }],
    ["[Group] Series [OVA 01-05 Fin][1080p]", { from: 1, to: 5 }],
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
    "[Group] Series [1972-1984] [1080p]",
    "[Group] Series 2026-10-12 [1080p]",
    "[Group] Series 1080p 1920x1080 HEVC10bit 5.1",
    "[Group] Series 86 [1080p]",
    "[Group] Series 第304-2集 [1080p]",
    "[Group] Series [24.5] [1080p]",
    "[Group] Series [01(13)] [1080p]",
    "[Group] Series [01+SP01] [1080p]",
    "[Group] Series [1128-11129] [1080p]",
    "[Group] [86] [1080p]",
  ])("does not infer an episode index from %s", (title) => {
    expect(parseTorrentTitle(title)?.index).toBeUndefined();
  });
});

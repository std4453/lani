import { parseSubtitleInfo, toLegacySubtitle } from "@/parseSubtitleInfo";
import { Subtitle, SubtitleInfo } from "@/types";

const legacyCases: Array<[SubtitleInfo | null | undefined, Subtitle]> = [
  [{ languages: ["zh-Hans"], multi: false, delivery: [] }, { hasCHS: true }],
  [{ languages: ["zh-Hant"], multi: false, delivery: [] }, { hasCHT: true }],
  [{ languages: ["ja"], multi: false, delivery: [] }, { hasJP: true }],
  [
    {
      languages: ["zh-Hans", "zh-Hant", "ja"],
      multi: true,
      delivery: ["muxed"],
    },
    { hasCHS: true, hasCHT: true, hasJP: true, type: "内挂" },
  ],
  [{ languages: [], multi: true, delivery: ["burned-in"] }, { type: "内嵌" }],
  [{ languages: [], multi: false, delivery: ["external"] }, { type: "外挂" }],
  [{ languages: ["zh"], multi: false, delivery: [] }, {}],
  [null, {}],
  [undefined, {}],
];

describe("parseSubtitleInfo", () => {
  test.each([
    ["[Multiple Subtitle]", [], true, []],
    ["[01-92简中合集]", ["zh-Hans"], false, []],
    [" 多国字幕", [], true, []],
    [" Multi-Sub", [], true, []],
    [" GB_CN HEVC_opus 1080p", ["zh-Hans"], false, []],
    [" BIG5 MP4_720P", ["zh-Hant"], false, []],
    [" CUE! 第12集 V2 GB_CN HEVC_opus 1080p", ["zh-Hans"], false, []],
    [" 女神宿舍的管理员 01-10 GB 1080P MP4 BDrip HEVC", ["zh-Hans"], false, []],
    [" GB_JP MP4_1080P", ["zh-Hans", "ja"], true, []],
    ["[bilibili - 1080p AVC1 CHS-JP]", ["zh-Hans", "ja"], true, []],
    [
      "(01-12Fin WEBRIP 1080p AVC AAC MP4 2024年4月 简日双语)",
      ["zh-Hans", "ja"],
      true,
      [],
    ],
    ["[GB_JP]", ["zh-Hans", "ja"], true, []],
    ["[CHS_JP]", ["zh-Hans", "ja"], true, []],
    ["[简日\\CHS_JP]", ["zh-Hans", "ja"], true, []],
    ["[簡體中文]", ["zh-Hans"], false, []],
    ["[多国字幕]", [], true, []],
    ["[粤日双语+内封繁体中文字幕]", ["zh-Hant"], false, ["muxed"]],
    ["[粤语+内封繁体中文字幕]", ["zh-Hant"], false, ["muxed"]],
    ["[粤日双语+内封繁体中文双字幕]", ["zh-Hant"], false, ["muxed"]],
    ["[WEB1920x1080 x264 AAC SRT TVB CHT]", ["zh-Hant"], false, []],
    ["[AVC AAC ASSx5 CHS]", ["zh-Hans"], false, []],
    ["[简体内嵌 试看版]", ["zh-Hans"], false, ["burned-in"]],
    ["(01-12Fin WEBRIP 720p AVC AAC 2022年1月 简中)", ["zh-Hans"], false, []],
    ["(WebRip AV1 简繁内封 Encoder)", ["zh-Hans", "zh-Hant"], true, ["muxed"]],
    [" 简体字幕", ["zh-Hans"], false, []],
    ["[CHS]", ["zh-Hans"], false, []],
    ["[chs]", ["zh-Hans"], false, []],
    ["[GB]", ["zh-Hans"], false, []],
    ["[简]", ["zh-Hans"], false, []],
    ["【简体中文】", ["zh-Hans"], false, []],
    ["[CHT]", ["zh-Hant"], false, []],
    ["[cht]", ["zh-Hant"], false, []],
    ["[BIG5]", ["zh-Hant"], false, []],
    ["[繁]", ["zh-Hant"], false, []],
    ["[繁體中文]", ["zh-Hant"], false, []],
    ["[繁簡體]", ["zh-Hans", "zh-Hant"], true, []],
    ["[zh-Hans]", ["zh-Hans"], false, []],
    ["[zh-Hant]", ["zh-Hant"], false, []],
    ["[簡]", ["zh-Hans"], false, []],
    ["[中文字幕]", ["zh"], false, []],
    ["标题自带中文字幕", ["zh"], false, []],
    ["[JP]", ["ja"], false, []],
    ["[jp]", ["ja"], false, []],
    ["[ja]", ["ja"], false, []],
    ["[英文字幕]", ["en"], false, []],
    ["[EN]", ["en"], false, []],
    ["[Korean subtitles]", ["ko"], false, []],
    ["[简繁]", ["zh-Hans", "zh-Hant"], true, []],
    ["[繁简]", ["zh-Hans", "zh-Hant"], true, []],
    ["[简/繁]", ["zh-Hans", "zh-Hant"], true, []],
    ["[简＆繁]", ["zh-Hans", "zh-Hant"], true, []],
    ["[簡繁日]", ["zh-Hans", "zh-Hant", "ja"], true, []],
    ["[简繁日语字幕]", ["zh-Hans", "zh-Hant", "ja"], true, []],
    ["[简日双语内嵌]", ["zh-Hans", "ja"], true, ["burned-in"]],
    ["[繁日双語內封字幕]", ["zh-Hant", "ja"], true, ["muxed"]],
    ["[简繁内嵌字幕]", ["zh-Hans", "zh-Hant"], true, ["burned-in"]],
    ["[简繁內掛字幕]", ["zh-Hans", "zh-Hant"], true, ["muxed"]],
    ["[简体中文内挂]", ["zh-Hans"], false, ["muxed"]],
    ["[繁体外挂字幕]", ["zh-Hant"], false, ["external"]],
    ["[CHS/CHT]", ["zh-Hans", "zh-Hant"], true, []],
    ["[CHS&CHT]", ["zh-Hans", "zh-Hant"], true, []],
    ["[CHS,CHT]", ["zh-Hans", "zh-Hant"], true, []],
    ["[CHS；CHT]", ["zh-Hans", "zh-Hant"], true, []],
    ["[Multi-Sub]", [], true, []],
    ["[Multi-Subs]", [], true, []],
    ["[MultiSub]", [], true, []],
    ["[MultiSub][CHS]", ["zh-Hans"], true, []],
    ["[MultiSub+CHS]", ["zh-Hans"], true, []],
    ["[MultiSub][自带中文字幕]", ["zh"], true, []],
    ["[多国语字幕]", [], true, []],
  ] as Array<[string, string[], boolean, string[]]>)(
    "%s gives its explicit language and delivery metadata",
    (metadata, languages, multi, delivery) => {
      expect(
        parseSubtitleInfo(`[Example Release] Feature Film ${metadata}`)
      ).toEqual({ languages, multi, delivery });
    }
  );

  test.each([
    "[Group-Raws] Feature Film",
    "[Japanese Audio][Dual Audio] Feature Film",
    "日语配音，双音轨",
    "Feature Film 2 GB 1080p",
    "Feature Film 1GB",
    "[Baha][WEB-DL][1080p] Feature Film",
    "An English title with no subtitle label",
    "[简繁字幕组] Series -01",
    "[Group] En En no Title -01",
    "[Group][外挂级补师]-01",
    "[多国语配音] Series -01",
    "[日版/JPN.Ver] Series -01",
    "[英日音轨] Series -01",
    "[粤日双语] Series -01",
    "[Japanese Audio+Dual Audio] Series -01",
    "[繁花 WEBRip] Series -01",
    "[2GB 1080p] Series -01",
    "Series 2 GB 1080p",
    "[简繁字幕组 WEBRip] Series -01",
    "[MultiSubsTeam]字幕组 Series -01",
    "[无外挂字幕] Series -01",
    "",
  ])("keeps unknown metadata unknown: %s", (input) => {
    expect(parseSubtitleInfo(input)).toBeUndefined();
  });

  test.each([
    "[No Subs] Feature Film",
    "[No-Subtitle] Feature Film",
    "[无字幕] Feature Film",
    "无字幕版电影",
  ])("returns explicit absence for %s", (input) => {
    expect(parseSubtitleInfo(input)).toBeNull();
  });

  test("does not confuse no Chinese subtitles with no subtitles", () => {
    expect(parseSubtitleInfo("[無中文字幕] Feature Film")).toBeUndefined();
    expect(
      parseSubtitleInfo("[No Chinese subtitles] Feature Film")
    ).toBeUndefined();
  });

  test("recognizes bare language labels only beside technical metadata", () => {
    expect(parseSubtitleInfo("Title 01-10 BIG5 1080P MP4 BDrip HEVC")).toEqual({
      languages: ["zh-Hant"],
      multi: false,
      delivery: [],
    });
    expect(parseSubtitleInfo("[Group][GB_MP4] Series -01")).toEqual({
      languages: ["zh-Hans"],
      multi: false,
      delivery: [],
    });
  });

  test.each([
    ["Feature Film (Dual-Audio, Multi-Subs)", true],
    ["Feature Film 1080p 日英双语-多国字幕", true],
    ["[多国语配音] Feature Film", false],
  ])(
    "recognizes explicit multi-sub metadata without reading audio: %s",
    (input, expected) => {
      expect(parseSubtitleInfo(input)?.multi ?? false).toBe(expected);
    }
  );

  test("keeps language evidence beside a shared multi-sub metadata tag", () => {
    expect(
      parseSubtitleInfo("[搬运] Series 01 (1080P 繁简中字 多国字幕)")
    ).toEqual({
      languages: ["zh-Hans", "zh-Hant"],
      multi: true,
      delivery: [],
    });
  });

  test.each(legacyCases)(
    "converts new info to the legacy subtitle shape",
    (info, legacy) => {
      expect(toLegacySubtitle(info)).toEqual(legacy);
    }
  );
});

import parseTorrentTitle, {
  parseSubtitleInfo,
  PositionalItemType,
} from "@/index";

describe("public parser API compatibility", () => {
  test("keeps legacy fields and exposes the independent subtitle structure", () => {
    const result = parseTorrentTitle(
      "[Example Subs] Series S01E03 [1080p] [简繁日内嵌字幕]"
    );

    expect(result).toMatchObject({
      index: 3,
      source: {},
      format: { resolution: "1080" },
      subtitle: {
        hasCHS: true,
        hasCHT: true,
        hasJP: true,
        type: "内嵌",
      },
      subtitleInfo: {
        languages: ["zh-Hans", "zh-Hant", "ja"],
        multi: true,
        delivery: ["burned-in"],
      },
    });
  });

  test("parses movie subtitle metadata without requiring an episode", () => {
    expect(
      parseSubtitleInfo("[Example Subs] Feature Film [Multi-Sub] [CHS] [外挂]")
    ).toEqual({ languages: ["zh-Hans"], multi: true, delivery: ["external"] });
  });

  test("preserves unknown and explicit absence through JSON serialization", () => {
    const unknown = parseTorrentTitle("[Example Subs] Series S01E03 [1080p]");
    const absent = parseTorrentTitle(
      "[Example Subs] Series S01E03 [1080p] [无字幕]"
    );

    expect(unknown?.subtitleInfo).toBeUndefined();
    expect(JSON.parse(JSON.stringify(unknown))).not.toHaveProperty(
      "subtitleInfo"
    );
    expect(absent?.subtitleInfo).toBeNull();
    expect(JSON.parse(JSON.stringify(absent))).toHaveProperty(
      "subtitleInfo",
      null
    );
  });

  test("continues to honor custom episode matching options", () => {
    const result = parseTorrentTitle("[Example Subs] Series EP-07~09", {
      episodeRegexes: [/EP-(\d+(?:~\d+)?)/],
      episodeInnerRegex: /\d+(?:~\d+)?/,
      episodeConnectorRegex: /~/,
    });

    expect(result?.index).toEqual({ from: 7, to: 9 });
  });

  test("continues to honor custom subtitle keywords", () => {
    const result = parseTorrentTitle("[Example Subs] Series - 03 [特殊繁组]", {
      subtitleKeywords: [/特殊繁组/],
    });

    expect(result?.subtitle).toEqual({ hasCHT: true });
    expect(result?.subtitleInfo).toBeUndefined();
    const subtitleItem = result?.positionalItems.find(
      ({ type }) => type === PositionalItemType.SUBTITLE
    );
    expect(subtitleItem).toBeDefined();
    expect(
      result?.raw.slice(
        subtitleItem!.index,
        subtitleItem!.index + subtitleItem!.length
      )
    ).toBe("特殊繁组");
  });

  test.each([
    ["[Example Subs] Series S01E03 [CHS]", "Series", "S01E03"],
    ["Series S01E03 [CHS]", "Series", "S01E03"],
    ["【字幕组】作品 第三集 [CHS]", "作品", "第三集"],
  ])(
    "keeps positional title and episode spans on the original title: %s",
    (raw, title, episode) => {
      const result = parseTorrentTitle(raw);
      const titleItem = result?.positionalItems.find(
        ({ type }) => type === PositionalItemType.TITLE
      );
      const indexItem = result?.positionalItems.find(
        ({ type }) => type === PositionalItemType.INDEX
      );

      expect(result?.raw).toBe(raw);
      expect(titleItem).toBeDefined();
      expect(indexItem).toBeDefined();
      expect(
        raw.slice(titleItem!.index, titleItem!.index + titleItem!.length)
      ).toBe(title);
      expect(
        raw.slice(indexItem!.index, indexItem!.index + indexItem!.length)
      ).toBe(episode);
      expect(indexItem?.length).toBe(episode.length);
    }
  );
});

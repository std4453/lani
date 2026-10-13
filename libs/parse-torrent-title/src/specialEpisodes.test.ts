import parseTorrentTitle from "@/parseTorrentTitle";
import { PositionalItemType } from "@/types";

describe("special episode information", () => {
  test.each<[string, object]>([
    ["[Group] Series SP1 [1080p]", { type: "sp", index: 1 }],
    ["[Group] Series SP01 [1080p]", { type: "sp", index: 1 }],
    ["[Group] Series OVA02 [1080p]", { type: "ova", index: 2 }],
    ["[Group] Series OAD 01 [1080p]", { type: "oad", index: 1 }],
    ["[Group] Series SP00 [1080p]", { type: "sp", index: 0 }],
    ["[Group] Series [SP01v2][1080p]", { type: "sp", index: 1 }],
    ["[Group] Series [OVA02-v3][1080p]", { type: "ova", index: 2 }],
    [
      "[Group] Series [OVA 01-05 Fin][1080p]",
      { type: "ova", index: { from: 1, to: 5 } },
    ],
    ["[Group] Series [SP01.5][1080p]", { type: "sp", index: 1.5 }],
    ["[Group] Series ＳＰ０１ [1080p]", { type: "sp", index: 1 }],
  ])("returns special type and number for %s", (title, expected) => {
    const result = parseTorrentTitle(title);

    expect(result?.episodeInfo).toEqual(expected);
    expect(result?.index).toBeUndefined();
  });

  test.each<[string, object]>([
    ["[Group] Series SP [1080p]", { type: "sp" }],
    ["[Group] Series OVA [1080p]", { type: "ova" }],
    ["[Group] Series 特别篇 [1080p]", { type: "sp" }],
    ["[Group] Series SPv2 [1080p]", { type: "sp" }],
    ["[Group] Series OVA 10-bit 1080p HEVC BDRip", { type: "ova" }],
    ["[Group] Series [OVA 1987][1080p]", { type: "ova" }],
    ["[Group] Series SP 1080p HEVC", { type: "sp" }],
  ])("does not invent a special episode number for %s", (title, expected) => {
    const result = parseTorrentTitle(title);

    expect(result?.episodeInfo).toEqual(expected);
    expect(result?.index).toBeUndefined();
  });

  test.each([
    "[Group] Series SP1+SP3 [1080p]",
    "[Group] Series OAD06&07 [1080p]",
    "[Group] Series [01+SP01] [1080p]",
    "[Group] Series [SP01.50] [1080p]",
    "[Group] Series SP1.2 [1080p]",
    "[Group] Series SPv2.1 [1080p]",
    "[Group] Series SP01v2.1 [1080p]",
    "[Group] Series SP01-v10 [1080p]",
    "[Special Subs] Series [1080p]",
    "[Group] Series (BD 1920x1080) - TV + SP",
    "[Group] Series TV + OVA [1080p]",
    "[Group] Series SP + TV [1080p]",
  ])("does not return a partial special number from %s", (title) => {
    expect(parseTorrentTitle(title)).toBeUndefined();
  });

  it("retains an ordinary episode range when the pack also includes an SP", () => {
    const result = parseTorrentTitle("[Group] Series [01-12+SP01] [1080p]");

    expect(result?.episodeInfo).toEqual({
      type: "episode",
      index: { from: 1, to: 12 },
    });
    expect(result?.index).toEqual({ from: 1, to: 12 });
  });

  it("does not treat SPY or OVATION inside a title as special markers", () => {
    const result = parseTorrentTitle(
      "[Group] SPY×FAMILY OVATION Episode 3 [1080p]"
    );

    expect(result?.episodeInfo).toEqual({ type: "episode", index: 3 });
    expect(result?.index).toBe(3);
  });

  test.each<[string, string, object]>([
    ["[Group] Series SP01 [1080p]", "SP01", { type: "sp", index: 1 }],
    ["[Group] Series OVA02 [1080p]", "OVA02", { type: "ova", index: 2 }],
    ["[Group] Series OAD 01 [1080p]", "OAD 01", { type: "oad", index: 1 }],
    ["[Group] Series SP00 [1080p]", "SP00", { type: "sp", index: 0 }],
  ])(
    "keeps the original positional span for %s",
    (title, rawSpan, expected) => {
      const result = parseTorrentTitle(title);
      const indexItem = result?.positionalItems.find(
        (item) => item.type === PositionalItemType.INDEX
      );

      expect(result?.episodeInfo).toEqual(expected);
      expect(indexItem).toBeDefined();
      expect(
        title.slice(indexItem!.index, indexItem!.index + indexItem!.length)
      ).toBe(rawSpan);
    }
  );

  it("omits the legacy index property when JSON serializing a special episode", () => {
    const result = parseTorrentTitle("[Group] Series SP01 [1080p]");
    const serialized = JSON.parse(JSON.stringify(result));

    expect(serialized).toHaveProperty("episodeInfo", {
      type: "sp",
      index: 1,
    });
    expect(serialized).not.toHaveProperty("index");
  });

  test.each(["[OVA01-05Fin]", "[OAD1-2合集]"])(
    "keeps the title before %s intact",
    (marker) => {
      const result = parseTorrentTitle(`[Group][Series]${marker}[1080p]`);
      expect(result?.title.raw).toBe("Series");
      const item = result?.positionalItems.find(
        ({ type }) => type === PositionalItemType.INDEX
      )!;
      expect(result?.raw.slice(item.index, item.index + item.length)).toBe(
        marker
      );
    }
  );
});
